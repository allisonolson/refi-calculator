import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import type { ScenarioResult } from '../../types/mortgage';

interface AmortizationTableProps {
  scenario: ScenarioResult;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function AmortizationTable({ scenario }: AmortizationTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box borderWidth="1px" borderColor="border" rounded="md" overflow="hidden">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        w="full"
        justifyContent="space-between"
        fontWeight="medium"
        px={4}
        py={3}
      >
        <span>{scenario.label} - Amortization Schedule</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </Button>

      {isExpanded && (
        <Box overflowX="auto" maxH="96" overflowY="auto">
          <Table.Root size="sm">
            <Table.Header position="sticky" top={0} bg="bg.panel" zIndex={1}>
              <Table.Row>
                <Table.ColumnHeader>#</Table.ColumnHeader>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Begin Balance</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Payment</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Extra</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Lump Sum</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Interest</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Principal</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">End Balance</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {scenario.schedule.map((row) => (
                <Table.Row key={row.period}>
                  <Table.Cell>{row.period}</Table.Cell>
                  <Table.Cell>{row.date}</Table.Cell>
                  <Table.Cell textAlign="right">{formatCurrency(row.beginBalance)}</Table.Cell>
                  <Table.Cell textAlign="right">{formatCurrency(row.payment)}</Table.Cell>
                  <Table.Cell textAlign="right">
                    {row.extraPayment > 0 ? formatCurrency(row.extraPayment) : '-'}
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {row.lumpSumApplied > 0 ? formatCurrency(row.lumpSumApplied) : '-'}
                  </Table.Cell>
                  <Table.Cell textAlign="right">{formatCurrency(row.interest)}</Table.Cell>
                  <Table.Cell textAlign="right">{formatCurrency(row.principal)}</Table.Cell>
                  <Table.Cell textAlign="right">{formatCurrency(row.endBalance)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
