import { differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Evaluates target timeline metrics to return current overages.
 * @param {string|Date} dueDate - Expected item completion date
 * @param {string|Date} [actualReturnDate] - Target check-in timestamp
 * @returns {Object} Metric profile capturing exact penalties
 */
export const calculateOverdueFine = (dueDate, actualReturnDate = new Date()) => {
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const returned = typeof actualReturnDate === 'string' ? parseISO(actualReturnDate) : actualReturnDate;
  
  const DAILY_FINE_RATE = 20; // Rs. 20 per day
  const overdueDays = differenceInCalendarDays(returned, due);
  
  if (overdueDays <= 0) {
    return { daysOverdue: 0, fineAmount: 0, isOverdue: false };
  }
  
  return {
    daysOverdue: overdueDays,
    fineAmount: overdueDays * DAILY_FINE_RATE,
    isOverdue: true
  };
};