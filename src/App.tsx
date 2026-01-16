import { useState, useEffect } from 'react';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { EisenhowerMatrix } from '@/components/tasks/EisenhowerMatrix';
import { HeaderMenu } from '@/components/HeaderMenu';
import { Toaster } from '@/components/ui/toast';
import { useSettingsStore } from '@/store/settingsStore';
import { ChatBot } from '@/components/chat';

function App() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const backgroundImage = useSettingsStore((state) => state.backgroundImage);
	const resetBackgroundImage = useSettingsStore((state) => state.resetBackgroundImage);
	const [bgLoadError, setBgLoadError] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isShortcut =
				(e.ctrlKey || e.metaKey) &&
				e.shiftKey &&
				(e.code === 'KeyN' || e.key.toLowerCase() === 'n');

			if (isShortcut) {
				e.preventDefault();
				setIsDialogOpen(true);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		setBgLoadError(false);
		const img = new Image();
		img.onerror = () => {
			setBgLoadError(true);
			resetBackgroundImage();
		};
		img.src = backgroundImage;
	}, [backgroundImage, resetBackgroundImage]);

	return (
		<div
			className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
			style={{
				backgroundImage: `url('${backgroundImage}')`,
			}}
		>
			{/* Subtle overlay for better readability */}
			<div className="min-h-screen">
				{/* Trello-style Header */}
				<header className="bg-white/80 border-b border-[#DFE1E6] px-4 py-3 sticky top-0 z-10 shadow-sm">
					<div className="flex items-center justify-between mx-auto max-w-7xl">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								{/* <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center">
									<svg
										className="w-5 h-5 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4V7h3v4h3V7h3v7z" />
									</svg>
								</div> */}
								{/* <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center"> */}
								<span className="text-2xl text-white">🎯</span>
								{/* </div> */}
								<h1 className="text-xl font-bold text-[#172B4D]">
									Priority Metrix
								</h1>
							</div>
						</div>

					<div className="flex items-center gap-3">
						<TaskFormDialog
							mode="add"
							open={isDialogOpen}
							onOpenChange={setIsDialogOpen}
							showTrigger={true}
						/>
						<HeaderMenu />
					</div>

					</div>
				</header>

				{bgLoadError && (
					<span className="sr-only" aria-live="polite">
						배경 이미지 로드 실패, 기본 배경으로 복원했습니다.
					</span>
				)}

				{/* Main Content - Eisenhower Matrix */}
				<main className="py-6 mx-auto max-w-7xl">
					<EisenhowerMatrix />
				</main>

				{/* Toast Provider */}
				<Toaster />
				<ChatBot />
			</div>
		</div>
	);
}

export default App;
