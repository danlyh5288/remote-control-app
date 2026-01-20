# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remote Control Shutdown & Notification Application - a full-stack app that sends sleep/shutdown warnings to a Windows PC and can remotely trigger shutdown. The application uses Chinese language localization for the UI.

**Windows-only deployment** - relies on PowerShell and Windows MessageBox API for notifications.

## Commands

### Development
```bash
# Server (with auto-reload)
npm run dev

# Client (Vite dev server with hot reload)
cd client && npm run dev
# Access at http://localhost:5173 (proxies /api to :3000)
```

### Production
```bash
cd client && npm run build   # Build React app to dist/
npm start                    # Run Express server on port 3000
```

### Linting
```bash
cd client && npm run lint
```

### Silent Launch (Windows)
```bash
start_silently.vbs           # Runs server in background without console
```

## Architecture

**Stack**: Node.js/Express backend + React 19/Vite frontend (monorepo structure)

### Backend (server/index.js)
- Serves React SPA from `/client/dist`
- `POST /api/shutdown` - Executes Windows shutdown command (`shutdown /s /t 5`)
- `POST /api/notify` - Shows Windows MessageBox dialog via PowerShell with Yes/No prompts
- `GET /api/status` - Returns notification status for polling
- All operations logged to `server.log` with timestamps

### Frontend (client/src/App.jsx)
- Single component with two main actions:
  - Shutdown button: Confirms and triggers 10-second delayed shutdown
  - Warning button: Shows Windows notification, polls status every 2 seconds
- Status states: idle, sending, sent, acknowledged, dismissed, timeout
- Polls `/api/status` up to 30 times (60 seconds max)

### Key Design Decisions
- **Polling over WebSockets**: Frontend polls backend status every 2 seconds
- **Dual frontend**: Both React and vanilla JS versions exist in `/public` (React is actively used)
- **System commands**: Uses `child_process.exec()` for PowerShell/cmd execution
