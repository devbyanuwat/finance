import { AuthCard, SignupForm } from '@/components/auth'

export default function Signup() {
  return (
    <AuthCard
      title="สร้างบัญชีใหม่"
      description="เริ่มต้นจัดการการเงินของคุณวันนี้"
    >
      <SignupForm />
    </AuthCard>
  )
}
