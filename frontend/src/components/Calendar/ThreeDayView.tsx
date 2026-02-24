import React from 'react';
import { Navigate } from 'react-big-calendar';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';

/**
 * Custom 3-day view for react-big-calendar.
 * Registers as the 'threeDay' view key.
 */
export class ThreeDayView extends React.Component<Record<string, unknown>> {
  render() {
    const { date, localizer, ...rest } = this.props;
    const range = ThreeDayView.range(date as Date);
    return <TimeGrid date={date} localizer={localizer} range={range} {...rest} />;
  }

  static range(date: Date): Date[] {
    return [date, addDays(date, 1), addDays(date, 2)];
  }

  static navigate(date: Date, action: string): Date {
    switch (action) {
      case Navigate.PREVIOUS:
        return addDays(date, -3);
      case Navigate.NEXT:
        return addDays(date, 3);
      default:
        return date;
    }
  }

  static title(date: Date): string {
    return `${format(date, 'd MMM', { locale: fr })} – ${format(addDays(date, 2), 'd MMM yyyy', { locale: fr })}`;
  }
}
