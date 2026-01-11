'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { taskFormSchema, type TaskFormSchema } from '@/lib/validations/task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuickAddFormProps {
	quadrant: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
	onSuccess?: () => void;
}

const PRIORITIES = [
	{ value: 'high', label: '🔴 높음', emoji: '🔴' },
	{ value: 'medium', label: '🟡 중간', emoji: '🟡' },
	{ value: 'low', label: '🟢 낮음', emoji: '🟢' },
	{ value: 'none', label: '⚫ 없음', emoji: '⚫' },
] as const;

export function QuickAddForm({ quadrant, onSuccess }: QuickAddFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showLimitAlert, setShowLimitAlert] = useState(false);
	const addTask = useTaskStore(state => state.addTask);
	const getTasksByQuadrant = useTaskStore(state => state.getTasksByQuadrant);

	const form = useForm<TaskFormSchema>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: '',
			description: '',
			quadrant,
			priority: 'medium',
			dueDate: undefined,
		},
	});

	function onSubmit(values: TaskFormSchema) {
		addTask(values);
		toast.success('작업이 추가되었습니다', {
			description: `"${values.title}"`,
		});
		form.reset();
		setIsOpen(false);
		onSuccess?.();
	}

	if (!isOpen) {
		const currentTasks = getTasksByQuadrant(quadrant);
		const isAtLimit = currentTasks.length >= 10;

		return (
			<Button
				variant="ghost"
				className={cn(
					'w-full justify-start text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded-trello',
					isAtLimit && 'opacity-50 cursor-not-allowed'
				)}
				onClick={() => {
					if (isAtLimit) {
						setShowLimitAlert(true);
					} else {
						setIsOpen(true);
					}
				}}
				disabled={isAtLimit}
			>
				<Plus className="w-4 h-4 mr-2" />
				작업 추가
			</Button>
		);
	}

	return (
		<>
			<AlertDialog open={showLimitAlert} onOpenChange={setShowLimitAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>작업 추가 제한</AlertDialogTitle>
					</AlertDialogHeader>
					<p className="text-sm text-muted-foreground">
						각 구역에는 최대 10개의 작업만 추가할 수 있습니다.
						기존 작업을 삭제하거나 다른 구역으로 이동시킨 후 다시 시도해주세요.
					</p>
					<AlertDialogFooter>
						<AlertDialogAction>확인</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="bg-white rounded-lg border border-[#DFE1E6] shadow-trello-card p-3">
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
				<Input
					placeholder="새 작업..."
					className={cn(
						'w-full px-3 py-2 h-auto text-sm',
						'border border-[#DFE1E6] rounded',
						'bg-[#FAFBFC] text-[#172B4D]',
						'placeholder:text-[#9E9E9E]',
						'transition-all duration-200',
						'focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none'
					)}
					{...form.register('title')}
					autoFocus
				/>
				{form.formState.errors.title && (
					<p className="text-xs text-[#EB5A46]">
						{form.formState.errors.title.message}
					</p>
				)}

				<div className="flex items-center gap-2">
					<Select
						value={form.watch('priority')}
						onValueChange={value =>
							form.setValue('priority', value as TaskFormSchema['priority'])
						}
					>
						<SelectTrigger
							className={cn(
								'h-6 w-20 px-2 py-0',
								'border border-[#DFE1E6] rounded',
								'bg-white text-xs',
								'focus:outline-none focus:ring-2 focus:ring-[#0079BF]/20',
								'shadow-none'
							)}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-white border border-[#DFE1E6] rounded shadow-trello-card min-w-[100px]">
							{PRIORITIES.map(p => (
								<SelectItem
									key={p.value}
									value={p.value}
									className={cn(
										'text-xs text-[#172B4D]',
										'hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]',
										'cursor-pointer px-2 py-1.5'
									)}
								>
									<span className="flex items-center gap-2">{p.label}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2 pt-1">
					<Button
						type="submit"
						size="sm"
						className="h-7 px-3 text-xs font-medium text-white bg-[#0079BF] hover:bg-[#026AA7] rounded transition-colors"
					>
						추가
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded transition-colors"
						onClick={() => {
							setIsOpen(false);
							form.reset();
						}}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</form>
		</div>
		</>
	);
}
