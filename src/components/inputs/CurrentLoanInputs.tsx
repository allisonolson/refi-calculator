import type { CurrentLoanInputs } from '../../types/mortgage';
import { Stack } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { PercentInput } from '../ui/PercentInput';
import { Card } from '../ui/Card';

interface CurrentLoanInputsProps {
  values: CurrentLoanInputs;
  onChange: (values: CurrentLoanInputs) => void;
}

export function CurrentLoanInputsComponent({ values, onChange }: CurrentLoanInputsProps) {
  function handleChange(field: keyof CurrentLoanInputs, value: string | number) {
    onChange({ ...values, [field]: value });
  }

  return (
    <Card title="Current Loan">
      <Stack gap={4}>
        <Field.Root required>
          <Field.Label>Current Date</Field.Label>
          <Input
            type="date"
            value={values.currentDate}
            onChange={(e) => handleChange('currentDate', e.target.value)}
          />
        </Field.Root>

        <CurrencyInput
          label="Current Balance (Principal)"
          value={values.principal}
          onChange={(v) => handleChange('principal', v)}
          required
        />

        <PercentInput
          label="Annual Interest Rate"
          value={values.annualRate}
          onChange={(v) => handleChange('annualRate', v)}
          required
        />

        <CurrencyInput
          label="Current Monthly Payment"
          value={values.monthlyPayment}
          onChange={(v) => handleChange('monthlyPayment', v)}
          required
        />

        <CurrencyInput
          label="Extra Monthly Principal Payment"
          value={values.extraMonthlyPrincipal}
          onChange={(v) => handleChange('extraMonthlyPrincipal', v)}
        />

        <Field.Root required>
          <Field.Label>Loan Maturity Date</Field.Label>
          <Input
            type="date"
            value={values.loanEndDate}
            onChange={(e) => handleChange('loanEndDate', e.target.value)}
          />
        </Field.Root>
      </Stack>
    </Card>
  );
}
