# Drivers Oracle integration

Drivers now use POST/PUT/DELETE /api/drivers and GET /api/drivers. The supplied schema requires LICENSE_CLASS and uses SEQ_DRIVERS.NEXTVAL for IDs. Existing vehicle functionality remains.

**Schema limitation:** DRIVERS has no LICENSE_EXPIRY_DATE, ADDRESS or EMERGENCY_CONTACT columns. These existing UI fields are not saved; they are optional/display-only. To persist them, add columns with a separately reviewed migration. No fake data is written for these fields.

**Test:** Configure src/backend/.env (never commit passwords), start MongoDB and Oracle, run `node server.js` from src/backend, run `npm install` and `npm run dev` from project root, create/edit/delete a test driver and confirm in SQL Developer with `SELECT * FROM DRIVERS ORDER BY DRIVER_ID DESC;`. Deleting a driver referenced by TRIPS or FEEDBACK_REVIEWS will be blocked by foreign keys. Back up the database first.

The prior partial ZIP had a duplicate vehicle POST route nested inside startServer; this ZIP removes it.
