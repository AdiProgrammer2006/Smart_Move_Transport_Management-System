import React, { useEffect, useState } from 'react';
import {
  getTrips,
  getAnnouncements,
  type Trip,
  type Announcement
} from '../../services/api';

export function DatabaseTestPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(
          err instanceof Error ? err.message : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading database data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        SmartMove Database Connection Test
      </h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Oracle Trips
        </h2>

        {trips.map((trip) => (
          <div
            key={trip.TRIP_ID}
            className="border rounded-lg p-4 mb-3"
          >
            <h3 className="font-bold">{trip.ROUTE_NAME}</h3>
            <p>
              {trip.ORIGIN_CITY} → {trip.DESTINATION_CITY}
            </p>
            <p>Trip ID: {trip.TRIP_ID}</p>
            <p>Available seats: {trip.AVAILABLE_SEATS}</p>
            <p>Status: {trip.STATUS}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          MongoDB Announcements
        </h2>

        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className="border rounded-lg p-4 mb-3"
          >
            <h3 className="font-bold">{announcement.title}</h3>
            <p>{announcement.message}</p>
          </div>
        ))}
      </section>
    </div>
  );
}