# Overview

This project is a comprehensive Google Maps scraper application that extracts detailed business information from Google Maps using the Google Places API. The application provides both single and bulk search capabilities, allowing users to search for businesses, restaurants, and other locations with advanced filtering options. It features a modern React frontend with TypeScript and a Node.js/Express backend that handles API interactions and data processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 19 and TypeScript using Create React App as the foundation. The frontend follows a component-based architecture with:

- **Component Structure**: Modular components including Header, SearchForm, ResultsDisplay, and PlaceCard for clean separation of concerns
- **State Management**: Uses React hooks (useState) for local state management without external state libraries
- **Type Safety**: Full TypeScript integration with custom interfaces for PlaceResult, SearchFilters, and API responses
- **HTTP Client**: Axios for API communication with environment-aware base URL configuration
- **Styling**: CSS-based styling with Google-inspired design system using CSS custom properties

## Backend Architecture
The server is built with Node.js and Express, implementing a RESTful API structure:

- **Route Organization**: Dedicated routes module (`routes/places.js`) for place-related endpoints
- **Service Layer**: Separate services for business logic including `placesService.js` for API interactions and `csvExporter.js` for data export
- **Middleware Stack**: Security-focused middleware including Helmet for security headers, CORS for cross-origin requests, and express-rate-limit for API protection
- **Environment Configuration**: Uses dotenv for environment variable management with production/development awareness

## API Integration Strategy
The application integrates with Google Places API (new Places API) using:

- **Text Search**: Primary search functionality using the `places:searchText` endpoint
- **Place Details**: Enhanced data retrieval for comprehensive business information
- **Field Masking**: Optimized API calls by requesting only necessary fields
- **Error Handling**: Comprehensive error handling with fallback mechanisms and user-friendly error messages

## Data Processing Pipeline
- **Search Processing**: Supports both single query and bulk search operations (up to 10 queries per bulk request)
- **Data Enrichment**: Automatic enhancement of basic place data with detailed information including reviews, photos, and business hours
- **Export Functionality**: CSV and JSON export capabilities with structured data formatting

# External Dependencies

## Google Services
- **Google Places API (new)**: Primary data source for business information, location data, reviews, and photos
- **API Key Configuration**: Requires `GOOGLE_PLACES_API_KEY` environment variable for authentication

## Core Technologies
- **React 19.1.1**: Frontend framework with latest features and TypeScript support
- **Node.js**: Backend runtime (minimum version 18.0.0)
- **Express 4.18.2**: Web server framework with middleware ecosystem

## Development and Build Tools
- **TypeScript 4.9.5**: Type safety and enhanced development experience
- **React Scripts 5.0.1**: Build tooling and development server
- **Concurrently 8.2.2**: Parallel execution of client and server during development

## Production Dependencies
- **Axios 1.12.2**: HTTP client for API communication
- **CORS 2.8.5**: Cross-origin request handling
- **Helmet 7.1.0**: Security middleware for HTTP headers
- **Express Rate Limit 7.1.5**: API rate limiting and abuse prevention
- **CSV Writer 1.6.0**: Data export functionality for CSV format

## Deployment Configuration
- **Replit Compatibility**: Environment-aware CORS configuration and proxy trust settings
- **Production Optimization**: Environment-based API URL resolution and security configurations