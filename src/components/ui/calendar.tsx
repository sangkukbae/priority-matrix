import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { ko } from 'date-fns/locale';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
	({ className, classNames, showOutsideDays = true, ...props }, _ref) => (
		<DayPicker
			showOutsideDays={showOutsideDays}
			mode="single"
			className={cn('p-2', className)}
			locale={ko}
			classNames={{
				months: 'flex flex-col space-y-3',
				month: 'space-y-2',
				caption: 'flex justify-center pt-1 relative items-center h-7',
				caption_label: 'text-sm font-semibold text-[#172B4D]',
				nav: 'space-x-1 flex items-center h-7',
				nav_button: cn(
					'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100',
					'border border-[#DFE1E6] rounded flex items-center justify-center',
					'text-[#6B778C] hover:bg-[#F4F5F7] transition-colors'
				),
				nav_button_previous: 'absolute left-1',
				nav_button_next: 'absolute right-1',
				table: 'w-full border-collapse space-y-1',
				head_row: 'flex justify-between mb-1',
				head_cell:
					'text-[#6B778C] text-xs font-medium w-8 h-6 flex items-center justify-center',
				row: 'flex justify-between w-full',
				cell: 'h-8 w-8 text-center text-sm p-0 relative flex items-center justify-center',
				day: cn(
					'h-8 w-8 p-0 font-medium text-sm transition-colors rounded-full',
					'text-[#172B4D] hover:bg-[#F4F5F7]'
				),
				day_selected:
					'!bg-[#0079BF] !text-white hover:!bg-[#0079BF] hover:!text-white font-semibold',
				day_today: 'bg-[#F4F5F7] text-[#172B4D] font-semibold',
				day_outside: 'text-[#9E9E9E] opacity-50',
				day_disabled: 'text-[#9E9E9E] opacity-50',
				day_range_middle: 'bg-[#0079BF]/10',
				day_hidden: 'invisible',
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) =>
					orientation === 'left' ? (
						<ChevronLeft className="h-4 w-4 text-[#6B778C]" />
					) : (
						<ChevronRight className="h-4 w-4 text-[#6B778C]" />
					),
			}}
			{...props}
		/>
	)
);
Calendar.displayName = 'Calendar';

export { Calendar };
