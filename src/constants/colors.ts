export interface ScenarioColor {
  hex: string;           // Main color for charts and borders
  bg: string;            // Light mode background color
  bgDark: string;        // Dark mode background color
}

export const SCENARIO_PALETTE: ScenarioColor[] = [
  { hex: '#3b82f6', bg: '#eff6ff', bgDark: 'rgba(59, 130, 246, 0.15)' },    // Blue
  { hex: '#10b981', bg: '#f0fdf4', bgDark: 'rgba(16, 185, 129, 0.15)' },    // Green
  { hex: '#f59e0b', bg: '#fffbeb', bgDark: 'rgba(245, 158, 11, 0.15)' },    // Amber
  { hex: '#ef4444', bg: '#fef2f2', bgDark: 'rgba(239, 68, 68, 0.15)' },     // Red
  { hex: '#8b5cf6', bg: '#faf5ff', bgDark: 'rgba(139, 92, 246, 0.15)' },    // Violet
  { hex: '#ec4899', bg: '#fdf2f8', bgDark: 'rgba(236, 72, 153, 0.15)' },    // Pink
  { hex: '#14b8a6', bg: '#f0fdfa', bgDark: 'rgba(20, 184, 166, 0.15)' },    // Teal
  { hex: '#f97316', bg: '#fff7ed', bgDark: 'rgba(249, 115, 22, 0.15)' }     // Orange
];

export function getScenarioColor(index: number): ScenarioColor {
  return SCENARIO_PALETTE[index % SCENARIO_PALETTE.length];
}
