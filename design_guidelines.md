# Tournament Management Platform - Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Design System Foundation with Gaming-Inspired Customization

**Primary References**: 
- Discord (community/chat interfaces)
- Challonge/Battlefy (bracket visualizations)
- Linear (clean dashboard layouts)

**Key Principles**:
- Competitive clarity: Information hierarchy that prioritizes match status and brackets
- Real-time energy: Interfaces that feel live and responsive to tournament progression
- Strategic density: Pack information efficiently without overwhelming users

---

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts) - UI elements, body text, data displays
- Accent: Space Grotesk (via Google Fonts) - Tournament titles, team names, competitive elements

**Hierarchy**:
- Tournament Headers: Space Grotesk, 3xl-4xl, font-bold
- Section Titles: Inter, xl-2xl, font-semibold
- Team Names/Match Info: Space Grotesk, base-lg, font-medium
- Body Text/Stats: Inter, sm-base, font-normal
- Meta Info (timestamps, rounds): Inter, xs-sm, font-normal

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 exclusively
- Micro spacing (icons, badges): 2
- Component padding: 4-6
- Section spacing: 8
- Page margins: 6-8

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Bracket view: Flexible horizontal scroll with fixed vertical sections
- Match cards: 2-column (md) to 3-column (lg) layouts

---

## Component Library

### Navigation
**Tournament Dashboard Header**:
- Sticky navigation with tournament logo/name (left), active tournament indicator (center), user profile/notifications (right)
- Secondary tab navigation: Overview | Brackets | Matches | Teams | Chat
- Breadcrumb trail for nested views

### Core Components

**Tournament Card** (Dashboard):
- Header with tournament name, format badge (Round-Robin/Elimination/Swiss)
- Status indicator (Upcoming/Live/Completed) with participant count
- Quick stats bar: Total matches, completed %, next match time
- Primary CTA: "View Bracket" or "Manage"

**Match Card** (Active/Upcoming):
- Team vs Team layout with team icons/avatars
- Match status badge (Pending/Live/Score Submitted/Complete)
- Score display area with submission timestamp
- Quick actions: "Submit Score", "View Chat", "Report Issue"
- Visual winner highlight (subtle border glow)

**Bracket Visualization** (Critical Custom Component):
- Horizontal tree layout with connective lines between rounds
- Each match as compact card with team names, scores, winner indication
- Round labels with match counts
- Bye indicators styled distinctly
- Progressive disclosure: Click match card to expand details
- Auto-scroll to current/next match

**Swiss Pairing Table**:
- Sortable table with round columns
- Team row with cumulative scores
- Match results as compact cells with opponent + result

**Chat Interface** (Match-Specific):
- Split panel: Match info (left 30%) | Chat (right 70%)
- Team-colored message bubbles
- System messages (match start, score submission) with distinct styling
- Input with emoji picker and file attachment for screenshots

**Score Submission Panel**:
- Image upload zone (drag-drop or click)
- Thumbnail preview grid of submitted images (2x2 max)
- Team winner selection buttons
- Confirmation state with both teams' submissions visible

### Forms & Inputs
- Tournament Creation: Multi-step wizard (Name/Format → Teams → Schedule → Confirm)
- Team input: Tag-style chips with remove option
- Format selector: Large radio cards with format descriptions
- All text inputs: Bordered with focus states, consistent padding-4

### Data Displays
**Standings Table**:
- Sticky header row
- Alternating row subtle treatment
- Highlight user's team
- Sortable columns (Team, Wins, Losses, Points)

**Tournament Timeline**:
- Vertical timeline with match nodes
- Status icons (checkmark/clock/alert)
- Collapsible past rounds

---

## Icons
**Library**: Heroicons (via CDN)
- Use outline style for navigation and secondary actions
- Use solid style for status indicators and primary actions
- Trophy icons for winners, clock for pending, check-circle for complete

---

## Images

**Hero Section** (Landing/Marketing Page):
- Full-width hero (80vh) featuring competitive gaming imagery: dramatic esports tournament scene with monitors, players focused, crowd atmosphere
- Overlay with gradient for text readability
- CTA buttons with backdrop-blur

**Tournament Creation/Empty States**:
- Illustration-style graphics showing bracket structures, team icons
- Use SVG illustrations for different tournament formats (bracket trees, round-robin circles, Swiss pairing grids)

**Team Avatars/Icons**:
- Placeholder system using initial letters in geometric shapes
- Support for uploaded team logos (circular crop)

---

## Animations
**Minimal, Purposeful Only**:
- Match result reveal: Quick fade-in of winner highlight (200ms)
- Bracket progression: Smooth scroll to next match
- Live indicators: Subtle pulse on "Live Match" badges
- No page transitions, no decorative animations

---

## Accessibility
- All interactive elements meet 44x44px touch targets
- Match status communicated via text + icon + visual treatment
- Keyboard navigation for bracket traversal
- ARIA labels for bracket connections and match relationships
- Form inputs with proper labels and error states

---

## Key Layout Patterns

**Dashboard Page**: 
- Top stats bar (3-4 metrics in grid)
- Active tournaments section (card grid, 2-3 columns)
- Upcoming matches list (stacked cards)
- Recent activity feed (right sidebar, 1/4 width)

**Bracket Page**:
- Fullscreen bracket view with zoom controls
- Round headers as sticky vertical labels
- Horizontal scroll with subtle scroll indicators
- Match detail panel slides from right on selection

**Match Detail View**:
- Split layout: Match info + chat (60/40 split desktop, stacked mobile)
- Score submission panel as modal overlay
- Image gallery in 2-column grid