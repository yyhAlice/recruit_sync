---
name: RecruitSync Kinetic
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#535f73'
  on-secondary: '#ffffff'
  secondary-container: '#d4e0f8'
  on-secondary-container: '#576377'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d7e3fb'
  secondary-fixed-dim: '#bbc7de'
  on-secondary-fixed: '#101c2d'
  on-secondary-fixed-variant: '#3b475b'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  success-green: '#36B37E'
  warning-amber: '#FFAB00'
  danger-red: '#FF5630'
  client-purple: '#6554C0'
  text-main: '#172B4D'
  text-subtle: '#505F79'
  border-low: '#DFE1E6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-page:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-main:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-page: 24px
  row-height-dense: 32px
  row-height-standard: 44px
---

## Brand & Style

The brand identity is built on the concept of **Operational Clarity**. As a recruitment CRM for international agencies in Japan, the design system must balance high-density data management with a trustworthy, "deliberately boring" professional aesthetic. It is a productivity tool, not a marketing site; it prioritizes utility, speed of recognition, and rhythmic workflows over decorative flair.

The chosen style is **Corporate / Modern** with a focus on **High-Density Information Architecture**. It utilizes a clean, systematic layout inspired by developer tools and enterprise dashboards. The visual language conveys reliability and precision, using a "Flat-Plus" approach where depth is only used to indicate active focus or temporary overlays.

**Key Brand Pillars:**
- **Efficient & Direct:** No unnecessary animations or whitespace; every pixel should serve a functional purpose.
- **Trustworthy:** A stable, blue-anchored palette that feels institutional and secure.
- **Relational:** Visual cues that highlight the connections between Candidates, Jobs, and Clients.
- **Urgency-Driven:** Using the "Status Dot" as the primary heartbeat of the UI to drive recruiter action.

## Colors

The palette is anchored in a neutral, light-gray base to reduce cognitive load during long sessions. 

- **Primary Blue:** Used for primary actions, active navigation states, and highlighting key links.
- **Semantic Logic:** The status colors (Green, Amber, Red) are strictly reserved for "warmth" and urgency. **Red** is specifically tied to time-sensitivity (Overdue > 14 days) and should not be used for generic "delete" buttons to avoid diluting its meaning.
- **Categorical Purple:** Reserved exclusively for "Client" entity badges to provide a quick visual anchor when scanning multi-entity lists.
- **Neutral Scale:** Use `neutral_color_hex` for page backgrounds and `border-low` for table rows and card dividers. Text should use `text-main` for maximum legibility against the white surface.

## Typography

This system uses **Inter** for all UI elements to ensure high legibility at small sizes, which is critical for the Japanese market's data-dense requirements.

**Usage Guidelines:**
- **13px Body:** This is the workhorse size for all table data, form inputs, and descriptions.
- **15px Headers:** Used for page titles and section headers within cards.
- **11px Labels:** Reserved for metadata, timestamps, and the text inside pill-shaped badges. These should often be set in `text-subtle`.
- **Japanese/Myanmar Support:** Ensure the CSS stack falls back to standard system fonts for non-Latin characters while maintaining the Inter sizing and line-heights.
- **Visual Weight:** Use font-weight (600) rather than size increases to differentiate importance within high-density rows.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict vertical rhythm based on a **4px base unit**.

**Structural Rules:**
- **The Dashboard:** 12-column grid. Components should span 3, 4, 6, or 12 columns.
- **Kanban Board:** A 6-column horizontal scroll layout. Each column has a fixed width of 280px to ensure card readability.
- **Information Density:** Tables use a `row-height-dense` (32px) for list views to maximize visible data.
- **Dual-Pane View:** For CV parsing, use a 50/50 split layout. The left pane contains the original document (PDF viewer), and the right pane contains the editable form fields.

**Breakpoints:**
- **Desktop (1280px+):** Full 12-column visibility. Sidebar is expanded.
- **Tablet (768px - 1279px):** Sidebar collapses to icons-only. Kanban columns become swipeable.
- **Mobile:** Not supported in v1; use responsive wrapping for basic data entry only.

## Elevation & Depth

This design system uses a **Tonal Layering** approach to maintain a flat, fast-feeling UI. 

- **Level 0 (Background):** `neutral_color_hex` (#F4F5F7). The canvas for the application.
- **Level 1 (Surface):** White (#FFFFFF) cards and containers. Use a 1px `border-low` outline rather than shadows for a cleaner, more technical look.
- **Level 2 (Active/Drag):** When dragging Kanban cards, apply a 15% opacity shadow with a 4px blur (color: `text-main`) to indicate elevation. 
- **Overlays:** Modals and human-review forms use a 40% `text-main` backdrop blur to focus the recruiter's attention on the task at hand.

## Shapes

The shape language is **Soft (0.25rem)** to maintain a professional, structured appearance without feeling aggressive.

- **Standard Elements:** Form inputs, cards, and buttons use 4px (0.25rem) corners.
- **Badges/Chips:** These are the only elements that use a **Pill-shaped (Full)** radius. They are used for status, stages, and categories.
- **Status Dot:** A strict 9px circular shape. No rounding variation—always a perfect circle.
- **Dashed Borders:** Used specifically for "File Drop Zones" and "Empty Kanban Stages" to indicate an invitation to interact.

## Components

### The Status Dot (Signature Component)
The core engine of the UI. A 9px filled circle.
- **Green:** Last contact < 7 days.
- **Amber:** Last contact 7–14 days.
- **Red:** Last contact > 14 days OR overdue reminder.
- **Placement:** Always precedes the Candidate Name or Job Title in lists and cards.

### Buttons
- **Primary:** Solid `primary_color_hex` with white text.
- **Secondary:** Transparent background with `primary_color_hex` border and text.
- **Ghost:** No border, `text-subtle`. Used for secondary actions like "Cancel" or "View More."

### Pipeline Cards (Kanban)
- **Background:** White surface. 
- **Header:** Candidate Name (Bold), Status Dot (Top Left).
- **Body:** Last activity log snippet (11px text), Next action date.
- **Footer:** Entity badges (e.g., "N1 Japanese").
- **Finality State:** "Placed" or "Rejected" cards should be reduced to 60% opacity to recede visually.

### Tables (TanStack Table)
- **Header:** Light gray background, 11px uppercase bold labels.
- **Borders:** 1px horizontal-only separators (`border-low`).
- **Interactive:** Entire row highlight on hover using a 5% opacity of the primary blue.

### Inputs & Forms
- **Structure:** Vertical labels (11px Bold) for high-density forms.
- **Required Fields:** Indicated by a 2px blue left-border on the input field rather than an asterisk.
- **Status Badges:** Text inside badges should use the 800-stop (darker version) of the badge background color for contrast.