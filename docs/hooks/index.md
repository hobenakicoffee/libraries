---
outline: deep
---

# Hooks

React hooks for common functionality.

## Usage

```ts
import { useIsMobile } from "@hobenakicoffee/libraries/hooks";
```

## Exports

| Hook | Description |
| `useIsMobile` | Detect if viewport is mobile-sized |

## useIsMobile

React hook to detect if the viewport is mobile-sized.

```ts
function MyComponent() {
  const isMobile = useIsMobile();
  
  return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
}
```

Returns `true` if the viewport width is less than 768px.