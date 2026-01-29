import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

// Password validation function
const validatePassword = (password: string) => {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasMinLength = password.length >= 8

  return {
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasMinLength,
    isValid: hasUppercase && hasLowercase && hasNumber && hasMinLength,
  }
}

// Generate random password
const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'

  let password = ''
  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  const allChars = uppercase + lowercase + numbers + special
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const passwordValidation = validatePassword(password)

  const handleGeneratePassword = async () => {
    const newPassword = generatePassword()
    setPassword(newPassword)
    setConfirmPassword(newPassword)
    setShowPassword(true)
    setShowConfirmPassword(true)

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(newPassword)
      toast.success('สร้างและคัดลอกรหัสผ่านสำเร็จ')
    } catch (error) {
      toast.success('สร้างรหัสผ่านสำเร็จ (ไม่สามารถคัดลอกได้)')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValidation.isValid) {
      toast.error('กรุณากรอกรหัสผ่านให้ถูกต้องตามเงื่อนไข')
      return
    }

    if (password !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      // Step 1: Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'ผู้ใช้',
          },
        },
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('ไม่สามารถสร้างบัญชีได้')
      }

      // Step 2: Create profile manually (since trigger is disabled)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName || 'ผู้ใช้',
          avatar_url: null,
        })

      if (profileError) {
        // If profile already exists, that's ok
        if (profileError.code !== '23505') {
          console.error('Profile creation error:', profileError)
          throw new Error('ไม่สามารถสร้างโปรไฟล์ได้: ' + profileError.message)
        }
      }

      toast.success('สมัครสมาชิกสำเร็จ!')
      navigate('/login')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>สมัครสมาชิก</CardTitle>
          <CardDescription>สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="ชื่อของคุณ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleGeneratePassword}
                    title="สร้างรหัสผ่านแบบสุ่ม"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {password && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-1 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasMinLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>อย่างน้อย 8 ตัวอักษร</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasUppercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>มีตัวพิมพ์ใหญ่ (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasLowercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>มีตัวพิมพ์เล็ก (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>มีตัวเลข (0-9)</span>
                  </div>
                  {confirmPassword && (
                    <div className={`flex items-center gap-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {password === confirmPassword ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>รหัสผ่านตรงกัน</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <XCircle className="h-3 w-3" />
                  <span>รหัสผ่านไม่ตรงกัน</span>
                </div>
              )}
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>รหัสผ่านตรงกัน</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                'สมัครสมาชิก'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
