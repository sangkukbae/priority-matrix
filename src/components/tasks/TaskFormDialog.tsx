'use client';

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, X, Check, ChevronDown } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { taskFormSchema, type TaskFormSchema } from '@/lib/validations/task';
import {
	cn,
	generateId,
	formatDateCompact,
	getDueDateStatus,
	getDueDateLabel,
} from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { LabelPicker } from '@/components/tasks/LabelPicker';

interface TaskFormDialogProps {
	mode?: 'add' | 'edit';
	initialData?: Partial<TaskFormSchema> & { id?: string; completed?: boolean };
	quadrant?: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
	onSuccess?: () => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	showTrigger?: boolean;
}

const PRIORITIES = [
	{ value: 'high', label: '🔴 높음' },
	{ value: 'medium', label: '🟡 중간' },
	{ value: 'low', label: '🟢 낮음' },
	{ value: 'none', label: '⚫ 없음' },
] as const;

const QUADRANTS = [
	{ value: 'DO', label: '🔴 DO (해야 할 일)' },
	{ value: 'PLAN', label: '🟢 PLAN (계획할 일)' },
	{ value: 'DELEGATE', label: '🔵 DELEGATE (위임할 일)' },
	{ value: 'DELETE', label: '⚫ DELETE (삭제할 일)' },
] as const;

export function TaskFormDialog({
	mode = 'add',
	initialData,
	quadrant: defaultQuadrant = 'DO',
	onSuccess,
	open: controlledOpen,
	onOpenChange,
	showTrigger = false,
}: TaskFormDialogProps) {
	const isControlled =
		controlledOpen !== undefined && onOpenChange !== undefined;
	const [internalOpen, setInternalOpen] = useState(false);

	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = isControlled ? onOpenChange : setInternalOpen;

	const addTask = useTaskStore(state => state.addTask);
	const updateTask = useTaskStore(state => state.updateTask);

	const isCompleted = initialData?.completed ?? false;

	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const form = useForm<TaskFormSchema>({
		resolver: zodResolver(taskFormSchema),
	defaultValues: {
		title: initialData?.title || '',
		description: initialData?.description || '',
		quadrant: initialData?.quadrant || defaultQuadrant,
		priority: initialData?.priority || 'medium',
		dueDate:
			initialData?.dueDate ??
			(mode === 'add' ? new Date().toISOString() : undefined),
		checklist: initialData?.checklist || [],
		labels: initialData?.labels || [],
	},
});


	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'checklist',
	});

	const watchedChecklist = form.watch('checklist');

	useEffect(() => {
		if (open) {
			form.reset({
				title: initialData?.title || '',
				description: initialData?.description || '',
				quadrant: initialData?.quadrant || defaultQuadrant,
				priority: initialData?.priority || 'medium',
				dueDate:
					initialData?.dueDate ??
					(mode === 'add' ? new Date().toISOString() : undefined),
				checklist: initialData?.checklist || [],
				labels: initialData?.labels || [],
			});
		}
	}, [open, initialData, defaultQuadrant, form, mode]);

	function onSubmit(values: TaskFormSchema) {
		if (mode === 'edit' && initialData?.id) {
			updateTask(initialData.id, values);
			toast.success('작업이 수정되었습니다', {
				description: `"${values.title}" 작업이 업데이트되었습니다.`,
			});
		} else {
			addTask(values);
			toast.success('작업이 추가되었습니다', {
				description: `"${values.title}" 작업이 ${values.quadrant} 사분면에 추가되었습니다.`,
			});
		}

		setOpen(false);
		form.reset();
		onSuccess?.();
	}

	const addChecklistItem = () => {
		append({
			id: generateId(),
			text: '',
			completed: false,
		});
	};

	const handleChecklistKeyDown = (e: React.KeyboardEvent, index: number) => {
		// IME 조합 중일 때는 Enter 키를 무시 (macOS 한글 입력 중복 방지)
		if (e.nativeEvent.isComposing) {
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			addChecklistItem();
		}
		if (
			e.key === 'Backspace' &&
			form.getValues(`checklist.${index}.text`) === '' &&
			fields.length > 0
		) {
			e.preventDefault();
			remove(fields.length - 1);
		}
	};

	return (
		<>
			{mode === 'add' && (!isControlled || showTrigger) && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="bg-[#0079BF] hover:bg-[#026AA7] text-white rounded-sm font-medium"
								onClick={() => setOpen(true)}
							>
								<Plus className="w-4 h-4 mr-2" />
								작업 추가
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								작업 추가{' '}
								<KbdGroup className="text-sm bg-gray-100 rounded-sm px-1 py-0.5">
									<Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>N</Kbd>
								</KbdGroup>
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-trello shadow-trello-card max-h-[90vh] overflow-y-auto">
					<DialogHeader className="px-6 pt-6 pb-4 border-b border-[#DFE1E6] sticky top-0 bg-white z-10">
						<DialogTitle className="text-lg font-semibold text-[#172B4D]">
							{mode === 'add' ? '새 작업 추가' : '작업 수정'}
						</DialogTitle>
						<DialogDescription className="text-sm text-[#6B778C] mt-1">
							{mode === 'add'
								? '새 작업을 추가하고 아이젠하워 매트릭스에 배치하세요.'
								: '작업 정보를 수정하세요.'}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="p-6 space-y-4"
						>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium text-[#172B4D]">
										작업 제목 *
									</FormLabel>
									<FormControl>
										<Input
											placeholder="새 작업을 입력하세요..."
											className={cn(
												'trello-input',
												'w-full px-3 py-2',
												'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
												'text-sm text-[#172B4D] placeholder:text-[#9E9E9E]',
												'focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
												'transition-all duration-200'
											)}
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-xs text-[#EB5A46]" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="labels"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium text-[#172B4D]">
										레이블
									</FormLabel>
									<LabelPicker
										value={field.value || []}
										onChange={field.onChange}
									/>
									<FormMessage className="text-xs text-[#EB5A46]" />
								</FormItem>
							)}
						/>

						<FormField

								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-[#172B4D]">
											설명
										</FormLabel>
										<FormControl>
											<RichTextEditor
												value={field.value || ''}
												onChange={field.onChange}
												placeholder="작업에 대한 상세 설명..."
											/>
										</FormControl>
										<FormMessage className="text-xs text-[#EB5A46]" />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="quadrant"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-[#172B4D]">
												사분면
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger
														className={cn(
															'trello-select',
															'w-full px-3 py-2',
															'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
															'text-sm text-[#172B4D]',
															'focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
															'transition-all duration-200'
														)}
													>
														<SelectValue placeholder="사분면 선택" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border border-[#DFE1E6] rounded shadow-lg">
													{QUADRANTS.map(q => (
														<SelectItem
															key={q.value}
															value={q.value}
															className="text-sm text-[#172B4D] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
														>
															{q.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage className="text-xs text-[#EB5A46]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="priority"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-[#172B4D]">
												우선순위
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger
														className={cn(
															'trello-select',
															'w-full px-3 py-2',
															'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
															'text-sm text-[#172B4D]',
															'focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
															'transition-all duration-200'
														)}
													>
														<SelectValue placeholder="우선순위 선택" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border border-[#DFE1E6] rounded shadow-lg">
													{PRIORITIES.map(p => (
														<SelectItem
															key={p.value}
															value={p.value}
															className="text-sm text-[#172B4D] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
														>
															{p.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage className="text-xs text-[#EB5A46]" />
										</FormItem>
									)}
								/>
							</div>

						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => {
								const status = getDueDateStatus(field.value);
								const statusLabel = getDueDateLabel(status);
								const badgeStyles = {
									overdue: 'bg-[#EB5A46] text-white',
									today: 'bg-[#F2D600] text-[#172B4D]',
									soon: 'bg-[#F2D600] text-[#172B4D]',
									normal: '',
									none: '',
								};

								return (
									<FormItem className="flex flex-col">
										<FormLabel
											htmlFor={undefined}
											className="text-sm font-medium text-[#172B4D]"
										>
											마감일
										</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<button
															type="button"
															className={cn(
																'inline-flex items-center gap-2',
																'w-full px-3 py-2 text-left',
																'bg-[#091E420F] hover:bg-[#091E4224]',
																'border border-transparent rounded-trello',
																'text-sm font-medium text-[#172B4D]',
																'focus:bg-[#091E4224] focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
																'transition-all duration-200',
																!field.value && 'text-[#6B778C]'
															)}
														>
															<span className="flex-1">
																{field.value ? formatDateCompact(field.value) : '마감일 설정'}
															</span>

							{statusLabel && status !== 'overdue' && (
								<span
									className={cn(
										'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
										badgeStyles[status]
									)}
								>
									{statusLabel}
								</span>
							)}
							{statusLabel && status === 'overdue' && !isCompleted && (
								<span
									className={cn(
										'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
										badgeStyles[status]
									)}
								>
									{statusLabel}
								</span>
							)}


															<ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
														</button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-1"
													align="start"
												>
													{(() => {
														const selectedDate = field.value ? new Date(field.value) : today;
														return (
															<CalendarComponent
																mode="single"
																selected={selectedDate}
																onSelect={date => {
																	const next = date ?? selectedDate;
																	field.onChange(next?.toISOString());
																}}
																disabled={date => date < today}
																weekStartsOn={1}
																className="border-0"
															/>
														);
													})()}
												</PopoverContent>
											</Popover>

										<FormMessage className="text-xs text-[#EB5A46]" />
									</FormItem>
								);
							}}
						/>


							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<FormLabel className="text-sm font-medium text-[#172B4D]">
										체크리스트
									</FormLabel>
									<Button
										type="button"
										variant="ghost"
										onClick={addChecklistItem}
										className="text-xs text-[#0079BF] hover:text-[#026AA7] hover:bg-[#E3F2FD] px-2 py-1 h-auto"
									>
										<Plus className="w-3 h-3 mr-1" />
										항목 추가
									</Button>
								</div>

								<div className="space-y-2">
									{fields.map((field, index) => (
										<div
											key={field.id}
											className={cn(
												'flex items-center gap-3',
												'px-3 py-2.5',
												'bg-white border border-[#DFE1E6] rounded-lg',
												// 'shadow-sm hover:shadow-md',
												'transition-all duration-200',
												'focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20',
												watchedChecklist?.[index]?.completed &&
													'bg-[#F4F5F7] opacity-75'
											)}
										>
											<button
												type="button"
												className={cn(
													'flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center',
													'transition-all duration-200 cursor-pointer',
													watchedChecklist?.[index]?.completed
														? 'bg-[#61BD4F] border-[#61BD4F] text-white'
														: 'border-[#DFE1E6] hover:border-[#0079BF] hover:bg-[#F4F5F7]'
												)}
												onClick={() => {
													const current =
														watchedChecklist?.[index]?.completed ?? false;
													form.setValue(
														`checklist.${index}.completed`,
														!current
													);
												}}
											>
												{watchedChecklist?.[index]?.completed && (
													<Check className="w-3.5 h-3.5" />
												)}
											</button>

											<Input
												{...form.register(`checklist.${index}.text`)}
												placeholder={`체크리스트 항목 ${index + 1}`}
												className={cn(
													'flex-1 bg-transparent shadow-none border-none focus-visible:ring-0',
													'text-sm text-[#172B4D] placeholder:text-[#9E9E9E]',
													'focus:outline-none focus:ring-0 p-0',
													watchedChecklist?.[index]?.completed &&
														'line-through text-[#6B778C]'
												)}
												onKeyDown={e => handleChecklistKeyDown(e, index)}
											/>

											<button
												type="button"
												className="flex-shrink-0 p-1 text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFE2E2] rounded transition-colors"
												onClick={() => remove(index)}
											>
												<X className="w-3 h-3" />
											</button>
										</div>
									))}

									{fields.length === 0 && (
										<div
											className={cn(
												'flex items-center justify-center py-4',
												'border-2 border-dashed border-[#DFE1E6] rounded',
												'text-sm text-[#6B778C]'
											)}
										>
											체크리스트 항목이 없습니다. 위 버튼을 눌러 추가하세요.
										</div>
									)}
								</div>
							</div>

							<DialogFooter className="mt-6 pt-4 border-t border-[#DFE1E6]">
								<Button
									type="button"
									variant="secondary"
									onClick={() => setOpen(false)}
									className="px-4 py-2 text-sm font-medium text-[#42526E] hover:bg-[#F4F5F7] rounded transition-colors"
								>
									취소
								</Button>
								<Button
									type="submit"
									className="px-4 py-2 text-sm font-medium text-white bg-[#0079BF] hover:bg-[#026AA7] rounded transition-colors"
								>
									{mode === 'add' ? '추가' : '저장'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}
