# Tournament Management Platform

## Overview

A web-based tournament management system that allows users to create and manage competitive tournaments across multiple formats (Round Robin, Single Elimination, and Swiss System). The platform features real-time match tracking, bracket visualization, team standings, match chat functionality, and score submission workflows.

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
- `TournamentCard` - Display tournament overview with status badges
- `BracketView` - Visualize tournament brackets based on format type
- `MatchCard` - Individual match display with team info and status
- `StandingsTable` - Team rankings with wins/losses/points
- `MatchChatPanel` - Real-time chat interface for match communication
- `CreateTournamentDialog` - Multi-step tournament creation wizard
- `SubmitScoreDialog` - Match score submission interface

**Routing Structure:**
- `/` - Dashboard (tournament list and statistics)
- `/tournament/:id` - Tournament detail view with tabs for overview, bracket, and standings

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
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `GET /api/tournaments/:id/teams` - Get tournament teams
- `GET /api/tournaments/:id/matches` - Get tournament matches
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

**tournaments table:**
- Stores tournament metadata (name, format, status, current round)
- Status enum: upcoming, in_progress, completed
- Format enum: round_robin, single_elimination, swiss
- Optional swiss_rounds field for Swiss format configuration

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