# Overview

This is a Patient Management System for Saphenus Medical Technology, focused on prosthetic sensory feedback and care. The system provides a comprehensive platform for patients to manage their Suralis sensory feedback system, track health metrics, communicate with medical staff, and monitor their treatment progress. The application serves patients who have prosthetic devices with integrated sensory feedback technology.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Git Version Control Setup (August 5, 2025)
- Enhanced .gitignore configuration for comprehensive file exclusion
- Created comprehensive README.md with project overview and Git workflow
- Developed DEPLOYMENT-GUIDE.md with detailed step-by-step deployment instructions
- Built automated Git workflow script (scripts/git-workflow.sh) for streamlined development
- Added testing verification script (scripts/test-setup.sh) for environment validation
- Established branch strategy: main (production) -> develop (testing) -> feature/* (development)
- Documented manual Git workflow due to Replit Git protections
- Prepared infrastructure for production deployment synchronization

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **UI Components**: Radix UI primitives with Tailwind CSS for styling, implementing a professional design system
- **State Management**: TanStack Query for server state management with custom hooks for different data domains
- **Charts**: Recharts library for data visualization including health metrics trends and progress tracking
- **Authentication**: Hook-based authentication system with localStorage persistence and session management

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Session Management**: Express sessions with passport.js for authentication using local strategy
- **API Structure**: RESTful endpoints organized by domain (users, patients, appointments, prescriptions, etc.)
- **Middleware**: CORS handling, request logging, and authentication middleware
- **Database Layer**: Abstracted through a storage interface pattern for flexible data access

## Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless) with comprehensive schema for medical data
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Schema Design**: Normalized tables for users, patients, medical staff, appointments, health metrics, prescriptions, device alerts, messages, and support requests

## Authentication and Authorization
- **Strategy**: Passport.js local strategy with username/password authentication
- **Session Storage**: Memory store with configurable expiration (24 hours)
- **Role-based Access**: User roles (patient, doctor, admin) with appropriate data access controls
- **Security**: CORS configuration, secure session cookies, and request validation

## External Dependencies
- **Database**: Neon serverless PostgreSQL for cloud-hosted database services
- **UI Library**: Extensive Radix UI component library for accessible interface components
- **Styling**: Tailwind CSS with custom theme configuration and dark mode support
- **Form Handling**: React Hook Form with Zod for validation and type safety
- **Date Utilities**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Development Tools**: ESBuild for production builds, TSX for development server, and various TypeScript utilities