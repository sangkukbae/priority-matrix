import { useEffect, useRef, useState } from 'react';
import {
	MoreHorizontal,
	Image as ImageIcon,
	X,
	Check,
	Archive,
	ChevronLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { ArchivePanel } from '@/components/archive/ArchivePanel';

export function HeaderMenu() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isBackgroundFormOpen, setIsBackgroundFormOpen] = useState(false);
	const [isArchiveOpen, setIsArchiveOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const [error, setError] = useState('');
	const panelRef = useRef<HTMLDivElement | null>(null);
	const archiveRef = useRef<HTMLDivElement | null>(null);
	const menuContentRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	const backgroundImage = useSettingsStore(state => state.backgroundImage);
	const setBackgroundImage = useSettingsStore(
		state => state.setBackgroundImage,
	);

	const handleClose = () => {
		setImageUrl('');
		setError('');
		setIsBackgroundFormOpen(false);
		setIsArchiveOpen(false);
	};

	const handleArchiveClose = () => {
		setIsArchiveOpen(false);
	};

	const handleBack = () => {
		handleClose();
		setIsMenuOpen(true);
	};

	const handleOpenChange = (open: boolean) => {
		if (isBackgroundFormOpen || isArchiveOpen) {
			handleClose();
			setIsMenuOpen(false);
			return;
		}
		setIsMenuOpen(open);
	};

	useEffect(() => {
		if (!isBackgroundFormOpen && !isArchiveOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;

			// Check if click is inside any open panel or the menu trigger
			if (
				(isBackgroundFormOpen && panelRef.current?.contains(target)) ||
				(isArchiveOpen && archiveRef.current?.contains(target)) ||
				menuContentRef.current?.contains(target) ||
				triggerRef.current?.contains(target)
			) {
				return;
			}

			handleClose();
			handleArchiveClose();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleClose();
				handleArchiveClose();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isBackgroundFormOpen, isArchiveOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!imageUrl.trim()) {
			setError('이미지 URL을 입력해주세요');
			return;
		}

		try {
			new URL(imageUrl);
		} catch {
			setError('올바른 URL 형식이 아닙니다');
			return;
		}

		setBackgroundImage(imageUrl);
		handleClose();
	};

	return (
		<div className="relative">
			<DropdownMenu open={isMenuOpen} onOpenChange={handleOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						ref={triggerRef}
						variant="ghost"
						size="icon"
						className={cn(
							'h-9 w-9 rounded-sm',
							'bg-transparent hover:bg-[#091E420F]',
							'text-[#42526E]',
						)}
						aria-label="더보기 메뉴"
					>
						<MoreHorizontal className="w-5 h-5" />
						<span className="sr-only">더보기 메뉴</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-64 p-1"
					ref={menuContentRef}
				>
					<DropdownMenuItem
						onSelect={event => {
							event.preventDefault();
							setIsMenuOpen(false);
							handleClose(); // Close background if open
							setIsArchiveOpen(true);
						}}
						className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
					>
						<Archive className="w-4 h-4 mr-2 text-[#172B4D]" />
						아카이브 목록
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={event => {
							event.preventDefault();
							setIsMenuOpen(false);
							handleArchiveClose(); // Close archive if open
							setIsBackgroundFormOpen(true);
						}}
						className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
					>
						<ImageIcon className="w-4 h-4 mr-2 text-[#172B4D]" />
						배경 화면 변경하기
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{isBackgroundFormOpen && (
				<div
					ref={panelRef}
					role="dialog"
					aria-label="배경 화면 변경"
					className="absolute right-0 mt-2 w-96 rounded-lg border border-[#DFE1E6] bg-white shadow-trello-card p-4 z-50"
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={handleBack}
									className="h-8 w-8 rounded-sm text-[#6B778C] hover:bg-[#F4F5F7] -ml-2"
									aria-label="뒤로 가기"
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>
								<h4 className="text-lg font-semibold text-[#172B4D]">
									배경 화면 변경
								</h4>
							</div>
							<button
								onClick={handleClose}
								className="p-1 rounded-md text-[#6B778C] hover:bg-[#F4F5F7]"
								aria-label="닫기"
								type="button"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="background-url"
									className="text-xs font-medium text-[#6B778C]"
								>
									이미지 URL
								</label>
								<Input
									id="background-url"
									type="url"
									placeholder="https://example.com/image.jpg"
									value={imageUrl}
									onChange={event => {
										setImageUrl(event.target.value);
										setError('');
									}}
									className={cn(
										'text-sm',
										error &&
											'border-[#EB5A46] focus:border-[#EB5A46] focus-visible:ring-[#EB5A46]/20',
									)}
								/>
								{error && <p className="text-xs text-[#EB5A46]">{error}</p>}
							</div>

							<div className="flex gap-2">
								<Button
									type="submit"
									size="sm"
									className="flex-1 rounded-lg bg-[#0079BF] hover:bg-[#026AA7] text-white"
								>
									<Check className="w-4 h-4 mr-1" />
									적용
								</Button>
							</div>
						</form>

						<div className="pt-3 border-t border-[#DFE1E6]">
							<p className="text-xs text-[#6B778C] mb-2">현재 배경</p>
							<div
								className="w-full h-16 rounded-lg bg-cover bg-center border border-[#DFE1E6]"
								style={{ backgroundImage: `url('${backgroundImage}')` }}
							/>
						</div>
					</div>
				</div>
			)}

			{isArchiveOpen && (
				<div ref={archiveRef} className="absolute right-0 mt-2 z-50">
					<ArchivePanel onClose={handleArchiveClose} onBack={handleBack} />
				</div>
			)}
		</div>
	);
}
