import type { PaymentSettings } from '../../types/mortgage';
import { Stack, Box, Text } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Card } from '../ui/Card';
import { addMonths, format } from 'date-fns';

interface PaymentSettingsProps {
  values: PaymentSettings;
  onChange: (values: PaymentSettings) => void;
}

export function PaymentSettingsComponent({ values, onChange }: PaymentSettingsProps) {
  function toggleRecast() {
    if (values.recastDate) {
      onChange({ ...values, recastDate: undefined, loanMaturityDate: undefined });
    } else {
      const defaultMaturityDate = format(addMonths(new Date(), 300), 'yyyy-MM-dd'); // ~25 years
      onChange({
        ...values,
        recastDate: new Date().toISOString().split('T')[0],
        loanMaturityDate: defaultMaturityDate
      });
    }
  }

  function handleRecastDateChange(date: string) {
    onChange({ ...values, recastDate: date });
  }

  function handleDesiredPaymentChange(amount: number) {
    onChange({ ...values, desiredMonthlyPayment: amount });
  }

  function handleLoanMaturityDateChange(date: string) {
    onChange({ ...values, loanMaturityDate: date });
  }

  return (
    <Card title="Payment Settings">
      <Stack gap={4}>
        <Checkbox.Root
          checked={!!values.recastDate}
          onCheckedChange={toggleRecast}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Enable Recast</Checkbox.Label>
        </Checkbox.Root>

        {values.recastDate && (
          <Box>
            <Field.Root>
              <Field.Label>Recast Date</Field.Label>
              <Input
                type="date"
                value={values.recastDate}
                onChange={(e) => handleRecastDateChange(e.target.value)}
              />
            </Field.Root>

            <Field.Root mt={4} required>
              <Field.Label>Loan Maturity Date</Field.Label>
              <Input
                type="date"
                value={values.loanMaturityDate || ''}
                onChange={(e) => handleLoanMaturityDateChange(e.target.value)}
              />
              <Field.HelperText>
                Original maturity date of your loan (used to calculate remaining term for recast)
              </Field.HelperText>
            </Field.Root>
          </Box>
        )}

        <CurrencyInput
          label="Desired Monthly Payment (global default)"
          value={values.desiredMonthlyPayment || 0}
          onChange={handleDesiredPaymentChange}
        />
        <Text fontSize="xs" color="fg.muted" mt={-2}>
          Global default for matched payment scenarios. Can be overridden per refinance option.
        </Text>
      </Stack>
    </Card>
  );
}
