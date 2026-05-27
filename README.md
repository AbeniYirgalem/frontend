## Bus Ticketing System - Frontend

A Next.js 16 app for bus ticket booking, RFID wallet management, live transit tracking, and admin/operator dashboards.

### Features

- Role-based dashboards for admin, operator, and passenger
- Ticket search, booking flow, and trip history
- RFID wallet recharge and management
- Live transit map and real-time updates (Socket.IO)
- Notifications, reviews, and system monitoring views

### Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Mongoose + NextAuth
- Socket.IO client, Leaflet maps, Radix UI

### Getting Started

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` with the required values (see Environment Variables below).

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

### Environment Variables

Required:

- `NEXT_PUBLIC_API_URL` - Base API URL used by the frontend (example: `http://localhost:5000/api`).
- `MONGODB_URI` - MongoDB connection string (used by server-side code).

Optional:

- `NEXT_PUBLIC_SOCKET_URL` - Socket.IO server URL. Falls back to `NEXT_PUBLIC_API_URL` without `/api`.
- `TELEBIRR_API_BASE` - Telebirr API base URL (defaults to Telebirr sandbox).
- `TELEBIRR_FABRIC_APP_ID`
- `TELEBIRR_APP_SECRET`
- `TELEBIRR_MERCHANT_APP_ID`
- `TELEBIRR_MERCHANT_CODE`
- `TELEBIRR_PUBLIC_KEY`

### Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build production output
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

- [src/app](src/app) - App Router pages and layouts
- [src/components](src/components) - UI and feature components
- [src/services](src/services) - API clients
- [src/hooks](src/hooks) - Reusable React hooks
- [src/lib](src/lib) - Utilities (auth, db, payment)
- [src/models](src/models) - Mongoose models
- [src/providers](src/providers) - Context providers
- [src/types](src/types) - Shared TypeScript types
- [src/utils](src/utils) - Helpers and validators

### Notes

- Update [next.config.ts](next.config.ts) if you need to change image, API, or build settings.
- Tailwind configuration is in [postcss.config.mjs](postcss.config.mjs) and [src/app/globals.css](src/app/globals.css).
