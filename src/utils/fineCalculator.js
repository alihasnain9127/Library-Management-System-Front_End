import { parseISO, differenceInCalendarDays, isAfter } from 'date-fns';

const DAILY_FINE_RATE = 20; // Rs. 20 per day overdue

/**
 * Evaluates active checkout records against temporal anchors
 * @param {string} dueDateISO - The expected return timestamp
 * @param {string} [returnDateISO] - Optional absolute settlement timestamp
 * @returns {{ daysOverdue: number, fineAmount: number }}
 */
export const calculateOverdueMetrics = (dueDateISO, returnDateISO) => {
  if (!dueDateISO) return { daysOverdue: 0, fineAmount: 0 };

  const dueAnchor = parseISO(dueDateISO);
  // If item is already returned, check against the return date; otherwise, check against today
  const comparativeAnchor = returnDateISO ? parseISO(returnDateISO) : new Date();

  if (isAfter(comparativeAnchor, dueAnchor)) {
    const daysOverdue = differenceInCalendarDays(comparativeAnchor, dueAnchor);
    return {
      daysOverdue,
      fineAmount: daysOverdue * DAILY_FINE_RATE,
    };
  }

  return { daysOverdue: 0, fineAmount: 0 };
};