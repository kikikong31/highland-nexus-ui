# Scottish Highland Games Management System

Highland Nexus - A Complete Highland Games Management System

## Features

- User Login and Registration
- Homepage/Project Introduction
- Competition List and Details Display
- Online Registration System
- Personal Center (View Application Records)
- Map Display of Competition Locations
- Winners List Display
- Admin Backend (CRUD Operations)
- Chinese and English Language Switching

## Tech Stack

- Vue 3 (Composition API)
- Vue Router 4
- Pinia
- Element Plus
- Vue-i18n
- Vite

## Installation and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

Check and modify the corresponding backend startup port in: highland-nexus-ui\src\api\config.js
```

## Default Accounts

- Standard User: user@example.com / password123
- Administrator: admin@example.com / admin123

## Project Structure

```
src/
├── assets/          # Static Resources
├── components/      # General Components
├── views/          # Page Components
├── router/         # Router Configuration
├── stores/         # Pinia State Management
├── locales/        # Internationalization Language Files
├── api/            # APIInterfaces
├── mock/           # Mock Data
└── utils/          # Utility Functions
```
