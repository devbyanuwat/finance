import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

// Account validation
export const accountSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อบัญชี'),
  type: z.enum(['cash', 'bank', 'credit_card', 'e_wallet']),
  balance: z.number(),
  currency: z.string(),
  is_active: z.boolean(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

export type AccountFormData = z.infer<typeof accountSchema>

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
  type: z.enum(['income', 'expense']),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Transaction validation
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  account_id: z.string().min(1, 'กรุณาเลือกบัญชี'),
  to_account_id: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  transaction_date: z.date(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  tags: z.array(z.string()).nullable().optional(),
}).refine((data) => {
  if (data.type === 'transfer' && !data.to_account_id) {
    return false
  }
  return true
}, {
  message: 'กรุณาเลือกบัญชีปลายทาง',
  path: ['to_account_id'],
})

export type TransactionFormData = z.infer<typeof transactionSchema>

// Budget validation
export const budgetSchema = z.object({
  category_id: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  period: z.enum(['monthly', 'yearly']),
  alert_threshold: z.number().min(0).max(100),
  start_date: z.date().nullable().optional(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>

// Debt validation
export const debtSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อรายการ'),
  debt_type: z.enum(['credit_card_installment', 'credit_card_full', 'personal_loan']),
  total_amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  installment_count: z.number().int().min(1, 'จำนวนงวดต้องมากกว่า 0'),
  interest_rate: z.number().min(0, 'อัตราดอกเบี้ยต้องไม่น้อยกว่า 0'),
  creditor_name: z.string().nullable().optional(),
  account_id: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  due_day: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.date(),
  note: z.string().nullable().optional(),
}).refine((data) => {
  if (data.debt_type !== 'personal_loan') return !!data.account_id
  return true
}, {
  message: 'กรุณาเลือกบัตรเครดิต',
  path: ['account_id'],
})

export type DebtFormData = z.infer<typeof debtSchema>
