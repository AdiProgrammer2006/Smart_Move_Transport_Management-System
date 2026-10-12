
// =====================================================
// SMARTMOVE TRANSPORT SOLUTIONS
// FRONTEND API SERVICE
// Oracle Database + MongoDB Integration
// =====================================================

// Backend API URL
const API_BASE_URL = "http://localhost:5000/api";

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

// Oracle Trip Data
export interface Trip {
  TRIP_ID: number;
  ROUTE_NAME: string;
  ORIGIN_CITY: string;
  DESTINATION_CITY: string;
  SCHEDULED_DEPARTURE: string;
  AVAILABLE_SEATS: number;
  STATUS: string;
}

// MongoDB Announcement Data
export interface Announcement {
  _id: string;
  title: string;
  message: string;
  category: string;
  is_active: boolean;
}

// Backend Health Response
export interface HealthResponse {
  status: string;
  message: string;
}

// =====================================================
// COMMON API REQUEST FUNCTION
// =====================================================

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: T = await response.json();

    return data;
  } catch (error) {
    console.error(`SmartMove API Error (${endpoint}):`, error);
    throw error;
  }
}

// =====================================================
// ORACLE DATABASE API FUNCTIONS
// =====================================================

// Get all scheduled trips
export async function getTrips(): Promise<Trip[]> {
  return fetchAPI<Trip[]>("/trips");
}

// =====================================================
// MONGODB API FUNCTIONS
// =====================================================

// Get active announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  return fetchAPI<Announcement[]>("/announcements");
}

// =====================================================
// BACKEND CONNECTION TEST
// =====================================================

// Check whether backend is running
export async function checkBackendHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>("/health");
}

// =====================================================
// END OF SMARTMOVE API SERVICE
// =====================================================

// Additional Oracle read endpoints. Mutations require separate validated server routes.
export async function getOracleRows<T = Record<string, unknown>>(resource: 'vehicles' | 'drivers' | 'routes' | 'passengers' | 'bookings' | 'payments' | 'maintenance' | 'feedback'): Promise<T[]> {
  return fetchAPI<T[]>(`/${resource}`);
}
