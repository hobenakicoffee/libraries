# Services Hub — Frontend Guide

## Route

```
src/routes/(app)/_authenticated/services/
├── -components/
│   ├── service-card.tsx
│   └── request-service-dialog.tsx
├── $serviceSlug.tsx     # Dynamic service detail page
├── index.tsx            # Service cards grid
```

## Features

### Service Grid (`index.tsx`)

Displays available services as a card grid. Each card shows the service icon, name, description, and current enable/disable state.

### Service Detail (`$serviceSlug.tsx`)

Dynamic route that renders the detail page for a specific service. The slug matches a key from the `ServiceItem` definitions.

### Toggle On/Off

Services are toggled via the `user_services` table:

```tsx
const { mutate: toggleService } = useMutation({
  mutationFn: async (params: { service: string; isEnabled: boolean }) => {
    const { error } = await supabase.rpc('toggle_user_service', {
      profile_id: profile.id,
      service: params.service,
      is_enabled: params.isEnabled,
    })
    if (error) throw error
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile', profile.id] })
  },
})
```

### Request Service Dialog

`request-service-dialog.tsx` — a dialog that lets creators suggest new features or service types they'd like to see added. Opens as a modal with a form that submits to the `service_requests` table.

## Service Data

Service definitions come from `constants/services.ts` in the app:

```tsx
interface ServiceItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType
  category: string
  isEnabled: boolean
  route: string | null
}
```

Services are categorized (e.g., monetization, engagement, content) and each has an associated route for its detail/management page.

## RPC Reference

| RPC | Parameters | Purpose |
|---|---|---|
| `toggle_user_service` | `profile_id`, `service`, `is_enabled` | Enable or disable a service |
