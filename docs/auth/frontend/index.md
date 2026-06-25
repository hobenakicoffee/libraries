# Auth — Frontend Guide

## Login Flow

1. User enters email address
2. Supabase sends 8-digit OTP to the email
3. User enters OTP code
4. Session is created, user is redirected to the app

## Route

```
src/routes/(auth)/login/
├── -components/
│   ├── email-form.tsx
│   └── otp-form.tsx
├── -index.content.tsx
└── index.tsx
```

## AuthProvider

Location: `src/components/providers/auth-provider.tsx`

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 7-second timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 7000)
    return () => clearTimeout(timer)
  }, [])

  const login = async (email: string) => {
    await supabase.auth.signInWithOtp({ email })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Provides:**

| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | Current Supabase user |
| `isAuthenticated` | `boolean` | Whether a user is signed in |
| `isLoading` | `boolean` | Session check in progress |
| `login(email)` | `(email: string) => Promise<void>` | Send OTP to email |
| `logout()` | `() => Promise<void>` | Sign out |

## Protected Routes

TanStack Router `beforeLoad` guard checks `context.auth.isAuthenticated`:

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

## Auth Callback

Route: `auth.callback.tsx` — handles OAuth/SSO redirect callbacks. Reads the `code` or `token` from the URL hash and exchanges it for a session via `supabase.auth.exchangeCodeForSession()`.

## Supabase Auth API

```tsx
// Send OTP
await supabase.auth.signInWithOtp({ email })

// Verify OTP
await supabase.auth.verifyOtp({ email, token, type: 'email' })
```

## CAPTCHA

The login form uses Cloudflare Turnstile for bot protection. The Turnstile site key is configured via `VITE_TURNSTILE_SITE_KEY` and rendered as a widget in the email form.
