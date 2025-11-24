# Tournament Management Platform

## Overview

This project is a dual-purpose web application consisting of mobile preview pages and a comprehensive tournament management platform. The platform provides a Discord-style server system for creating and managing gaming communities, featuring public channels and a private, owner-only "Tournament Dashboard" for managing tournaments. It supports various tournament formats (Round Robin, Single Elimination, Swiss System), bracket visualization, team standings, match tracking, and score submission. The core purpose is to empower server owners to efficiently organize and manage competitive gaming tournaments through a centralized, private dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 24, 2025 (Latest)
- **Achievement System Complete Enhancement**: 
  - Added `serverId` field to achievements table to track which server awarded each achievement
  - Added `reward` field to capture prize details (money, in-game prizes, trophies, etc.)
  - Made server names under achievement icons clickable to navigate to the server
  - Display "Server no longer exists" message when server is deleted
  - Created achievement details popup showing full information:
    - Icon, title, and description
    - **Reward** section displaying prize/trophy details provided by organizer
    - Category, awarded by, and awarded on timestamp
    - "Visit Server" button for easy navigation
  - Achievement cards are now clickable to open the details popup
  - Updated Tournament Dashboard achievement form to include reward input field
  - Added data-testid attributes for all interactive achievement elements

### November 19, 2025
- **My Servers Filter Badges**: Added visible filter UI with "All Servers", "Owned" (crown icon), and "Member" (users icon) badges for easy server list filtering
- **Image Upload System Overhaul**: Fixed critical image upload bugs affecting profile pictures, server icons/backgrounds, and tournament posters:
  - Created secure `/api/objects/normalize` endpoint with authentication and path validation
  - Fixed ImageUploadField component to properly save uploaded images
  - Updated object storage service to return both upload URL and object path
  - Fixed path handling to prevent "uploads/uploads" double-concatenation
  - Added toast notifications for upload success/failure
- **Tournament Poster Editor Enhancement**: Image editor now saves the actual cropped/positioned image instead of just the original:
  - Canvas rendering matches preview for all three fit modes (Cover, Contain, Fill)
  - Position and zoom settings are applied to the saved image
  - Uploaded images persist correctly to object storage

### November 19, 2025 (Earlier)
- **Server List Fix**: Fixed critical bug where newly created servers didn't appear in the server list. Now automatically adds server owner to server_members table upon server creation.
- **Game Tags Enhancement**: Replaced preset game tag selectors with flexible manual text input system. Users can now type any game name (e.g., "Dragon Ball Z", "Valorant", "Fortnite") and add them as tags by pressing Enter.
- **Message Reply System**: Implemented Discord-style message reply functionality in chat channels. Users can tap/click any message to set it as a reply, with visual indication of the replied-to message displayed in the chat.
- **Tournament Poster Image Editor**: Created comprehensive image editor component with zoom controls, fit modes, position grid, and drag-to-reposition functionality

## System Architecture

### Frontend Architecture

*   **Technology Stack**: React 18 with TypeScript, Wouter for routing, TanStack Query for state management, Radix UI primitives with shadcn/ui for UI components, Tailwind CSS for styling, and Vite for building.
*   **Design System**: Gaming-inspired aesthetic drawing from Discord, Challonge/Battlefy, and Linear, featuring custom typography (Inter, Space Grotesk), responsive 12-column grid layouts, standardized spacing, and dark/light theme support.
*   **Key Features**: Server and channel management (including a dedicated Tournament Dashboard with access enforcement), robust member permissions system, tournament creation and visualization (brackets, standings, match tracking), and real-time match chat.
*   **Routing**: Structured to support mobile preview pages, server-specific views (`/server/:serverId`), tournament details (`/tournament/:id`), a home page, and user account management.
*   **Channel System**: Supports unlimited custom channels with 35 selectable icons across 10 categories. New servers automatically create "Tournament Dashboard", "Announcements", and "General Chat" channels.
*   **User Account Management**: Account settings page for profile management, avatar upload, password change, language preferences, and account disable/delete options.
*   **Server Settings**: Overview for server name, description, icon/background upload; Roles management with comprehensive permission checkboxes; Bans management; and Invite link generation with expiration and usage limits.
*   **Tournament Features**: Entry fee and prize fields support custom text inputs. A robust tournament poster upload system with live preview and secure handling is integrated.
*   **Homepage Filters**: Functional filter badges for "All", "Prize", "No Prize", "Free Entry", "Paid Entry" with smart matching logic (exact word, numeric zero, keywords, case-insensitive).

### Backend Architecture

*   **Technology Stack**: Node.js with Express, TypeScript (ESM), Drizzle ORM, Neon Serverless for PostgreSQL, and `ws` for WebSocket communication.
*   **API Design**: RESTful endpoints under `/api`, WebSocket connections for real-time match chat, and JSON-based communication.
*   **Tournament Logic**: Implements bracket generation algorithms for Round Robin, Single Elimination (with bye handling), and Swiss System formats.
*   **WebSocket Implementation**: Dedicated WebSocket connections per match for real-time chat message broadcasting.
*   **Security**: Zod validation applied to all critical endpoints (user updates, password changes, server/channel/member management). Access enforcement for Tournament Dashboard based on explicit `tournament_dashboard_access` permission or server ownership.
*   **Permissions Model**: Hybrid permissions model combining role-based permissions with explicit permissions for server members.

### Data Storage

*   **Database**: PostgreSQL via Neon Serverless.
*   **Schema Design**: Key tables include `servers`, `channels`, `channelCategories`, `serverRoles`, `serverMembers`, `serverBans`, `serverInvites`, `tournaments`, `teams`, `matches`, `channelMessages`, and `users`.
*   **Data Relationships**: Employs one-to-many and many-to-many relationships to link servers, channels, tournament entities, members, and messages.
*   **Validation**: Utilizes Zod schemas generated from Drizzle tables for type-safe data validation.

## External Dependencies

*   **Database**: Neon PostgreSQL.
*   **Object Storage**: Replit Object Storage (Google Cloud Storage backend).
*   **UI Libraries**: Radix UI, shadcn/ui, Lucide React, class-variance-authority, tailwind-merge, clsx.
*   **Form Management**: React Hook Form, @hookform/resolvers.
*   **Data Fetching**: TanStack Query.
*   **File Upload**: Uppy Core, Uppy Dashboard, Uppy AWS S3 plugin, Uppy Drag Drop, Uppy React.
*   **Date Utilities**: date-fns.
*   **Development Tools**: tsx, esbuild, drizzle-kit, Vite plugins.
*   **Fonts**: Google Fonts (Inter, Space Grotesk).
*   **Real-time Communication**: `ws` library (server), native WebSocket API (client).