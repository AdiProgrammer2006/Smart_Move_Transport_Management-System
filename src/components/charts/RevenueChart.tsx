import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatLKR } from '../../utils/formatters';

interface RevenueChartProps {
  data?: Array<{ name: string; revenue: number; bookings: number }>;
}

const DEFAULT_REVENUE_DATA = [
  { name: 'Mon', revenue: 145000, bookings: 88 },
  { name: 'Tue', revenue: 168000, bookings: 104 },
  { name: 'Wed', revenue: 152000, bookings: 95 },
  { name: 'Thu', revenue: 189000, bookings: 118 },
  { name: 'Fri', revenue: 265000, bookings: 165 },
  { name: 'Sat', revenue: 310000, bookings: 194 },
  { name: 'Sun', revenue: 280000, bookings: 176 },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = DEFAULT_REVENUE_DATA }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `LKR ${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(value: any) => [formatLKR(Number(value)), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
