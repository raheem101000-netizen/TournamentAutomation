# Tournament Management Platform

## Recent Changes (Nov 18, 2025)

### New Features - COMPLETE ✅
- **Homepage Search Filter**: Search bar now filters tournaments by title, game, or server name
  - Typing "valorant" shows only Valorant tournaments
  - Real-time filtering as user types
- **Create Server Flow**: Discord-style server creation dialog on Discovery page
  - Form includes: server name (required), description, and clickable game tag selection
  - Creates server via POST /api/servers endpoint
  - Navigates to new server after creation
  - **Automatically creates 3 default channels**:
    1. Announcements (public)
    2. General (public, chat)
    3. Tournament Dashboard (private, owner-only) - **Full tournament management**
- **Team Logo Upload**: Photo upload option added to team creation page (Account)
  - Users can upload images from camera roll/file system (5MB max)
  - File type and size validation with toast notifications
  - Works alongside existing emoji selection
  - Image preview with remove button
- **Tournament Dashboard Integration**: Complete tournament management system accessible via private server channel
  - Create tournaments with all 3 formats (Round Robin, Single Elimination, Swiss)
  - Tournament list view (Upcoming, In Progress, Completed)
  - Tournament detail view with 5 tabs: Overview, Bracket, Standings, Matches, Teams
  - Automatic bracket generation based on format
  - Match score submission with real-time updates
  - Team standings tracking

### Mobile Preview Pages: Account & My Servers Fixes - COMPLETE ✅
- **Account Page**: Fixed profile picture loading by using correct `/api/users/${userId}` endpoint
  - Changed from fetching `/api/users` (returned HTML) to `/api/users/${userId}` (returns User object)
  - Achievements fetch from `/api/users/${userId}/achievements`
  - Removed fallback to mock achievements - shows real data or empty state
- **My Servers Page**: Fixed to show ALL servers user is member of with proper filtering
  - Fixed queryKey to `/api/users/${userId}/servers` for member servers
  - Separated display into "Owned Servers" and "Member Servers" sections
  - Added search filter and game tag filter badges
  - Server logos display using Avatar with iconUrl
- **Messages Page**: Enhanced UI with group avatar editing and message request flow (client-side only)

### Phase 2 Homepage Improvements - COMPLETE ✅
- **Tournament Type Filters**: Replaced game badges with Prize/Non-Prize and Free/Paid Entry filters
- **Game Tags**: Added game tags to tournament schema, displayed as badges on posters for discovery
- **Clickable Organizers**: Server names now open join modal with server details and navigation
- **Server Integration**: All posters (real + mock) reference actual servers from Discovery page
- **Avatar Pattern**: Unified AvatarImage + AvatarFallback pattern across all surfaces (cards, modals)
- **Join Flow**: Unified server join logic using shared `joinServerAPI` helper
- **Duplicate Registration**: 409 error detection for "Team name already exists" shows friendly toast
- **Development Messaging**: Sign-up page button shows "feature in development" message

### Data Architecture
- Servers on Discovery page are the **publishers** of tournament posters on Homepage
- Each tournament has `serverId` FK referencing the publishing server
- Server logos, names, icons all pulled from `/api/mobile-preview/servers` endpoint
- Mock posters generated from first 4 real servers when no tournaments exist

### Phase 1 Bug Fixes - Complete (Nov 17, 2025)
- **Game Tags**: Extended servers table with gameTags array field for search/discovery
- **Server Memberships**: Added serverMembers table to track user-server relationships
- **Join Server Functionality**: Implemented POST /api/servers/:serverId/join endpoint
- **Discovery Page Updates**: Shows game tags, removed filter badges, fixed join button
- **Voice Channels Removed**: Cleaned up server detail page
- **Backend Storage**: Added joinServer(), getServersByUser(), isUserInServer() methods

### Backend Integration (Nov 15, 2025)
- Added 6 new database tables: users, achievements, teamProfiles, teamMembers, serverMembers, posterTemplates + posterTemplateTags
- Built complete storage layer with 40+ CRUD methods using Drizzle ORM
- Created comprehensive REST API routes for all new features
- Successfully migrated database schema

### Frontend Integration (4 Pages Connected)
1. **preview-home.tsx** - Fetches tournaments + servers, displays posters with real server data
2. **preview-discovery.tsx** - Fetches servers from /api/mobile-preview/servers
3. **preview-templates.tsx** - Fetches poster templates from /api/poster-templates
4. **preview-account.tsx** - Fetches users and achievements from APIs

All pages include proper loading/error states and fallback to mock data.

## Overview

A dual-purpose web application combining:

1. **Mobile Preview Pages** - Visual mockups of mobile app features (Discovery, Messages, Notifications, Profile)
2. **Tournament Management Platform** - A Discord-style server system where users can create and manage gaming communities with channels. Each server contains:
   - Public channels (Announcements, Chat)
   - Private owner-only Tournament Dashboard channel with full tournament management capabilities
   - Tournament creation, bracket visualization, team standings, match tracking, and score submission

The platform enables server owners to organize competitive tournaments across multiple formats (Round Robin, Single Elimination, and Swiss System) through a centralized dashboard accessible only to them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with shadcn/ui design system
- **Styling:** Tailwind CSS with custom design tokens
- **Build Tool:** Vite

**Design System:**
- Custom typography using Inter (UI/body) and Space Grotesk (headers/competitive elements)
- Gaming-inspired design with influences from Discord, Challonge/Battlefy, and Linear
- Responsive layouts using 12-column grid system
- Standardized spacing using Tailwind units (2, 4, 6, 8)
- Dark/light theme support with CSS custom properties

**Key UI Components:**

*Server & Channel Components:*
- `ServerCard` - Display server with icon, name, and member count
- `AnnouncementsChannel` - Static announcements display for servers
- `ChatChannel` - Chat interface for general server communication
- `TournamentDashboardChannel` - Owner-only tournament management interface

*Tournament Components:*
- `TournamentCard` - Display tournament overview with status badges
- `BracketView` - Visualize tournament brackets based on format type
- `MatchCard` - Individual match display with team info and status
- `StandingsTable` - Team rankings with wins/losses/points
- `MatchChatPanel` - Real-time chat interface for match communication
- `CreateTournamentDialog` - Multi-step tournament creation wizard
- `SubmitScoreDialog` - Match score submission interface

**Routing Structure:**
- `/` - Home page
- `/mobile-preview` - Mobile app preview landing
- `/discovery` - Discovery feed preview
- `/messages` - Messages preview
- `/notifications` - Notifications preview
- `/profile` - Profile preview
- `/myservers` - My Servers page (displays owned and member servers)
- `/server/:serverId` - Server detail view (Discord-style interface with channels)
- `/tournament/:id` - Tournament detail view (legacy route)

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express
- **Language:** TypeScript (ESM modules)
- **ORM:** Drizzle ORM
- **Database Driver:** Neon Serverless (@neondatabase/serverless)
- **WebSocket:** ws library for real-time updates
- **Session Management:** connect-pg-simple

**API Design:**
- RESTful endpoints under `/api` prefix
- WebSocket connections for real-time match chat
- Request/response logging middleware
- JSON body parsing with raw buffer preservation

**Key API Endpoints:**

*Server & Channel Endpoints:*
- `GET /api/mobile-preview/servers` - List all servers for mobile preview
- `GET /api/servers/:id` - Get server details
- `GET /api/servers/:id/channels` - Get channels for a server
- `POST /api/servers/:id/channels` - Create new channel in server

*Tournament Endpoints:*
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `GET /api/tournaments/:id/teams` - Get tournament teams
- `GET /api/tournaments/:id/matches` - Get tournament matches
- `POST /api/matches/:id/score` - Submit match score
- `PATCH /api/matches/:id` - Update match (scores, status, winner)
- `POST /api/matches/:id/messages` - Send chat message
- `GET /api/matches/:id/messages` - Get chat history

**Tournament Logic:**
- Bracket generation algorithms for each format type in `bracket-generator.ts`
- Round Robin: All teams play each other once
- Single Elimination: Bracket with byes for non-power-of-2 team counts
- Swiss System: Pairing algorithm based on current standings

**WebSocket Implementation:**
- Separate WebSocket connections per match ID
- Real-time broadcast of chat messages to all participants
- Connection cleanup on client disconnect

### Data Storage

**Database:** PostgreSQL via Neon Serverless

**Schema Design:**

**servers table:**
- Server information (name, description, owner)
- Optional icon and background URLs
- Member count tracking
- Owner ID for access control

**channels table:**
- Channel information linked to servers
- Type enum: announcements, chat, tournament_dashboard
- Privacy flag (isPrivate) for owner-only channels
- Foreign key to server_id

**tournaments table:**
- Stores tournament metadata (name, format, status, current round)
- Status enum: upcoming, in_progress, completed
- Format enum: round_robin, single_elimination, swiss
- Optional swiss_rounds field for Swiss format configuration
- Foreign key to server_id to scope tournaments to servers

**teams table:**
- Team information linked to tournaments
- Tracks wins, losses, and points
- Foreign key to tournament_id

**matches table:**
- Match pairings with team references
- Round number for bracket positioning
- Status tracking (pending, in_progress, completed)
- Score fields (team1_score, team2_score)
- Winner reference
- Bye flag for single elimination brackets

**chat_messages table:**
- Match-specific chat messages
- Optional team_id for message attribution
- System message flag for automated notifications
- Image URL field for score screenshot submissions
- Timestamp for message ordering

**Data Relationships:**
- One server has many channels (1:N)
- One server has many tournaments (1:N)
- One tournament has many teams (1:N)
- One tournament has many matches (1:N)
- One match references two teams (M:N)
- One match has many chat messages (1:N)

**Validation:**
- Zod schemas generated from Drizzle tables using drizzle-zod
- Insert schemas for type-safe data creation
- Form validation with @hookform/resolvers

### External Dependencies

**Database:**
- Neon PostgreSQL - Serverless Postgres database
- Connection pooling via @neondatabase/serverless

**UI Libraries:**
- Radix UI - Unstyled, accessible component primitives
- shadcn/ui - Pre-styled component library built on Radix
- Lucide React - Icon library
- class-variance-authority - Type-safe variant styling
- tailwind-merge & clsx - Class name utilities

**Form Management:**
- React Hook Form - Form state management
- @hookform/resolvers - Validation resolver integration

**Data Fetching:**
- TanStack Query - Server state caching and synchronization
- Custom fetch wrapper with error handling

**Date Utilities:**
- date-fns - Date formatting and manipulation

**Development Tools:**
- tsx - TypeScript execution for development
- esbuild - Production bundling
- drizzle-kit - Database migrations and schema management
- Vite plugins for Replit integration (error overlay, cartographer, dev banner)

**Fonts:**
- Google Fonts API - Inter and Space Grotesk font families

**Real-time Communication:**
- ws - WebSocket server implementation
- Native WebSocket API on client