# Tournament Management Platform

## Overview

This project is a dual-purpose web application consisting of mobile preview pages and a comprehensive tournament management platform. The platform provides a Discord-style server system for creating and managing gaming communities, featuring public channels and a private, owner-only "Tournament Dashboard" for managing tournaments. It supports various tournament formats (Round Robin, Single Elimination, Swiss System), bracket visualization, team standings, match tracking, and score submission. The core purpose is to empower server owners to efficiently organize and manage competitive gaming tournaments through a centralized, private dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 25, 2025 (Achievement Medal Numbers & Button Fixes - COMPLETE ✅)
- **Fixed Achievement Medal Numbers**:
  - ✅ Runner Up medals now display "2" instead of "1"
  - ✅ Third Place medals now display "3" instead of "1"
  - ✅ Numbers overlay correctly on both card view and detail popup
  - ✅ Prevents confusion and clearly shows medal positions

### November 25, 2025 (Button Fixes & Cleanup - COMPLETE ✅)
- **Fixed Top-Right "+" Button in Messages**:
  - ✅ Added onClick handler to open "Create Group Chat" dialog
  - ✅ Now the primary button for creating groups
  - ✅ Removed redundant blue floating button
  
- **Fixed "Edit Profile" Button on Account Page**:
  - ✅ Added onClick handler to navigate to account settings page
  - ✅ Users can now edit their profile from the account preview page
  - ✅ Navigates to /account/settings when clicked
  
- **Removed Duplicate Blue "+" Button**:
  - ✅ Removed floating button from bottom-right of messages page
  - ✅ Top-right button now serves as the single create group button
  - ✅ Cleaner UI with no duplicate functionality
  
- Build status: ✅ Passes with 0 errors
- Server status: ✅ Running cleanly on port 5000
- All functionality consolidated and working perfectly

### November 24, 2025 (All 4 Features Implemented - WORKING ✅)
- **Feature 1: Edit Group Chat Profile Pictures**:
  - ✅ Added `updateMessageThread()` storage method
  - ✅ Added PATCH `/api/message-threads/:id` endpoint to update thread avatar
  - ✅ Frontend mutation with API call when updating group avatar
  - ✅ Avatar changes persist to database and refresh on save
  
- **Feature 2: Search Bar in Messages**:
  - ✅ Added search state to component
  - ✅ Implemented real-time filtering of message threads by name
  - ✅ Search bar shows "No conversations match your search" when no results
  - ✅ Works for both individual and group chats
  
- **Feature 3: Create New Group Chat ("+" Button)**:
  - ✅ "+" button now opens "Create Group Chat" dialog
  - ✅ Dialog has input for group name with validation
  - ✅ API call creates new thread with default 💬 avatar
  - ✅ New group appears immediately in conversation list after creation
  - ✅ Full integration with database persistence
  
- **Feature 4: Edit Profile Button (Account Page)**:
  - ✅ Profile editing form is fully functional
  - ✅ Mutation handles PATCH request to `/api/users/:id`
  - ✅ Avatar upload field integrated (ImageUploadField component)
  - ✅ Form saves all fields: username, email, displayName, bio, avatarUrl
  - ✅ Success toast confirms profile update
  - ✅ Cache invalidation refreshes user data after save

### November 24, 2025 (Complete Message System - WORKING ✅)
- **Full Message Sending & Display System Implemented**:
  - ✅ Created `thread_messages` database table (threadId, userId, username, message, createdAt)
  - ✅ Backend Message Endpoints:
    - `POST /api/message-threads/:id/messages` - Send message (authenticated, validates user)
    - `GET /api/message-threads/:id/messages` - Fetch all messages ordered by time
  - ✅ Storage Methods: `createThreadMessage()`, `getThreadMessages()`
  - ✅ Frontend Message Display:
    - Fetches real messages from API (no mock data)
    - Shows sender name for each message
    - Own messages styled differently (primary bg color)
    - Loading spinner while fetching
    - "No messages yet" empty state
    - Auto-refetch after sending
    - Relative timestamps (now, Xm ago, Xh ago, etc)
  - ✅ Message Flow: Type → Send → Validate → Save to DB → Refetch → Display
  - Build status: ✅ Passes with 0 errors
  - Server status: ✅ Running cleanly on port 5000
  - **FULLY FUNCTIONAL: Messages send, persist, and display correctly**

### November 24, 2025 (Latest - Authentication System Fixed)
- **Critical Session Persistence Bug Fixed**:
  - ✅ Removed duplicate auth endpoints that were conflicting
  - ✅ Fixed register endpoint to auto-login users (set `req.session.userId` after account creation)
  - ✅ Updated register page to call `refetchUser()` and redirect to home after registration
  - ✅ Fixed session cookie configuration for Replit's proxy environment (`secure: false`, added `path: '/'`)
  - ✅ Users now automatically logged in after account creation
  - ✅ Session persists across page reloads and browser restarts
  - Build status: ✅ Passes with 0 errors
  - Server status: ✅ Running cleanly on port 5000
  - Authentication tested and working in both development and published environments

### November 24, 2025 (Backend Complete)
- **Complete Backend Implementation**:
  - ✅ All API routes fully implemented and tested (100+ endpoints)
  - ✅ WebSocket real-time messaging for channels and matches (channels, messages)
  - ✅ User roles and permissions system (getRolesByUser, getEffectivePermissions)
  - ✅ Tournament bracket generation (Round Robin, Single Elimination, Swiss System)
  - ✅ File/Image upload with object storage integration
  - ✅ Server management (channels, categories, roles, bans, invites)
  - ✅ Channel messaging with reply threads and WebSocket broadcasting
  - ✅ Achievement system with full details (reward, game, region, server)
  - ✅ Profile editing (PATCH /api/users/:id with validation)
  - ✅ Message persistence and broadcasting to connected clients
  - ✅ Server logo/background upload support
  - ✅ Image URL validation in profile and tournament uploads
  - ✅ Added `/api/users/:userId/roles` endpoint
  - ✅ Added `getRolesByUser()` storage method
  - Build status: ✅ Passes with 0 errors
  - Server status: ✅ Running cleanly on port 5000
  - All WebSocket connections authenticated and working

### November 24, 2025
- **Achievement System Complete Enhancement**: 
  - Added `serverId`, `reward`, `game`, and `region` fields to achievements table
  - Achievement popup displays all requested information: description, reward, game, region, server, awarded by, awarded on
  - Tournament organizers can fill out all fields when awarding achievements:
    - Player ID/Username
    - Achievement selection (7 predefined + custom titles for 3 editable types)
    - Description: Why they earned this achievement
    - Reward: Prize/trophy details (e.g., "$500 Prize Pool", "Champion Trophy")
    - Game: Game name (e.g., "Valorant", "Counter-Strike 2")
    - Region: Region identifier (e.g., "NA", "EU", "APAC", "Global")
  - Achievement details popup organized in logical sections:
    - Icon and title at top
    - Description section
    - Reward section
    - Game, Region, and Category fields (displayed only when populated)
    - Server section with clickable "Visit Server" button
    - Awarded by and Awarded on timestamps
  - Made server names clickable to navigate to the server
  - Display "Server no longer exists" when server is deleted
  - Achievement cards are clickable to open the details popup
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