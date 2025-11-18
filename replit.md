# Tournament Management Platform

## Recent Changes (Nov 18, 2025)

### Tournament Creation & Management Enhancements
- Added comprehensive tournament metadata: startDate, endDate, platform, region, prizeReward, entryFee, imageUrl
- Tournament creation form includes poster image URL, prize pool, entry fee, start/end date pickers
- Implemented tournament editing: PATCH /api/tournaments/:id endpoint with EditTournamentDialog component
- Server detail page displays upcoming tournaments in horizontally swipeable carousel with navigation arrows
- Discovery page now includes search/filter functionality (filters servers by name, description, game tags)
- Data consistency: tournaments on homepage only display if their parent server exists

### Fixes Applied
- Fixed carousel setup: moved Embla event binding to useEffect for proper navigation button state
- Verified tournament metadata persists correctly through storage layer

## Overview

This project is a dual-purpose web application comprising:

1.  **Mobile Preview Pages**: Visual mockups for upcoming mobile app features (Discovery, Messages, Notifications, Profile).
2.  **Tournament Management Platform**: A Discord-style server system for creating and managing gaming communities. It features:
    *   Public channels (e.g., Announcements, General Chat).
    *   A private, owner-only "Tournament Dashboard" channel with comprehensive tournament management capabilities.
    *   Functionality for tournament creation across various formats (Round Robin, Single Elimination, Swiss System), bracket visualization, team standings, match tracking, and score submission.

The platform's core purpose is to empower server owners to organize and manage competitive gaming tournaments efficiently through a centralized, private dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

*   **Technology Stack**: React 18 with TypeScript, Wouter for routing, TanStack Query for state management, Radix UI primitives with shadcn/ui for UI components, Tailwind CSS for styling, and Vite for building.
*   **Design System**: Gaming-inspired aesthetic drawing from Discord, Challonge/Battlefy, and Linear, featuring custom typography (Inter, Space Grotesk), responsive 12-column grid layouts, standardized spacing, and dark/light theme support.
*   **Key Features**: Server and channel management (including a dedicated Tournament Dashboard), tournament creation and visualization (brackets, standings, match tracking), and real-time match chat.
*   **Routing**: Structured to support mobile preview pages, server-specific views (`/server/:serverId`), and tournament details (`/tournament/:id`), alongside a home page and user account management.
*   **Channel System**: Supports unlimited custom channels with 35 selectable icons across 10 categories. Each new server automatically creates "Tournament Dashboard" (position 0, private, 🏆), "Announcements" (position 1, public, 📢), and "General Chat" (position 2, public, 💬) channels.

**Channel Icons (All 35):**
- Text Channels: 📝 (default), 📢 (announcements), 💬 (chat), 🗂️ (threads)
- Voice Channels: 🔊 (voice), 🎤 (stage), 🎧 (music)
- Categories: 📁 (folder), 📂 (sub-category)
- Bots & Automations: 🤖 (bot), 🛠️ (admin), ⚙️ (settings)
- Gaming: 🎮 (gaming), 🕹️ (controller), 🏆 (tournaments)
- Media: 🎨 (art), 📸 (photos), 🎥 (videos), 🎵 (music)
- Information: 📌 (rules), 📜 (guidelines), 📢 (announcements), ❓ (FAQ), 📣 (updates)
- Economy/Points: 💰 (money), 🪙 (coins), 📊 (stats), 📝 (leaderboards)
- Community: 👋 (welcome), 🙋 (introductions), 🗣️ (discussion), 🎉 (events)
- Security/Staff: 🔐 (staff-only), 🛡️ (moderation), 🚨 (reports)

### Backend Architecture

*   **Technology Stack**: Node.js with Express, TypeScript (ESM), Drizzle ORM, Neon Serverless for PostgreSQL, and `ws` for WebSocket communication.
*   **API Design**: RESTful endpoints under `/api`, WebSocket connections for real-time match chat, and JSON-based communication.
*   **Tournament Logic**: Implements bracket generation algorithms for Round Robin, Single Elimination (with bye handling), and Swiss System formats.
*   **WebSocket Implementation**: Dedicated WebSocket connections per match for real-time chat message broadcasting.

### Data Storage

*   **Database**: PostgreSQL via Neon Serverless.
*   **Schema Design**: Key tables include `servers` (name, owner, icon), `channels` (type, privacy, server\_id), `tournaments` (name, format, status, server\_id), `teams` (wins, losses, tournament\_id), `matches` (pairings, scores, status, tournament\_id), and `chat_messages` (match\_id, content).
*   **Data Relationships**: Employs one-to-many and many-to-many relationships to link servers, channels, tournaments, teams, matches, and chat messages.
*   **Validation**: Utilizes Zod schemas generated from Drizzle tables for type-safe data validation.

## External Dependencies

*   **Database**: Neon PostgreSQL.
*   **UI Libraries**: Radix UI, shadcn/ui, Lucide React, class-variance-authority, tailwind-merge, clsx.
*   **Form Management**: React Hook Form, @hookform/resolvers.
*   **Data Fetching**: TanStack Query.
*   **Date Utilities**: date-fns.
*   **Development Tools**: tsx, esbuild, drizzle-kit, Vite plugins.
*   **Fonts**: Google Fonts (Inter, Space Grotesk).
*   **Real-time Communication**: `ws` library (server), native WebSocket API (client).