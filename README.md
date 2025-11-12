# Jeopardy Generator (local-first)

This is a small React + Vite app for building and playing Jeopardy-style boards. It stores boards locally in your browser by default and can be extended to use a remote backend (e.g., Supabase) if you want to sync boards across machines.

This README explains how to clone, run, and use the project locally.

## Prerequisites

- Node.js (recommended 16+ or 18+)
- npm (or yarn/pnpm)
- A modern browser (Chrome / Edge / Firefox)

## Clone and run (development)

Open a terminal and run:

```powershell
# clone the repository (replace <repo-url> with your remote or use local path)
git clone <repo-url>

# change into the app folder
cd 'd:\Projects\Personal Projects\Jeopardy-Generator-2.0\jeopardy'

# install deps
npm install

# start dev server (Vite)
npm run dev
```

When Vite starts it will print the local dev URL (usually `http://localhost:5173`). Open that in your browser.

If you prefer macOS/Linux, use the equivalent shell commands.

## Build / Preview

To create a production build and preview it locally:

```powershell
npm run build
npm run preview
```

## How boards are stored

- Boards are saved to your browser's localStorage under the key `jeopardy_boards_v1`.
- The app exposes a small local storage service at `src/services/localStorage.js` and a hook `useLocalBoards()` that components use to read and mutate boards.

If you want to clear all locally-saved boards, open your browser DevTools Console and run:

```js
localStorage.removeItem("jeopardy_boards_v1");
// then reload the page
location.reload();
```

## Play & Edit notes

- Use the **Make Board** screen to create and edit boards.
- In Build mode you can edit category titles and questions. When editing a saved board, changes are persisted to localStorage immediately.
- In Play mode you can claim/unclaim questions by opening a cell and using the claim button. There's also a **Reset Claims** button in the header that clears all claimed marks on the current board.

## Optional: Supabase remote sync (experimental)

If you'd like to use Supabase instead of localStorage so boards are available across machines, you can implement a simple adapter.

Minimal steps:

1. Create a Supabase project and table to store boards (JSON column for the board object).
1. Add the client package:

```powershell
npm install @supabase/supabase-js
```

1. Create Vite env vars in `.env.local` (do NOT commit this file):

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

1. Implement a small service `src/services/remoteStorage.js` that exports the same functions as the local storage service (getBoards, addBoard, updateBoard, removeBoard, ...). Then add an adapter (or a `useBoards()` hook) that chooses remote vs local based on the presence of the VITE env vars.

If you'd like I can scaffold this adapter for you.

## Troubleshooting

- If changes don't persist, make sure your browser allows localStorage and you're not in a strict private mode that disables it.
- Use the browser DevTools Console to inspect `localStorage.getItem('jeopardy_boards_v1')` and confirm the stored JSON.
- If you don't see console logs added by the app, ensure you're running the dev server (Vite) — production builds may minify or remove debug output.
- React DevTools is very helpful for inspecting component state. Install it here: [React DevTools](https://react.dev/link/react-devtools).

## Contributing / Development notes

- The app is built with React and Vite. Source is under `src/` and routes live in `src/Routes`.
- Key files:
  - `src/services/localStorage.js` — local persistence layer and `useLocalBoards()` hook
  - `src/Components/Board/Board.jsx` — main board UI (build & play modes)
  - `src/Routes/MakeBoard/MakeBoard.jsx` — board editor/preview

If you want tests added or CI, tell me which test runner you prefer and I can scaffold a few unit tests.

---

Enjoy building boards! If you'd like remote sync or an autosave feature, say the word and I can implement it next.
