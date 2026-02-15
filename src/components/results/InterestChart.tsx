import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, differenceInMonths, addMonths, parseISO } from 'date-fns';
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { ScenarioResult } from '../../types/mortgage';
import { getScenarioColor } from '../../constants/colors';

interface InterestChartProps {
  scenarios: ScenarioResult[];
  hiddenScenarioIds: Set<string>;
}

export function InterestChart({ scenarios, hiddenScenarioIds }: InterestChartProps) {
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

  // Get start date from first scenario
  const startDate = scenarios[0]?.schedule[0]?.date
    ? parseISO(scenarios[0].schedule[0].date)
    : new Date();

  // Build cumulative interest data points
  const data: any[] = [];
  for (let period = 0; period <= maxPeriods; period += 6) { // Sample every 6 months
    const point: any = { period };

    // Calculate date based on start date and period (months elapsed)
    point.date = format(addMonths(startDate, period), 'yyyy-MM-dd');

    scenarios.forEach((scenario) => {
      const upToPeriod = Math.min(period, scenario.schedule.length - 1);
      const cumulativeInterest = scenario.schedule
        .slice(0, upToPeriod + 1)
        .reduce((sum, row) => sum + row.interest, 0);

      point[scenario.id] = cumulativeInterest;
    });

    data.push(point);
  }

  return (
    <Box w="full" h="96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#e5e5e5'} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), "MMM ''yy")}
            minTickGap={50}
            stroke={isDark ? '#999' : '#666'}
          />
          <YAxis
            label={{ value: 'Cumulative Interest ($)', angle: -90, position: 'left', offset: 0 }}
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
              <Area
                key={scenario.id}
                type="monotone"
                dataKey={scenario.id}
                name={scenario.label}
                stroke={color.hex}
                fill={color.hex}
                fillOpacity={0.3}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
