import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PopularRoutesChartProps {
  data?: Array<{ route: string; passengers: number }>;
}

const DEFAULT_POPULAR_ROUTES = [
  { route: 'Colombo ↔ Kandy', passengers: 420 },
  { route: 'Colombo ↔ Galle', passengers: 380 },
  { route: 'Colombo ↔ Airport', passengers: 310 },
  { route: 'Colombo ↔ Matara', passengers: 260 },
  { route: 'Colombo ↔ Jaffna', passengers: 190 },
  { route: 'Kandy ↔ Kurunegala', passengers: 140 },
];

const COLORS = ['#14b8a6', '#3b82f6', '#06b6d4', '#6366f1', '#8b5cf6', '#a855f7'];

export const PopularRoutesChart: React.FC<PopularRoutesChartProps> = ({
  data = DEFAULT_POPULAR_ROUTES,
}) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis
            type="category"
            dataKey="route"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(val: any) => [`${val} Passengers`, 'Volume']}
          />
          <Bar dataKey="passengers" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
