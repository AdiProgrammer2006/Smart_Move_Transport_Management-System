import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboardPage } from './AdminDashboardPage';
import { ManagerDashboardPage } from './ManagerDashboardPage';
import { DriverDashboardPage } from './DriverDashboardPage';
import { PassengerDashboardPage } from './PassengerDashboardPage';

export const DashboardRouterPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'Administrator':
      return <AdminDashboardPage />;
    case 'Transport Manager':
      return <ManagerDashboardPage />;
    case 'Driver':
      return <DriverDashboardPage />;
    case 'Passenger':
    default:
      return <PassengerDashboardPage />;
  }
};
