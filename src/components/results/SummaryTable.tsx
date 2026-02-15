import type { ScenarioResult } from '../../types/mortgage';
import { Box, Text, IconButton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Table } from '@chakra-ui/react';
import { getScenarioColor } from '../../constants/colors';

interface SummaryTableProps {
  scenarios: ScenarioResult[];
  hiddenScenarioIds: Set<string>;
  onToggleVisibility: (id: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatSavings(value: number): string {
  if (value === 0) return '-';
  return value > 0
    ? `+${formatCurrency(value)}`
    : formatCurrency(value);
}

export function SummaryTable({ scenarios, hiddenScenarioIds, onToggleVisibility }: SummaryTableProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateColorMode = () => {
      const root = document.documentElement;
      const mode = root.classList.contains('dark') ||
                   root.getAttribute('data-theme') === 'dark' ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                    !localStorage.getItem('chakra-ui-color-mode'))
        ? 'dark'
        : 'light';
      setColorMode(mode);
    };

    updateColorMode();

    const observer = new MutationObserver(updateColorMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  if (scenarios.length === 0) {
    return (
      <Text textAlign="center" py={8} color="fg.muted">
        No scenarios to display. Please enter loan details.
      </Text>
    );
  }

  const baseYearlyPayment = scenarios[0].effectivePayment * 12;

  return (
    <Box overflowX="auto">
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader textAlign="center" w="12"></Table.ColumnHeader>
            <Table.ColumnHeader>Scenario</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Base Payment</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Effective Payment</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Yearly Payment</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Yearly Diff vs. Base</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Time to Payoff</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Payoff Date</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Total Interest</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Interest Savings vs. Base</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Interest Savings vs. Extra</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scenarios.map((scenario, index) => {
            const color = getScenarioColor(index);
            const isHidden = hiddenScenarioIds.has(scenario.id);
            const yearlyPayment = scenario.effectivePayment * 12;
            const yearlyDiff = index === 0 ? 0 : baseYearlyPayment - yearlyPayment;
            const bgColor = colorMode === 'dark' ? color.bgDark : color.bg;

            return (
              <Table.Row
                key={scenario.id}
                style={{ backgroundColor: bgColor }}
                borderLeftWidth="4px"
                borderLeftColor={color.hex}
                opacity={isHidden ? 0.5 : 1}
              >
                <Table.Cell textAlign="center">
                  <IconButton
                    aria-label={isHidden ? 'Show in charts' : 'Hide from charts'}
                    onClick={() => onToggleVisibility(scenario.id)}
                    variant="ghost"
                    size="xs"
                  >
                    {isHidden ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </IconButton>
                </Table.Cell>
                <Table.Cell fontWeight="medium">{scenario.label}</Table.Cell>
                <Table.Cell textAlign="right">{formatCurrency(scenario.basePayment)}</Table.Cell>
                <Table.Cell textAlign="right">{formatCurrency(scenario.effectivePayment)}</Table.Cell>
                <Table.Cell textAlign="right">{formatCurrency(yearlyPayment)}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Text color={yearlyDiff > 0 ? 'green.500' : 'fg.muted'} fontWeight={yearlyDiff > 0 ? 'medium' : 'normal'}>
                    {formatSavings(yearlyDiff)}
                  </Text>
                </Table.Cell>
                <Table.Cell textAlign="right">{scenario.payoffLabel}</Table.Cell>
                <Table.Cell textAlign="right">{scenario.payoffDate}</Table.Cell>
                <Table.Cell textAlign="right" fontWeight="medium">{formatCurrency(scenario.totalInterest)}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Text color={scenario.interestSavingsVsCurrentBase > 0 ? 'green.500' : 'fg.muted'} fontWeight={scenario.interestSavingsVsCurrentBase > 0 ? 'medium' : 'normal'}>
                    {formatSavings(scenario.interestSavingsVsCurrentBase)}
                  </Text>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Text color={scenario.interestSavingsVsCurrentExtra > 0 ? 'green.500' : 'fg.muted'} fontWeight={scenario.interestSavingsVsCurrentExtra > 0 ? 'medium' : 'normal'}>
                    {formatSavings(scenario.interestSavingsVsCurrentExtra)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
