import { AuthCard, LoginForm } from '@/components/auth'

export default function Login() {
  return (
    <AuthCard
      title="เข้าสู่ระบบ Money Manager"
      description="จัดการการเงินของคุณอย่างชาญฉลาด"
    >
      <LoginForm />
    </AuthCard>
  )
}
