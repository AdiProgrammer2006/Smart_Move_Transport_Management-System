/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { SearchTripsPage } from './pages/public/SearchTripsPage';
import { TripDetailsPage } from './pages/public/TripDetailsPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { DatabaseTestPage } from './pages/public/DatabaseTestPage';


// Dashboard Pages
import { DashboardRouterPage } from './pages/dashboard/DashboardRouterPage';
import { AdminDashboardPage } from './pages/dashboard/AdminDashboardPage';
import { ManagerDashboardPage } from './pages/dashboard/ManagerDashboardPage';
import { DriverDashboardPage } from './pages/dashboard/DriverDashboardPage';
import { PassengerDashboardPage } from './pages/dashboard/PassengerDashboardPage';

// Module Pages
import { VehicleListPage } from './pages/vehicles/VehicleListPage';
import { VehicleDetailPage } from './pages/vehicles/VehicleDetailPage';
import { DriverListPage } from './pages/drivers/DriverListPage';
import { DriverProfilePage } from './pages/drivers/DriverProfilePage';
import { RouteListPage } from './pages/routes/RouteListPage';
import { RouteDetailPage } from './pages/routes/RouteDetailPage';
import { TripListPage } from './pages/trips/TripListPage';
import { TripDetailPage } from './pages/trips/TripDetailPage';
import { BookingListPage } from './pages/bookings/BookingListPage';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import { PassengerListPage } from './pages/passengers/PassengerListPage';
import { PassengerDetailPage } from './pages/passengers/PassengerDetailPage';
import { PaymentListPage } from './pages/payments/PaymentListPage';
import { MaintenanceListPage } from './pages/maintenance/MaintenanceListPage';
import { FeedbackListPage } from './pages/feedback/FeedbackListPage';
import { AnnouncementListPage } from './pages/announcements/AnnouncementListPage';
import { CommunityForumPage } from './pages/community/CommunityForumPage';
import { BusinessReportsPage } from './pages/reports/BusinessReportsPage';
import { ProfileSettingsPage } from './pages/settings/ProfileSettingsPage';
import { DatabaseDesignPage } from './pages/database/DatabaseDesignPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/search-trips" element={<SearchTripsPage />} />
              <Route path="/trip/:id" element={<TripDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            {/* Protected SaaS Dashboard Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouterPage />} />
              <Route path="dashboard/admin" element={<AdminDashboardPage />} />
              <Route path="dashboard/manager" element={<ManagerDashboardPage />} />
              <Route path="dashboard/driver" element={<DriverDashboardPage />} />
              <Route path="dashboard/passenger" element={<PassengerDashboardPage />} />

              {/* Vehicle Management */}
              <Route path="vehicles" element={<VehicleListPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />

              {/* Driver Management */}
              <Route path="drivers" element={<DriverListPage />} />
              <Route path="drivers/:id" element={<DriverProfilePage />} />

              {/* Route Management */}
              <Route path="routes" element={<RouteListPage />} />
              <Route path="routes/:id" element={<RouteDetailPage />} />

              {/* Trip Scheduling Management */}
              <Route path="trips" element={<TripListPage />} />
              <Route path="trips/:id" element={<TripDetailPage />} />

              {/* Booking Management */}
              <Route path="bookings" element={<BookingListPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />

              {/* Passenger Management */}
              <Route path="passengers" element={<PassengerListPage />} />
              <Route path="passengers/:id" element={<PassengerDetailPage />} />

              {/* Payment Processing & Ledger */}
              <Route path="payments" element={<PaymentListPage />} />

              {/* Maintenance Management */}
              <Route path="maintenance" element={<MaintenanceListPage />} />

              {/* Feedback and Reviews */}
              <Route path="feedback" element={<FeedbackListPage />} />

              {/* Announcements & Notices */}
              <Route path="announcements" element={<AnnouncementListPage />} />

              {/* Community & Interactive Forum */}
              <Route path="community" element={<CommunityForumPage />} />

              {/* Business Reports Engine */}
              <Route path="reports" element={<BusinessReportsPage />} />

              {/* Settings & Profile */}
              <Route path="settings" element={<ProfileSettingsPage />} />

              {/* Technical Architecture & Database Design */}
              <Route path="database-design" element={<DatabaseDesignPage />} />
            </Route>

            {/* Friendly URL Redirections for Root Paths */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/vehicles" element={<Navigate to="/app/vehicles" replace />} />
            <Route path="/vehicles/:id" element={<Navigate to="/app/vehicles/:id" replace />} />
            <Route path="/drivers" element={<Navigate to="/app/drivers" replace />} />
            <Route path="/drivers/:id" element={<Navigate to="/app/drivers/:id" replace />} />
            <Route path="/routes" element={<Navigate to="/app/routes" replace />} />
            <Route path="/routes/:id" element={<Navigate to="/app/routes/:id" replace />} />
            <Route path="/trips" element={<Navigate to="/app/trips" replace />} />
            <Route path="/trips/:id" element={<Navigate to="/app/trips/:id" replace />} />
            <Route path="/bookings" element={<Navigate to="/app/bookings" replace />} />
            <Route path="/bookings/:id" element={<Navigate to="/app/bookings/:id" replace />} />
            <Route path="/passengers" element={<Navigate to="/app/passengers" replace />} />
            <Route path="/passengers/:id" element={<Navigate to="/app/passengers/:id" replace />} />
            <Route path="/payments" element={<Navigate to="/app/payments" replace />} />
            <Route path="/maintenance" element={<Navigate to="/app/maintenance" replace />} />
            <Route path="/feedback" element={<Navigate to="/app/feedback" replace />} />
            <Route path="/announcements" element={<Navigate to="/app/announcements" replace />} />
            <Route path="/forum" element={<Navigate to="/app/community" replace />} />
            <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
            <Route path="/profile" element={<Navigate to="/app/settings" replace />} />
            <Route path="/database-design" element={<Navigate to="/app/database-design" replace />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
