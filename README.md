# Mortgage Refinance & Recast Calculator

A comprehensive frontend-only React + Vite application for comparing mortgage refinance and recast scenarios. Visualize different payoff timelines, monthly payments, and total interest costs to make informed decisions about your mortgage.

## Features

- **Current Loan Analysis**: Track your existing mortgage with extra payments and lump sums
- **Refinance Comparison**: Compare multiple refinance options with different terms and rates
- **Recast Scenarios**: Model payment recalculation after lump sum payments
- **Two-Phase Refinancing**: Accurately models waiting periods before refinancing
- **Interactive Charts**: Visualize balance and interest over time using Recharts
- **Detailed Schedules**: View month-by-month amortization for each scenario

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- date-fns for date calculations
- Vitest for testing

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app in development mode.

### Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Enter Current Loan Details**: Input your current loan balance, rate, payment, and maturity date
2. **Add Lump Sums** (optional): Plan for extra payments at specific dates
3. **Add Refinance Options** (optional): Compare different refinance terms and rates
4. **Configure Payment Settings** (optional): Enable recast and set desired payment amounts
5. **Review Results**: Compare scenarios in the summary table and charts

## Deployment

The app is configured for deployment to GitHub Pages. Push to the `main` branch to trigger automatic deployment.

## Project Structure

```
src/
├── types/          # TypeScript interfaces
├── calc/           # Calculation engine (formulas, amortization, scenarios)
├── components/     # React components
│   ├── inputs/     # Input form components
│   ├── results/    # Results display components
│   └── ui/         # Reusable UI components
└── hooks/          # Custom React hooks
```

## License

MIT
