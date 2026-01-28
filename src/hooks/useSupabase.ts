import { useMemo } from 'react'
import { useSession } from '@clerk/clerk-react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function useSupabase(): SupabaseClient {
  const { session } = useSession()

  const supabase = useMemo(() => {
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        global: {
          fetch: async (url, options = {}) => {
            // Get Clerk token for Supabase
            const clerkToken = await session?.getToken({ template: 'supabase' })

            const headers = new Headers(options.headers)
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`)
            }
            return fetch(url, { ...options, headers })
          },
        },
      }
    )
  }, [session])

  return supabase
}
