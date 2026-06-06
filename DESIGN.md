# DESIGN.md – UI/UX & Design System

## Overview

This document defines the design principles, component library, visual identity, and interaction patterns for the Howard Endocrinology Fellowship App. All UI work must align with these guidelines to ensure consistency, accessibility, and mobile-first usability.

---

## Design Principles

### 1. **Mobile-First**
- Design for 320px screens first; scale up to larger breakpoints
- Touch targets minimum 44×44px for buttons and interactive elements
- Avoid hover-only interactions; all features must be accessible via tap
- Optimize for portrait orientation as primary use case (fellows on the go)

### 2. **Rapid Data Entry**
- Minimize form fields per screen
- Use smart defaults and auto-fill where possible
- Provide visual feedback immediately on input
- Support one-handed operation on phones

### 3. **Clinician-Friendly**
- Use medical terminology consistently (procedure names, competency terms)
- Provide contextual help inline (not separate modals when avoidable)
- Show relevant data at a glance (dashboard aggregates)
- Support quick lookups (procedure history, competency status)

### 4. **Accessible & Inclusive**
- WCAG 2.1 AA compliance minimum
- Color is never the only indicator (use icons, text labels)
- Sufficient contrast ratios (4.5:1 for text, 3:1 for graphics)
- Screen reader friendly (semantic HTML, ARIA labels)
- Support keyboard navigation throughout

### 5. **Trust & Compliance**
- Transparent about data handling (who sees what, when)
- Clear error messages (never generic "something went wrong")
- Audit trail awareness (note that evaluations are recorded)
- HIPAA-appropriate messaging around PII storage

---

## Visual Identity

### Color Palette

#### Primary Colors
| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| **Howard Blue** | `#0066CC` | Buttons, links, primary CTAs | `blue-600` |
| **Success Green** | `#22C55E` | Confirmations, completed items | `green-500` |
| **Warning Orange** | `#F97316` | Alerts, incomplete items | `orange-500` |
| **Error Red** | `#EF4444` | Destructive actions, errors | `red-500` |
| **Neutral Gray** | `#6B7280` | Text, secondary elements | `gray-500` |

#### Accessibility Considerations
- Never use red/green alone to indicate status → pair with icons
- Minimum contrast: text on background must be 4.5:1
- Test color combinations for colorblind accessibility (Deuteranopia, Protanopia)

### Typography

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| **Page Title** | System Stack | 28px | 700 (bold) | H1 headings |
| **Section Title** | System Stack | 20px | 700 (bold) | H2 headings |
| **Subsection** | System Stack | 16px | 600 (semibold) | H3, form labels |
| **Body Text** | System Stack | 14px–16px | 400 (regular) | Paragraphs, descriptions |
| **Small Text** | System Stack | 12px | 400 (regular) | Hints, secondary info |
| **Monospace** | `Courier New`, monospace | 12px–14px | 400 | Code, procedure IDs |

**Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`

### Spacing & Layout

Use Tailwind's spacing scale consistently:

| Scale | Pixels | Usage |
|-------|--------|-------|
| `p-2` / `m-2` | 8px | Tight spacing within components |
| `p-3` / `m-3` | 12px | Default spacing |
| `p-4` / `m-4` | 16px | Section padding, card margins |
| `p-6` / `m-6` | 24px | Large section spacing |
| `p-8` / `m-8` | 32px | Page-level margins |

**Responsive Margins:**
- Mobile (default): `px-4 py-4`
- Tablet (`md:`): `px-6 py-6`
- Desktop (`lg:`): `px-8 py-8`

### Breakpoints

Follow Tailwind's default breakpoints:

| Breakpoint | Width | Device | Usage |
|-----------|-------|--------|-------|
| `sm:` | 640px | Tablet (portrait) | Adjust grid to 2 columns |
| `md:` | 768px | Tablet (landscape) | Expand layouts |
| `lg:` | 1024px | Desktop | Full-width dashboards |
| `xl:` | 1280px | Large desktop | Additional refinements |

---

## Component Library

### Buttons

#### Primary Button
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
  Action
</button>
```
**Usage:** Primary CTAs (submit, save, confirm)

#### Secondary Button
```tsx
<button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md font-semibold hover:bg-gray-300 active:bg-gray-400 transition-colors">
  Cancel
</button>
```
**Usage:** Secondary actions, cancel/back

#### Destructive Button
```tsx
<button className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 active:bg-red-700 transition-colors">
  Delete
</button>
```
**Usage:** Irreversible actions (delete procedure, remove evaluation)

#### Icon Button
```tsx
<button className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors">
  <IconComponent size={24} />
</button>
```
**Usage:** Menu toggles, filters, quick actions
**Minimum size:** 44×44px (ensure with padding)

### Forms

#### Text Input
```tsx
<input
  type="text"
  placeholder="Placeholder text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```
**Mobile:** Full-width on small screens, constrain on larger

#### Textarea
```tsx
<textarea
  placeholder="Enter notes..."
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
  rows={4}
/>
```
**Usage:** Procedure notes, evaluation comments

#### Select / Dropdown
```tsx
<select className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option>Choose one...</option>
  <option>Option 1</option>
</select>
```
**Mobile:** Consider native select for better UX on phones

#### Checkbox
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500" />
  <span className="text-sm">Checkbox label</span>
</label>
```
**Minimum size:** 44×44px (with padding)

#### Radio Button
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="radio" name="group" className="w-4 h-4 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500" />
  <span className="text-sm">Radio option</span>
</label>
```
**Mobile:** Large tap targets with clear labels

#### Date Picker
```tsx
<input
  type="date"
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```
**Note:** Native date pickers on mobile provide better UX

### Cards

#### Procedure Log Card
```tsx
<div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
  <div className="flex justify-between items-start mb-2">
    <h3 className="font-semibold text-lg">Thyroid FNA</h3>
    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
      Completed
    </span>
  </div>
  <p className="text-sm text-gray-600 mb-3">June 5, 2026 • Dr. Smith</p>
  <p className="text-sm text-gray-700">Clinical outcome noted</p>
</div>
```

#### Evaluation Card
```tsx
<div className="p-4 border-l-4 border-l-blue-600 bg-blue-50 rounded">
  <h3 className="font-semibold text-base mb-1">Communication</h3>
  <p className="text-sm text-gray-700 mb-3">Proficiency: Advanced</p>
  <p className="text-xs text-gray-600">From: Dr. Johnson • June 2026</p>
</div>
```

#### Status Badge
```tsx
<div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  <span className="w-2 h-2 rounded-full bg-green-600"></span>
  On Track
</div>
```

**Status Variants:**
- ✅ **On Track:** `bg-green-100 text-green-800`
- ⚠️ **At Risk:** `bg-orange-100 text-orange-800`
- ❌ **Behind:** `bg-red-100 text-red-800`
- ⏳ **Pending:** `bg-gray-100 text-gray-800`

### Modals & Alerts

#### Success Alert
```tsx
<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
  <h4 className="font-semibold text-green-900 mb-1">Success</h4>
  <p className="text-sm text-green-700">Procedure logged successfully.</p>
</div>
```

#### Error Alert
```tsx
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <h4 className="font-semibold text-red-900 mb-1">Error</h4>
  <p className="text-sm text-red-700">Failed to save. Please try again.</p>
</div>
```

#### Warning Alert
```tsx
<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
  <h4 className="font-semibold text-orange-900 mb-1">Warning</h4>
  <p className="text-sm text-orange-700">You're approaching the minimum procedure count.</p>
</div>
```

#### Confirmation Modal
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg p-6 max-w-sm w-full">
    <h2 className="text-lg font-semibold mb-4">Delete this procedure?</h2>
    <p className="text-gray-600 mb-6">This action cannot be undone.</p>
    <div className="flex gap-3 justify-end">
      <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
        Cancel
      </button>
      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
        Delete
      </button>
    </div>
  </div>
</div>
```

### Navigation

#### Mobile Bottom Navigation
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around">
  <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:bg-blue-50">
    <IconHome size={24} />
    <span className="text-xs font-medium">Home</span>
  </button>
  {/* Additional nav items */}
</nav>
```

#### Breadcrumb Navigation
```tsx
<nav className="flex items-center gap-2 text-sm mb-4">
  <a href="/" className="text-blue-600 hover:underline">Home</a>
  <span className="text-gray-400">/</span>
  <a href="/procedures" className="text-blue-600 hover:underline">Procedures</a>
  <span className="text-gray-400">/</span>
  <span className="text-gray-600">New Entry</span>
</nav>
```

### Tables (Mobile-Optimized)

#### Stacked Card Layout (Mobile)
```tsx
<div className="grid grid-cols-1 gap-4">
  {items.map((item) => (
    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">{item.name}</span>
        <span className="text-sm text-gray-600">{item.date}</span>
      </div>
      <div className="text-sm text-gray-700">{item.details}</div>
    </div>
  ))}
</div>
```

#### Scrollable Table (Larger Screens)
```tsx
<div className="hidden md:block overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-4 py-2 text-left font-semibold">Procedure</th>
        <th className="px-4 py-2 text-left font-semibold">Date</th>
        <th className="px-4 py-2 text-left font-semibold">Status</th>
      </tr>
    </thead>
    <tbody>
      {/* Rows */}
    </tbody>
  </table>
</div>
```

---

## Interaction Patterns

### Loading States
- **Skeleton screens** for initial data load (show content shape)
- **Spinners** for in-progress actions (minimal, 24px icon)
- **Disabled buttons** with loading spinner for form submissions

### Error Handling
- **Inline validation:** Show errors below fields in real-time
- **Alert toasts:** Temporary dismissible notifications (top of screen)
- **Error summary:** List all form errors above the form on submission

### Feedback & Confirmation
- **Immediate visual feedback** on button tap (scale, color change)
- **Toast notifications** for successful operations (3-second auto-dismiss)
- **Modal confirmation** for destructive actions (delete, clear data)
- **Disabled state** for operations in progress

### Empty States
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconEmpty size={48} className="text-gray-400 mb-4" />
  <h3 className="font-semibold text-gray-900 mb-2">No procedures logged yet</h3>
  <p className="text-sm text-gray-600 mb-4">Start logging procedures to track your progress.</p>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
    Log First Procedure
  </button>
</div>
```

---

## Accessibility Guidelines

### Semantic HTML
- Always use semantic elements: `<button>`, `<a>`, `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`
- Avoid `<div>` for interactive content; use proper button/link elements
- Use `<label>` for all form inputs (not just placeholder text)

### ARIA Attributes
```tsx
// Button with loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Expandable section
<button aria-expanded={isOpen} aria-controls="panel-id">
  Show Details
</button>
<div id="panel-id" hidden={!isOpen}>
  Details content
</div>

// Screen reader only text
<span className="sr-only">Loading...</span>
```

### Color & Contrast
- Text on background: minimum 4.5:1 contrast
- Large text (18px+): minimum 3:1 contrast
- UI components: minimum 3:1 contrast
- Test with WebAIM Contrast Checker or similar tools

### Keyboard Navigation
- All interactive elements must be reachable via Tab key
- Focus order must be logical (left-to-right, top-to-bottom)
- Use visible focus indicators (`:focus-visible` in Tailwind: `focus:outline-2`)
- Provide escape key to close modals

### Screen Reader Testing
- Test with NVDA (Windows) or VoiceOver (Mac)
- Verify form labels, headings, and navigation announce correctly
- Check that button purposes are clear without visual context
- Ensure data tables have proper header associations

---

## Responsive Design Strategy

### Mobile First (320px+)
- Single column layout
- Full-width forms and buttons
- Minimal margin/padding
- Bottom sheet modals
- Native date/select inputs

### Tablet (`sm:` / 640px+)
- Shift to 2-column grids where appropriate
- Increase spacing and font sizes
- Hero images can appear
- Sticky headers on long lists

### Desktop (`md:` / 768px+)
- 3-column layouts for complex dashboards
- Side navigation instead of bottom nav
- Multi-panel views (list + detail)
- Popovers instead of modals where appropriate

---

## Dark Mode (Future Consideration)

If dark mode support is added:

```tsx
// Use Tailwind's dark: prefix
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

**Considerations:**
- Ensure sufficient contrast in dark mode too
- Test all colors against dark backgrounds
- Provide user preference toggle in settings

---

## Performance & Best Practices

### Image Optimization
- Use Next.js `<Image>` component for automatic optimization
- Lazy load images below the fold
- Provide appropriate `alt` text for all images
- Use WebP format with fallbacks

### Animation Guidelines
- Keep animations under 300ms for UI feedback
- Reduce Motion: respect `prefers-reduced-motion` media query
- Avoid animation on every interaction; use sparingly for emphasis

```tsx
// Respect prefers-reduced-motion
<div className="transition-colors duration-300 motion-safe:transition-transform motion-reduce:transition-none">
  Animated content
</div>
```

### CSS & Bundle Size
- Use Tailwind's JIT mode (already configured)
- Purge unused styles in production
- Avoid adding custom CSS when Tailwind utilities exist
- Review bundle size regularly with `next/bundle-analyzer`

---

## Design Tokens (for Future Expansion)

When the design system matures, consider extracting tokens:

```json
{
  "colors": {
    "primary": "#0066CC",
    "success": "#22C55E",
    "warning": "#F97316",
    "error": "#EF4444"
  },
  "spacing": {
    "xs": "8px",
    "sm": "12px",
    "md": "16px",
    "lg": "24px"
  },
  "typography": {
    "body": { "fontSize": "16px", "lineHeight": "1.5" }
  }
}
```

---

## Resources

- **Tailwind CSS:** https://tailwindcss.com
- **Web Accessibility (WCAG 2.1):** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design Mobile UX:** https://material.io/design/platform-guidance/android-bars.html
- **Accessible Rich Internet Applications (ARIA):** https://www.w3.org/WAI/ARIA/apg/
- **Next.js Image Optimization:** https://nextjs.org/docs/api-reference/next/image

---

## Questions Before Design Work

1. **Mobile first?** Does the design work on 320px phones in portrait?
2. **Accessible?** Have we tested with keyboard nav and a screen reader?
3. **Clinician-friendly?** Would a busy fellow understand this in 2 seconds?
4. **Consistent?** Does it follow established component patterns from this guide?
5. **Performance?** Are we adding unnecessary images, animations, or complexity?
