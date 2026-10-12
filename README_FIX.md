# SmartMove repair package

This copy restores the missing `src/services/index.ts` so existing dashboard pages can import their services. These restored dashboard services use localStorage-backed **demo data**; they are NOT wired to Oracle/MongoDB.

`src/services/api.ts` remains the live API test client. The backend in the uploaded ZIP is under `src/backend`, not `backend` at the root. Do not commit secrets. Configure your local `src/backend/.env` separately.

Run `npm install` then `npm run dev` in the project root. For the backend, run `cd src/backend`, `npm install`, `node server.js`.

The real database integration of all dashboard CRUD operations needs additional API routes and frontend field mapping.
