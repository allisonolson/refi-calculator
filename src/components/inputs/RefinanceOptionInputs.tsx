import type { RefinanceOption } from '../../types/mortgage';
import { Stack, Box, Flex, Grid, Text } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { PercentInput } from '../ui/PercentInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Card } from '../ui/Card';

interface RefinanceOptionInputsProps {
  values: RefinanceOption[];
  onChange: (values: RefinanceOption[]) => void;
}

export function RefinanceOptionInputs({ values, onChange }: RefinanceOptionInputsProps) {
  function addOption() {
    const newOption: RefinanceOption = {
      id: crypto.randomUUID(),
      label: `Refi Option ${values.length + 1}`,
      termYears: 30,
      annualRate: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    onChange([...values, newOption]);
  }

  function removeOption(id: string) {
    onChange(values.filter(opt => opt.id !== id));
  }

  function updateOption(id: string, field: keyof Omit<RefinanceOption, 'id'>, value: string | number) {
    onChange(
      values.map(opt => opt.id === id ? { ...opt, [field]: value } : opt)
    );
  }

  return (
    <Card title="Refinance Options">
      <Stack gap={4}>
        {values.map((option) => (
          <Box key={option.id} borderWidth="1px" borderColor="border" rounded="md" p={4}>
            <Stack gap={3}>
              <Flex align="center" justify="space-between">
                <Input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                  variant="flushed"
                  fontWeight="medium"
                />
                <Button
                  onClick={() => removeOption(option.id)}
                  colorPalette="red"
                  size="sm"
                  title="Remove"
                >
                  ✕
                </Button>
              </Flex>

              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                <Field.Root>
                  <Field.Label>Term (years)</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={option.termYears}
                      onChange={(e) => updateOption(option.id, 'termYears', parseInt(e.target.value))}
                    >
                      <option value={10}>10 years</option>
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={30}>30 years</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>

                <PercentInput
                  label="Annual Rate"
                  value={option.annualRate}
                  onChange={(v) => updateOption(option.id, 'annualRate', v)}
                />
              </Grid>

              <Field.Root>
                <Field.Label>Refi Start Date</Field.Label>
                <Input
                  type="date"
                  value={option.startDate}
                  onChange={(e) => updateOption(option.id, 'startDate', e.target.value)}
                />
              </Field.Root>

              <CurrencyInput
                label="Desired Monthly Payment (optional)"
                value={option.desiredMonthlyPayment || 0}
                onChange={(v) => updateOption(option.id, 'desiredMonthlyPayment', v)}
              />
              <Text fontSize="xs" color="fg.muted" mt={-2}>
                Leave as $0 to use the global default. If set, this creates a "matched payment" scenario.
              </Text>
            </Stack>
          </Box>
        ))}

        <Button
          onClick={addOption}
          colorPalette="blue"
          w="full"
        >
          + Add Refinance Option
        </Button>
      </Stack>
    </Card>
  );
}
