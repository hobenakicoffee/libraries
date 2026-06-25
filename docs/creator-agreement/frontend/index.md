# Creator Agreement — Frontend Guide

## Route

```
src/routes/(app)/_authenticated/creator-agreement/
├── -components/
│   ├── creator-agreement-banner.tsx
│   └── suspension-banner.tsx
├── index.tsx
```

## Components

### Creator Agreement Banner

`creator-agreement-banner.tsx` — shown when the creator has not yet accepted the creator agreement.

```tsx
export function CreatorAgreementBanner() {
  const { profile } = useProfile()
  const acceptAgreement = useAcceptCreatorAgreement()

  if (profile?.accepted_creator_agreement_at) return null

  return (
    <Banner variant="warning">
      <p>You need to accept the Creator Agreement before using our services.</p>
      <Button onClick={() => acceptAgreement.mutate(version)}>
        Accept Agreement
      </Button>
    </Banner>
  )
}
```

### Suspension Banner

`suspension-banner.tsx` — shown when the creator's account is suspended.

```tsx
export function SuspensionBanner() {
  const { profile } = useProfile()

  if (!profile?.suspended_at) return null

  return (
    <Banner variant="error">
      Your account has been suspended. Some features may be unavailable.
    </Banner>
  )
}
```

## Fields

| Column | Type | Purpose |
|---|---|---|
| `profiles.accepted_creator_agreement_at` | `timestamptz \| null` | When the creator accepted |
| `profiles.creator_agreement_version` | `int \| null` | Version of the accepted agreement |

## RPC

```sql
-- Accept the creator agreement
SELECT accept_creator_agreement(version := 1);
```

## Flow

1. Creator lands on a page that requires the agreement
2. `CreatorAgreementBanner` checks if `accepted_creator_agreement_at` is null
3. If not accepted, the banner is displayed with the agreement text
4. Creator reads and clicks "Accept Agreement"
5. `accept_creator_agreement(version)` RPC is called
6. Profile is updated, banner disappears
7. If `suspended_at` is set, `SuspensionBanner` shows instead
