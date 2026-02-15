import type { CalculatorInputs } from '../types/mortgage';
import { Stack, Heading } from '@chakra-ui/react';
import { CurrentLoanInputsComponent } from './inputs/CurrentLoanInputs';
import { LumpSumInputs } from './inputs/LumpSumInputs';
import { RefinanceOptionInputs } from './inputs/RefinanceOptionInputs';
import { PaymentSettingsComponent } from './inputs/PaymentSettings';

interface InputPanelProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export function InputPanel({ inputs, onChange }: InputPanelProps) {
  return (
    <Stack gap={6}>
      <Heading size="2xl">
        Mortgage Refinance & Recast Calculator
      </Heading>

      <CurrentLoanInputsComponent
        values={inputs.currentLoan}
        onChange={(currentLoan) => onChange({ ...inputs, currentLoan })}
      />

      <LumpSumInputs
        values={inputs.lumpSums}
        onChange={(lumpSums) => onChange({ ...inputs, lumpSums })}
      />

      <RefinanceOptionInputs
        values={inputs.refinanceOptions}
        onChange={(refinanceOptions) => onChange({ ...inputs, refinanceOptions })}
      />

      <PaymentSettingsComponent
        values={inputs.paymentSettings}
        onChange={(paymentSettings) => onChange({ ...inputs, paymentSettings })}
      />
    </Stack>
  );
}
