# Money Manager & Investment Tracker - Requirements Document

## Project Overview
สร้าง Web Application สำหรับจัดการการเงินส่วนบุคคล รวมถึงการติดตามการลงทุนและการวางแผนทางการเงิน พร้อมระบบ Authentication

---

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
  - Pre-built accessible components
  - Customizable and owns the code
  - Copy-paste approach (not npm dependency)
- **Charts**: Recharts (with shadcn/ui chart components)
- **Icons**: Lucide React
- **State Management**: React Context API / Zustand
- **Form Handling**: React Hook Form + Zod (validation)
- **Date Picker**: react-day-picker (included in shadcn/ui)

### Backend & Authentication
- **BaaS**: Supabase
  - Authentication (Email/Password, OAuth: Google, GitHub)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage (สำหรับ receipts/documents)

### Additional Libraries
- **Date Handling**: date-fns
- **Currency Formatting**: dinero.js / currency.js
- **Export**: xlsx (Excel export), jsPDF (PDF reports)

---

## shadcn/ui Setup & Components

### Installation & Setup
```bash
# Create new Vite + React + TypeScript project
npm create vite@latest money-manager -- --template react-ts

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init

# During init, choose:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### shadcn/ui Components to Install
```bash
# Layout & Navigation
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add separator

# Forms & Inputs
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add date-picker
npx shadcn-ui@latest add form

# Feedback & Overlays
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert

# Data Display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add chart

# Other
npx shadcn-ui@latest add command
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add skeleton
```

### Custom Theme Configuration
```typescript
// tailwind.config.js
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for Money Manager
        income: "hsl(142, 76%, 36%)", // Green
        expense: "hsl(0, 84%, 60%)", // Red
        investment: "hsl(217, 91%, 60%)", // Blue
        goal: "hsl(280, 67%, 55%)", // Purple
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## Core Features

### 1. Authentication & User Management
- ✅ Sign Up / Sign In (Email/Password)
- ✅ OAuth Login (Google, GitHub)
- ✅ Password Reset
- ✅ User Profile Management
- ✅ Multi-user Support (data isolation per user)
- ✅ Session Management

### 2. Personal Finance Management

#### Accounts Management
- สร้าง/แก้ไข/ลบบัญชี
- ประเภทบัญชี:
  - เงินสด (Cash)
  - บัญชีธนาคาร (Bank Account)
  - บัตรเครดิต (Credit Card)
  - กระเป๋าเงินดิจิทัล (E-Wallet)
- แสดงยอดคงเหลือแต่ละบัญชี
- Multi-currency support

#### Transactions (รายรับ-รายจ่าย)
- บันทึกรายการ (Income/Expense/Transfer)
- หมวดหมู่:
  - Predefined categories (อาหาร, ที่อยู่อาศัย, ขนส่ง, ความบันเทิง, ฯลฯ)
  - Custom categories
  - Sub-categories
- Tags & Labels
- Split transactions (แยกรายการเป็นหลายหมวดหมู่)
- Recurring transactions (รายการซ้ำ):
  - Daily, Weekly, Monthly, Yearly
  - End date / Number of occurrences
- Note/Memo
- Receipt attachment (optional)
- Date & Time

#### Budgeting
- ตั้งงบประมาณรายเดือนต่อหมวดหมู่
- Budget alerts (แจ้งเตือนเมื่อใกล้เกินงบ)
- แสดง % การใช้งบ
- เปรียบเทียบงบจริงกับงบตั้งไว้

### 3. Investment & Business Tracking

#### Inventory Management (สำหรับขายของ)
- Product catalog:
  - Product name, SKU/Code
  - Description
  - Category
  - Cost per unit
  - Quantity
- Purchase records:
  - Date, Quantity, Unit cost
  - Supplier (optional)
  - Total cost
- Sales records:
  - Date, Quantity, Selling price
  - Customer (optional)
  - Total revenue
- Cost calculation methods:
  - FIFO (First In, First Out)
  - LIFO (Last In, First Out)
  - Average Cost
- Metrics:
  - Profit/Loss per sale
  - Profit margin %
  - ROI (Return on Investment)
  - Inventory valuation
  - Holding period
  - Stock on hand

#### Investment Portfolio (หุ้น/Crypto/สินทรัพย์)
- Asset types:
  - Stocks
  - Cryptocurrency
  - Mutual Funds
  - ETF
  - Gold/Commodities
  - Real Estate
  - Other assets
- Transaction types:
  - Buy
  - Sell
  - Dividend/Interest received
  - Stock split
- Tracking:
  - Purchase date, quantity, price
  - Current holdings
  - Average cost
  - Unrealized P&L (ยังไม่ขาย)
  - Realized P&L (ขายแล้ว)
  - % Gain/Loss
  - Total return %
  - Dividend/Interest tracking
- Portfolio metrics:
  - Asset allocation (% breakdown)
  - Portfolio value
  - Total return
  - Annualized return
  - Best/Worst performers

### 4. Financial Goals & Planning

#### Savings Goals
- Goal types:
  - Transportation (ซื้อรถ, ดาวน์รถ)
  - Travel (ท่องเที่ยว)
  - Housing (ดาวน์บ้าน, ซื้อคอนโด)
  - Life events (แต่งงาน, มีลูก)
  - Education (เรียนต่อ, คอร์ส)
  - Shopping (ของใช้ราคาแพง)
  - Emergency fund
  - Retirement
  - Custom goals
- Goal properties:
  - Goal name
  - Target amount
  - Current saved amount
  - Deadline (target date)
  - Priority (High/Medium/Low)
  - Monthly contribution (calculated or manual)
  - Auto-allocation from income
- Progress tracking:
  - % completed
  - Amount remaining
  - Months remaining
  - On track / Behind / Ahead status
- Timeline projection
- Multiple goals management
- Goal conflict warnings

#### Planning Tools
- "What-if" scenarios:
  - ถ้าออมเพิ่ม X บาท/เดือน จะถึงเป้าเมื่อไหร่?
  - ถ้าลดเป้าหมาย Y% จะเหลือเงินเท่าไหร่?
- Reallocation suggestions
- Monthly savings calculator
- Goal prioritization helper

### 5. Analytics & Reports

#### Dashboards
- **Overview Dashboard**:
  - Net worth (total assets - total liabilities)
  - Cash flow this month (income - expense)
  - Budget vs Actual
  - Upcoming bills
  - Goal progress summary
  - Investment performance
  - Recent transactions
- **Trends Dashboard**:
  - Spending trends (monthly/yearly)
  - Income trends
  - Category breakdown (pie chart)
  - Monthly comparison
  - Yearly comparison
- **Investment Dashboard**:
  - Portfolio value over time
  - Asset allocation
  - Top gainers/losers
  - Dividend income
  - Unrealized vs Realized P&L

#### Reports
- Income Statement (รายงานรายรับ-รายจ่าย)
- Net Worth Statement (งบดุล)
- Cash Flow Report
- Category Report (by period)
- Investment Performance Report
- Inventory Report
- Tax Report (for capital gains)
- Custom date range reports
- Export options:
  - PDF
  - Excel (XLSX)
  - CSV

#### Smart Insights
- 💡 Spending insights
- ⚠️ Budget warnings
- 🎯 Goal achievement predictions
- 📈 Investment recommendations
- 📊 Unusual transaction detection
- 🔔 Bill reminders

### 6. Import/Export

#### Import
- CSV import for:
  - Bank statements
  - Credit card statements
  - Transaction history
- Auto-categorization (based on description/merchant)
- Duplicate detection
- Support formats: CSV, Excel, QIF, OFX (optional)

#### Export
- Export all data:
  - Transactions (CSV/Excel)
  - Reports (PDF)
  - Investment records (CSV/Excel)
  - Inventory data (CSV/Excel)
- Backup & Restore:
  - Full database export (JSON)
  - Scheduled automatic backups

### 7. UI/UX Features

#### Design
- Modern, clean interface
- Responsive design (Mobile + Desktop)
- Dark mode / Light mode toggle
- Color-coded categories
- Interactive charts & graphs
- Smooth animations

#### User Experience
- Quick add transaction (floating button)
- Search & filter:
  - Transaction search
  - Advanced filters (date range, category, amount, tags)
- Bulk operations:
  - Bulk edit
  - Bulk delete
  - Bulk categorize
- Keyboard shortcuts
- Customizable dashboard widgets
- Drag-and-drop interface (for dashboard customization)

#### Notifications
- Budget alerts
- Bill reminders
- Goal milestones
- Unusual transactions
- Low balance warnings
- Investment price alerts (optional)

### 8. Security & Privacy

- Row Level Security (RLS) on Supabase
- Encrypted data at rest
- Secure API calls
- Password protection
- Session timeout
- Privacy mode (hide amounts)
- Biometric login (if PWA)
- Data export before account deletion
- GDPR compliance ready

---

## Database Schema (Supabase PostgreSQL)

### Core Tables

```sql
-- Users (handled by Supabase Auth)
-- profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- cash, bank, credit_card, e_wallet
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- income, expense
  parent_id UUID REFERENCES categories(id),
  color TEXT,
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

-- transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  type TEXT NOT NULL, -- income, expense, transfer
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  note TEXT,
  tags TEXT[],
  receipt_url TEXT,
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule JSONB, -- {frequency, interval, end_date}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(15,2) NOT NULL,
  period TEXT DEFAULT 'monthly', -- monthly, yearly
  start_date DATE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8, -- 80%
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_type TEXT, -- travel, car, house, etc.
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  priority TEXT DEFAULT 'medium', -- high, medium, low
  monthly_contribution DECIMAL(15,2),
  auto_allocate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- products (inventory)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cost_method TEXT DEFAULT 'average', -- fifo, lifo, average
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- product_transactions
CREATE TABLE product_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  type TEXT NOT NULL, -- purchase, sale
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2),
  transaction_date DATE NOT NULL,
  supplier TEXT,
  customer TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- investments
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- ticker symbol or asset code
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- stock, crypto, fund, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- investment_transactions
CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id),
  type TEXT NOT NULL, -- buy, sell, dividend
  quantity DECIMAL(15,6),
  price DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  fees DECIMAL(15,2) DEFAULT 0,
  transaction_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Package Dependencies

### package.json (Main Dependencies)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.3",
    "zod": "^3.22.4",
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.10.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.303.0",
    "zustand": "^4.4.7",
    "currency.js": "^2.0.4",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "sonner": "^1.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.1.0"
  }
}
```

---

## Project Initialization Steps

### Step-by-Step Setup
```bash
# 1. Create Vite project
npm create vite@latest money-manager -- --template react-ts
cd money-manager

# 2. Install dependencies
npm install

# 3. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Install shadcn/ui
npx shadcn-ui@latest init

# 5. Install additional dependencies
npm install @supabase/supabase-js react-router-dom zustand react-hook-form @hookform/resolvers zod date-fns recharts lucide-react currency.js xlsx jspdf sonner

# 6. Install shadcn components (as needed during development)
npx shadcn-ui@latest add button card input select dialog form table badge alert tabs calendar date-picker progress toast tooltip sheet popover separator skeleton chart

# 7. Setup Supabase project (do this on supabase.com)
# - Create new project
# - Get API URL and anon key
# - Create .env file

# 8. Create .env file
echo "VITE_SUPABASE_URL=your-project-url" > .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env

# 9. Run development server
npm run dev
```

### vite.config.ts
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### components.json (shadcn/ui config)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Page Structure

### Public Pages (No Auth Required)
- `/` - Landing page
- `/login` - Sign in
- `/signup` - Sign up
- `/forgot-password` - Password reset

### Protected Pages (Auth Required)

#### Main Navigation
- `/dashboard` - Overview dashboard
- `/transactions` - Transaction list & management
- `/accounts` - Accounts management
- `/budgets` - Budget planning
- `/goals` - Financial goals
- `/investments` - Investment portfolio
- `/inventory` - Product/inventory tracking
- `/reports` - Analytics & reports
- `/settings` - User settings & preferences

#### Sub-pages
- `/transactions/new` - Add transaction
- `/transactions/:id` - Edit transaction
- `/accounts/new` - Add account
- `/goals/new` - Create goal
- `/investments/:id` - Investment details
- `/inventory/products` - Product list
- `/inventory/products/:id` - Product details
- `/reports/income-statement` - Income statement
- `/reports/net-worth` - Net worth report
- `/reports/investment-performance` - Investment report

---

## Component Structure

```
src/
├── components/
│   ├── ui/  (shadcn/ui components - auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── tabs.tsx
│   │   ├── form.tsx
│   │   ├── calendar.tsx
│   │   ├── date-picker.tsx
│   │   ├── progress.tsx
│   │   ├── toast.tsx
│   │   ├── tooltip.tsx
│   │   ├── sheet.tsx
│   │   ├── popover.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── chart.tsx
│   │   └── ... (other shadcn components)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── ThemeToggle.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── NetWorthCard.tsx
│   │   ├── CashFlowCard.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── GoalProgress.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── QuickStats.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionFilter.tsx
│   │   ├── TransactionCard.tsx
│   │   ├── QuickAddButton.tsx
│   │   └── CategorySelector.tsx
│   ├── accounts/
│   │   ├── AccountCard.tsx
│   │   ├── AccountForm.tsx
│   │   ├── AccountList.tsx
│   │   └── AccountBalance.tsx
│   ├── budgets/
│   │   ├── BudgetCard.tsx
│   │   ├── BudgetForm.tsx
│   │   ├── BudgetProgress.tsx
│   │   └── BudgetAlerts.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   ├── GoalForm.tsx
│   │   ├── GoalTimeline.tsx
│   │   ├── GoalProgress.tsx
│   │   └── WhatIfCalculator.tsx
│   ├── investments/
│   │   ├── PortfolioOverview.tsx
│   │   ├── AssetAllocation.tsx
│   │   ├── InvestmentForm.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── HoldingsList.tsx
│   │   └── TransactionHistory.tsx
│   ├── inventory/
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProfitCalculator.tsx
│   │   ├── InventoryValue.tsx
│   │   └── StockStatus.tsx
│   ├── reports/
│   │   ├── IncomeExpenseChart.tsx
│   │   ├── CategoryBreakdown.tsx
│   │   ├── TrendsChart.tsx
│   │   ├── NetWorthChart.tsx
│   │   ├── ReportFilters.tsx
│   │   └── ExportButton.tsx
│   └── charts/
│       ├── CustomLineChart.tsx
│       ├── CustomPieChart.tsx
│       ├── CustomBarChart.tsx
│       └── CustomAreaChart.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Accounts.tsx
│   ├── Budgets.tsx
│   ├── Goals.tsx
│   ├── Investments.tsx
│   ├── Inventory.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── utils.ts (shadcn cn() utility)
│   └── validations.ts (Zod schemas)
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useAccounts.ts
│   ├── useBudgets.ts
│   ├── useGoals.ts
│   ├── useInvestments.ts
│   ├── useInventory.ts
│   └── useTheme.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── DataContext.tsx
├── types/
│   ├── database.types.ts
│   ├── transaction.types.ts
│   ├── investment.types.ts
│   ├── goal.types.ts
│   └── inventory.types.ts
└── utils/
    ├── formatCurrency.ts
    ├── calculateROI.ts
    ├── calculateProfitMargin.ts
    ├── dateHelpers.ts
    └── exportHelpers.ts
```

---

## Key Calculations & Formulas

### Investment Calculations
```typescript
// Average Cost
averageCost = totalCost / totalQuantity

// Unrealized P&L
unrealizedPL = (currentPrice - averageCost) * holdingQuantity

// Realized P&L (FIFO)
realizedPL = (sellPrice - purchasePriceOfSoldUnits) * quantitySold

// % Gain/Loss
percentGain = ((currentPrice - averageCost) / averageCost) * 100

// Total Return
totalReturn = (currentValue + dividends - totalInvested) / totalInvested * 100

// ROI
ROI = (profit / cost) * 100
```

### Inventory Calculations
```typescript
// Profit Margin
profitMargin = ((sellingPrice - cost) / sellingPrice) * 100

// Gross Profit
grossProfit = sellingPrice - cost

// Inventory Valuation (Average Cost)
inventoryValue = averageCost * quantityOnHand

// Holding Period
holdingPeriod = sellDate - purchaseDate (in days)
```

### Goal Calculations
```typescript
// Monthly Contribution Required
monthlyContribution = (targetAmount - currentAmount) / monthsRemaining

// Projected Completion Date
projectedDate = currentDate + (remainingAmount / monthlyContribution)

// Progress %
progress = (currentAmount / targetAmount) * 100
```

---

## MVP vs Full Version

### Phase 1 - MVP (Minimum Viable Product)
**Week 1-2: Setup & Authentication**
- ✅ Project setup (Vite + React + TypeScript)
- ✅ Install shadcn/ui and essential components
- ✅ Tailwind CSS configuration with custom theme
- ✅ Supabase setup (Auth + Database)
- ✅ Authentication pages (Login/Signup with shadcn/ui Form)
- ✅ Protected routes
- ✅ Basic layout with Navbar/Sidebar (shadcn/ui components)
- ✅ Dark/Light mode toggle

**Week 3: Core Finance Features**
- ✅ Dashboard with cards (shadcn/ui Card)
- ✅ Accounts management (Table, Dialog for forms)
- ✅ Basic transaction CRUD (Form, Input, Select)
- ✅ Categories (predefined + custom)
- ✅ Simple charts (Recharts with shadcn/ui Chart wrapper)

**Week 4: Budget & Polish**
- ✅ Budget tracking (Progress bars, Alerts)
- ✅ Transaction filters (Popover, DatePicker)
- ✅ Responsive design
- ✅ Toast notifications (Sonner)
- ✅ Loading states (Skeleton)

### Phase 2 - Core Features (Week 5-8)
- ✅ Financial goals tracker
- ✅ Investment portfolio
- ✅ Inventory management
- ✅ Advanced analytics dashboard
- ✅ OAuth login (Google, GitHub)
- ✅ Recurring transactions
- ✅ CSV import
- ✅ Advanced filters with Command palette

### Phase 3 - Advanced Features (Week 9-12)
- ✅ Comprehensive reports
- ✅ PDF/Excel export
- ✅ Receipt attachments (Supabase Storage)
- ✅ Smart insights & notifications
- ✅ What-if calculators
- ✅ Goal conflict detection
- ✅ Mobile optimization (PWA)
- ✅ Performance optimization

---

## Development Guidelines

### shadcn/ui Best Practices
- Use shadcn/ui components as base, customize when needed
- Keep all ui components in `components/ui/` folder
- Use the `cn()` utility for className merging
- Leverage Radix UI primitives for complex interactions
- Follow shadcn/ui naming conventions
- Use Form component with React Hook Form + Zod validation

### Example Usage
```typescript
// Using shadcn/ui Button component
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">
  Add Transaction
</Button>

// Using Form with validation
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Component documentation with JSDoc
- Unit tests (Vitest)
- E2E tests (Playwright) - optional
- Use Zod for runtime validation

### Performance
- Lazy loading components with React.lazy()
- Virtualized lists for large datasets (react-virtual)
- Optimistic UI updates
- Debounced search/filter
- React Query for server state caching
- Memoization with useMemo/useCallback

### Accessibility
- WCAG 2.1 AA compliance (built-in with shadcn/ui)
- Keyboard navigation (Radix UI handles this)
- Screen reader support (ARIA labels)
- Focus management
- Semantic HTML
- Color contrast ratios

### Security
- Input validation with Zod
- SQL injection prevention (via Supabase)
- XSS protection
- CSRF tokens
- Rate limiting on Supabase
- Secure headers
- Environment variables for secrets

---

## Deployment

### Development
- Local Supabase (Docker)
- Vite dev server
- Hot reload

### Production
- Vercel / Netlify / Cloudflare Pages
- Supabase hosted (free tier)
- Environment variables
- CI/CD pipeline (GitHub Actions)

### Environment Variables
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Documentation Requirements

- README.md with setup instructions
- API documentation (if custom endpoints)
- User guide (in-app help)
- Component documentation (Storybook) - optional
- Database schema documentation

---

## Success Metrics

- User can sign up and add first transaction in < 2 minutes
- Dashboard loads in < 1 second
- 100% mobile responsive
- Support for 10,000+ transactions per user
- Zero data loss
- 99.9% uptime (via Supabase)

---

## Future Enhancements (Post-Launch)

- Mobile app (React Native)
- Bank account integration (Open Banking API)
- AI-powered categorization
- Budget recommendations
- Investment portfolio rebalancing suggestions
- Multi-language support
- Team/family accounts
- API for third-party integrations
- Chrome extension for quick expense tracking
- Telegram/Discord bot for expense logging

---

## License & Credits

- Open Source (MIT License) - optional
- Built with React, Tailwind CSS, Supabase
- Icons by Lucide
- Charts by Recharts

---

**End of Requirements Document**

_Last Updated: January 2026_
_Version: 1.0_