# Syncora - AI Operation Command Centre

## Project Overview
Syncora is a sophisticated, AI-powered dashboard that serves as a central command center for managing professional communications and schedules. It integrates with Google's ecosystem (Gmail, Calendar, Drive) to automate workflow, prioritize information, and provide intelligent assistance.

## Architecture

### Frontend (React + TypeScript)
- **Landing Page**: Animated neural network background, feature showcase, CTA to auth
- **Authentication**: Email/password signup/login, Google OAuth support, 2FA with QR codes
- **Dashboard**: Customizable widget-based interface
  - Priority Inbox: AI-categorized emails (High/Medium/Low priority)
  - Calendar Widget: Upcoming meetings from Google Calendar
  - Task List: Auto-detected tasks from emails
  - AI Chat: Gemini-powered assistant with context awareness
- **Settings**: 2FA management, Google integrations, theme toggle
- **Theme**: Dark/Light mode with premium gold accent (#E0B36A)

### Backend (Express + TypeScript)
- **Authentication**: Passport.js with local strategy and Google OAuth
  - Password hashing with bcrypt
  - Staged 2FA flow with server-side nonce storage
  - Session-based auth with secure cookies
- **Database**: PostgreSQL via Drizzle ORM
  - Users, emails, calendar events, tasks, notifications
- **AI Integration**: Gemini AI for:
  - Email priority analysis
  - Email summarization
  - Meeting detail extraction
  - Task detection
  - Conversational chat
- **Google Calendar**: Replit connector integration for calendar sync

## Key Features Implemented

### ✅ Completed Features
1. **User Authentication**
   - Email/password signup/login with bcrypt hashing
   - Staged 2FA flow with TOTP and QR code generation
   - Session management with passport.js
   - Google OAuth configuration (requires env vars)

2. **Email Management**
   - Priority inbox with AI-powered categorization
   - Email summarization using Gemini AI
   - Meeting detail extraction from email content
   - Task detection from email content

3. **Calendar Integration**
   - Google Calendar sync via Replit connector
   - Event display with meeting links
   - Automatic event creation from emails (future enhancement)

4. **Task Management**
   - Manual task creation
   - AI-detected tasks from emails
   - Priority levels and due dates
   - Task completion tracking

5. **AI Assistant**
   - Gemini-powered chatbot
   - Context-aware responses
   - Schedule and email insights

6. **UI/UX**
   - Animated landing page
   - Dark/Light theme toggle
   - Premium design with gold accents
   - Responsive layout
   - Loading states and error handling

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `SESSION_SECRET`: Secret for session encryption (defaults to fallback, should be set in production)

### Optional (for full Google OAuth)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

**Note**: Without Google OAuth credentials, users can still:
- Sign up/login with email/password
- Use Google Calendar connector (shared account)
- Access all AI features

## Important Limitations

### Google Calendar Integration
The current implementation uses a **shared Google Calendar connector** which means:
- All users see events from the same Google account (the connector account)
- Calendar data is NOT user-isolated
- **This is a known limitation** due to missing Google OAuth env vars

To fix this for production:
1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
2. Extend user schema to store per-user OAuth tokens
3. Update calendar routes to use user-specific tokens
4. Implement token refresh logic

### Gmail Integration
- Gmail integration requires manual OAuth setup
- Email data is currently seeded as demo data
- Full Gmail sync requires additional implementation

## Database Schema

### Users
- Email/password authentication
- Google OAuth ID (optional)
- 2FA secret and enabled flag
- Widget layout preferences

### Emails
- Message content and metadata
- AI-analyzed priority (high/medium/low)
- AI-generated summary
- Extracted meeting details

### Calendar Events
- Google Calendar event data
- Meeting links and attendees
- Time and location information

### Tasks
- User-created or AI-detected
- Priority and due date
- Completion status

### Notifications
- System notifications
- Email alerts
- Meeting reminders

## Development

### Setup
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Tech Stack
- Frontend: React, TypeScript, Tailwind CSS, Shadcn UI, Wouter, TanStack Query
- Backend: Express, Passport.js, Drizzle ORM, PostgreSQL
- AI: Google Gemini API
- Integrations: Google Calendar and Email

## Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **2FA**: OTP-based with QR code provisioning
3. **Session Security**: HTTP-only cookies, secure in production
4. **Staged Authentication**: 2FA uses server-side nonce to prevent bypass
5. **Input Validation**: Zod schemas for request validation

## User Preferences
- Theme preference stored in localStorage
- Widget layouts (future: stored in database)
- 2FA preferences per user

## Recent Changes
  -  Initial MVP implementation
  - Complete authentication system with 2FA
  - Google Calendar integration via connector
  - Gemini AI for email analysis and chat
  - Premium UI with theme toggle
  - Database persistence

## Known Issues & Future Enhancements

### Critical
- [ ] Implement per-user Google OAuth token storage (requires env vars)
- [ ] Add user isolation for calendar data

### High Priority
- [ ] Gmail API integration for real email fetching
- [ ] Google Drive document linking
- [ ] Automatic meeting creation from emails
- [ ] Widget drag-and-drop customization
- [ ] Real-time notifications

### Medium Priority
- [ ] Email composition and reply
- [ ] Calendar conflict detection
- [ ] Task deadline reminders
- [ ] Analytics dashboard
- [ ] Export functionality

### Low Priority
- [ ] Custom domain support
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Voice commands

## Testing
- Manual testing completed for core flows
- E2E testing recommended for:
  - Authentication (signup, login, 2FA)
  - Email summarization
  - Calendar sync
  - Task management
  - AI chat

## Deployment Notes
- Set `SESSION_SECRET` environment variable in production
- Ensure `GEMINI_API_KEY` is configured
- For full functionality, set Google OAuth credentials
- Database migrations handled automatically via `npm run db:push`
