# DESIGN_SYSTEM.md — Gavel Drive
> Agent instruction: Read this file before touching any UI file.
> Apply every rule here as a hard constraint, not a suggestion.

---

## Stack context
React 18 + Vite, Tailwind CSS v3, component files in `/src/components/`.
Extend `tailwind.config.js` with the tokens below. Never use arbitrary
Tailwind values ([#xxx]) for colors, radii, or shadows — use the named
tokens only.

---

## 1. Color tokens

```js
colors: {
  gd: {
    // Page & surfaces
    bg:         '#F0EFE9', // warm off-white page background
    card:       '#0D0F1A', // dark auction card
    sidebar:    '#FFFFFF',
    surface:    '#F7F7F4', // elevated panels, modals

    // Text
    ink:        '#111111', // primary text
    muted:      '#6B6B6B', // secondary / metadata
    ghost:      '#9A9A9A', // placeholders, disabled
    inverse:    '#FFFFFF', // text on dark backgrounds

    // Border & dividers
    line:       '#E5E5E5',
    lineDark:   '#2A2E3F', // dividers inside dark cards

    // Primary action
    cta:        '#0D0F1A',
    ctaHover:   '#2A2E3F',

    // Status badges
    reserveMet: '#1A7A4A', // green — reserve price met
    noReserve:  '#1A3A6A', // navy — no reserve
    endingSoon: '#7A4A0A', // amber-brown bg
    endingText: '#F5A623', // amber text on endingSoon badge
    newListing: '#2A1A6A', // purple — newly listed

    // Semantic
    success:    '#1A7A4A',
    warning:    '#F5A623',
    error:      '#C0392B',
  }
}
```

---

## 2. Typography

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
fontSize: {
  eyebrow: ['10px', { lineHeight: '1.4', letterSpacing: '0.15em' }],
  label:   ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
  xs:      ['12px', { lineHeight: '1.5' }],
  sm:      ['13px', { lineHeight: '1.5' }],
  base:    ['15px', { lineHeight: '1.6' }],
  lg:      ['18px', { lineHeight: '1.4' }],
  xl:      ['22px', { lineHeight: '1.3' }],
  '2xl':   ['28px', { lineHeight: '1.2' }],
  '3xl':   ['36px', { lineHeight: '1.1' }],
},
fontWeight: {
  normal: 400,
  medium: 500,
  semi:   600,
  bold:   700,
},
```

**Rules:**
- Eyebrow labels (section tags, meta categories): `text-eyebrow font-medium text-gd-muted uppercase tracking-widest` — use sparingly, max one per section
- Page headings: `text-3xl font-bold text-gd-ink`
- Card headings: `text-base font-semi text-gd-ink` (light bg) or `text-base font-semi text-gd-inverse` (dark card)
- Spec lines (color • transmission • drive): `text-label font-medium text-gd-muted uppercase` — separate items with ` · ` (spaced middle dot)
- Price / bid amounts: `text-lg font-bold text-gd-ink`
- "Current Bid" / field labels: `text-eyebrow text-gd-ghost uppercase`

---

## 3. Border radius

```js
borderRadius: {
  none: '0',
  sm:   '4px',
  DEFAULT: '6px',
  md:   '8px',   // ← maximum for cards, inputs, modals
  pill: '999px', // badges, chips, toggle pills only
}
```

**Rule:** Nothing in this app uses a border-radius larger than `8px` except pill-shaped badges and filter chips. No `rounded-xl`, `rounded-2xl`, `rounded-3xl`, or `rounded-full` on containers.

---

## 4. Shadows

```js
boxShadow: {
  none:  'none',
  card:  '0 1px 3px rgba(0,0,0,0.06)',  // very subtle, light-bg cards only
  modal: '0 8px 32px rgba(0,0,0,0.18)',
  dropdown: '0 4px 12px rgba(0,0,0,0.12)',
}
```

**Rule:** Dark auction cards (`gd-card` background) get **no shadow**. Shadow is only used on light-surface elements (sidebar, modals, dropdowns). Never use `shadow-lg`, `shadow-xl`, or `shadow-2xl`.

---

## 5. Component patterns

### Auction vehicle card (VehicleCard)
