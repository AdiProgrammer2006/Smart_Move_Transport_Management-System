import { useEffect, useState } from "react";
import { getTrips, getAnnouncements } from "./services/api";

export default function DatabaseTest() {
  const [trips, setTrips] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tripData, announcementData] = await Promise.all([
          getTrips(),
          getAnnouncements()
        ]);

        setTrips(tripData);
        setAnnouncements(announcementData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading SmartMove data...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>SmartMove Database Connection Test</h1>

      <h2>Oracle Trips</h2>

      {trips.map((trip) => (
        <div key={trip.TRIP_ID}>
          <h3>{trip.ROUTE_NAME}</h3>
          <p>
            {trip.ORIGIN_CITY} → {trip.DESTINATION_CITY}
          </p>
          <p>Available Seats: {trip.AVAILABLE_SEATS}</p>
          <p>Status: {trip.STATUS}</p>
          <hr />
        </div>
      ))}

      <h2>MongoDB Announcements</h2>

      {announcements.map((announcement) => (
        <div key={announcement._id}>
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}