import type {
  CalculatorInputs,
  ScenarioResult
} from '../types/mortgage';
import {
  generateSchedule,
  calculateTotalInterest,
  calculateTotalPaid
} from './amortization';
import { formatDuration, calcMonthlyPayment, annualToMonthlyRate, calcMonthsToPayoff } from './formulas';
import { differenceInMonths, parseISO } from 'date-fns';

export function computeAllScenarios(inputs: CalculatorInputs): ScenarioResult[] {
  const scenarios: ScenarioResult[] = [];
  const { currentLoan, lumpSums, refinanceOptions, paymentSettings } = inputs;

  const monthlyRate = annualToMonthlyRate(currentLoan.annualRate);

  // For recast scenarios, use the loan maturity date if provided
  // Otherwise, calculate remaining term based on balance, rate, and payment
  const remainingMonths = paymentSettings.loanMaturityDate
    ? differenceInMonths(
        parseISO(paymentSettings.loanMaturityDate),
        parseISO(currentLoan.currentDate)
      )
    : calcMonthsToPayoff(
        currentLoan.principal,
        monthlyRate,
        currentLoan.monthlyPayment
      );

  // Scenario 1: Current (base) - minimum payment only
  const currentBaseSchedule = generateSchedule({
    startDate: currentLoan.currentDate,
    startingBalance: currentLoan.principal,
    annualRate: currentLoan.annualRate,
    basePayment: currentLoan.monthlyPayment,
    extraMonthlyPrincipal: 0,
    lumpSums: []
  });

  const currentBase: ScenarioResult = {
    id: 'current-base',
    label: 'Current (base)',
    basePayment: currentLoan.monthlyPayment,
    effectivePayment: currentLoan.monthlyPayment,
    totalInterest: calculateTotalInterest(currentBaseSchedule),
    totalPaid: calculateTotalPaid(currentBaseSchedule),
    monthsToPayoff: currentBaseSchedule.length,
    payoffDate: currentBaseSchedule[currentBaseSchedule.length - 1]?.date || '',
    payoffLabel: formatDuration(currentBaseSchedule.length),
    interestSavingsVsCurrentBase: 0,
    interestSavingsVsCurrentExtra: 0,
    schedule: currentBaseSchedule
  };
  scenarios.push(currentBase);

  // Scenario 2: Current (with extra) - with extra payments and lump sums
  const currentExtraSchedule = generateSchedule({
    startDate: currentLoan.currentDate,
    startingBalance: currentLoan.principal,
    annualRate: currentLoan.annualRate,
    basePayment: currentLoan.monthlyPayment,
    extraMonthlyPrincipal: currentLoan.extraMonthlyPrincipal,
    lumpSums: lumpSums
  });

  const currentExtra: ScenarioResult = {
    id: 'current-extra',
    label: 'Current (with extra)',
    basePayment: currentLoan.monthlyPayment,
    effectivePayment: currentLoan.monthlyPayment + currentLoan.extraMonthlyPrincipal,
    totalInterest: calculateTotalInterest(currentExtraSchedule),
    totalPaid: calculateTotalPaid(currentExtraSchedule),
    monthsToPayoff: currentExtraSchedule.length,
    payoffDate: currentExtraSchedule[currentExtraSchedule.length - 1]?.date || '',
    payoffLabel: formatDuration(currentExtraSchedule.length),
    interestSavingsVsCurrentBase: currentBase.totalInterest - calculateTotalInterest(currentExtraSchedule),
    interestSavingsVsCurrentExtra: 0,
    schedule: currentExtraSchedule
  };
  scenarios.push(currentExtra);

  // Scenario 3: Current + recast (if recast date is set)
  if (paymentSettings.recastDate) {
    const currentRecastSchedule = generateSchedule({
      startDate: currentLoan.currentDate,
      startingBalance: currentLoan.principal,
      annualRate: currentLoan.annualRate,
      basePayment: currentLoan.monthlyPayment,
      extraMonthlyPrincipal: currentLoan.extraMonthlyPrincipal,
      lumpSums: lumpSums,
      recastDate: paymentSettings.recastDate,
      termMonths: remainingMonths
    });

    // Find the recast payment (base payment after recast date)
    const recastRow = currentRecastSchedule.find(row => row.date >= paymentSettings.recastDate!);
    const recastPayment = recastRow?.payment || currentLoan.monthlyPayment;

    const currentRecast: ScenarioResult = {
      id: 'current-recast',
      label: 'Current + recast',
      basePayment: recastPayment,
      effectivePayment: recastPayment + currentLoan.extraMonthlyPrincipal,
      totalInterest: calculateTotalInterest(currentRecastSchedule),
      totalPaid: calculateTotalPaid(currentRecastSchedule),
      monthsToPayoff: currentRecastSchedule.length,
      payoffDate: currentRecastSchedule[currentRecastSchedule.length - 1]?.date || '',
      payoffLabel: formatDuration(currentRecastSchedule.length),
      interestSavingsVsCurrentBase: currentBase.totalInterest - calculateTotalInterest(currentRecastSchedule),
      interestSavingsVsCurrentExtra: currentExtra.totalInterest - calculateTotalInterest(currentRecastSchedule),
      schedule: currentRecastSchedule
    };
    scenarios.push(currentRecast);
  }

  // Refinance scenarios
  refinanceOptions.forEach(refi => {
    // Calculate two-phase schedules

    // Determine which lump sums apply before refi
    const lumpsBeforeRefi = lumpSums.filter(ls => ls.date < refi.startDate);
    const lumpsAfterRefi = lumpSums.filter(ls => ls.date >= refi.startDate);

    // Phase 1: Current loan until refi date
    const phase1Schedule = generateSchedule({
      startDate: currentLoan.currentDate,
      startingBalance: currentLoan.principal,
      annualRate: currentLoan.annualRate,
      basePayment: currentLoan.monthlyPayment,
      extraMonthlyPrincipal: currentLoan.extraMonthlyPrincipal,
      lumpSums: lumpsBeforeRefi,
      maxMonths: differenceInMonths(parseISO(refi.startDate), parseISO(currentLoan.currentDate))
    });

    const phase1EndBalance = phase1Schedule.length > 0
      ? phase1Schedule[phase1Schedule.length - 1].endBalance
      : currentLoan.principal;

    // Apply any unapplied lump sums (e.g., if phase1 is too short or dates don't align)
    const appliedLumpSums = phase1Schedule.reduce((sum, row) => sum + row.lumpSumApplied, 0);
    const totalLumpsBeforeRefi = lumpsBeforeRefi.reduce((sum, ls) => sum + ls.amount, 0);
    const unappliedLumps = totalLumpsBeforeRefi - appliedLumpSums;
    const adjustedBalance = Math.max(0, phase1EndBalance - unappliedLumps);

    // Calculate refi payment
    const refiMonths = refi.termYears * 12;
    const refiMonthlyRate = annualToMonthlyRate(refi.annualRate);
    const refiBasePayment = calcMonthlyPayment(adjustedBalance, refiMonthlyRate, refiMonths);

    // Scenario: Refi (base) - minimum payment only
    const phase2BaseSchedule = generateSchedule({
      startDate: refi.startDate,
      startingBalance: adjustedBalance,
      annualRate: refi.annualRate,
      basePayment: refiBasePayment,
      extraMonthlyPrincipal: 0,
      lumpSums: [],
      termMonths: refiMonths
    });

    const refiBaseSchedule = [...phase1Schedule, ...phase2BaseSchedule];
    const refiBase: ScenarioResult = {
      id: `refi-${refi.id}-base`,
      label: `${refi.label} (base)`,
      basePayment: refiBasePayment,
      effectivePayment: refiBasePayment,
      totalInterest: calculateTotalInterest(refiBaseSchedule),
      totalPaid: calculateTotalPaid(refiBaseSchedule),
      monthsToPayoff: refiBaseSchedule.length,
      payoffDate: refiBaseSchedule[refiBaseSchedule.length - 1]?.date || '',
      payoffLabel: formatDuration(refiBaseSchedule.length),
      interestSavingsVsCurrentBase: currentBase.totalInterest - calculateTotalInterest(refiBaseSchedule),
      interestSavingsVsCurrentExtra: currentExtra.totalInterest - calculateTotalInterest(refiBaseSchedule),
      schedule: refiBaseSchedule
    };
    scenarios.push(refiBase);

    // Scenario: Refi (matched payment) - with extra to match desired/current payment
    const desiredPayment = refi.desiredMonthlyPayment || paymentSettings.desiredMonthlyPayment;
    if (desiredPayment && desiredPayment > refiBasePayment) {
      const extraForRefi = desiredPayment - refiBasePayment;

      const phase2MatchedSchedule = generateSchedule({
        startDate: refi.startDate,
        startingBalance: adjustedBalance,
        annualRate: refi.annualRate,
        basePayment: refiBasePayment,
        extraMonthlyPrincipal: extraForRefi,
        lumpSums: [],
        termMonths: refiMonths
      });

      const refiMatchedSchedule = [...phase1Schedule, ...phase2MatchedSchedule];
      const refiMatched: ScenarioResult = {
        id: `refi-${refi.id}-matched`,
        label: `${refi.label} (matched payment)`,
        basePayment: refiBasePayment,
        effectivePayment: desiredPayment,
        totalInterest: calculateTotalInterest(refiMatchedSchedule),
        totalPaid: calculateTotalPaid(refiMatchedSchedule),
        monthsToPayoff: refiMatchedSchedule.length,
        payoffDate: refiMatchedSchedule[refiMatchedSchedule.length - 1]?.date || '',
        payoffLabel: formatDuration(refiMatchedSchedule.length),
        interestSavingsVsCurrentBase: currentBase.totalInterest - calculateTotalInterest(refiMatchedSchedule),
        interestSavingsVsCurrentExtra: currentExtra.totalInterest - calculateTotalInterest(refiMatchedSchedule),
        schedule: refiMatchedSchedule
      };
      scenarios.push(refiMatched);
    }

    // Scenario: Refi + lump sums (applied after refi)
    if (lumpsAfterRefi.length > 0) {
      const phase2LumpSchedule = generateSchedule({
        startDate: refi.startDate,
        startingBalance: adjustedBalance,
        annualRate: refi.annualRate,
        basePayment: refiBasePayment,
        extraMonthlyPrincipal: 0,
        lumpSums: lumpsAfterRefi,
        termMonths: refiMonths
      });

      const refiLumpSchedule = [...phase1Schedule, ...phase2LumpSchedule];
      const refiLump: ScenarioResult = {
        id: `refi-${refi.id}-lump`,
        label: `${refi.label} (with lump sums)`,
        basePayment: refiBasePayment,
        effectivePayment: refiBasePayment,
        totalInterest: calculateTotalInterest(refiLumpSchedule),
        totalPaid: calculateTotalPaid(refiLumpSchedule),
        monthsToPayoff: refiLumpSchedule.length,
        payoffDate: refiLumpSchedule[refiLumpSchedule.length - 1]?.date || '',
        payoffLabel: formatDuration(refiLumpSchedule.length),
        interestSavingsVsCurrentBase: currentBase.totalInterest - calculateTotalInterest(refiLumpSchedule),
        interestSavingsVsCurrentExtra: currentExtra.totalInterest - calculateTotalInterest(refiLumpSchedule),
        schedule: refiLumpSchedule
      };
      scenarios.push(refiLump);
    }
  });

  return scenarios;
}
