/**
 * Calculate monthly payment using standard PMT formula
 * PMT = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export function calcMonthlyPayment(
  principal: number,
  monthlyRate: number,
  totalMonths: number
): number {
  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;

  return numerator / denominator;
}

/**
 * Calculate months to payoff given principal, rate, and payment
 * Solve for n in PMT formula: n = -log(1 - r*P/PMT) / log(1 + r)
 */
export function calcMonthsToPayoff(
  principal: number,
  monthlyRate: number,
  payment: number
): number {
  if (monthlyRate === 0) {
    return Math.ceil(principal / payment);
  }

  if (payment <= principal * monthlyRate) {
    // Payment doesn't even cover interest - will never pay off
    return Infinity;
  }

  const numerator = Math.log(1 - (monthlyRate * principal) / payment);
  const denominator = Math.log(1 + monthlyRate);

  return Math.ceil(-numerator / denominator);
}

/**
 * Format duration in months to human-readable string
 * e.g., 188 months -> "15 years 8 months"
 */
export function formatDuration(months: number): string {
  if (months === Infinity || isNaN(months)) {
    return 'Never';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

/**
 * Convert annual percentage rate to monthly decimal rate
 */
export function annualToMonthlyRate(annualPercent: number): number {
  return annualPercent / 100 / 12;
}
