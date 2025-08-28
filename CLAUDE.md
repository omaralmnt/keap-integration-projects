# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Keap (Infusionsoft) API integration project with multiple implementations demonstrating different approaches to working with Keap's various APIs. The project contains four main components:

1. **restv1/** - React frontend using Keap REST API v1
2. **xmlrpc/** - React frontend using Keap XML-RPC API 
3. **server/** - Express.js proxy server for API requests
4. **keap-resthooks/** - Google Cloud Function for webhook handling
5. **phpsdkv1/** - PHP SDK v1 implementation examples

## Development Commands

### REST API v1 Frontend (restv1/)
```bash
cd restv1
npm start          # Run development server on default port
npm run build      # Build for production
npm test           # Run tests
```

### XML-RPC Frontend (xmlrpc/)
```bash
cd xmlrpc
npm start          # Run development server on port 3001
npm run build      # Build for production
npm test           # Run tests
```

### Express Server (server/)
```bash
cd server
npm start          # Run production server
npm run dev        # Run with nodemon for development
```

### Webhook Handler (keap-resthooks/)
```bash
cd keap-resthooks
npm start          # Start Google Cloud Functions Framework
```

### PHP Implementation (phpsdkv1/)
```bash
cd phpsdkv1
composer install   # Install dependencies
php src/test.php    # Run test scripts
```

## Architecture

### Frontend Applications (React)
Both `restv1/` and `xmlrpc/` are React applications with similar structure:
- **Authentication flow**: OAuth2 with login/callback pages
- **Protected routes**: All main application routes wrapped in `ProtectedRoute` component
- **Layout system**: Shared `Layout` component with `Header` and `Sidebar`
- **Component organization**: Feature-based folders (contacts, products, orders, etc.)
- **API integration**: Service layer abstracts API calls
- **Styling**: Tailwind CSS for styling, Lucide React for icons
- **Notifications**: React Toastify for user feedback

Key differences:
- `restv1/` uses standard REST API calls via axios
- `xmlrpc/` uses XML-RPC protocol with `xmlrpc-parser` library
- `xmlrpc/` runs on port 3001 to avoid conflicts

### Backend Services

**Express Server (server/):**
- Proxy server for handling API requests
- Routes in `routes/` directory
- Controllers in `controllers/` directory
- Environment variable configuration via dotenv
- CORS handling (currently commented out)

**Webhook Handler (keap-resthooks/):**
- Google Cloud Function for processing Keap webhooks
- PostgreSQL database integration for event storage
- Handles webhook verification and event processing
- Connection pooling for database efficiency

### API Service Layer
Both frontends use similar service patterns:
- `httpClient.js` - Axios configuration and interceptors
- `keapAPI.js` - API method implementations
- Error handling with user-friendly messages
- Parameter cleaning and validation
- Date formatting utilities

### Component Architecture
- **UI Components**: Reusable components in `ui/` folder (Button, Card, Modal, etc.)
- **Feature Components**: Domain-specific components grouped by functionality
- **Selectors**: Reusable selection components (ContactSelector, ProductSelector, etc.)
- **Auth Components**: OAuth flow handling
- **Layout Components**: Application shell and navigation

## Key Integration Points

### Keap API Endpoints Covered:
- Contacts (CRUD, tagging, profiles)
- Products (catalog, inventory management)  
- Orders (creation, management, payments)
- Campaigns and email marketing
- Companies and users
- Appointments and tasks
- Files and notes
- Webhooks (REST hooks)
- Application settings

### Authentication
- OAuth2 flow with redirect handling
- Token storage and refresh logic
- Protected route system

### Data Flow
1. Frontend makes API calls through service layer
2. Requests go through Express proxy server (for additional processing)
3. Server communicates with Keap API endpoints
4. Responses processed and returned to frontend
5. UI updates with success/error notifications

## Environment Configuration
- Server requires environment variables for Keap API credentials
- Database configuration needed for webhook handler
- Frontend apps configured for different ports to run simultaneously

## Testing
Standard React Testing Library setup with Jest. Use `npm test` in respective frontend directories.