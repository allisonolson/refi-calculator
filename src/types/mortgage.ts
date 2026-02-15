export interface CurrentLoanInputs {
  currentDate: string;             // YYYY-MM-DD
  principal: number;               // remaining balance
  annualRate: number;              // e.g., 6.625 (percent)
  monthlyPayment: number;         // required payment
  extraMonthlyPrincipal: number;  // additional principal/month
  loanEndDate: string;            // maturity date
}

export interface LumpSum {
  id: string;
  amount: number;
  date: string;                   // YYYY-MM-DD
}

export interface RefinanceOption {
  id: string;
  label: string;                  // user-editable name
  termYears: number;              // 15, 20, 30
  annualRate: number;             // percent
  startDate: string;              // YYYY-MM-DD, when this refi would begin
  desiredMonthlyPayment?: number; // optional per-option target payment
}

export interface PaymentSettings {
  recastDate?: string;            // optional YYYY-MM-DD
  desiredMonthlyPayment?: number; // optional target payment
}

export interface AmortizationRow {
  period: number;
  date: string;
  beginBalance: number;
  payment: number;
  extraPayment: number;
  lumpSumApplied: number;
  interest: number;
  principal: number;
  endBalance: number;
}

export interface ScenarioResult {
  id: string;
  label: string;
  basePayment: number;
  effectivePayment: number;       // base + extra
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
  payoffDate: string;
  payoffLabel: string;            // "15 years 8 months"
  interestSavingsVsCurrentBase: number;
  interestSavingsVsCurrentExtra: number;
  schedule: AmortizationRow[];
}

export interface CalculatorInputs {
  currentLoan: CurrentLoanInputs;
  lumpSums: LumpSum[];
  refinanceOptions: RefinanceOption[];
  paymentSettings: PaymentSettings;
}
