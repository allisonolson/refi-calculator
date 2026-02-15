import type { LumpSum } from '../../types/mortgage';
import { Stack, Flex, Box } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Card } from '../ui/Card';

interface LumpSumInputsProps {
  values: LumpSum[];
  onChange: (values: LumpSum[]) => void;
}

export function LumpSumInputs({ values, onChange }: LumpSumInputsProps) {
  function addLumpSum() {
    const newLumpSum: LumpSum = {
      id: crypto.randomUUID(),
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    onChange([...values, newLumpSum]);
  }

  function removeLumpSum(id: string) {
    onChange(values.filter(ls => ls.id !== id));
  }

  function updateLumpSum(id: string, field: keyof Omit<LumpSum, 'id'>, value: string | number) {
    onChange(
      values.map(ls => ls.id === id ? { ...ls, [field]: value } : ls)
    );
  }

  return (
    <Card title="Lump Sum Payments">
      <Stack gap={3}>
        {values.map((lumpSum) => (
          <Flex key={lumpSum.id} gap={3} align="end">
            <Box flex={1}>
              <CurrencyInput
                label="Amount"
                value={lumpSum.amount}
                onChange={(v) => updateLumpSum(lumpSum.id, 'amount', v)}
              />
            </Box>
            <Box flex={1}>
              <Field.Root>
                <Field.Label>Date</Field.Label>
                <Input
                  type="date"
                  value={lumpSum.date}
                  onChange={(e) => updateLumpSum(lumpSum.id, 'date', e.target.value)}
                />
              </Field.Root>
            </Box>
            <Button
              onClick={() => removeLumpSum(lumpSum.id)}
              colorPalette="red"
              size="sm"
              title="Remove"
            >
              ✕
            </Button>
          </Flex>
        ))}

        <Button
          onClick={addLumpSum}
          colorPalette="blue"
          w="full"
        >
          + Add Lump Sum
        </Button>
      </Stack>
    </Card>
  );
}
