// Test Supabase Connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rgljnyedroqhcrapsvts.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnbGpueWVkcm9xaGNyYXBzdnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODA4NzEsImV4cCI6MjA4NTE1Njg3MX0.Y77Rsp9AnR9cioZVaGA1m77iVhhizAnlMteQxW4Ds9A'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test 1: Check if profiles table exists
console.log('\n1. Testing database connection...')
const { data: tables, error: tablesError } = await supabase
  .from('profiles')
  .select('id')
  .limit(0)

if (tablesError) {
  console.error('❌ Error accessing profiles table:', tablesError.message)
  console.log('\n💡 Solution: You need to run the migration SQL in Supabase dashboard')
  console.log('   Go to: https://supabase.com/dashboard/project/rgljnyedroqhcrapsvts/editor')
  console.log('   Copy and run the SQL from: supabase/migrations/001_initial_schema.sql')
} else {
  console.log('✅ Profiles table exists')
}

// Test 2: Try to sign up
console.log('\n2. Testing signup...')
const testEmail = `test${Date.now()}@example.com`
const testPassword = 'Test1234!'

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: {
    data: {
      full_name: 'Test User',
    },
  },
})

if (signUpError) {
  console.error('❌ Signup error:', signUpError.message)

  if (signUpError.message.includes('email')) {
    console.log('\n💡 Note: Email confirmation might be enabled in Supabase Auth settings')
    console.log('   To disable: Go to Authentication > Settings > Email Auth')
    console.log('   And turn off "Confirm email"')
  }
} else {
  console.log('✅ Signup successful!')
  console.log('   User ID:', signUpData.user?.id)
  console.log('   Email:', signUpData.user?.email)

  if (signUpData.user?.identities?.length === 0) {
    console.log('\n⚠️  Warning: Email already exists but user creation succeeded')
  }
}

console.log('\n3. Auth settings recommendations:')
console.log('   Go to: https://supabase.com/dashboard/project/rgljnyedroqhcrapsvts/auth/providers')
console.log('   - Disable "Confirm email" for development')
console.log('   - Enable "Autoconfirm" for development')
