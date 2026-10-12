import React, { useState } from 'react';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_ROUTES,
  INITIAL_TRIPS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_FEEDBACK,
} from '../data/seedData';
import { Database, Play, Terminal, Sparkles, Check, Copy, ArrowRight } from 'lucide-react';

export const OracleSqlWorkbench: React.FC = () => {
  const [activeQueryText, setActiveQueryText] = useState<string>(
    `SELECT v.REGISTRATION_NO, v.MODEL_NAME, v.CURRENT_MILEAGE_KM, v.NEXT_SERVICE_MILEAGE_KM,\n       CASE WHEN v.CURRENT_MILEAGE_KM >= v.NEXT_SERVICE_MILEAGE_KM THEN 'CRITICAL_OVERDUE' ELSE 'NOMINAL' END AS STATUS\nFROM VEHICLES v\nORDER BY v.CURRENT_MILEAGE_KM DESC;`
  );
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [executionStats, setExecutionStats] = useState<string>(
    'Oracle 21c RDBMS Connected (SID: ORCLPDB1) · Session User: SMARTMOVE_ADMIN'
  );
  const [showExplainPlan, setShowExplainPlan] = useState<boolean>(false);

  const sampleQueries = [
    {
      title: 'Active Fleet & Maintenance Thresholds',
      sql: `SELECT v.REGISTRATION_NO, v.MODEL_NAME, v.CURRENT_MILEAGE_KM, v.NEXT_SERVICE_MILEAGE_KM,\n       CASE WHEN v.CURRENT_MILEAGE_KM >= v.NEXT_SERVICE_MILEAGE_KM THEN 'CRITICAL_OVERDUE' ELSE 'NOMINAL' END AS STATUS\nFROM VEHICLES v\nORDER BY v.CURRENT_MILEAGE_KM DESC;`,
      run: () => {
        const rows = INITIAL_VEHICLES.map((v) => ({
          REGISTRATION_NO: v.registration_no,
          MODEL_NAME: v.model_name,
          CURRENT_MILEAGE_KM: `${v.current_mileage_km} km`,
          NEXT_SERVICE_MILEAGE_KM: `${v.next_service_mileage_km || 100000} km`,
          STATUS: v.current_mileage_km >= (v.next_service_mileage_km || 100000) ? 'CRITICAL_OVERDUE' : 'NOMINAL',
        }));
        return { cols: ['REGISTRATION_NO', 'MODEL_NAME', 'CURRENT_MILEAGE_KM', 'NEXT_SERVICE_MILEAGE_KM', 'STATUS'], rows };
      },
    },
    {
      title: 'Top Rated Drivers with Safety Index',
      sql: `SELECT d.DRIVER_ID, d.FULL_NAME, d.LICENSE_CLASS, d.SAFETY_SCORE, d.RATING, d.TOTAL_TRIPS_COMPLETED\nFROM DRIVERS d\nWHERE d.RATING >= 4.80\nORDER BY d.RATING DESC, d.SAFETY_SCORE DESC;`,
      run: () => {
        const rows = INITIAL_DRIVERS.filter((d) => d.rating >= 4.8)
          .sort((a, b) => b.rating - a.rating)
          .map((d) => ({
            DRIVER_ID: d.driver_id,
            FULL_NAME: d.full_name,
            LICENSE_CLASS: d.license_class,
            SAFETY_SCORE: `${d.safety_score} / 100`,
            RATING: `★ ${d.rating.toFixed(2)}`,
            TOTAL_TRIPS: d.total_trips_completed,
          }));
        return { cols: ['DRIVER_ID', 'FULL_NAME', 'LICENSE_CLASS', 'SAFETY_SCORE', 'RATING', 'TOTAL_TRIPS'], rows };
      },
    },
    {
      title: 'Booking Revenue by Payment Gateway',
      sql: `SELECT p.PAYMENT_METHOD, COUNT(p.PAYMENT_ID) AS TXN_COUNT, SUM(p.AMOUNT) AS TOTAL_VOLUME_USD\nFROM PAYMENTS p\nWHERE p.PAYMENT_STATUS = 'SUCCESS'\nGROUP BY p.PAYMENT_METHOD\nORDER BY TOTAL_VOLUME_USD DESC;`,
      run: () => {
        const grouped: Record<string, { count: number; sum: number }> = {};
        INITIAL_PAYMENTS.forEach((p) => {
          if (!grouped[p.payment_method]) grouped[p.payment_method] = { count: 0, sum: 0 };
          grouped[p.payment_method].count += 1;
          grouped[p.payment_method].sum += p.amount;
        });
        const rows = Object.entries(grouped).map(([method, val]) => ({
          PAYMENT_METHOD: method,
          TXN_COUNT: val.count,
          TOTAL_VOLUME_USD: `$${val.sum.toFixed(2)}`,
        }));
        return { cols: ['PAYMENT_METHOD', 'TXN_COUNT', 'TOTAL_VOLUME_USD'], rows };
      },
    },
    {
      title: 'Live Trips with Seat Occupancy',
      sql: `SELECT t.TRIP_ID, r.ROUTE_CODE, r.ROUTE_NAME, t.SCHEDULED_DEPARTURE, t.AVAILABLE_SEATS, t.TOTAL_SEATS, t.STATUS\nFROM TRIPS t\nJOIN ROUTES r ON t.ROUTE_ID = r.ROUTE_ID\nWHERE t.STATUS IN ('IN_TRANSIT', 'BOARDING', 'SCHEDULED')\nORDER BY t.SCHEDULED_DEPARTURE ASC;`,
      run: () => {
        const rows = INITIAL_TRIPS.filter((t) => t.status !== 'COMPLETED').map((t) => {
          const r = INITIAL_ROUTES.find((item) => item.route_id === t.route_id);
          return {
            TRIP_ID: t.trip_id,
            ROUTE_CODE: r?.route_code || 'N/A',
            ROUTE_NAME: r?.route_name || 'N/A',
            SCHEDULED_DEPARTURE: (t.scheduled_departure || t.departure_time || '').replace('T', ' '),
            AVAILABLE_SEATS: `${t.available_seats} / ${t.total_seats}`,
            STATUS: t.status,
          };
        });
        return { cols: ['TRIP_ID', 'ROUTE_CODE', 'ROUTE_NAME', 'SCHEDULED_DEPARTURE', 'AVAILABLE_SEATS', 'STATUS'], rows };
      },
    },
  ];

  const handleExecuteQuery = () => {
    // Match against sample or run default active fleet query
    const match = sampleQueries.find((s) => s.sql.trim() === activeQueryText.trim());
    if (match) {
      const res = match.run();
      setColumns(res.cols);
      setQueryResults(res.rows);
    } else {
      const res = sampleQueries[0].run();
      setColumns(res.cols);
      setQueryResults(res.rows);
    }

    setExecutionStats(
      `Query executed in 3.8ms. Fetching from Cost-Based Optimizer (CBO). Total Rows: ${INITIAL_VEHICLES.length}.`
    );
  };

  // Run initial query on mount
  React.useEffect(() => {
    handleExecuteQuery();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Oracle SQL & Explain Plan Workbench</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute relational DML queries, review index usage, and inspect Oracle CBO optimizer execution plans.
        </p>
      </div>

      {/* Preset Queries Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Sample Queries:</span>
        {sampleQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveQueryText(item.sql);
              const res = item.run();
              setColumns(res.cols);
              setQueryResults(res.rows);
              setExecutionStats(`Executed query preset: "${item.title}". Elapsed: 2.1ms.`);
            }}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* SQL Editor Area */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-white font-semibold">SQL*Plus Console</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExplainPlan(!showExplainPlan)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                showExplainPlan
                  ? 'bg-teal-950 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showExplainPlan ? 'Hide EXPLAIN PLAN' : 'Show EXPLAIN PLAN'}
            </button>
            <button
              onClick={handleExecuteQuery}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run SQL (F5)</span>
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={activeQueryText}
          onChange={(e) => setActiveQueryText(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-teal-400 leading-relaxed resize-none"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>{executionStats}</span>
          <span>Buffer Cache Hit Ratio: 99.4%</span>
        </div>
      </div>

      {/* Explain Plan Drawer if toggled */}
      {showExplainPlan && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-mono font-bold text-teal-400 block">
            EXPLAIN PLAN FOR STATEMENT (Oracle Cost-Based Optimizer)
          </span>
          <pre className="p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`-------------------------------------------------------------------------------------------------
| Id  | Operation                     | Name                | Rows  | Bytes | Cost (%CPU)| Time     |
-------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT              |                     |     6 |   324 |     3   (0)| 00:00:01 |
|   1 |  SORT ORDER BY                |                     |     6 |   324 |     3   (0)| 00:00:01 |
|   2 |   TABLE ACCESS FULL           | VEHICLES            |     6 |   324 |     2   (0)| 00:00:01 |
-------------------------------------------------------------------------------------------------
Predicate Information (identified by operation id):
---------------------------------------------------
   2 - filter("V"."STATUS"='ACTIVE')
Note: dynamic statistics used: blocks=5`}</pre>
        </div>
      )}

      {/* Query Results Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">Query Output Grid ({queryResults.length} Rows)</span>
          <span className="font-mono text-teal-400 text-[11px]">Columns: {columns.length}</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="p-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
              {queryResults.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="p-3 whitespace-nowrap text-white">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
