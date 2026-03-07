# CLAUDE.md — DeepFrame Media Dashboard

This file provides guidance for AI assistants working on this codebase.

## Project Overview

**DeepFrame Media Dashboard** is a real-time WhatsApp messaging dashboard that enables human agents to monitor, take over, and manage AI-driven customer conversations. It features AI/human handoff, message history, browser notifications, and audio message playback.

**Architecture:** React SPA (frontend) + external backend API (not in this repo)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 with JSX |
| Build Tool | Vite 6 |
| Routing | react-router-dom v6 |
| State Management | Zustand v5 |
| Real-time | Socket.IO client |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Deployment | Netlify |
| PWA | vite-plugin-pwa |

---

## Project Structure

```
src/
├── main.jsx                    # React entry point (ReactDOM.createRoot)
├── App.jsx                     # Router setup + ProtectedRoute component
├── index.css                   # Global styles, animations, Tailwind base
├── api/
│   └── client.js               # Axios instance with JWT auth interceptors
├── pages/
│   ├── LoginPage.jsx           # Login form with email/password + JWT auth
│   └── DashboardPage.jsx       # Main container: conversations + chat layout
├── components/
│   ├── ChatView/
│   │   ├── ChatView.jsx        # Chat container, message fetching, polling
│   │   ├── ChatHeader.jsx      # Conversation header with AI/human controls
│   │   ├── ChatInput.jsx       # Message input, window status display
│   │   ├── MessageList.jsx     # Scrollable message list with infinite scroll
│   │   └── MessageBubble.jsx   # Individual message renderer (text + audio)
│   ├── Sidebar/
│   │   ├── Sidebar.jsx         # Conversation list with search
│   │   └── ConversationItem.jsx # Conversation row with unread badge
│   ├── EmptyState.jsx          # Placeholder when no conversation selected
│   ├── StatusBadge.jsx         # AI/human mode indicator badge
│   └── Toast.jsx               # Notification toast system
├── hooks/
│   └── useSocket.js            # Socket.IO connection + event listeners
├── store/
│   └── useStore.js             # Zustand global state store
└── utils/
    └── format.js               # Date/time formatting + audio URL parsing
```

---

## Development Workflow

### Setup

```bash
npm install
cp .env.example .env            # Configure VITE_API_URL
npm run dev                     # Dev server at http://localhost:5173
```

### Available Scripts

```bash
npm run dev        # Vite dev server with Fast Refresh
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

### Environment Variables

Only one required variable (must use `VITE_` prefix to be accessible in frontend):

```env
VITE_API_URL=http://localhost:3000   # Backend API base URL
```

Access in code via `import.meta.env.VITE_API_URL`.

---

## Architecture & Key Patterns

### Authentication

- JWT-based auth. Token stored in `localStorage` as `dashboard_token`.
- Login: POST `/dashboard/auth/login` → receives JWT + user data.
- `api/client.js` auto-attaches token to every request (`Authorization: Bearer`).
- 401 responses automatically clear session and redirect to `/login`.
- JWT payload contains: `email`, `nombre`, `clienteNombre` (multi-tenant support).

### State Management (Zustand)

The single store (`src/store/useStore.js`) holds:
- Auth state: `user`, `token`
- Conversations list and selected conversation ID
- Messages for the active conversation
- UI state: toasts, unread counts, loading flags

**Critical pattern:** Socket.IO event handlers use `useStore.getState()` (not hook) to avoid stale closures:

```js
// Correct - avoids stale closure in event callbacks
const { conversations } = useStore.getState();

// Wrong - causes stale closure inside socket listeners
const { conversations } = useStore();
```

### Real-time + Polling Strategy

The app uses a hybrid approach:
- **Socket.IO** for instant updates (`new_message`, `conversation_update` events)
- **Polling fallback** to compensate for missed webhooks:
  - Conversations: every **15 seconds**
  - Messages (active chat): every **10 seconds**
  - Window status (WhatsApp 24h window): every **60 seconds**

### API Endpoints

Base: `{VITE_API_URL}/dashboard`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Authenticate, get JWT |
| GET | `/conversations` | List all conversations |
| GET | `/conversations/:id/messages` | Paginated messages (param: `before` timestamp) |
| GET | `/conversations/:id/window` | WhatsApp 24h window status |
| POST | `/conversations/:id/send` | Send a message |
| POST | `/conversations/:id/takeover` | Switch to human agent mode |
| POST | `/conversations/:id/release` | Return to AI mode |
| PATCH | `/conversations/:id/contact-name` | Update contact display name |
| GET | `/media/proxy` | Proxy audio (CORS bypass + auth) |

### Socket.IO Events

- `new_message` — payload: `{ conversation_id, message }` — add message to store
- `conversation_update` — payload: `{ conversation_id, modo }` — update AI/human mode

---

## Styling Conventions

Tailwind CSS only. No separate CSS files except `index.css` (global base styles).

**Color palette (WhatsApp-inspired dark theme):**

| Role | Color |
|------|-------|
| Background | `#111b21` |
| Primary action (green) | `#00a884` |
| Primary text | `#e9edef` |
| Secondary/muted text | `#8696a0` |
| Input background | `#2a3942` |
| Sent message bubble | `#005c4b` |
| Received bubble | `#202c33` |

**Responsive breakpoints:** Mobile-first design with `md:` breakpoints for desktop layout.

---

## Component Conventions

- **All components are functional** with React hooks — no class components.
- **File naming:** PascalCase for components, camelCase for hooks/utilities.
- **Infinite scroll pattern:** `useRef` to preserve scroll position when prepending older messages; `useLayoutEffect` for scroll restoration before paint.
- **Form refs:** Input values accessed via `useRef` (not controlled state) for performance.
- **Browser notifications:** Triggered when tab is in background (`document.hidden`).

---

## Message Format

- **Standard text:** Plain string in `message.contenido`
- **Audio messages:** Content starts with `[AUDIO_URL:https://...]` — parsed by `utils/format.js` `parseAudioUrl()`
- **Audio playback:** Proxied through `/media/proxy` to handle auth + CORS
- **Message roles:** `user` (customer), `assistant` (AI bot), `human_agent`

---

## Deployment

**Platform:** Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing: all 404s redirect to `/index.html` (configured in `netlify.toml`)

**PWA:** Configured via `vite-plugin-pwa`. Service worker is auto-updated on new deploys.

---

## What Does Not Exist (Yet)

- **No tests** — no testing framework configured (no Vitest, Jest, or RTL)
- **No linter config** — no ESLint or Prettier configuration files
- **No CI/CD pipeline** — no GitHub Actions or other automation
- **No backend code** — backend lives in a separate repository

---

## Common Tasks

### Add a new API call
1. Import `apiClient` from `src/api/client.js`
2. Call `apiClient.get/post/patch(...)` — auth header is injected automatically
3. Handle errors; 401s are globally handled (auto-logout)

### Add a new global state field
1. Open `src/store/useStore.js`
2. Add initial value in the `create()` call
3. Add a setter action alongside it
4. In event handlers/sockets, read via `useStore.getState()` not the hook

### Add a new Socket.IO event
1. Open `src/hooks/useSocket.js`
2. Add `socket.on('event_name', handler)` inside the `useEffect`
3. Add corresponding `socket.off('event_name', handler)` in the cleanup return
4. Use `useStore.getState()` inside handlers to access current state

### Add a new page/route
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Wrap with `<ProtectedRoute>` if authentication is required
