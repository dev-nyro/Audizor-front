# Audizor Development Guidelines

## Project Overview
Audizor is a Next.js application for audio/video transcription services with features including:
- User authentication via Supabase
- Media file upload and processing
- Transcript generation and viewing
- Interactive audio player with synchronized transcript
- Chat interface for querying transcripts

## Tech Stack
- Framework: Next.js 14+ with App Router
- Auth/Database: Supabase
- Styling: Tailwind CSS
- UI Components: shadcn/ui with Radix UI
- Form Handling: React Hook Form with Zod validation
- API: Server Actions for data operations

## Build and Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npx jest path/to/file.test.ts` - Run a single test file

## Code Style Guidelines
- **TypeScript**: Use strict typing with interfaces/types and explicit generics
- **Imports**: Use absolute imports with `@/` prefix grouped by external/internal
- **Components**: 
  - Use functional components with React hooks
  - Mark client components with "use client" directive
  - Use async/await for server components
- **Naming**: 
  - PascalCase for components and types
  - camelCase for functions/variables
  - kebab-case for file names
- **CSS**: Use Tailwind utility classes with the `cn()` utility for conditional classes
- **UI Components**: Leverage shadcn/ui patterns with variants using class-variance-authority
- **Error Handling**: Use try/catch with toast notifications for user feedback
- **File Structure**: 
  - `/app` - Next.js pages and layouts
  - `/components` - Reusable UI components
  - `/lib` - Utility functions and services
  - `/hooks` - Custom React hooks
- **State Management**: Use React hooks with prop drilling for simple state

## Authentication
Authentication is handled through Supabase with email/password and OAuth options.
Use the auth utilities in `/lib/auth.ts` for auth operations.

## Testing
Tests are written with Jest and follow the pattern `**/__tests__/**/*.test.ts`