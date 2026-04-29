# Theming System

Each shop has a `theme_config` JSONB blob stored on `shop_settings`. Astro SSR converts it to CSS custom properties inlined in the `<head>`. Components reference those variables via Tailwind's arbitrary-value syntax.

## `ShopThemeConfig` shape

```typescript
// app/src/types/shop.ts
export interface ShopThemeConfig {
  // Colors (hex or hsl strings)
  primary?: string;
  primary_foreground?: string;
  accent?: string;
  accent_foreground?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  muted_foreground?: string;
  border?: string;

  // Typography
  font_heading?: 'inter' | 'playfair' | 'merriweather' | 'space-grotesk' | 'manrope';
  font_body?: 'inter' | 'merriweather' | 'lora' | 'manrope';

  // Layout
  border_radius?: 'sharp' | 'soft' | 'pill';
  layout_density?: 'compact' | 'comfortable' | 'spacious';

  // Hero style
  hero_style?: 'banner' | 'minimal' | 'split';
}
```

::: tip Partial updates
`upsert_shop_settings` merges `theme_config` using the JSONB `||` operator — it does **not** replace the entire object. Sending `{ primary: "#ff0000" }` only changes the primary color, leaving all other keys untouched. This lets the theme editor update individual fields without reading the full config first.
:::

---

## Step 1 — CSS variable builder

```typescript
// shared/lib/shop-theme.ts (used by both Astro and the preview page)

const FONT_STACKS: Record<NonNullable<ShopThemeConfig['font_heading']>, string> = {
  inter:           "'Inter', system-ui, sans-serif",
  playfair:        "'Playfair Display', Georgia, serif",
  merriweather:    "'Merriweather', Georgia, serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  manrope:         "'Manrope', sans-serif",
};

const RADII: Record<NonNullable<ShopThemeConfig['border_radius']>, string> = {
  sharp: '0',
  soft:  '0.5rem',
  pill:  '9999px',
};

export function buildShopCssVars(config: ShopThemeConfig): string {
  const lines: string[] = [];

  if (config.primary)            lines.push(`--shop-primary: ${config.primary};`);
  if (config.primary_foreground) lines.push(`--shop-primary-foreground: ${config.primary_foreground};`);
  if (config.accent)             lines.push(`--shop-accent: ${config.accent};`);
  if (config.accent_foreground)  lines.push(`--shop-accent-foreground: ${config.accent_foreground};`);
  if (config.background)         lines.push(`--shop-background: ${config.background};`);
  if (config.foreground)         lines.push(`--shop-foreground: ${config.foreground};`);
  if (config.muted)              lines.push(`--shop-muted: ${config.muted};`);
  if (config.muted_foreground)   lines.push(`--shop-muted-foreground: ${config.muted_foreground};`);
  if (config.border)             lines.push(`--shop-border: ${config.border};`);

  if (config.font_heading) lines.push(`--shop-font-heading: ${FONT_STACKS[config.font_heading]};`);
  if (config.font_body)    lines.push(`--shop-font-body: ${FONT_STACKS[config.font_body]};`);
  if (config.border_radius) lines.push(`--shop-radius: ${RADII[config.border_radius]};`);

  return lines.length > 0 ? `:root { ${lines.join(' ')} }` : '';
}
```

---

## Step 2 — Inject in Astro layout

```astro
---
// pages/@[username]/shops/index.astro
import { buildShopCssVars } from '@/lib/shop-theme';
import { getShopByUsername } from '@/lib/shop-api';

const { username } = Astro.params;
const result = await getShopByUsername(username);
if (!result?.success) return Astro.redirect('/404');

const cssVars = buildShopCssVars(result.shop.theme_config ?? {});
---

<html>
  <head>
    <title>{result.shop.seo_title ?? result.shop.shop_name}</title>
    {cssVars && <style is:inline set:html={cssVars} />}
  </head>
  <body>
    <!-- shop content -->
  </body>
</html>
```

`<style is:inline>` tells Astro not to process the content — it's injected verbatim into the `<head>`. This means the CSS variables are available before any page paint.

---

## Step 3 — Using variables in components

Reference theme variables via Tailwind's arbitrary-value syntax:

```tsx
// Works in both .astro files and React islands
<button
  className="
    bg-[var(--shop-primary)]
    text-[var(--shop-primary-foreground)]
    rounded-[var(--shop-radius)]
    hover:opacity-90
  "
>
  Add to cart
</button>

<h1 className="font-[family-name:var(--shop-font-heading)] text-4xl">
  {product.title}
</h1>
```

Use a fallback when a variable might not be set (seller hasn't customised their theme):

```css
background-color: var(--shop-primary, #6f4e37);
```

---

## Step 4 — Preset themes

Offer 4–6 preset themes the seller can apply with one click. Each preset is a complete `ShopThemeConfig` object:

```typescript
// app/src/lib/shop-theme-presets.ts
export const THEME_PRESETS: Record<string, { label: string; config: ShopThemeConfig }> = {
  earthy: {
    label: 'Earthy',
    config: {
      primary: '#6f4e37',
      primary_foreground: '#ffffff',
      background: '#fdf8f4',
      foreground: '#2d1f14',
      accent: '#c8956c',
      font_heading: 'merriweather',
      font_body: 'inter',
      border_radius: 'soft',
    },
  },
  minimal: {
    label: 'Minimal',
    config: {
      primary: '#111111',
      primary_foreground: '#ffffff',
      background: '#ffffff',
      foreground: '#111111',
      font_heading: 'space-grotesk',
      font_body: 'inter',
      border_radius: 'sharp',
    },
  },
  warm: {
    label: 'Warm',
    config: {
      primary: '#e07a5f',
      primary_foreground: '#ffffff',
      background: '#fffbf7',
      foreground: '#3d2b1f',
      accent: '#f2cc8f',
      font_heading: 'playfair',
      font_body: 'lora',
      border_radius: 'soft',
    },
  },
};
```

---

## Step 5 — AI theme generation

The `generate-shop-theme` Edge Function accepts a text prompt and optional reference images, calls `gpt-4o-mini` with a structured-output prompt, and returns a `ShopThemeConfig`.

```typescript
// Usage from the Studio theme editor
async function generateTheme(prompt: string) {
  const { data } = await supabase.functions.invoke('generate-shop-theme', {
    body: { prompt }
  });

  if (data.success) {
    // Merge the AI output into the form (don't overwrite the whole config)
    setThemeConfig((prev) => ({ ...prev, ...data.theme_config }));
  }
}
```

The AI output is treated as a **suggestion** that the editor merges into current state — the seller can then tweak individual fields before saving.

---

## Studio theme editor pattern

```
┌──────────────────────────────────────────────────┐
│  Theme Editor                                     │
│                                                  │
│  [Color pickers] [Font selectors] [Radius]        │
│  [Generate from prompt ▶]  [Preset buttons]       │
│                                                  │
│  [Save]  [Discard]                               │
└──────────────────────────────────────────────────┘
          ↕ live preview (iframe)
┌──────────────────────────────────────────────────┐
│  /studio/shop/preview?theme=<base64>              │
│  (Astro page that reads theme from URL param)     │
└──────────────────────────────────────────────────┘
```

The preview page is a lightweight Astro page at `/studio/shop/preview` that reads `?theme=<base64-JSON>` from the URL, calls `buildShopCssVars`, and renders a sample shop layout. The theme editor keeps the iframe `src` in sync with the form state via a debounced URL update.
