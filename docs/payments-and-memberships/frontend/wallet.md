# Wallet

The wallet holds a creator's earned balance. There is exactly one wallet per user, created automatically on first payment received.

---

## Data shape

```ts
interface Wallet {
  id: string
  profile_id: string
  balance: number          // spendable balance in BDT
  locked_balance: number   // reserved for pending withdrawals
  currency: string         // always 'BDT'
  created_at: string
  updated_at: string
}
```

`balance` is what the creator can withdraw right now.  
`locked_balance` is funds tied up in a pending withdrawal request.  
Total wallet value = `balance + locked_balance`.

---

## Fetching the wallet

```ts
const { data: wallet, error } = await supabase
  .from('wallets')
  .select('balance, locked_balance, currency')
  .single()
```

The RLS policy scopes this to `profile_id = auth.uid()` automatically — no need to filter by user.

### Handling the "no wallet yet" case

New creators have no wallet row until their first payment. A `single()` call returns `{ data: null }` — not an error.

```ts
const { data: wallet } = await supabase
  .from('wallets')
  .select('balance, locked_balance, currency')
  .maybeSingle()   // returns null instead of throwing if no row

const balance = wallet?.balance ?? 0
const lockedBalance = wallet?.locked_balance ?? 0
```

---

## Displaying balance

```tsx
function WalletCard({ balance, lockedBalance }: {
  balance: number
  lockedBalance: number
}) {
  const formatBDT = (amount: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount)

  return (
    <div>
      <p>Available balance: {formatBDT(balance)}</p>
      {lockedBalance > 0 && (
        <p>Pending withdrawal: {formatBDT(lockedBalance)}</p>
      )}
    </div>
  )
}
```

---

## Real-time balance updates

Subscribe to wallet changes so the balance updates automatically when a new payment comes in or a withdrawal is processed:

```ts
const channel = supabase
  .channel('wallet-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'wallets',
      filter: `profile_id=eq.${userId}`,
    },
    (payload) => {
      const updated = payload.new as Wallet
      setBalance(updated.balance)
      setLockedBalance(updated.locked_balance)
    }
  )
  .subscribe()

// Cleanup
return () => { supabase.removeChannel(channel) }
```

---

## React Query hook example

```ts
import { useQuery } from '@tanstack/react-query'

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, locked_balance, currency, updated_at')
        .maybeSingle()

      if (error) throw error
      return data
    },
  })
}
```

---

## `has_wallet_balance` profile flag

The `profiles` table has a `has_wallet_balance` boolean that is kept in sync with `wallets.balance > 0` by a database trigger. Use this flag to cheaply show/hide wallet-related UI when loading a profile without querying the wallets table:

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('has_wallet_balance')
  .eq('id', userId)
  .single()

// Only show "Withdraw" button if the user has a balance
if (profile?.has_wallet_balance) {
  // show withdraw UI
}
```

---

## Important constraints

- Do **not** directly `UPDATE` the `balance` or `locked_balance` columns from client code. The RLS `UPDATE` policy exists as a guard, but all balance mutations are meant to flow through payment RPCs and the `request_withdrawal` RPC.
- The `balance` column has a `CHECK (balance >= 0)` constraint — it can never go negative.
