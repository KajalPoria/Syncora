# Syncora - AI Operation Command Centre Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach (Material Design 3 + Custom Elements)
**Rationale:** As a utility-focused, information-dense productivity dashboard, Syncora prioritizes efficiency and clarity while maintaining a premium aesthetic. Material Design 3 provides robust patterns for data visualization, notifications, and complex interactions, customized with the specified premium color palette.

**Design Principles:**
1. **Command Center Authority** - Interface exudes control and intelligence
2. **Information Clarity** - Dense data presented with perfect readability
3. **Intelligent Assistance** - AI features feel seamless and trustworthy
4. **Premium Professionalism** - Elevated beyond typical dashboard tools

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Default):**
- Primary Background: `30 20% 15%` (charcoal navy)
- Surface/Cards: `30 18% 25%` (lighter slate)
- Surface Elevated: `30 16% 30%` (hover states, modals)
- Gold Accent: `38 70% 65%` (buttons, highlights, priority indicators)
- Text Primary: `0 0% 95%`
- Text Secondary: `0 0% 70%`
- Borders: `30 15% 35%`
- Success: `142 71% 45%`
- Warning: `38 92% 50%`
- Error: `0 84% 60%`
- High Priority: `0 84% 60%` (urgent emails)
- Medium Priority: `38 92% 50%`
- Low Priority: `0 0% 60%`

**Light Mode:**
- Primary Background: `210 40% 98%` (off-white)
- Surface/Cards: `0 0% 100%` (white)
- Surface Elevated: `210 20% 96%`
- Gold Accent: `38 70% 50%` (slightly darker for contrast)
- Text Primary: `30 20% 15%`
- Text Secondary: `0 0% 40%`
- Borders: `210 20% 90%`
- Success/Warning/Error: Same as dark mode

**Accent Usage Rules:**
- Gold accent ONLY for: Primary CTAs, high-priority badges, active widget borders, important status indicators
- Never use gold for backgrounds or large areas
- Limit to 5-10% of visible interface elements

### B. Typography

**Font System:** Inter (primary), JetBrains Mono (code/data)

**Type Scale:**
- Display (Dashboard headers): 2.5rem / 600 / -0.02em
- H1 (Widget titles): 1.5rem / 600 / -0.01em
- H2 (Section headers): 1.25rem / 600
- H3 (Card headers): 1.125rem / 500
- Body Large (Email previews): 1rem / 400 / 0.01em
- Body (Default): 0.875rem / 400 / 0.01em
- Body Small (Metadata): 0.8125rem / 400 / 0.02em
- Caption (Timestamps): 0.75rem / 400 / 0.03em
- Button: 0.875rem / 500 / 0.01em
- Monospace (Email IDs, dates): 0.8125rem JetBrains Mono

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (icon-text): `p-2`, `gap-2`
- Component internal: `p-4`, `gap-4`
- Widget padding: `p-6`
- Section spacing: `gap-8`, `mb-8`
- Dashboard grid gaps: `gap-6`
- Page margins: `p-8` mobile, `p-12` desktop

**Grid System:**
- Dashboard: 12-column CSS Grid with `gap-6`
- Widgets occupy 3-6 columns (adjustable via drag)
- Mobile: Single column stack
- Tablet: 2-column with 6-span widgets
- Desktop: Full 12-column flexibility

### D. Component Library

**Navigation & Header:**
- Fixed top header (`h-16`) with dark glass morphism effect
- Logo (left): Clickable, returns to landing page
- Center: Dashboard view switcher (tabs)
- Right: Search, notifications bell (with badge count), theme toggle, profile avatar
- Notification panel: Slide-down 400px panel with scrollable alert list

**Widget Cards:**
- Border-radius: `rounded-xl` (12px)
- Shadow: Subtle elevation `shadow-lg` with colored glow on hover
- Header: Drag handle (⋮⋮), title, action icons (refresh, settings, minimize)
- Resize handles: Gold accent borders on active resize
- States: Default, Hover (subtle gold border), Active/Focused (gold accent border)

**Priority Inbox Widget:**
- Email list items: `h-20` minimum with clear hierarchy
- Priority badge: Pill shape, colored background (High=red, Med=amber, Low=gray)
- Email preview: Sender name (bold), subject (truncated), timestamp, 2-line preview
- Hover state: Elevated with quick actions (Archive, Summarize, Mark priority)
- Summarize button: Magic wand icon + "Summarize" text, gold accent

**Calendar Widget:**
- Week/Month view toggle
- Events: Color-coded by type, time-blocked visualization
- Meeting cards: Client name prominent, time/duration, join link button (gold)
- Today indicator: Gold accent vertical line

**Task List Widget:**
- Checkbox + task text + priority indicator + due date
- Grouping: High priority at top, visual separator
- Completed tasks: Strikethrough with subtle opacity
- Add task: Always-visible input at top with gold "+ Add" button

**AI Chatbot Panel:**
- Fixed bottom-right: Circular FAB (gold, 64px) with AI sparkle icon
- Expanded: 400px × 600px panel, rounded top corners
- Messages: User (right-aligned, light bg), AI (left-aligned, gold accent)
- Input: Fixed bottom with send button
- Suggested prompts: Pill buttons for common queries

**Authentication Pages:**
- Centered card (max-w-md) on subtle gradient background
- "Sign in with Google" primary button (gold accent, full-width)
- Divider: "or continue with email"
- Email/password fields: Outlined inputs with focus gold accent
- 2FA toggle in settings (not on initial auth flow)

**Notifications:**
- Toast: Slide from top-right, 4-second auto-dismiss
- Types: Success (green icon), Warning (amber), Error (red), Info (blue)
- High-priority email: Red accent with preview
- Meeting reminder: Gold accent with countdown timer

**Modals & Overlays:**
- Backdrop: `bg-black/40` with blur
- Modal: Center-positioned, max-w-2xl, rounded-xl, shadow-2xl
- Email summary modal: Full email metadata + AI bullet points
- Close: X icon top-right + click outside to dismiss

### E. Interactions & Animations

**Critical Rule:** Minimal animation, focused on clarity

**Approved Animations:**
- Loading screen: Neural network pulse (3 nodes connecting), 2-second loop
- Widget drag: Subtle lift (transform: translateY(-4px)) + shadow increase
- Notification toast: Slide-in from right (0.3s ease-out)
- Button clicks: Scale 0.98 (0.1s)
- Email priority badge: Gentle pulse for High priority only
- Calendar event creation: Fade-in (0.2s)

**No animations for:**
- Theme switching (instant)
- Widget resizing (direct manipulation)
- Tab changes (instant content swap)
- Email list scrolling

---

## Page-Specific Guidelines

**Landing Page:**
- Hero: Full viewport (100vh) with animated neural network background
- Headline: "Your AI Command Center for Professional Communications"
- Subheadline: Feature bullets (Gmail integration, Smart scheduling, AI assistant)
- Single CTA: "Get Started" (gold, large, routes to auth)
- No additional sections - direct focus on conversion

**Dashboard (Main App):**
- Top bar: As specified in Navigation section
- Main area: Drag-and-drop grid for widgets
- Default layout (first login): 
  - Row 1: Priority Inbox (6 cols) + Calendar (6 cols)
  - Row 2: Task List (4 cols) + Chatbot (8 cols - expanded)
- Widget state saved to user profile (database persistence)

**Email Summary Modal:**
- Header: Email subject + sender + timestamp
- AI Summary section: Labeled "AI Summary" with bullet points
- Key details extraction: Meeting time, date, location highlighted in gold
- Full email: Collapsible accordion below summary
- Actions: Archive, Mark priority, Close

**Settings Page:**
- Sidebar navigation: Account, Integrations, Notifications, Appearance, Security
- 2FA setup: QR code + manual key, authenticator app integration
- Theme toggle: Visual preview of both modes
- Connected accounts: Gmail, Calendar, Drive status indicators (green=connected)

---

## Images

**Landing Page Hero:**
- Background: Abstract neural network visualization (dark blue nodes, gold connections, subtle animation)
- Style: Minimalist, high-tech, professional
- Placement: Full-width behind headline/CTA, with dark overlay for text contrast

**Dashboard Placeholder Images:**
- None - all data is real user content
- Empty states: Icon + "No emails" / "No upcoming meetings" messages

**Profile Avatars:**
- Google profile images via OAuth
- Fallback: Initials in circle with gold background

---

## Accessibility & Responsive Design

- All gold accent elements: Minimum 4.5:1 contrast ratio
- Focus indicators: 2px gold outline on all interactive elements
- Keyboard navigation: Full support for widget focus, tab through emails
- Screen reader: ARIA labels for all icons, widget types announced
- Mobile (< 768px): Single column, widgets stack, chatbot full-screen overlay
- Tablet (768-1024px): 2-column grid, simplified widgets
- Desktop (> 1024px): Full 12-column grid flexibility

**Dark mode priority:** Design dark first, ensure light mode maintains readability and gold accent visibility.