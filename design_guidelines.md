# Tournament App Preview Website - Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based with Mobile-First Showcase
**Primary References**: Apple.com product pages, Vercel's app showcases, Linear's marketing site

**Key Principles**:
- Mobile-centric: Center stage for app interface preview in phone frame
- Visual energy: Tournament posters and app screens create vibrancy
- Clean showcase: Minimal chrome, maximum focus on app content

---

## Typography System

**Font Families**:
- Primary: Inter (Google Fonts) - UI, body text, navigation
- Accent: Space Grotesk (Google Fonts) - Tournament titles, team names, headings

**Hierarchy**:
- Hero Headline: Space Grotesk, 4xl-5xl, font-bold
- Tab Labels: Inter, sm, font-medium
- Tournament Titles: Space Grotesk, lg, font-semibold
- Card Content: Inter, sm-base, font-normal
- Meta Text: Inter, xs, font-normal

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8

**Page Structure**:
- Hero section: 90vh with dramatic tournament imagery, gradient overlay
- App preview section: max-w-7xl container with sidebar (240px) + phone frame (375px) + details panel (flex-1)
- Responsive: Stacked mobile, sidebar + phone on tablet, full layout desktop

---

## Component Library

### Hero Section
- Full-width competitive gaming scene: Esports arena with monitors, players, crowd energy
- Gradient overlay (bottom to top, dark to transparent)
- Centered headline: "Manage Tournaments. Track Matches. Anywhere."
- Primary CTA: "Download App" with backdrop-blur-md background
- Floating phone mockup showing app interface (positioned bottom-right, 30% visible)

### Sidebar Navigation
- Vertical tab list with icons + labels
- Tabs: Home, Discovery, Messages, Notifications, MyServers, Account
- Active state: background treatment, accent indicator (left border-4)
- Icons: Heroicons solid style
- Fixed width: w-60, sticky positioning

### Phone Frame Container
- iPhone-style frame: rounded-3xl border, shadow-2xl
- Dimensions: 375px width, 812px height
- Screen area with rounded corners matching device
- Status bar: time (left), signal/battery (right)
- Bottom safe area spacing

### Tab Content Screens

**Home Tab - Tournament Grid**:
- 2-column grid of tournament poster cards
- Each card: Image (16:9 aspect), tournament name overlay, participant count badge
- Vibrant poster images: Colorful tournament graphics, game artwork, competitive themes
- Cards with rounded-2xl, overflow-hidden

**Discovery Tab - Server List**:
- Stacked server cards (full-width)
- Each card: Server icon (circular, left), name + member count (center), join button (right)
- Compact padding-4, border-b dividers

**Messages Tab - Chat Threads**:
- List of conversation cards
- Each: Avatar + team icon (left), name + last message preview (center), timestamp + unread badge (right)
- Unread messages: slightly bolder, unread count badge

**Notifications Tab - Alerts Feed**:
- Chronological list with grouped headers (Today, Yesterday, Earlier)
- Each notification: Icon type (trophy/bell/alert), message text, timestamp
- Action items (match result, score submission) with inline CTA buttons

**MyServers Tab - Calendar View**:
- Month calendar grid (7 columns)
- Day cells with match count dots (colored indicators)
- Selected day shows match list below calendar
- Upcoming matches as compact list items

**Account Tab - Profile**:
- Profile header: Large avatar, username, stats row (Tournaments/Wins/Teams)
- Settings list: Grouped sections (Account, Notifications, Privacy)
- Each setting as tappable row with right chevron

### Details Panel (Right Side)
- Feature callouts corresponding to active tab
- Screenshot enlargements on hover over phone content
- Bullet list of key features with icons
- Secondary CTA: "Learn More" or "View Documentation"

---

## Images

**Hero**: Full-width esports tournament scene - players at gaming stations, monitors glowing, dramatic lighting, audience atmosphere

**Tournament Posters** (Home Tab): 6+ vibrant images showing various tournament types:
- Fighting game tournament art (bold colors, character silhouettes)
- Battle royale event graphics (landscape, weapon icons)
- MOBA championship designs (team crests, arena views)
- Racing league posters (vehicles, speed effects)

**Server Icons** (Discovery Tab): Circular logos representing different gaming communities (placeholder geometric patterns)

**Avatars** (Messages/Account): Circular team/user photos (placeholder with initials)

---

## Icons
**Library**: Heroicons (CDN)
- Navigation tabs: home, globe-alt, chat-bubble-left, bell, calendar, user-circle
- Solid style for sidebar, outline for in-app UI elements

---

## Animations
**Minimal, Strategic**:
- Tab switching: 300ms cross-fade between phone screen content
- Hover states: Subtle scale (1.02) on tournament posters
- Details panel updates: Fade-in corresponding to active tab
- No page load animations, no excessive motion

---

## Key Layout Patterns

**Desktop (lg+)**: 3-panel layout - Sidebar (240px) | Phone Frame (375px centered) | Details Panel (flex-1)

**Tablet (md)**: 2-panel - Sidebar (200px) | Phone Frame (centered)

**Mobile**: Single column - Tab selector horizontal scroll, phone frame full-width (max 375px centered)

**Spacing**: Container padding-8, inter-element spacing using 4 and 6, section gaps using 8