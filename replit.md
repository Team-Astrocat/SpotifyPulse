# RedTunes - Custom Spotify Client

## Overview
RedTunes is a custom Spotify client application built with a modern full-stack architecture. It provides a highly customizable interface with red and black theming, featuring full playlist management, audio controls, and Spotify integration. The application is designed as a single-page application (SPA) with server-side API endpoints for Spotify authentication and data management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Icons**: Font Awesome and Lucide React icons

### Backend Architecture  
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with planned PostgreSQL session store
- **Authentication**: OAuth 2.0 flow with Spotify API

### Development Tools
- **Type System**: TypeScript with strict configuration
- **Code Quality**: ESLint integration through Vite
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **OAuth Flow**: Implements Spotify OAuth 2.0 authorization code flow
- **Token Management**: Handles access token refresh and expiration
- **Session Storage**: User sessions stored in database with automatic cleanup
- **Protected Routes**: Client-side route protection based on authentication state

### Database Schema
- **Users Table**: Stores Spotify user profile data and OAuth tokens
- **Playlists Table**: Manages user playlists with metadata
- **Tracks Table**: Caches track information to reduce API calls
- **User Settings Table**: Stores user preferences including themes and playback settings

### Spotify Integration
- **Web Playback SDK**: Direct audio streaming through Spotify's JavaScript SDK
- **API Wrapper**: Custom service layer for Spotify Web API interactions
- **Real-time Playback**: Live playback state synchronization
- **Search Functionality**: Real-time search with debouncing and caching

### Theming System
- **CSS Variables**: Dynamic theme switching using CSS custom properties
- **Predefined Themes**: Multiple built-in color schemes (red-black, blue-dark, purple-dark, green-dark)
- **Custom Themes**: User-defined color customization with live preview
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

### Authentication Flow
1. User initiates login → Redirect to Spotify OAuth
2. Spotify callback → Exchange code for tokens
3. Store user data and tokens → Create database session
4. Client receives authentication state → Initialize Spotify SDK

### Music Playback Flow
1. User selects track → API request to play track
2. Spotify SDK receives command → Begin audio streaming
3. Playback state updates → Real-time UI synchronization
4. User controls (play/pause/skip) → Direct SDK interaction

### Data Synchronization
1. Client queries server endpoints → TanStack Query cache management
2. Server fetches from Spotify API → Database caching layer
3. Real-time updates via polling → Optimistic UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Modern icon library

### Development Dependencies
- **typescript**: Static type checking
- **vite**: Build tool and dev server
- **@vitejs/plugin-react**: React support for Vite

## Deployment Strategy

### Production Build
- **Client Build**: Vite bundles React app to static assets
- **Server Build**: esbuild compiles TypeScript server to ESM
- **Asset Serving**: Express serves static files in production

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Spotify API**: Client credentials via environment variables
- **Session Security**: Configurable session secrets and timeouts

### Scalability Considerations
- **Database Connection Pooling**: Neon serverless handles connection scaling
- **API Rate Limiting**: Spotify API calls optimized with caching
- **Session Storage**: Designed to scale from memory to database

## Changelog
- July 01, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.