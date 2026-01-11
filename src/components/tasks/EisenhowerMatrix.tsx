import { useState } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
	DndContext,
	DragOverlay,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Quadrant } from './Quadrant';
import { TaskCard } from './TaskCard';
import { TaskFormDialog } from './TaskFormDialog';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import type { Task, QuadrantType } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { toast } from 'sonner';

const quadrantConfig = {
	DO: { title: '해야 할 일', id: 'DO' as QuadrantType },
	PLAN: { title: '계획할 일', id: 'PLAN' as QuadrantType },
	DELEGATE: {
		title: '위임할 일',
		id: 'DELEGATE' as QuadrantType,
	},
	DELETE: {
		title: '삭제할 일',
		id: 'DELETE' as QuadrantType,
	},
};

export function EisenhowerMatrix() {
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const tasks = useTaskStore(state => state.tasks);
	const moveTask = useTaskStore(state => state.moveTask);
	const reorderTasks = useTaskStore(state => state.reorderTasks);
	const deleteTask = useTaskStore(state => state.deleteTask);
	const toggleComplete = useTaskStore(state => state.toggleComplete);
	const getTasksByQuadrant = useTaskStore(state => state.getTasksByQuadrant);
	const getTaskStats = useTaskStore(state => state.getTaskStats);
	const getTaskById = useTaskStore(state => state.getTaskById);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const stats = getTaskStats();

	function handleDragStart(event: DragStartEvent) {
		const task = tasks.find(t => t.id === event.active.id);
		if (task) {
			setActiveTask(task);
		}
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		setActiveTask(null);

		if (!over) return;

		const activeTaskId = active.id as string;
		const overId = over.id as string;

		const task = tasks.find(t => t.id === activeTaskId);
		if (!task) return;

		const validQuadrants: QuadrantType[] = ['DO', 'PLAN', 'DELEGATE', 'DELETE'];
		const isDroppingOnQuadrant = validQuadrants.includes(overId as QuadrantType);

		if (isDroppingOnQuadrant) {
			const overQuadrantId = overId as QuadrantType;
			if (task.quadrant !== overQuadrantId) {
				moveTask(activeTaskId, overQuadrantId);
				toast.success('작업 이동됨', {
					description: `"${task.title}" → ${
						quadrantConfig[overQuadrantId].title.split(' ')[0]
					}`,
				});
			}
		} else {
			const overTask = tasks.find(t => t.id === overId);
			const isSameQuadrant = overTask && task.quadrant === overTask.quadrant;
			const isDifferentTask = activeTaskId !== overId;

			if (isSameQuadrant && isDifferentTask) {
				reorderTasks(task.quadrant, activeTaskId, overId);
			}
		}
	}

	function handleEditTask(task: Task) {
		setEditingTask(task);
		setIsEditDialogOpen(true);
	}

	function handleDeleteTask(taskId: string) {
		const task = getTaskById(taskId);
		if (task) {
			setTaskToDelete(task);
			setIsDeleteDialogOpen(true);
		}
	}

	function handleConfirmDelete() {
		if (taskToDelete) {
			const success = deleteTask(taskToDelete.id);

			if (success) {
				toast.success('삭제되었습니다', {
					description: `"${taskToDelete.title}" 작업이 삭제되었습니다.`,
				});
			} else {
				toast.error('삭제 실패', {
					description: '작업이 존재하지 않습니다.',
				});
			}

			setTaskToDelete(null);
			setIsDeleteDialogOpen(false);
		}
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
					<Quadrant
						{...quadrantConfig.DO}
						tasks={getTasksByQuadrant('DO')}
						taskCount={stats.DO}
						onEditTask={handleEditTask}
						onDeleteTask={handleDeleteTask}
						onToggleComplete={toggleComplete}
					/>

					<Quadrant
						{...quadrantConfig.PLAN}
						tasks={getTasksByQuadrant('PLAN')}
						taskCount={stats.PLAN}
						onEditTask={handleEditTask}
						onDeleteTask={handleDeleteTask}
						onToggleComplete={toggleComplete}
					/>

					<Quadrant
						{...quadrantConfig.DELEGATE}
						tasks={getTasksByQuadrant('DELEGATE')}
						taskCount={stats.DELEGATE}
						onEditTask={handleEditTask}
						onDeleteTask={handleDeleteTask}
						onToggleComplete={toggleComplete}
					/>

					<Quadrant
						{...quadrantConfig.DELETE}
						tasks={getTasksByQuadrant('DELETE')}
						taskCount={stats.DELETE}
						onEditTask={handleEditTask}
						onDeleteTask={handleDeleteTask}
						onToggleComplete={toggleComplete}
					/>
				</div>

				<DragOverlay>
					{activeTask ? (
						<div className="transform rotate-2 opacity-90">
							<TaskCard
								task={activeTask}
								onEdit={() => {}}
								onDelete={() => {}}
								onToggleComplete={() => {}}
							/>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			<TaskFormDialog
				mode="edit"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				initialData={editingTask || undefined}
			/>

			<DeleteTaskDialog
				task={taskToDelete}
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
