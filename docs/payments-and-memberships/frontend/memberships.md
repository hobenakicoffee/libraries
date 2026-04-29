# Memberships

Memberships allow supporters to subscribe to a creator's service (newsletter, course, etc.) for recurring or lifetime access. This page covers how to read plans, check access, purchase a membership, and handle cancellation from the client.

---

## Data shapes

```ts
type MembershipBillingCycle = 'monthly' | 'annual' | 'lifetime'
type MembershipStatus = 'active' | 'cancelled' | 'expired' | 'paused' | 'past_due'

interface MembershipPlan {
  id: string
  owner_profile_id: string
  service_type: string
  name: string
  description: string | null
  is_featured: boolean
  price: number
  billing_cycle: MembershipBillingCycle
  access_config: Record<string, unknown>
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProfileMembership {
  id: string
  plan_id: string
  owner_profile_id: string
  member_profile_id: string
  service_type: string
  status: MembershipStatus
  period_start: string
  period_end: string | null     // null = lifetime
  cancelled_at: string | null
  renewed_at: string | null
  price_at_purchase: number
  transaction_id: string | null
  auto_renew: boolean
  created_at: string
  updated_at: string
}
```

---

## Fetching a creator's plans

Returns active plans visible to all visitors. A plan's owner also sees their inactive plans.

```ts
export async function fetchCreatorPlans(
  creatorProfileId: string,
  serviceType: string
) {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('owner_profile_id', creatorProfileId)
    .eq('service_type', serviceType)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as MembershipPlan[]
}
```

---

## Checking if a user has an active membership

Use the `has_active_membership` RPC for a definitive server-side check:

```ts
export async function checkMembership(
  ownerProfileId: string,
  serviceType: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_membership', {
    p_owner_profile_id: ownerProfileId,
    p_member_profile_id: (await supabase.auth.getUser()).data.user!.id,
    p_service_type: serviceType,
  })

  if (error) throw error
  return data as boolean
}
```

Or read the membership row directly to also get plan details:

```ts
export async function fetchMembership(
  ownerProfileId: string,
  serviceType: string
) {
  const { data, error } = await supabase
    .from('profile_memberships')
    .select(`
      *,
      membership_plans (
        name,
        billing_cycle,
        price
      )
    `)
    .eq('owner_profile_id', ownerProfileId)
    .eq('service_type', serviceType)
    .maybeSingle()

  if (error) throw error
  return data
}
```

---

## Checking access in a Server Action / API route

For content-gating (e.g. unlocking a newsletter post), call the `has_active_membership` RPC from your server:

```ts
// app/api/newsletter/[postId]/route.ts
import { supabaseAdmin } from '@/lib/supabase/server-admin'

export async function GET(req: Request, { params }: { params: { postId: string } }) {
  const userId = getUserFromSession(req)  // your auth helper

  const { data: hasAccess } = await supabaseAdmin.rpc('has_active_membership', {
    p_owner_profile_id: CREATOR_ID,
    p_member_profile_id: userId,
    p_service_type: 'newsletter',
  })

  if (!hasAccess) {
    return Response.json({ error: 'Membership required' }, { status: 403 })
  }

  // Return the content...
}
```

---

## Purchasing a membership

Memberships are created by service-specific RPCs on the server — clients do not insert into `profile_memberships` directly. Trigger a purchase via your API route:

```ts
// Client-side: call your API route
export async function purchaseNewsletter(
  planId: string,
  paymentDetails: { provider: string; transactionId: string }
) {
  const response = await fetch('/api/newsletter/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, ...paymentDetails }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Purchase failed')
  }

  return response.json()
}
```

```ts
// Server-side: API route calls the Supabase RPC with service role
// app/api/newsletter/purchase/route.ts
export async function POST(req: Request) {
  const { planId, provider, transactionId } = await req.json()

  const { data, error } = await supabaseAdmin.rpc(
    'purchase_newsletter_membership',
    {
      p_plan_id: planId,
      p_provider: provider,
      p_provider_transaction_id: transactionId,
      // ... other params per the RPC signature
    }
  )

  if (error) return Response.json({ message: error.message }, { status: 400 })
  return Response.json(data)
}
```

---

## Cancelling a membership

Members can cancel their own membership. Access remains valid until `period_end`:

```ts
export async function cancelMembership(membershipId: string) {
  const { error } = await supabase
    .from('profile_memberships')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', membershipId)

  if (error) throw error
}
```

The RLS policy allows members to set `status` to `'cancelled'` or `'paused'` on their own rows. No other status transitions are allowed from the client.

---

## Displaying plan prices

```ts
export function formatPlanPrice(plan: MembershipPlan): string {
  const price = new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(plan.price)

  const cycleLabels: Record<MembershipBillingCycle, string> = {
    monthly:  '/month',
    annual:   '/year',
    lifetime: ' one-time',
  }

  return `${price}${cycleLabels[plan.billing_cycle]}`
}
```

---

## Membership status helpers

```ts
export function isMembershipActive(membership: ProfileMembership): boolean {
  if (membership.status !== 'active') return false
  if (membership.period_end === null) return true  // lifetime
  return new Date(membership.period_end) > new Date()
}

export function daysUntilExpiry(membership: ProfileMembership): number | null {
  if (!membership.period_end) return null  // lifetime
  const diff = new Date(membership.period_end).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function membershipStatusLabel(membership: ProfileMembership): string {
  const days = daysUntilExpiry(membership)

  if (membership.status === 'cancelled' && days !== null && days > 0) {
    return `Cancelled — access until ${new Date(membership.period_end!).toLocaleDateString()}`
  }

  const labels: Record<MembershipStatus, string> = {
    active:    days !== null ? `Active — ${days} days left` : 'Active (Lifetime)',
    cancelled: 'Cancelled',
    expired:   'Expired',
    paused:    'Paused',
    past_due:  'Payment overdue',
  }

  return labels[membership.status]
}
```

---

## Showing expiry notification in-app

Membership expiry notifications appear as `system` role activities in the user's private feed. They are created automatically by the nightly cron — you do not need to poll. Subscribe to the activities table instead:

```ts
useEffect(() => {
  const channel = supabase
    .channel('membership-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `user_profile_id=eq.${userId}`,
      },
      (payload) => {
        const activity = payload.new as Activity
        if (activity.role === 'system') {
          showToast('Membership update', activity.metadata.notification_type)
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [userId])
```

---

## Plan management (creator side)

```ts
// Create a new plan
export async function createPlan(plan: Omit<MembershipPlan, 'id' | 'owner_profile_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('membership_plans')
    .insert(plan)
    .select()
    .single()

  if (error) throw error
  return data as MembershipPlan
}

// Deactivate a plan (soft delete — cannot delete if members exist)
export async function deactivatePlan(planId: string) {
  const { error } = await supabase
    .from('membership_plans')
    .update({ is_active: false })
    .eq('id', planId)

  if (error) throw error
}
```

::: warning
You cannot delete a `membership_plans` row if any `profile_memberships` reference it (`ON DELETE RESTRICT`). Always deactivate instead.
:::
