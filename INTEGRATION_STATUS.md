# SmartMove database integration

Backend Oracle CRUD endpoints: vehicles, drivers, routes, trips, passengers, bookings, payments, maintenance, feedback. MongoDB CRUD: announcements, community. Frontend service operations now use these APIs.

## Important limitations / local checks
- Live Oracle/MongoDB connectivity and actual database constraints cannot be tested in this environment. Back up databases before trying changes.
- Several original UI fields have no matching Oracle column (addresses, route status, license expiry, etc.) and are not persisted.
- Route stops need a separate child-table editor; current route service maps stops to an empty list.
- Booking API accepts one seat per booking, and booking delete is intentionally disabled; use cancellation. The database seat triggers are responsible for seat counts.
- Trip/booking/payment UI display fields derived from related tables are not all enriched in the current adapter.
- Route code is generated on creation because the original form does not request it.
- Maintenance form may need odometer and next-service odometer fields; existing service supplies defaults but should be reviewed.
- MongoDB announcements collection document shape may need mapping to existing data.
- Review frontend screens and run `npm run lint` and `npm run build` with dependencies installed.
- The supplied schema contains an incomplete SP_BOOK_TICKET procedure. Do not rerun the entire SQL schema against a populated database.
- Do not include .env in shared archives. Copy your existing backend .env into src/backend/.env.
