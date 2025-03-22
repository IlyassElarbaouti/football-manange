# FootballHub Project - Comprehensive Technical Documentation

## Project Overview

FootballHub is a web application that allows users to organize, join, and manage football (soccer) matches with a FIFA-inspired black and gold UI theme. The platform combines modern web technologies with an intuitive interface to create a seamless experience for football enthusiasts.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (custom-styled components)
- **Date Handling**: Moment.js
- **State Management**: React hooks for local state

### Backend
- **API Routes**: Next.js API routes with server components
- **Database**: Sanity.io as headless CMS
- **Authentication**: Clerk for user authentication
- **Image Handling**: Sanity for storage, with Next.js Image component for rendering

### Infrastructure
- **Hosting**: Not specified (likely Vercel)
- **Environment Variables**: .env.local for configuration

## Architecture

### User Authentication Flow
1. Users sign up/sign in using Clerk
2. Application verifies if a corresponding Sanity user exists via /api/users/check endpoint
3. If no Sanity user exists, one is created automatically via /api/users endpoint
4. User profile synchronization happens in the background with visual feedback
5. If auto-sync fails, users have a fallback manual profile setup option

### Data Schema
The application uses Sanity.io schemas for:
1. **Users**: Player profiles with stats, preferences, and authentication links
2. **Matches**: Football match details, including venues, participants, and status
3. **Venues**: Football pitch information, amenities, and availability
4. **Payments**: Financial tracking for match expenses
5. **Achievements**: In-game achievements and rewards
6. **Notifications**: System messages for users
7. **Telegram Settings**: Configuration for the Telegram bot integration

### API Structure
All API endpoints are implemented as Next.js API routes:
1. **Match APIs** (/api/matches/*)
   - GET: Fetch matches
   - POST: Create matches
   - PATCH: Update match details
   - Plus specialized endpoints for joining/leaving

2. **User APIs** (/api/users/*)
   - GET /check: Check if a user exists
   - POST: Create new users in Sanity

3. **Venue APIs** (/api/venues/*)
   - GET: Fetch available venues

### UI Structure
The application follows a modular component design:
1. **Layouts**:
   - Main layout for the dashboard with sidebar and user panel
   - Authentication layout for sign-in/sign-up flows

2. **Pages**:
   - Dashboard: Main hub showing player stats and upcoming matches
   - Matches list: Overview of all available matches
   - Match details: Detailed view of a specific match
   - Match creation: Form to create new matches
   - Profile: User statistics and preferences

3. **Components**:
   - Match cards: Display match information in a consistent format
   - Player cards: FIFA-inspired player statistics display
   - Venue selector: Interactive venue selection component
   - Action components: Join/leave match functionality
   - Background effects: Interactive gradients and visual elements

## Current Implementation Status

### Complete Features
1. **Authentication**:
   - Sign-in/sign-up with Clerk
   - User profile synchronization with Sanity
   - Manual profile creation fallback

2. **Dashboard**:
   - Player statistics card
   - Quick actions panel
   - Upcoming matches overview

3. **Match System**:
   - Match creation with venue selection
   - Match listing with filtering options
   - Match details view with participant information
   - Join/leave functionality

4. **Venues**:
   - Venue listing and selection
   - Venue details display
   - Testing tools for venue management

### In Progress/Partially Implemented
1. **Payment System**:
   - Schema defined but UI not fully implemented
   - Backend logic prepared but not connected

2. **UI Polishing**:
   - Background gradients and animations
   - Responsive layouts
   - FIFA-inspired styling

### Planned Features
1. **Telegram Integration**:
   - Match notifications
   - RSVP system
   - Group chat integration

2. **Leaderboards**:
   - Player rankings
   - Achievement tracking
   - Season statistics

3. **Advanced Match Features**:
   - Weather integration
   - Directions to venues
   - Team formation suggestions

## Code Organization

### File Structure
```
football-hub/
├── app/                       # Next.js App Router pages and layouts
│   ├── (auth)/                # Authentication routes
│   │   ├── sign-in/           # Sign-in page
│   │   ├── sign-up/           # Sign-up page
│   │   └── onboarding/        # User onboarding flow
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── matches/           # Match-related pages
│   │   │   ├── [id]/          # Match details page
│   │   │   ├── create/        # Match creation page
│   │   │   └── calendar/      # Calendar view page
│   │   ├── profile/           # User profile pages
│   │   └── payments/          # Payment tracking pages (planned)
│   ├── api/                   # API routes
│   │   ├── matches/           # Match-related endpoints
│   │   ├── users/             # User-related endpoints
│   │   └── venues/            # Venue-related endpoints
│   └── studio/                # Sanity Studio embedded in Next.js
├── components/                # React components
│   ├── ui/                    # UI primitive components
│   ├── matches/               # Match-related components
│   │   ├── MatchesList.tsx    # List of matches
│   │   ├── MatchActions.tsx   # Join/leave actions
│   │   └── VenueSelector.tsx  # Venue selection component
│   └── UserSyncIndicator.tsx  # User sync status indicator
├── lib/                       # Utility functions and helpers
│   ├── hooks/                 # Custom React hooks
│   │   └── useClerkSanityUser.ts  # User sync hook
│   ├── sanity/                # Sanity.io helpers
│   │   └── utils.ts           # Database utility functions
│   └── utils.ts               # General utilities
├── public/                    # Static assets
│   └── images/                # Image assets
├── sanity/                    # Sanity.io schema definitions
│   ├── lib/                   # Sanity client setup
│   │   └── client.ts          # Sanity client configuration
│   └── schemas/               # Schema definitions
│       ├── user.ts            # User schema
│       ├── match.ts           # Match schema
│       ├── venue.ts           # Venue schema
│       └── ...                # Other schemas
├── scripts/                   # Helper scripts
│   ├── test-venues.js         # Test venue fetching
│   ├── create-sanity-user.js  # Create test users
│   └── ...                    # Other utility scripts
├── types/                     # TypeScript type definitions
│   └── sanity.d.ts            # Sanity schema types
├── middleware.ts              # Next.js middleware for auth protection
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── sanity.config.ts           # Sanity studio configuration
└── .env.local                 # Environment variables
```

### Key Files and Their Purpose

#### Authentication and User Management
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`: Clerk sign-in page with custom styling
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`: Clerk sign-up page with custom styling
- `app/(auth)/onboarding/page.tsx`: User onboarding flow after sign-up
- `app/api/users/route.ts`: API endpoint for creating users in Sanity
- `app/api/users/check/route.ts`: API endpoint for checking if a user exists
- `lib/hooks/useClerkSanityUser.ts`: Hook for synchronizing Clerk users with Sanity

#### Dashboard and Navigation
- `app/(dashboard)/layout.tsx`: Main layout for the dashboard area with navigation
- `app/(dashboard)/dashboard/page.tsx`: Main dashboard page showing user stats and matches
- `components/ui/BackgroundGradient.tsx`: Interactive background effect for the dashboard

#### Match Management
- `app/(dashboard)/dashboard/matches/page.tsx`: List of all available matches
- `app/(dashboard)/dashboard/matches/create/page.tsx`: Form for creating new matches
- `app/(dashboard)/dashboard/matches/[id]/page.tsx`: Detailed view of a specific match
- `app/api/matches/route.ts`: API endpoint for creating and listing matches
- `app/api/matches/[id]/join/route.ts`: API endpoint for joining a match
- `app/api/matches/[id]/leave/route.ts`: API endpoint for leaving a match
- `components/matches/MatchesList.tsx`: Component for displaying list of matches
- `components/matches/VenueSelector.tsx`: Component for selecting venues during match creation
- `components/matches/MatchActions.tsx`: Component for match join/leave actions

#### Sanity Integration
- `sanity/lib/client.ts`: Sanity client configuration
- `sanity/schemas/`: Schema definitions for Sanity.io
- `types/sanity.d.ts`: TypeScript type definitions for Sanity schemas
- `lib/sanity/utils.ts`: Utility functions for interacting with Sanity

#### UI Components and Styling
- `components/ui/`: UI primitive components from shadcn/ui
- `styles/globals.css`: Global CSS styles including Tailwind directives

## Technical Implementation Details

### Authentication Flow
The application uses Clerk for authentication but maintains its own user data in Sanity:

```typescript
// In useClerkSanityUser.ts
useEffect(() => {
  // Only run this effect once per component lifecycle
  if (syncAttempted.current || syncInProgress.current) {
    return;
  }

  const syncUser = async () => {
    // Check if the user exists in Sanity through our API
    const response = await fetch(`/api/users/check?clerkId=${encodeURIComponent(user.id)}`);
    
    if (!response.ok || !data.exists) {
      // Create user via API endpoint if it doesn't exist
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ userData }),
      });
    }
  };
}, [user, clerkLoaded]);
```

On the server side, the API routes handle user creation:

```typescript
// In app/api/users/route.ts
export async function POST(request: NextRequest) {
  // Create user in Sanity with data from request
  const userData = {
    _type: 'user',
    clerkId: data.userData.clerkId,
    name: data.userData.name || 'User',
    // ...other fields
  };
  
  const user = await client.create(userData);
}
```

### Match Creation Flow
Users create matches through a multi-step form:

1. Select a date and time
2. Choose a venue
3. Configure match details (number of players, match type)
4. Submit to create the match in Sanity

The form data is sent to the API endpoint:

```typescript
// In match creation page
const handleSubmit = async (e: React.FormEvent) => {
  // Prepare match data
  const matchData = {
    title: formData.title,
    date: matchDate.toISOString(),
    venue: { _type: 'reference', _ref: formData.venue },
    // ...other fields
  };
  
  // Send to API
  const response = await fetch('/api/matches', {
    method: 'POST',
    body: JSON.stringify(matchData),
  });
};
```

On the server side, the match is created in Sanity:

```typescript
// In app/api/matches/route.ts
export async function POST(request: NextRequest) {
  // Add creator reference
  data.createdBy._ref = user._id;
  
  // Set initial filledSlots to 1 (the creator)
  data.filledSlots = 1;
  
  // Create match in Sanity
  const match = await createMatch(data);
}
```

### UI Design System
The application uses a consistent design language inspired by FIFA:

1. **Color Palette**:
   - Primary colors: Black backgrounds with amber/gold accents
   - Text colors: White text on dark backgrounds, black text on gold elements
   - Accent colors: Greens, reds, and blues for status indicators

2. **Card Components**:
   - Consistent card design with gold gradient headers
   - Semi-transparent backgrounds with backdrop blur
   - Amber/gold border accents

3. **Interactive Elements**:
   - Gold gradient buttons for primary actions
   - Hover effects with subtle animations
   - Progress bars with gradient fills

4. **Typography**:
   - Bold, extrabold for headings with gradient text
   - Medium weight for regular text
   - Smaller font sizes for secondary information

5. **FIFA-inspired Elements**:
   - Player cards with ratings
   - Match cards with venue information
   - Form indicators (W/L/D)
   - Progress bars for statistics

### Security Considerations

1. **Authentication Protection**:
   - Routes protected via Clerk middleware
   - API routes check for authenticated users

2. **Data Validation**:
   - Request validation in API routes
   - Schema validation in Sanity

3. **Environment Variables**:
   - Sensitive values stored in .env.local
   - API tokens only used in server-side code

4. **Role-based Actions**:
   - Match creators have special permissions
   - Admin flag in user schema for advanced operations

### Performance Optimizations

1. **React Optimizations**:
   - Use of useRef for values that shouldn't trigger re-renders
   - Proper dependency arrays in useEffect hooks
   - Memoization of expensive calculations

2. **Data Fetching Strategy**:
   - Server-side rendering for initial data
   - Client-side fetching for dynamic updates
   - Efficient querying with GROQ

3. **Asset Handling**:
   - Next.js Image component for optimized images
   - Progressive loading of non-critical resources

## Customization and Extension Points

The application is designed to be extensible:

1. **Sanity Schemas**:
   - New fields can be added to existing schemas
   - New content types can be created

2. **UI Components**:
   - Components are modular and reusable
   - New UI elements can be created following the design system

3. **API Routes**:
   - New endpoints can be added for additional functionality
   - Existing endpoints can be extended

## Testing and Debugging

The application includes several utilities for testing:

1. **Sanity Connection Testing**:
   - `npm run troubleshoot-sanity`: Tests Sanity configuration
   - `npm run test-venues`: Checks venue fetching
   - `npm run test-token`: Tests Sanity token permissions

2. **Data Creation Utilities**:
   - `npm run seed-venue`: Creates a test venue
   - `npm run create-user`: Manually creates a Sanity user
   - `npm run test-create-match`: Tests match creation

## Environment Setup

Required environment variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=your_sanity_token_with_editor_permissions

# Telegram Bot Configuration (planned)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_GROUP_CHAT_ID=your_telegram_group_id
```

## Common Issues and Troubleshooting

1. **Sanity Permissions**:
   - Ensure Sanity token has Editor permissions
   - Token must be used in server-side code only
   - Use the API route pattern for client-side mutations

2. **User Synchronization**:
   - If auto-sync fails, use manual profile setup
   - Check for infinite loop patterns in sync code

3. **Match Creation Issues**:
   - Ensure venues exist in the database
   - Verify user has been properly created in Sanity

4. **Data Missing in UI**:
   - Verify correct GROQ queries in Sanity utils
   - Check API response formats

## Future Development Roadmap

1. **Immediate Priorities**:
   - Complete payment tracking system
   - Implement player statistics page
   - Finalize match details enhancements

2. **Medium-term Goals**:
   - Telegram bot integration
   - Leaderboards and achievements
   - Advanced match features (weather, directions)

3. **Long-term Vision**:
   - Team formation and management
   - Season and tournament organization
   - Mobile application

## Deployment Considerations

1. **Environment Setup**:
   - Configure all required environment variables
   - Ensure Sanity token has correct permissions

2. **Build Process**:
   - Run `npm run build` to create production build
   - Verify all pages render correctly

3. **Monitoring**:
   - Set up error logging
   - Monitor API response times

## Contribution Guidelines

For developers working on this project:

1. **Code Style**:
   - Follow established patterns for components
   - Use TypeScript types for all functions and components
   - Follow the FIFA-inspired design system

2. **Testing**:
   - Use provided scripts to test Sanity integration
   - Test on mobile and desktop viewports

3. **Documentation**:
   - Update this document when adding new features
   - Document complex logic in code comments

## Conclusion

FootballHub is a comprehensive platform for organizing football matches, built with modern web technologies and following best practices for performance, security, and user experience. The FIFA-inspired design creates an engaging interface while the powerful backend enables rich functionality.

The application demonstrates effective integration of multiple services (Clerk, Sanity, Next.js) while maintaining a clean architecture and separation of concerns. The modular design allows for easy extension and customization.
