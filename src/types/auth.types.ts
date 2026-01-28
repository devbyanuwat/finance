import type { User, Session } from '@supabase/supabase-js'

export type AuthUser = User
export type AuthSession = Session

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}
