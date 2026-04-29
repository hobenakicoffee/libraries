# Payout Methods

Payout methods are the bank or mobile banking accounts a creator uses to receive withdrawals. Users can have multiple methods but only one marked as default.

---

## Data shape

```ts
type PayoutProvider = 'bkash' | 'nagad' | 'rocket' | 'bank'

// Mobile banking details (bkash / nagad / rocket)
interface MobileDetails {
  number: string   // '01XXXXXXXXX'
  type: 'personal' | 'merchant'
}

// Bank transfer details
interface BankDetails {
  bank_name: string
  account_name: string
  account_number: string
  routing_number: string
  branch_name: string
}

interface PayoutMethod {
  id: string
  profile_id: string
  provider: PayoutProvider
  details: MobileDetails | BankDetails
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}
```

---

## List active payout methods

```ts
const { data: methods, error } = await supabase
  .from('payout_methods')
  .select('id, provider, details, is_default, is_active')
  .eq('is_active', true)
  .order('is_default', { ascending: false })  // default first
```

---

## Add a new payout method

```ts
async function addPayoutMethod(
  provider: PayoutProvider,
  details: MobileDetails | BankDetails,
  isDefault = false
) {
  // If setting as default, clear existing defaults first
  if (isDefault) {
    await supabase
      .from('payout_methods')
      .update({ is_default: false })
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('payout_methods')
    .insert({
      provider,
      details,
      is_default: isDefault,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Validation before inserting

Validate `details` client-side before sending to avoid unnecessary round trips:

```ts
function validateMobileDetails(details: MobileDetails): string | null {
  const bdMobileRegex = /^01[3-9]\d{8}$/
  if (!bdMobileRegex.test(details.number)) {
    return 'Please enter a valid Bangladeshi mobile number'
  }
  return null
}

function validateBankDetails(details: BankDetails): string | null {
  if (!details.bank_name.trim()) return 'Bank name is required'
  if (!details.account_name.trim()) return 'Account holder name is required'
  if (!details.account_number.trim()) return 'Account number is required'
  if (!details.routing_number.trim()) return 'Routing number is required'
  return null
}
```

---

## Set a method as default

```ts
async function setDefaultPayoutMethod(methodId: string) {
  // Clear all other defaults for this user
  await supabase
    .from('payout_methods')
    .update({ is_default: false })
    .neq('id', methodId)

  // Set the new default
  const { error } = await supabase
    .from('payout_methods')
    .update({ is_default: true })
    .eq('id', methodId)

  if (error) throw error
}
```

---

## Edit a payout method

```ts
async function updatePayoutMethod(
  methodId: string,
  updates: Partial<Pick<PayoutMethod, 'details' | 'is_default'>>
) {
  const { data, error } = await supabase
    .from('payout_methods')
    .update(updates)
    .eq('id', methodId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Remove a payout method (soft delete)

::: warning
Hard-deleting a method that has been used in a withdrawal request will fail with a foreign key constraint error. Always soft-delete by setting `is_active = false`.
:::

```ts
async function removePayoutMethod(methodId: string) {
  const { error } = await supabase
    .from('payout_methods')
    .update({ is_active: false, is_default: false })
    .eq('id', methodId)

  if (error) throw error
}
```

---

## Provider display helpers

```ts
const PROVIDER_LABELS: Record<PayoutProvider, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  bank: 'Bank Transfer',
}

const PROVIDER_COLORS: Record<PayoutProvider, string> = {
  bkash: '#E2136E',
  nagad: '#F05829',
  rocket: '#8B4513',
  bank: '#1A56DB',
}

function getMethodLabel(method: PayoutMethod): string {
  if (method.provider === 'bank') {
    const d = method.details as BankDetails
    return `${d.bank_name} — ${d.account_number.slice(-4).padStart(d.account_number.length, '*')}`
  }
  const d = method.details as MobileDetails
  return `${PROVIDER_LABELS[method.provider]} — ${d.number}`
}
```

---

## React Query hooks example

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePayoutMethods() {
  return useQuery({
    queryKey: ['payout-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
      if (error) throw error
      return data as PayoutMethod[]
    },
  })
}

export function useAddPayoutMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      provider: PayoutProvider
      details: MobileDetails | BankDetails
      isDefault?: boolean
    }) => addPayoutMethod(input.provider, input.details, input.isDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-methods'] })
    },
  })
}
```
