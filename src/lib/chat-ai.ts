import { streamText } from 'ai';
import { builtInAI, doesBrowserSupportBuiltInAI } from '@built-in-ai/core';
import type { AIPromptMessage, StreamChatOptions } from '@/types/chat';

type BuiltInAIModel = ReturnType<typeof builtInAI> & {
	createSessionWithProgress?: (progress: (value: number) => void) => Promise<unknown>;
};

type LanguageModelAvailability = 'available' | 'readily' | 'downloadable' | 'after-download' | 'downloading' | 'unavailable' | 'no';

interface LanguageModelMonitor {
	addEventListener: (event: string, callback: () => void) => void;
}

interface LanguageModelSession {
	promptStreaming: (prompt: string, options?: { signal?: AbortSignal }) => AsyncIterable<string>;
}

interface LanguageModelAPI {
	create: (options?: {
		monitor?: (m: LanguageModelMonitor) => void;
		initialPrompts?: AIPromptMessage[];
	}) => Promise<LanguageModelSession>;
	availability?: () => Promise<LanguageModelAvailability>;
}

interface WindowWithLanguageModel {
	LanguageModel?: LanguageModelAPI;
}

async function getReadyModel(signal?: AbortSignal): Promise<BuiltInAIModel> {
	const model = builtInAI() as BuiltInAIModel;
	const availability = await model.availability();

	if (availability === 'available') return model;

	if ((availability === 'downloadable' || availability === 'downloading') && model.createSessionWithProgress) {
		await model.createSessionWithProgress(() => {
			if (signal?.aborted) {
				throw new DOMException('Aborted', 'AbortError');
			}
		});
		return model;
	}

	throw new Error('Built-in AI unavailable');
}

async function streamWithLanguageModel(
	prompt: string,
	onUpdate: (text: string) => void,
	signal?: AbortSignal,
	systemPrompt?: string,
	conversationHistory?: AIPromptMessage[],
): Promise<string> {
	const lm = (window as unknown as WindowWithLanguageModel).LanguageModel;
	if (!lm?.create) {
		throw new Error('LanguageModel API unavailable');
	}

	if (lm.availability) {
		const availability = await lm.availability();
		if (availability === 'unavailable' || availability === 'no') {
			throw new Error('LanguageModel is not available on this device');
		}
		if (availability === 'downloadable' || availability === 'after-download') {
			throw new Error('Model needs to be downloaded first. Please enable Chrome AI flags and download the model.');
		}
		if (availability === 'downloading') {
			throw new Error('Model is currently downloading. Please wait and try again.');
		}
		if (availability !== 'available' && availability !== 'readily') {
			throw new Error(`LanguageModel availability status: ${availability}`);
		}
	}

	const sessionOptions: Parameters<LanguageModelAPI['create']>[0] = {
		monitor: (m: LanguageModelMonitor) => {
			m.addEventListener('downloadprogress', () => {
				if (signal?.aborted) {
					throw new DOMException('Aborted', 'AbortError');
				}
			});
		},
	};

	const historyMessages = conversationHistory?.filter(
		(message) => message.role !== 'system' && message.content.trim().length > 0,
	);
	const initialPrompts: AIPromptMessage[] = [];

	if (systemPrompt) {
		initialPrompts.push({ role: 'system', content: systemPrompt });
	}

	if (historyMessages?.length) {
		initialPrompts.push(...historyMessages);
	}

	if (initialPrompts.length > 0) {
		sessionOptions.initialPrompts = initialPrompts;
	}

	const sessionPromise = lm.create(sessionOptions);

	const session = await Promise.race([
		sessionPromise,
		new Promise((_, reject) => {
			const timer = setTimeout(() => {
				reject(new Error('Session creation timed out. Model may not be ready.'));
			}, 10000);
			signal?.addEventListener('abort', () => {
				clearTimeout(timer);
				reject(new DOMException('Aborted', 'AbortError'));
			});
		}),
	]);

	const stream = (session as LanguageModelSession).promptStreaming(prompt, { signal });
	let fullText = '';
	for await (const chunk of stream) {
		if (signal?.aborted) {
			throw new DOMException('Aborted', 'AbortError');
		}
		fullText += chunk;
		onUpdate(fullText);
	}
	return fullText;
}

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('Streaming timed out'));
		}, ms);

		promise
			.then((val) => {
				clearTimeout(timer);
				resolve(val);
			})
			.catch((err) => {
				clearTimeout(timer);
				reject(err);
			});

		signal?.addEventListener('abort', () => {
			clearTimeout(timer);
			reject(new DOMException('Aborted', 'AbortError'));
		});
	});
}

export type ChatAvailabilityStatus = 
	| 'available'
	| 'downloading'
	| 'downloadable'
	| 'unavailable';

export async function checkChatAvailability(): Promise<boolean> {
	const status = await getChatAvailabilityStatus();
	return status === 'available';
}

export async function getChatAvailabilityStatus(): Promise<ChatAvailabilityStatus> {
	if (typeof window === 'undefined') return 'unavailable';

	if (!doesBrowserSupportBuiltInAI()) return 'unavailable';

	try {
		const lm = (window as unknown as WindowWithLanguageModel).LanguageModel;
		if (lm?.availability) {
			const availability = await lm.availability();
			if (availability === 'available' || availability === 'readily') return 'available';
			if (availability === 'downloading') return 'downloading';
			if (availability === 'downloadable' || availability === 'after-download') return 'downloadable';
		}

		const model = builtInAI() as BuiltInAIModel;
		const availability = await model.availability();
		if (availability === 'available') return 'available';
		if (availability === 'downloading') return 'downloading';
		if (availability === 'downloadable') return 'downloadable';
		return 'unavailable';
	} catch (error) {
		console.error('Failed to check built-in AI availability', error);
		return 'unavailable';
	}
}

export async function streamChatResponse(
	prompt: string,
	onUpdate: (text: string) => void,
	signal?: AbortSignal,
	options?: StreamChatOptions
): Promise<string> {
	const resolvedSignal = options?.signal ?? signal;
	const historyMessages = options?.conversationHistory?.filter(
		(message) => message.role !== 'system' && message.content.trim().length > 0,
	);
	const historyAwareMessages = historyMessages?.length
		? [...historyMessages, { role: 'user' as const, content: prompt }]
		: undefined;

	if (typeof window !== 'undefined' && (window as unknown as WindowWithLanguageModel).LanguageModel) {
		try {
			return await withTimeout(
				streamWithLanguageModel(
					prompt,
					onUpdate,
					resolvedSignal,
					options?.systemPrompt,
					historyMessages,
				),
				30000,
				resolvedSignal,
			);
		} catch (error) {
			console.warn('LanguageModel streaming failed, falling back to builtInAI', error);
		}
	}

	const model = await getReadyModel(resolvedSignal);
	const { textStream } = await streamText({
		model,
		system: options?.systemPrompt,
		...(historyAwareMessages ? { messages: historyAwareMessages } : { prompt }),
		abortSignal: resolvedSignal,
	});

	let fullText = '';
	for await (const chunk of textStream) {
		fullText += chunk;
		onUpdate(fullText);
	}

	return fullText;
}
