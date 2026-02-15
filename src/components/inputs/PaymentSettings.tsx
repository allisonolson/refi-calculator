import type { PaymentSettings } from '../../types/mortgage';
import { Stack, Box, Text } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Card } from '../ui/Card';

interface PaymentSettingsProps {
  values: PaymentSettings;
  onChange: (values: PaymentSettings) => void;
}

export function PaymentSettingsComponent({ values, onChange }: PaymentSettingsProps) {
  function toggleRecast() {
    if (values.recastDate) {
      onChange({ ...values, recastDate: undefined });
    } else {
      onChange({ ...values, recastDate: new Date().toISOString().split('T')[0] });
    }
  }

  function handleRecastDateChange(date: string) {
    onChange({ ...values, recastDate: date });
  }

  function handleDesiredPaymentChange(amount: number) {
    onChange({ ...values, desiredMonthlyPayment: amount });
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
            <Text mt={1} fontSize="xs" color="fg.muted">
              Payment will be recalculated on this date based on remaining balance and term
            </Text>
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
