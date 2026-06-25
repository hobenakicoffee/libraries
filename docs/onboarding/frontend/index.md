# Onboarding — Frontend Guide

## Route

```
src/routes/(app)/onboarding/
├── -components/
│   ├── onboarding-incomplete-alert.tsx
│   ├── step-1.tsx
│   ├── step-2.tsx
│   ├── step-3.tsx
│   ├── step-4.tsx
│   └── step-5.tsx
├── route.tsx
└── index.tsx
```

## Flow

5-step wizard — `step-1` through `step-5` — wrapped by `route.tsx` which provides the shared layout and step navigation.

### Layout (`route.tsx`)

```tsx
export const Route = createFileRoute('/_authenticated/onboarding')({
  component: OnboardingLayout,
})

function OnboardingLayout() {
  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={5} />
      <Outlet />
    </div>
  )
}
```

### Onboarding Incomplete Alert

Component: `onboarding-incomplete-alert.tsx`

Shown on dashboard pages when the creator hasn't completed onboarding yet. Displays a banner with a link to resume the wizard.

## Profile Fields Set Per Step

| Step | Fields |
|---|---|
| 1 | `display_name` |
| 2 | `username` |
| 3 | `categories` |
| 4 | `social_links` |
| 5 | `page_slug` |

## Step Tracking

Progress is tracked via the `profiles.onboarding_step` column (0–5):

- `0` — not started
- `1–5` — current step
- `5` — completed (redirects to `/activities`)

## Completion

Once all steps are done:

```tsx
await supabase
  .from('profiles')
  .update({
    onboarding_step: 5,
    onboarding_completed_at: new Date().toISOString(),
  })
  .eq('id', userId)
```

After completion, the user is redirected to `/activities` and the onboarding incomplete banner is no longer shown.
