import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type Matcher, type SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils';
import { ko } from 'date-fns/locale';

export type CalendarProps = Omit<
	React.ComponentProps<typeof DayPicker>,
	'selected' | 'disabled' | 'mode' | 'onSelect'
> & {
	selected?: Date;
	disabled?: Matcher | Matcher[];
	onSelect?: SelectSingleEventHandler;
	mode?: 'single';
};

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
	(
		{ className, classNames, showOutsideDays = true, selected, disabled, ...props },
		ref
	) => {
		const today = React.useMemo(() => {
			const now = new Date();
			now.setHours(0, 0, 0, 0);
			return now;
		}, []);

		const resolvedDisabled = React.useMemo(() => {
			const pastDates = { before: today };
			if (!disabled) {
				return pastDates;
			}
			return Array.isArray(disabled)
				? [pastDates, ...disabled]
				: [pastDates, disabled];
		}, [disabled, today]);

		const resolvedSelected = selected ?? today;

		return (
			<div ref={ref} className={cn('p-2', className)}>
				<DayPicker
					showOutsideDays={showOutsideDays}
					mode="single"
					locale={ko}
					selected={resolvedSelected}
					disabled={resolvedDisabled}
					classNames={{
						months: 'flex flex-col space-y-3',
						month: 'space-y-2',
						month_caption: 'flex justify-center pt-1 relative items-center h-7',
						caption_label: 'text-sm font-semibold text-trello-charcoal',
						nav: 'space-x-1 flex items-center h-7',
						button_previous: cn(
							'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
							'border border-trello-border rounded-trello flex items-center justify-center',
							'text-trello-gray hover:bg-trello-light transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trello-blue',
							'absolute left-1'
						),
						button_next: cn(
							'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
							'border border-trello-border rounded-trello flex items-center justify-center',
							'text-trello-gray hover:bg-trello-light transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trello-blue',
							'absolute right-1'
						),
						month_grid: 'w-full border-collapse space-y-1',
						weekdays: 'flex justify-between mb-1',
						weekday:
							'text-trello-gray text-xs font-medium w-8 h-6 flex items-center justify-center',
						week: 'flex justify-between w-full',
						day: 'h-8 w-8 text-center text-sm p-0 relative flex items-center justify-center text-trello-charcoal group',
						day_button: cn(
							'h-8 w-8 p-0 font-medium text-sm transition-colors rounded-full flex items-center justify-center',
							'text-trello-charcoal hover:bg-trello-light',
							'[.today_&]:text-trello-blue [.today_&]:font-bold',
							'group-aria-selected:bg-trello-blue group-aria-selected:text-white group-aria-selected:font-semibold group-aria-selected:opacity-100',
							'group-aria-selected:hover:bg-[#026AA7] group-aria-selected:hover:text-white',
							'group-aria-selected:[.today_&]:text-white',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trello-blue'
						),
						selected: 'bg-transparent',
						today: 'today',
						outside: 'text-trello-gray opacity-50',
						disabled:
							'text-trello-gray opacity-30 cursor-not-allowed hover:bg-transparent',
						range_middle: 'bg-trello-blue/10',
						hidden: 'invisible',
						...classNames,
					}}
					components={{
						Chevron: ({ orientation }) =>
							orientation === 'left' ? (
								<ChevronLeft className="h-4 w-4 text-trello-gray" />
							) : (
								<ChevronRight className="h-4 w-4 text-trello-gray" />
							),
					}}
					{...props}
				/>
			</div>
		);
	}
);
Calendar.displayName = 'Calendar';

export { Calendar };
