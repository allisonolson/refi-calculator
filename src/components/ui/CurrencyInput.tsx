import { useState } from 'react';
import { Field } from '@chakra-ui/react';
import { Group } from '@chakra-ui/react';
import { Input, InputAddon } from '@chakra-ui/react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 100,
  required = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  function formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  function handleFocus() {
    setDisplayValue(value.toString());
  }

  function handleBlur() {
    setDisplayValue(formatCurrency(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/[^0-9.-]/g, '');
    setDisplayValue(rawValue);

    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (rawValue === '') {
      onChange(0);
    }
  }

  return (
    <Field.Root required={required}>
      <Field.Label>{label}</Field.Label>
      <Group attached>
        <InputAddon>$</InputAddon>
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
        />
      </Group>
    </Field.Root>
  );
}
