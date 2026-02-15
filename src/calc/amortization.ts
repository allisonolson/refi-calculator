import { addMonths, format, parseISO } from 'date-fns';
import type { AmortizationRow, LumpSum } from '../types/mortgage';
import { calcMonthlyPayment, annualToMonthlyRate } from './formulas';

export interface AmortizationConfig {
  startDate: string;              // YYYY-MM-DD
  startingBalance: number;
  annualRate: number;             // percent
  basePayment: number;
  extraMonthlyPrincipal: number;
  lumpSums: LumpSum[];
  recastDate?: string;            // YYYY-MM-DD
  termMonths?: number;            // for recalculation after recast
  maxMonths?: number;             // safety limit, default 360
}

export function generateSchedule(config: AmortizationConfig): AmortizationRow[] {
  const {
    startDate,
    startingBalance,
    annualRate,
    extraMonthlyPrincipal,
    lumpSums,
    recastDate,
    termMonths,
    maxMonths = 360
  } = config;

  let basePayment = config.basePayment;
  const monthlyRate = annualToMonthlyRate(annualRate);
  const schedule: AmortizationRow[] = [];

  let balance = startingBalance;
  // Normalize to the 1st of the next month (since current month's payment has already been made)
  const startDateParsed = parseISO(startDate);
  let currentDate = new Date(startDateParsed.getFullYear(), startDateParsed.getMonth(), 1);

  // If current date is after the 1st, move to next month
  if (startDateParsed.getDate() > 1) {
    currentDate = addMonths(currentDate, 1);
  }

  let period = 0;
  let hasRecast = false; // Track whether we've already recast

  // Sort lump sums by date for efficient lookup
  const sortedLumpSums = [...lumpSums].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Track which lump sums have been applied
  const appliedLumpSums = new Set<string>();

  while (balance > 0.01 && period < maxMonths) {
    period++;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const beginBalance = balance;

    // Check for lump sums - apply any lump sums that occur before this payment
    // and haven't been applied yet
    let lumpSumApplied = 0;
    for (const ls of sortedLumpSums) {
      if (appliedLumpSums.has(ls.id)) continue;

      const lumpDate = parseISO(ls.date);
      // Apply lump sum if it's dated before or during this payment period
      if (lumpDate < currentDate) {
        lumpSumApplied += ls.amount;
        appliedLumpSums.add(ls.id);
      }
    }

    // Apply lump sum to principal first
    balance -= lumpSumApplied;

    // Calculate interest AFTER applying lump sum
    // This ensures that when recast happens on the same day as lump sum,
    // interest is calculated on the reduced balance
    const interest = balance * monthlyRate;

    // Check for recast - trigger on the first period on or after the recast date
    if (recastDate && !hasRecast && termMonths) {
      const recastDateTime = parseISO(recastDate);
      // Recast if this period's month/year is >= recast date's month/year
      const shouldRecast = currentDate.getFullYear() > recastDateTime.getFullYear() ||
        (currentDate.getFullYear() === recastDateTime.getFullYear() &&
         currentDate.getMonth() >= recastDateTime.getMonth());

      if (shouldRecast) {
        // Recalculate base payment based on remaining balance and term
        const remainingMonths = termMonths - period + 1;
        basePayment = calcMonthlyPayment(balance, monthlyRate, remainingMonths);
        hasRecast = true; // Mark that we've recast to prevent recasting again
      }
    }

    // Calculate total payment
    let totalPayment = basePayment + extraMonthlyPrincipal;
    let extraPayment = extraMonthlyPrincipal;

    // Final payment adjustment - can't pay more than balance + interest
    if (totalPayment > balance + interest) {
      totalPayment = balance + interest;
      extraPayment = totalPayment - basePayment;
      if (extraPayment < 0) {
        extraPayment = 0;
      }
    }

    // Principal portion of payment
    const principalPayment = totalPayment - interest;

    // Update balance
    balance -= principalPayment;

    // Ensure balance doesn't go negative due to rounding
    if (balance < 0) balance = 0;

    schedule.push({
      period,
      date: dateStr,
      beginBalance,
      payment: basePayment,
      extraPayment,
      lumpSumApplied,
      interest,
      principal: principalPayment + lumpSumApplied,
      endBalance: balance
    });

    // Move to next month
    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
}

/**
 * Calculate total interest from schedule
 */
export function calculateTotalInterest(schedule: AmortizationRow[]): number {
  return schedule.reduce((sum, row) => sum + row.interest, 0);
}

/**
 * Calculate total paid (all payments + lump sums)
 */
export function calculateTotalPaid(schedule: AmortizationRow[]): number {
  return schedule.reduce(
    (sum, row) => sum + row.payment + row.extraPayment + row.lumpSumApplied,
    0
  );
}
