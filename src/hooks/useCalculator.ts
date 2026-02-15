import { useState, useMemo, useEffect } from 'react';
import type { CalculatorInputs, ScenarioResult } from '../types/mortgage';
import { computeAllScenarios } from '../calc/scenarios';
import { format } from 'date-fns';
import { encodeToHash, decodeFromHash } from '../utils/urlEncoding';

function getDefaultInputs(): CalculatorInputs {
  const today = format(new Date(), 'yyyy-MM-dd');

  return {
    currentLoan: {
      currentDate: today,
      principal: 500000,
      annualRate: 6.625,
      monthlyPayment: 3200,
      extraMonthlyPrincipal: 0
    },
    lumpSums: [],
    refinanceOptions: [],
    paymentSettings: {}
  };
}

function parseInputsFromHash(): CalculatorInputs | null {
  const hash = window.location.hash.slice(1); // Remove leading '#'
  return decodeFromHash(hash);
}

function writeInputsToHash(inputs: CalculatorInputs): void {
  try {
    const hash = encodeToHash(inputs);
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
