import { useState } from 'react';
import { Field } from '@chakra-ui/react';
import { Group } from '@chakra-ui/react';
import { Input, InputAddon } from '@chakra-ui/react';

interface PercentInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
}

export function PercentInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.125,
  required = false,
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toFixed(3));

  function handleFocus() {
    setDisplayValue(value.toString());
  }

  function handleBlur() {
    setDisplayValue(value.toFixed(3));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
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
        <InputAddon>%</InputAddon>
      </Group>
    </Field.Root>
  );
}
