import type { PaymentSettings } from '../../types/mortgage';
import { Stack, Box } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';
import { Card } from '../ui/Card';
import { addMonths, format } from 'date-fns';

interface PaymentSettingsProps {
  values: PaymentSettings;
  onChange: (values: PaymentSettings) => void;
}

export function PaymentSettingsComponent({ values, onChange }: PaymentSettingsProps) {
  function toggleRecast() {
    if (values.enableRecast) {
      // Just disable, but keep the values
      onChange({ ...values, enableRecast: false });
    } else {
      // Enable and set defaults if values don't exist
      const defaultRecastDate = values.recastDate || new Date().toISOString().split('T')[0];
      const defaultMaturityDate = values.loanMaturityDate || format(addMonths(new Date(), 300), 'yyyy-MM-dd');
      onChange({
        ...values,
        enableRecast: true,
        recastDate: defaultRecastDate,
        loanMaturityDate: defaultMaturityDate
      });
    }
  }

  function handleRecastDateChange(date: string) {
    onChange({ ...values, recastDate: date });
  }

  function handleLoanMaturityDateChange(date: string) {
    onChange({ ...values, loanMaturityDate: date });
  }

  return (
    <Card title="Payment Settings">
      <Stack gap={4}>
        <Checkbox.Root
          checked={!!values.enableRecast}
          onCheckedChange={toggleRecast}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Enable Recast</Checkbox.Label>
        </Checkbox.Root>

        {values.enableRecast && (
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
      </Stack>
    </Card>
  );
}
