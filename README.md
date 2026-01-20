# Remote Control App

A full-stack application for remotely sending sleep/shutdown warnings to a Windows PC and triggering system shutdown. Built with Node.js/Express backend and React frontend.

**Windows-only** - relies on PowerShell and Windows MessageBox API for notifications.

## Features

- Remote shutdown trigger with 5-second delay
- Sleep reminder notifications via Windows MessageBox dialog
- Real-time status tracking (acknowledged/dismissed)
- Mobile-friendly web interface
- Silent background operation mode

## Prerequisites

- Node.js (v16+)
- Windows OS (for notification and shutdown features)

## Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
```

## Usage

### Development

```bash
# Start server with auto-reload
npm run dev

# In another terminal, start client dev server
cd client && npm run dev
# Access at http://localhost:5173
```

### Production

```bash
# Build the React client
cd client && npm run build

# Start the server
npm start
# Access at http://localhost:3000
```

### Silent Launch (Windows)

Double-click `start_silently.vbs` to run the server in the background without a console window.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shutdown` | Triggers Windows shutdown (5s delay) |
| POST | `/api/notify` | Shows sleep reminder dialog |
| GET | `/api/status` | Returns current notification status |

## Project Structure

```
remote-control-app/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   └── App.jsx      # Main React component
│   └── dist/            # Production build output
├── server/
│   └── index.js         # Express backend
├── public/              # Static files (vanilla JS fallback)
├── package.json
├── start_silently.vbs   # Windows silent launcher
└── server.log           # Server logs
```

## License

MIT
