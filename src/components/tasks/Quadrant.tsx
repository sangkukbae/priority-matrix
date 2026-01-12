import { useDroppable } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Info } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { QuickAddForm } from './QuickAddForm';
import type { Task, QuadrantType } from '@/types/task';
import { cn } from '@/lib/utils';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';

const MAX_TASKS_PER_QUADRANT = 10;

const quadrantDescriptions: Record<QuadrantType, string> = {
	DO: '긴급하고 중요한 일로, 지금 바로 처리해야 할 핵심 업무가 여기에 들어갑니다.',
	PLAN: '중요하지만 긴급하지 않은 일로, 일정에 넣어 계획적으로 수행해야 할 성장·개발 관련 업무입니다.',
	DELEGATE:
		'긴급하지만 중요하지 않은 일로, 다른 사람에게 맡기는 것이 좋은 업무들입니다.',
	DELETE:
		'긴급하지도 중요하지도 않은 방해 요소로, 과감히 줄이거나 없애야 할 일들입니다.',
};

interface QuadrantProps {
	id: QuadrantType;
	title: string;
	tasks: Task[];
	taskCount: number;
	onEditTask: (task: Task) => void;
	onDeleteTask: (taskId: string) => void;
	onToggleComplete: (taskId: string) => void;
}

const quadrantColors = {
	DO: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		header: 'bg-red-100 text-red-800',
		accent: 'bg-red-500',
	},
	PLAN: {
		bg: 'bg-blue-50',
		border: 'border-blue-200',
		header: 'bg-blue-100 text-blue-800',
		accent: 'bg-blue-500',
	},
	DELEGATE: {
		bg: 'bg-yellow-50',
		border: 'border-yellow-200',
		header: 'bg-yellow-100 text-yellow-800',
		accent: 'bg-yellow-500',
	},
	DELETE: {
		bg: 'bg-gray-50',
		border: 'border-gray-200',
		header: 'bg-gray-100 text-gray-800',
		accent: 'bg-gray-500',
	},
};

export function Quadrant({
	id,
	title,
	tasks,
	taskCount,
	onEditTask,
	onDeleteTask,
	onToggleComplete,
}: QuadrantProps) {
	const { setNodeRef, isOver } = useDroppable({ id });

	const colors = quadrantColors[id];

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'flex flex-col rounded-xl border-2 transition-all duration-200',
				colors.bg,
				colors.border,
				isOver && 'ring-2 ring-trello-blue ring-offset-2 scale-[1.02]'
			)}
		>
			{/* Quadrant header */}
			<div
				className={cn(
					'flex items-center justify-between px-4 py-3 rounded-t-xl',
					colors.header
				)}
			>
				<div className="flex items-center gap-2">
					<div className={cn('w-3 h-3 rounded-full', colors.accent)} />
					<h2 className="font-semibold text-sm">{title}</h2>
					<HoverCard openDelay={0} closeDelay={100}>
						<HoverCardTrigger asChild>
							<button
								type="button"
								className="text-muted-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full ml-0.5"
							>
								<Info className="w-4 h-4" />
								<span className="sr-only">정보</span>
							</button>
						</HoverCardTrigger>
						<HoverCardContent className="w-auto max-w-[300px] break-keep text-center p-3 bg-white/90 backdrop-blur-sm border shadow-lg">
							<p className="text-sm font-medium text-[#172B4D]">
								{quadrantDescriptions[id]}
							</p>
						</HoverCardContent>
					</HoverCard>
				</div>
				<span
					className={cn(
						'px-2 py-0.5 rounded-full text-xs font-medium',
						'bg-white/50'
					)}
				>
					{taskCount}
				</span>
			</div>

			{/* Task list area */}
			<div className="flex-1 p-3 space-y-2 min-h-[200px]">
				<SortableContext
					items={tasks.map(t => t.id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.map(task => (
						<TaskCard
							key={task.id}
							task={task}
							onEdit={onEditTask}
							onDelete={onDeleteTask}
							onToggleComplete={onToggleComplete}
						/>
					))}
				</SortableContext>

				{/* Empty state */}
				{tasks.length === 0 && (
					<div
						className={cn(
							'flex items-center justify-center py-8 text-sm',
							'text-gray-400 border-2 border-dashed border-gray-300 rounded-lg',
							isOver && 'border-trello-blue bg-trello-blue/5'
						)}
					>
						여기에 작업 추가
					</div>
				)}
			</div>

			{/* Quick add form */}
			<div className="p-3 pt-0">
				{taskCount >= MAX_TASKS_PER_QUADRANT ? (
					<div className="text-xs text-[#6B778C] text-center py-2">
						작업은 최대 10개 이상 추가할 수 없습니다.
					</div>
				) : (
					<QuickAddForm quadrant={id} />
				)}
			</div>
		</div>
	);
}
