# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Calm, modern travel planner: warm off-white canvas, generous whitespace, one deep-teal accent, restrained Linear/Stripe-style typography, single subtly-tinted category palette for the bar chart.

## Colors

- `--color-bg`: **#FAFAF8**
- `--color-surface`: **#FFFFFF**
- `--color-surface-alt`: **#F4F4F1**
- `--color-fg`: **#1B2430**
- `--color-fg-soft`: **#41505F**
- `--color-muted`: **#6B7280**
- `--color-border`: **#E4E4E7**
- `--color-border-strong`: **#D4D4D8**
- `--color-accent`: **#0F766E**
- `--color-accent-hover`: **#0C5F59**
- `--color-accent-active`: **#0A4E49**
- `--color-accent-soft`: **#E6F2F0**
- `--color-accent-contrast`: **#FFFFFF**
- `--color-focus-ring`: **#14B8A6**
- `--color-danger`: **#B42318**
- `--color-danger-hover`: **#932014**
- `--color-danger-soft`: **#FEF3F2**
- `--color-success`: **#067647**
- `--color-success-soft`: **#ECFDF3**
- `--color-cat-travel`: **#0F766E**
- `--color-cat-accommodation`: **#2563EB**
- `--color-cat-food`: **#B45309**
- `--color-cat-activity`: **#7C3AED**
- `--color-cat-shopping`: **#BE185D**
- `--color-cat-other`: **#475569**
- `--color-overlay`: **rgba(27, 36, 48, 0.45)**
- `--color-shadow-card`: **0 1px 2px rgba(27,36,48,0.04), 0 1px 3px rgba(27,36,48,0.06)**

## Typography

- `font_family`: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `font_mono`: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace
- `heading_weight`: 600
- `body_weight`: 400
- `size_display`: 32px
- `size_h1`: 24px
- `size_h2`: 19px
- `size_h3`: 16px
- `size_body`: 15px
- `size_small`: 13px
- `size_caption`: 12px
- `line_height_tight`: 1.25
- `line_height_body`: 1.55
- `letter_spacing_heading`: -0.01em

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 16px
- `--space-3`: 24px
- `--space-4`: 32px
- `--space-5`: 48px
- `--space-6`: 64px

## Border-Radii

- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Base: font-weight 600, font-size 15px, padding 0 20px, min-height 44px (touch target), radius md (10px), gap 8px to icon, transition 120ms ease-out on background/box-shadow/transform, cursor pointer, no text-decoration. PRIMARY: bg=accent #0F766E, fg=accent-contrast #FFFFFF, border 1px solid transparent. hover: bg=accent-hover #0C5F59. active: bg=accent-active #0A4E49, transform translateY(1px). disabled: bg=#E4E4E7, fg=#9CA3AF, cursor not-allowed, opacity 1 (never faked with opacity alone), aria-disabled='true', no hover change. FOCUS-VISIBLE (all variants): 2px solid focus-ring #14B8A6, outline-offset 2px. SECONDARY: bg=surface, fg=fg #1B2430, border 1px solid border-strong #D4D4D8; hover bg=surface-alt #F4F4F1; active bg=#EAEAE6. GHOST/TEXT: bg transparent, fg=accent, no border, padding 0 12px; hover bg=accent-soft #E6F2F0. DANGER: bg=surface, fg=danger #B42318, border 1px solid #F0C7C3; hover bg=danger-soft #FEF3F2. DANGER-SOLID (in confirm dialog): bg=danger, fg #FFFFFF; hover bg=danger-hover #932014. SIZES: default 44px; compact 36px (used only inside table rows, still with 8px surrounding hit area); full-width modifier stretches to container on viewports <640px. Every button has a visible text label; icon-only is not used in this product.

### Input / DateInput / TimeInput / NumberInput

Label above field: font-size 13px, weight 500, color fg-soft #41505F, margin-bottom 4px, bound via htmlFor/id. Field: width 100%, min-height 44px, padding 10px 12px, font-size 15px, color fg, bg surface, border 1px solid border-strong #D4D4D8, radius md, transition 120ms. focus: border-color accent #0F766E + box-shadow 0 0 0 3px accent-soft #E6F2F0, no outline change. disabled: bg surface-alt, fg muted, cursor not-allowed. INVALID (only after field touched or submit attempted): border-color danger #B42318, box-shadow 0 0 0 3px danger-soft, aria-invalid='true', aria-describedby pointing at error id. ERROR TEXT: 13px, color danger, margin-top 4px, sits directly under its own field, prefixed with a small warning glyph; error clears as soon as the value becomes valid. NumberInput (cost): inputmode='decimal', min 0, step 1, no currency symbol inside the field. Placeholder is allowed as a hint but is never the only label.

### Form row / Fieldset

Vertical stack, gap 16px between fields, 24px before the submit row. Two columns (grid-template-columns: 1fr 1fr) from 640px up for start/end date and time/cost pairs, single column below. Submit row: primary button left, secondary/cancel right, gap 8px, wraps to full-width buttons under 480px.

### App header / Navigation

Sticky top, height 56px, bg rgba(250,250,248,0.85) with backdrop-filter blur(8px), border-bottom 1px solid border #E4E4E7, z-index 10. Inner container uses the same 960px max-width as the page. Left: wordmark 'Reiseplaner' 16px weight 600, color fg, links to '/'. Right: inline nav links 15px, color fg-soft, padding 8px 12px, radius sm; current route (NavLink isActive) = color accent + weight 600 + 2px accent underline via inset box-shadow; hover = color fg on accent-soft pill. All links keyboard-reachable with the shared focus-visible ring. At 360px: wordmark shrinks to 15px and the nav stays on one row (max 3 short links, never a hamburger).

### Page shell

max-width 960px, margin 0 auto, horizontal padding 16px (mobile) / 24px (>=640px) / 32px (>=1024px), vertical padding 32px top / 64px bottom. Every page starts with a PageHeader: h1 24px weight 600 line-height tight, optional breadcrumb/back link above it (14px, color accent, '← Alle Reisen'), optional primary action aligned right on >=640px and full-width below the title on mobile.

### Card / Surface

bg surface #FFFFFF, border 1px solid border #E4E4E7, radius lg 16px, padding 16px (mobile) / 24px (>=640px), box-shadow shadow-card. Cards are the only container for trip entries, day sections and budget blocks; never nest cards inside cards — use section dividers (1px border, 24px vertical spacing) instead. Hover (only when the whole card is a link): border-color border-strong + shadow 0 2px 6px rgba(27,36,48,0.08), transition 150ms; the card keeps a visible focus ring when focused.

### Trip list item

A card whose title is a real <Link> to '/trips/:tripId' (covers the card via ::after for a large hit area, min 64px tall). Content: trip name 19px weight 600, then one meta row 13px color muted with destination (with a small location glyph) and period. Actions on the right: 'Umbenennen' (ghost) and 'Löschen' (danger), stacked vertically under 640px. INLINE RENAME: title swaps for a text input (44px) plus 'Speichern' (primary, compact) and 'Abbrechen' (secondary); Enter saves, Escape cancels; empty name shows the same field-local error as the create form.

### Empty state

Centered inside a card, padding 48px 24px, max-width 420px, text-align center. Icon 40px in accent-soft circle, heading 19px weight 600, one sentence 15px color muted, one primary button ('Reise anlegen'). Used on '/', on the day plan of a trip with no activities, on an empty budget and on an empty packing list — always with a specific sentence per page, never a generic 'Keine Daten'.

### Confirm dialog (delete trip / delete activity / delete packing item)

Modal overlay color rgba(27,36,48,0.45), dialog bg surface radius lg 16px, padding 24px, max-width 420px, centered, shadow 0 10px 30px rgba(27,36,48,0.18). Title 19px weight 600, body 15px naming the exact trip/item and stating that activities, budget data and the packing list are deleted with it. Buttons right-aligned: 'Abbrechen' (secondary) and 'Löschen' (danger-solid), 8px gap, full-width stacked under 480px. Focus moves into the dialog and returns to the trigger; Escape and overlay click cancel.

### Day section (Tagesplan)

Card per date of the trip period, stacked with 16px gap. Header row: weekday as h2 16px weight 600 (e.g. 'Montag'), date next to it 13px color muted ('14.04.2025'), right-aligned 'Aktivität hinzufügen' (ghost button). Body: activity list, sorted ascending by time; empty day shows the inline empty state variant 'Noch keine Aktivitäten für diesen Tag'. Mobile: header stacks (weekday/date on one line, action button below, full-width).

### Activity row

Grid: time | title/location | cost | actions. Time 13px weight 600 color accent, fixed 56px column (monospace-feel alignment, 'HH:MM'); title 15px weight 500 fg with location 13px muted beneath it; category as a badge next to the title: pill radius, 12px, padding 2px 8px, bg = 12% tint of its category color, text = the category color at full strength. Cost right-aligned, 13px, weight 500, formatted '1.234,50' (de-DE, 2 decimals, no currency symbol). Actions: 'Bearbeiten' (ghost, compact) and 'Löschen' (danger, compact). Row padding 12px 0 with a 1px border-top divider between rows; min height 56px. Under 640px the cost moves under the title and the actions sit on their own full-width row.

### Activity edit form

Same field specs as Input; fields: Bezeichnung, Uhrzeit (time), Ort, Kosten (number >= 0), Kategorie (select). Appears inline in place of the row (or as a card directly under it) and never as a separate page. Errors are field-local and only appear after touch/submit; cost < 0 messages 'Kosten dürfen nicht negativ sein.'.

### Select (Kategorie)

Native <select> styled like Input: 44px, 15px, border-strong, radius md, custom chevron via background-image, padding-right 36px. Options in fixed order and fixed German labels: 'Anreise', 'Unterkunft', 'Essen', 'Aktivität', 'Shopping', 'Sonstiges'. The same six labels and the same order are used in the activity form, the activity badges and the budget chart — no synonyms anywhere.

### Budget summary block

Card: 'Gesamtsumme' as label 13px muted with the total below it, 32px weight 600 fg (the largest number on the page), tabular-nums. Under it a 1px divider and the per-category rows: category label 15px weight 500 left, amount 15px weight 600 tabular-nums right. Zero state: every amount '0,00' and a muted note 'Für diese Reise sind noch keine Kosten erfasst.'

### Bar chart (CSS only)

One row per category, 24px gap between rows. Row grid: 110px label column (13px, fg-soft) | flexible track | amount column (13px weight 600, tabular-nums, min-width 72px, right-aligned). Track: bg surface-alt #F4F4F1, height 12px, radius pill, overflow hidden. Bar: height 100%, radius pill, width = (categorySum / maxCategorySum) * 100%, minimum 4px when the value is > 0, background = the category's own color (cat-travel … cat-other), transition width 200ms ease-out. Amount is printed next to the bar (never only as a tooltip). Zero case: when the largest category is 0, all bars stay at 0 width and only the amounts plus the empty note are shown — no NaN, no division artefacts. Under 480px the label sits above the track and the amount moves to the end of that same line.

### Packing list

Header line with the counter 'X von Y gepackt' (15px, weight 600, tabular-nums) plus an accent-filled progress track (height 6px, radius pill) underneath. Add row: text input (44px) + 'Hinzufügen' primary button, stacks to full width under 480px; empty input error 'Bitte einen Gegenstand eingeben.' Items as a plain list with 1px dividers (no card per item): native-looking checkbox 20x20px with accent fill when checked (min 44px hit area via padding), label 15px fg; when checked the label is line-through + color muted (never color alone — strike-through plus a checkmark is the marker). Delete button (danger ghost, compact) right-aligned per row. Row min-height 48px.

### Badge / Pill

radius pill, padding 2px 8px, font-size 12px, weight 500, no border. Used for category labels on activities and for the 'X von Y gepackt' counter. Background is a light tint of the semantic color, text the full-strength color; never the only carrier of meaning (always accompanied by text).

### Inline note / Helper text

13px, color muted, margin-top 4px. Used for format hints (e.g. 'TT.MM.JJJJ' beside date fields, 'Uhrzeit HH:MM', 'Betrag in Zahlen, ohne Währung'). Not used for errors — those use the danger style and never appear before touch/submit.

### Skeleton / loading state

Not needed: hydration from localStorage is synchronous. If it ever flickers, show the page header plus a muted 'Laden …' line, no spinner animation.

## Layout Principles

- Container: max-width 960px, centered, with 16px / 24px / 32px horizontal padding at <640px / >=640px / >=1024px. No fixed-width elements, nothing wider than its container.
- Breakpoints: 480px (forms and button groups stack, full-width buttons), 640px (two-column form rows, actions move beside titles), 1024px (widest comfortable content width, no further layout change). Must be fully usable and horizontal-scroll-free from 360px up.
- Vertical rhythm: section gaps 32px, block gaps 24px, in-block gaps 16px, tight text gaps 4-8px — always multiples from the spacing scale, no ad-hoc pixel values. Blocks inside a card use 24px, page sections 32-48px.
- One card = one object (trip, day, budget block, packing list). Never nest cards; separate sections inside a card with 1px dividers and 24px padding.
- Headers: every page has exactly one h1 (24px). Day sections use h2 (16px), sub-blocks h3 (15px weight 600). Never skip a level; never style a heading by its tag alone.
- Bar chart without any library: divs and CSS only, bars proportional to the largest category, amounts always printed as text — the chart must be readable as a plain list if CSS fails.
- FORMAT CONTRACT (identical everywhere the value appears — list, detail, budget, packing): date 'TT.MM.JJJJ' (14.04.2025), weekday full German name, period 'TT.MM.JJJJ – TT.MM.JJJJ' with an en dash and one space each side, time 24h 'HH:MM' (09:30), amounts de-DE with thousands dot and comma decimals '1.234,50' and no currency symbol, counter 'X von Y gepackt', trip duration in days as '7 Tage'. Use Intl.NumberFormat('de-DE') and manual date formatting (no date library).
- Empty states are never blank: every empty list gets a specific sentence plus the action that would fill it, inside the Empty state component.
- States: default, hover, active, focus-visible, disabled and error are defined for every interactive element; disabled means muted background/border with not-allowed cursor and aria-disabled, never 'clickable but does nothing'.
- Accessibility: every control has a label or aria-label, focus order follows the visual order, focus-visible ring 2px focus-ring with 2px offset is never removed, all hit areas >= 44px, body text contrast at least 4.5:1 on bg and surface (fg #1B2430 on #FAFAF8 / #FFFFFF, accent #0F766E on #FFFFFF).
- Motion: 120-200ms ease-out on background, border, box-shadow and bar width only. No entrance animations, no parallax — the app should feel calm and instant.
- CSS structure: hand-written CSS in a small number of files (base/tokens, layout, components), all values from :root custom properties named --color-*, --space-*, --radius-*, --font-*; no utility framework, no inline styles beyond one-off width/height percentages for the chart bars.
