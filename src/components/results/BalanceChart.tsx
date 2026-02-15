import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, differenceInMonths } from 'date-fns';
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { ScenarioResult } from '../../types/mortgage';
import { getScenarioColor } from '../../constants/colors';

interface BalanceChartProps {
  scenarios: ScenarioResult[];
  hiddenScenarioIds: Set<string>;
}

export function BalanceChart({ scenarios, hiddenScenarioIds }: BalanceChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateColorMode = () => {
      const root = document.documentElement;
      const mode = root.classList.contains('dark') ||
                   root.getAttribute('data-theme') === 'dark' ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                    !localStorage.getItem('chakra-ui-color-mode'));
      setIsDark(!!mode);
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
    return null;
  }

  // Find the longest schedule to determine chart length
  const maxPeriods = Math.max(...scenarios.map(s => s.schedule.length));

  // Build data points for chart
  const data: any[] = [];
  for (let period = 0; period <= maxPeriods; period += 6) { // Sample every 6 months
    const point: any = { period };

    scenarios.forEach((scenario) => {
      const row = scenario.schedule[period] || scenario.schedule[scenario.schedule.length - 1];
      if (row) {
        point[scenario.id] = row.endBalance;
        point.date = row.date;
      }
    });

    data.push(point);
  }

  const startDate = data[0]?.date ? new Date(data[0].date) : new Date();

  return (
    <Box w="full" h="96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#e5e5e5'} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), "MMM ''yy")}
            minTickGap={50}
            stroke={isDark ? '#999' : '#666'}
          />
          <YAxis
            label={{ value: 'Remaining Balance ($)', angle: -90, position: 'left', offset: 0 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke={isDark ? '#999' : '#666'}
          />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            labelFormatter={(date) => {
              const currentDate = new Date(date);
              const months = differenceInMonths(currentDate, startDate);
              const years = Math.floor(months / 12);
              const remainingMonths = months % 12;
              const duration = years > 0
                ? `${years}yr ${remainingMonths}mo`
                : `${remainingMonths}mo`;
              return `${format(currentDate, 'MMMM yyyy')} (${duration})`;
            }}
            contentStyle={{
              backgroundColor: isDark ? '#1a1a1a' : '#fff',
              border: `1px solid ${isDark ? '#444' : '#ccc'}`,
              color: isDark ? '#fff' : '#000'
            }}
          />
          <Legend />
          {scenarios.map((scenario, index) => {
            const color = getScenarioColor(index);
            const isHidden = hiddenScenarioIds.has(scenario.id);

            if (isHidden) {
              return null;
            }

            return (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.id}
                name={scenario.label}
                stroke={color.hex}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
