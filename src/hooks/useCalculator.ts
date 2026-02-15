import { useState, useMemo, useEffect } from 'react';
import type { CalculatorInputs, ScenarioResult } from '../types/mortgage';
import { computeAllScenarios } from '../calc/scenarios';
import { addMonths, format } from 'date-fns';

function getDefaultInputs(): CalculatorInputs {
  const today = format(new Date(), 'yyyy-MM-dd');
  const loanEndDate = format(addMonths(new Date(), 300), 'yyyy-MM-dd'); // ~25 years

  return {
    currentLoan: {
      currentDate: today,
      principal: 500000,
      annualRate: 6.625,
      monthlyPayment: 3200,
      extraMonthlyPrincipal: 0,
      loanEndDate
    },
    lumpSums: [],
    refinanceOptions: [],
    paymentSettings: {}
  };
}

function parseInputsFromHash(): CalculatorInputs | null {
  try {
    const hash = window.location.hash.slice(1); // Remove leading '#'
    if (!hash) return null;

    // Decode base64 with unicode support
    const json = decodeURIComponent(escape(atob(hash)));
    const parsed = JSON.parse(json);

    // Validate that it has the expected shape
    if (!parsed || typeof parsed !== 'object' || !parsed.currentLoan) {
      return null;
    }

    return parsed as CalculatorInputs;
  } catch (error) {
    // Invalid hash, corrupted data, or parse error - fail silently
    return null;
  }
}

function writeInputsToHash(inputs: CalculatorInputs): void {
  try {
    const json = JSON.stringify(inputs);
    // Encode with unicode support
    const hash = btoa(unescape(encodeURIComponent(json)));
    window.history.replaceState(null, '', '#' + hash);
  } catch (error) {
    console.error('Failed to write inputs to hash:', error);
  }
}

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(
    () => parseInputsFromHash() ?? getDefaultInputs()
  );

  // Sync state changes to URL hash
  useEffect(() => {
    writeInputsToHash(inputs);
  }, [inputs]);

  const scenarios = useMemo<ScenarioResult[]>(() => {
    try {
      return computeAllScenarios(inputs);
    } catch (error) {
      console.error('Error computing scenarios:', error);
      return [];
    }
  }, [inputs]);

  return {
    inputs,
    setInputs,
    scenarios
  };
}
