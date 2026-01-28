# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Money Manager & Investment Tracker - A personal finance web application for managing transactions, investments, inventory tracking, and financial planning with Supabase authentication.

## Tech Stack

- **Frontend**: React 18+ with TypeScript, Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Backend**: Supabase (Auth, PostgreSQL with RLS, Storage)
- **State**: Zustand or React Context
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts with shadcn/ui chart wrappers

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build

# Linting & Testing
npm run lint         # Run ESLint
npm run test         # Run Vitest tests

# shadcn/ui components
npx shadcn-ui@latest add <component>  # Add a new component
```

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui components (auto-generated)
│   ├── layout/      # Navbar, Sidebar, DashboardLayout
│   ├── auth/        # LoginForm, SignupForm, ProtectedRoute
│   ├── transactions/
│   ├── accounts/
│   ├── budgets/
│   ├── goals/
│   ├── investments/
│   ├── inventory/
│   └── reports/
├── pages/           # Page components
├── lib/             # Supabase client, utils, validations
├── hooks/           # Custom hooks (useAuth, useTransactions, etc.)
├── contexts/        # React contexts
├── types/           # TypeScript types
└── utils/           # Utility functions
```

### Key Patterns

- **Path aliases**: Use `@/` for imports (e.g., `@/components/ui/button`)
- **Class merging**: Use `cn()` utility from `@/lib/utils` for className composition
- **Form validation**: Always use Zod schemas with React Hook Form
- **Database access**: All queries through Supabase client with RLS enabled

### Database Tables

Core tables: `profiles`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `products`, `product_transactions`, `investments`, `investment_transactions`

All tables include `user_id` for RLS-based data isolation.

### Custom Colors (Tailwind)

- `income`: Green (hsl 142, 76%, 36%)
- `expense`: Red (hsl 0, 84%, 60%)
- `investment`: Blue (hsl 217, 91%, 60%)
- `goal`: Purple (hsl 280, 67%, 55%)

## Environment Variables

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
