import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BookingsTrendChartProps {
  data?: Array<{ name: string; bookings: number; cancelled: number }>;
}

const DEFAULT_BOOKINGS_DATA = [
  { name: '06:00', bookings: 42, cancelled: 1 },
  { name: '08:00', bookings: 95, cancelled: 3 },
  { name: '10:00', bookings: 68, cancelled: 2 },
  { name: '12:00', bookings: 54, cancelled: 0 },
  { name: '14:00', bookings: 76, cancelled: 2 },
  { name: '16:00', bookings: 118, cancelled: 4 },
  { name: '18:00', bookings: 132, cancelled: 3 },
  { name: '20:00', bookings: 84, cancelled: 1 },
];

export const BookingsTrendChart: React.FC<BookingsTrendChartProps> = ({
  data = DEFAULT_BOOKINGS_DATA,
}) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            name="Confirmed"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cancelled"
            name="Cancelled"
            stroke="#f43f5e"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
