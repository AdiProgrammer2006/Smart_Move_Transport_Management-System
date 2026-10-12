import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Available':
      case 'Active':
      case 'Confirmed':
      case 'Paid':
      case 'Completed':
      case 'Published':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Assigned':
      case 'Boarding':
      case 'In Progress':
      case 'Scheduled':
      case 'Under Review':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Maintenance':
      case 'Resting':
      case 'Pending':
      case 'On Trip':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Inactive':
      case 'Overdue':
      case 'Cancelled':
      case 'Failed':
      case 'Suspended':
      case 'On Leave':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'Refunded':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border tracking-wide uppercase ${sizeClass} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      <span>{status}</span>
    </span>
  );
};
