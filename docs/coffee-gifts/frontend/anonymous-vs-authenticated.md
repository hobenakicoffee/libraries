# Anonymous vs Authenticated Supporters

The coffee gifts system supports two distinct types of supporters. Understanding the difference is important for building the gift form and displaying gift history correctly.

## At a Glance

| | Authenticated Supporter | Anonymous Supporter |
|---|---|---|
| Logged in? | Yes | No |
| `supporter_profile_id` | User's UUID | `null` |
| Wallet deduction possible? | Yes (if using internal wallet) | No |
| Tracked in `supporters` table? | Yes | Yes (by identity hash) |
| Gift shown in their activity? | Yes (private) | No |
| Gift shown in creator's feed? | Yes (public) | Yes (public) |
| Name shown | User-supplied or profile name | User-supplied |

## Detecting the Supporter Type

On your frontend, check the auth session to decide which path to take:

```typescript
import { useSession } from '@/hooks/useSession' // your auth hook

function GiftPage() {
  const { session } = useSession()
  const isAuthenticated = !!session?.user

  return isAuthenticated
    ? <AuthenticatedGiftForm user={session.user} />
    : <AnonymousGiftForm />
}
```

## Authenticated Gift Form

When the user is logged in, you can pre-fill their name and profile info. Offer the internal wallet as a payment option if they have a balance.

```typescript
interface AuthenticatedGiftFormProps {
  user: { id: string; displayName: string }
}

function AuthenticatedGiftForm({ user }: AuthenticatedGiftFormProps) {
  const [supporterName, setSupporterName] = useState(user.displayName)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    // Fetch the user's wallet balance
    supabase
      .from('wallets')
      .select('balance')
      .single()
      .then(({ data }) => setWalletBalance(data?.balance ?? 0))
  }, [])

  // Render form with wallet payment option if balance > 0
}
```

### What Gets Sent to the Backend

```typescript
const payload = {
  creatorId: creator.id,
  // ✅ Include the supporter's user ID
  supporterId: user.id,
  supporterName: form.supporterName,
  // ...
}
```

Your backend maps `supporterId` → `p_supporter_profile_id` in the RPC call.

## Anonymous Gift Form

When the user is not logged in, collect just the display name and optionally the platform they came from. Do not offer wallet payment.

```typescript
function AnonymousGiftForm() {
  const [supporterName, setSupporterName] = useState('')
  const [platform, setPlatform] = useState<string | null>(null)

  // No wallet payment option for anonymous users
  const availablePaymentMethods = ['bkash', 'nagad', 'rocket', 'card']

  return (
    <form>
      <input
        placeholder="Your name (e.g. Coffee Fan)"
        value={supporterName}
        onChange={e => setSupporterName(e.target.value)}
        required
      />
      <PlatformPicker value={platform} onChange={setPlatform} />
      <PaymentMethodPicker methods={availablePaymentMethods} />
    </form>
  )
}
```

### What Gets Sent to the Backend

```typescript
const payload = {
  creatorId: creator.id,
  // ✅ No supporterId for anonymous
  supporterName: form.supporterName,
  supporterPlatform: form.platform ?? undefined,
  // ...
}
```

Your backend sets `p_supporter_profile_id = null` in the RPC call.

## Identity Hash (Backend Responsibility)

Anonymous supporters are deduplicated by an `identity_hash`. **This is always computed on the backend** — you should never send it from the frontend.

The hash is computed from a stable combination of:

- Creator ID
- Supporter's display name
- Client IP address (from request headers)
- User agent string

```typescript
// backend/lib/identity.ts
import { createHash } from 'crypto'

export function generateIdentityHash(params: {
  creatorId: string
  name: string
  ip: string
  userAgent: string
}): string {
  const input = [params.creatorId, params.name, params.ip, params.userAgent]
    .join('|')
    .toLowerCase()
  return createHash('sha256').update(input).digest('hex')
}
```

For authenticated users, you still pass an `identity_hash` — the same function applies. The database uses it as a secondary deduplication key when the user signs up or logs in after gifting anonymously.

## Displaying the Supporter Name in Feeds

In the gift feed, anonymous gifts show the name the supporter entered. Authenticated gifts can optionally be enriched with the supporter's current profile data, but the `supporter_name` snapshot on the `coffee_gifts` row is always a safe fallback:

```typescript
function GiftCard({ gift }: { gift: CoffeeGift }) {
  const isAnonymous = gift.supporter_profile_id === null

  return (
    <div className="gift-card">
      <Avatar
        src={isAnonymous ? null : `/api/avatars/${gift.supporter_profile_id}`}
        fallback={gift.supporter_name?.[0] ?? '?'}
      />
      <div>
        <span className="name">
          {gift.supporter_name ?? 'Someone'}
          {isAnonymous && <span className="badge">Anonymous</span>}
        </span>
        {gift.message && <p className="message">{gift.message}</p>}
        <span className="count">
          ☕ × {gift.coffee_count}
          {gift.is_monthly && ' / month'}
        </span>
      </div>
    </div>
  )
}
```

## Monthly vs One-Time Gifts

The `is_monthly` flag indicates a recurring (monthly) gift. Currently the database records this as a flag on the gift row — the scheduling system is separate. For the frontend, handle it as follows:

- Show a "Monthly" toggle on the gift form
- Display a "/ month" label on monthly gifts in the feed
- If you're building a supporter management page, filter by `is_monthly = true` to show subscribers

```typescript
// Querying only monthly gifts
const { data: monthlyGifts } = await supabase
  .from('coffee_gifts')
  .select('*')
  .eq('creator_profile_id', creatorId)
  .eq('is_monthly', true)
  .order('created_at', { ascending: false })
```
