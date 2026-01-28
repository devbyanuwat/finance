import { useUser, useClerk } from '@clerk/clerk-react'

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()

  // Map Clerk user to a compatible format
  const mappedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        user_metadata: {
          full_name: user.fullName ?? user.firstName ?? 'ผู้ใช้',
          avatar_url: user.imageUrl,
        },
      }
    : null

  return {
    user: mappedUser,
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    signOut: () => signOut({ redirectUrl: '/login' }),
  }
}
