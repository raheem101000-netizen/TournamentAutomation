# Tournament Management Platform

## Recent Changes (Nov 19, 2025)

### Backend Enhancements & Bug Fixes ✅
- **Added Zod validation to user update endpoint** (PATCH /api/users/:id):
  - Validates username, email, displayName, bio, avatarUrl, language, isDisabled
  - Uses z.coerce.number() for isDisabled field (database uses integer 0/1)
- **Implemented password change endpoint** (POST /api/users/:id/password):
  - Validates minimum 8-character password requirement
  - Verifies current password with bcrypt before allowing change
  - Hashes new password with bcrypt (salt rounds: 10)
  - Fixed HTTP method mismatch (was PATCH, now correctly POST)
- **Added account management endpoints**:
  - POST /api/users/:id/disable - Sets isDisabled to 1
  - DELETE /api/users/:id - Deletes user account
- **Storage layer enhancements**:
  - changeUserPassword() method with bcrypt verification
  - deleteUser() method for account deletion
  - All methods properly typed with Promise returns

### Channel Category Management System ✅
- **ManageCategoriesDialog component**:
  - Create new categories with name and auto-position
  - Delete categories (channels become uncategorized)
  - Real-time updates via TanStack Query invalidation
  - Toast notifications for success/error feedback
- **Categorized channel display**:
  - Channels grouped under their categories in server detail view
  - Categories display in position order
  - Uncategorized channels shown separately
  - Folder icon button to access category management (owner only)
- **Backend API routes**:
  - All category CRUD endpoints already existed with proper validation
  - Channel update route supports categoryId assignment

## Recent Changes (Nov 19, 2025) - Earlier

### User Account & Server Management Features ✅
- **Account Settings Page** (`/account/settings`):
  - Profile management: username, email, display name, bio
  - Avatar upload using ObjectUploader (camera roll & file system)
  - Password change functionality
  - Language preferences (EN, ES, FR, DE, JA)
  - Contact support button
  - Account disable/delete options with confirmation dialogs
  - Organized in tabs: Profile, Security, Preferences, Danger Zone

- **Server Settings Page** (`/server/:serverId/settings`):
  - **Overview Tab**: Server name, description, icon & background upload using ImageUploadField
  - **Roles Tab**: Create/delete roles with name, color picker, and permission checkboxes (manage_server, manage_roles, manage_channels, kick_members, ban_members, manage_messages, mention_everyone, manage_tournaments)
  - **Bans Tab**: Ban users by ID with optional reason, view banned users in table with unban button
  - **Invites Tab**: Generate invite links with optional expiration date and max uses, copy invite links, delete invites

- **Database Schema Expansions**:
  - Added `channelCategories` table for Discord-style channel organization
  - Added `serverRoles` table for permission management
  - Added `serverBans` table for user banning
  - Added `serverInvites` table with expiration and usage limits
  - Extended `users` table: email, language, isDisabled fields
  - Extended `channels` table: categoryId for category assignment

- **Backend API Routes** (with Zod validation):
  - Channel categories: Create, read, update, delete
  - Server roles: Full CRUD with permissions array
  - Server bans: Ban/unban users with reason tracking
  - Server invites: Generate codes with expiration & usage limits (with z.coerce.number for maxUses)
  - Channel management: Update channel properties, delete channels
  - Channel messages: Create, read, delete messages
  - Server updates: Modify server profile, icon, background
  - Avatar uploads: Dedicated endpoint with ACL policy

- **Storage Layer**: Complete implementations for all new tables with proper type safety

### Tournament Creation Enhancements ✅
- **Changed entry fee and prize fields from numeric to text**: `entryFee` and `prizeReward` now accept any text input
- Organizers can now enter: "FREE", "$5", "₦1000", "No Prize", "Gift Card", or any custom text
- Updated CreateTournamentDialog and EditTournamentDialog with text inputs and helpful placeholders
- Database schema migration completed successfully

### Tournament Poster Upload System ✅
- **Full file upload implementation using Replit Object Storage**
- **ImageUploadField component** supports both URL paste AND file upload from camera/device
- **ObjectUploader component** provides modal interface using Uppy for:
  - Camera roll uploads (mobile)
  - File system uploads (desktop)
  - Drag-and-drop support
  - Upload progress tracking
- **Backend infrastructure**:
  - `server/objectStorage.ts` - Object storage service with ACL support
  - `server/objectAcl.ts` - ACL policy enforcement (public/private)
  - Robust path normalization handles all PRIVATE_OBJECT_DIR configurations
  - Presigned URL generation for direct-to-GCS uploads
- **Security features**:
  - ACL enforcement on file retrieval (GET /objects/:path)
  - Public visibility for tournament posters
  - Secure upload flow with validation
- **Complete upload flow**: File selection → Presigned URL → GCS upload → Normalize path → Set ACL → Preview → Database save
- Integrated into CreateTournamentDialog and EditTournamentDialog
- Supports live preview and easy removal

### Homepage Filter Functionality ✅
- **Made filter badges fully functional** with robust matching logic
- Active filters: All, Prize, No Prize, Free Entry, Paid Entry
- Visual indication of active filter (variant switches between default/outline)
- Smart filtering logic with multiple improvements:
  - **Exact word matching** (not substring) to prevent false matches
  - **Numeric zero handling** - treats 0, 0.00, 0,00, $0, 0€ as free
  - **Keyword matching** - recognizes "free", "no entry fee", "no fee", etc.
  - **Case-insensitive** and **format-agnostic** matching
- Test cases covered: "Honorary Title" (has prize), "No Prize" (no prize), "FREE" (free), "$25" (paid), "0.00" (free), "No entry fee" (free)
- Filters combine seamlessly with search functionality

### Channel Messages Schema (Partial) ✅
- Added `channelMessages` table to database with support for:
  - Image uploads (`imageUrl`)
  - File attachments (`fileUrl`, `fileName`)
  - Reply threading (`replyToId`)
  - Message editing (`editedAt`)
  - Soft deletes (`deletedAt`)
- Full chat UI implementation pending (future work)

### Previous Changes (Nov 18, 2025)
- Tournament metadata fields: startDate, endDate, platform, region
- Horizontally swipeable carousel on server detail page
- Discovery page search functionality
- Data consistency validation for tournaments

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
*   **Object Storage**: Replit Object Storage (Google Cloud Storage backend).
*   **UI Libraries**: Radix UI, shadcn/ui, Lucide React, class-variance-authority, tailwind-merge, clsx.
*   **Form Management**: React Hook Form, @hookform/resolvers.
*   **Data Fetching**: TanStack Query.
*   **File Upload**: Uppy Core, Uppy Dashboard, Uppy AWS S3 plugin, Uppy Drag Drop, Uppy React.
*   **Date Utilities**: date-fns.
*   **Development Tools**: tsx, esbuild, drizzle-kit, Vite plugins.
*   **Fonts**: Google Fonts (Inter, Space Grotesk).
*   **Real-time Communication**: `ws` library (server), native WebSocket API (client).