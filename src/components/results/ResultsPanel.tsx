import { useState } from 'react';
import { Stack, Center, Text } from '@chakra-ui/react';
import type { ScenarioResult } from '../../types/mortgage';
import { Card } from '../ui/Card';
import { SummaryTable } from './SummaryTable';
import { BalanceChart } from './BalanceChart';
import { InterestChart } from './InterestChart';
import { AmortizationTable } from './AmortizationTable';

interface ResultsPanelProps {
  scenarios: ScenarioResult[];
}

export function ResultsPanel({ scenarios }: ResultsPanelProps) {
  const [hiddenScenarioIds, setHiddenScenarioIds] = useState<Set<string>>(new Set());

  const toggleVisibility = (id: string) => {
    setHiddenScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (scenarios.length === 0) {
    return (
      <Center h="64">
        <Text color="fg.muted">Enter loan details to see results</Text>
      </Center>
    );
  }

  return (
    <Stack gap={6}>
      <Card title="Scenario Comparison">
        <SummaryTable
          scenarios={scenarios}
          hiddenScenarioIds={hiddenScenarioIds}
          onToggleVisibility={toggleVisibility}
        />
      </Card>

      <Card title="Remaining Balance Over Time">
        <BalanceChart
          scenarios={scenarios}
          hiddenScenarioIds={hiddenScenarioIds}
        />
      </Card>

      <Card title="Cumulative Interest Over Time">
        <InterestChart
          scenarios={scenarios}
          hiddenScenarioIds={hiddenScenarioIds}
        />
      </Card>

      <Card title="Detailed Amortization Schedules">
        <Stack gap={3}>
          {scenarios.map((scenario) => (
            <AmortizationTable key={scenario.id} scenario={scenario} />
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
