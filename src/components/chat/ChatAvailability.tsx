import type { ChatAvailabilityStatus } from '@/types/chat';

interface ChatAvailabilityProps {
	availabilityStatus: ChatAvailabilityStatus;
}

export function ChatAvailability({ availabilityStatus }: ChatAvailabilityProps) {
	if (availabilityStatus === 'checking') {
		return (
			<div className="px-5 py-3 text-sm text-[#172B4D]">
				Chrome AI 가용성을 확인 중입니다...
			</div>
		);
	}

	if (availabilityStatus === 'downloading') {
		return (
			<div className="px-5 py-3 text-sm text-[#E65100] bg-[#FFF3E0] rounded-[12px] mx-5 my-3 border border-[#FFB74D]/40">
				<p className="font-semibold mb-1">Chrome AI 모델 다운로드 중...</p>
				<p className="text-xs">모델 다운로드가 완료되면 사용할 수 있습니다. 약 22GB 공간이 필요합니다.</p>
			</div>
		);
	}

	if (availabilityStatus === 'downloadable') {
		return (
			<div className="px-5 py-3 text-sm text-[#E65100] bg-[#FFF3E0] rounded-[12px] mx-5 my-3 border border-[#FFB74D]/40">
				<p className="font-semibold mb-1">Chrome AI 모델 다운로드가 필요합니다.</p>
				<ul className="list-disc pl-4 space-y-1 text-xs">
					<li>chrome://flags에서 prompt-api-for-gemini-nano 활성화</li>
					<li>chrome://components에서 Optimization Guide 업데이트 실행</li>
					<li>22GB 이상 디스크 공간 필요</li>
				</ul>
			</div>
		);
	}

	if (availabilityStatus === 'unavailable') {
		return (
			<div className="px-5 py-3 text-sm text-[#8B0000] bg-[#FFE2E2] rounded-[12px] mx-5 my-3 border border-[#EB5A46]/40">
				<p className="font-semibold mb-1">Chrome AI를 사용할 수 없습니다.</p>
				<ul className="list-disc pl-4 space-y-1 text-xs text-[#8B0000]">
					<li>Chrome 127+ (Dev/Canary)에서 시도하세요.</li>
					<li>플래그 활성화: prompt-api, optimization-guide.</li>
					<li>22GB 이상 디스크, 4GB VRAM 또는 16GB RAM 권장.</li>
				</ul>
			</div>
		);
	}

	return null;
}
