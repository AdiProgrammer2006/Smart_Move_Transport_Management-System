export type UserRole = 'Administrator' | 'Transport Manager' | 'Driver' | 'Passenger';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  driverId?: string;
  passengerId?: string;
}

export type VehicleType = 'Bus' | 'Van' | 'Luxury Coach';
export type VehicleStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Inactive';

export interface VehicleDocument {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  fileUrl: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g., "WP ND-4521"
  vinNumber?: string;
  nextServiceMileageKm?: number;
  nextServiceDate?: string;
  primaryDriverId?: string;
  oracleVehicleType?: string;
  oracleStatus?: string;
  oracleFuelType?: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  seatingCapacity: number;
  manufactureYear: number;
  status: VehicleStatus;
  mileageKm: number;
  fuelType: 'Diesel' | 'Electric' | 'Hybrid' | 'Petrol';
  image: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  documents: VehicleDocument[];
  galleryImages: string[];
}

export type DriverStatus = 'Active' | 'On Trip' | 'Resting' | 'On Leave' | 'Inactive';

export interface Driver {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseClass?: string;
  safetyScore?: number;
  address: string;
  employmentDate: string;
  status: DriverStatus;
  assignedVehicleId?: string;
  assignedVehicleReg?: string;
  yearsExperience: number;
  safetyRating: number; // e.g. 4.9
  totalTripsCompleted: number;
  emergencyContact: string;
  avatar: string;
}

export interface IntermediateStop {
  id: string;
  stopName: string;
  durationFromStartMins: number;
  distanceFromStartKm: number;
  fareFromStartLkr: number;
}

export interface Route {
  id: string;
  routeName: string;
  startingLocation: string;
  destination: string;
  distanceKm: number;
  estimatedDuration: string; // e.g. "3 hrs 15 mins"
  baseFareLkr: number;
  status: 'Active' | 'Inactive';
  stops: IntermediateStop[];
  isPopular?: boolean;
}

export interface Passenger {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  registrationDate: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending';
  loyaltyPoints: number;
  tier: 'Regular Commuter' | 'Corporate Partner' | 'Student Pass';
}

export type TripStatus = 'Scheduled' | 'Boarding' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  startingLocation: string;
  destination: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleType: VehicleType;
  driverId: string;
  driverName: string;
  departureDateTime: string; // ISO string
  estimatedArrivalDateTime: string; // ISO string
  ticketPriceLkr: number;
  availableSeats: number;
  totalSeats: number;
  status: TripStatus;
  bookedSeats: string[]; // e.g. ["1A", "1B", "4C"]
}

export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "SM-2026-7841"
  tripId: string;
  routeName: string;
  startingLocation: string;
  destination: string;
  departureDateTime: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  seats: string[];
  totalAmountLkr: number;
  bookingStatus: BookingStatus;
  bookingDate: string;
  paymentMethod: 'Card' | 'Bank Transfer' | 'Cash';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  vehicleReg: string;
  qrCodeUrl?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference: string;
  passengerName: string;
  amountLkr: number;
  paymentMethod: 'Card' | 'Bank Transfer' | 'Cash';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  transactionDate: string;
  referenceNumber: string;
  receiptNumber: string;
}

export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  maintenanceType: 'Brake Service' | 'Engine Overhaul' | 'Tyre Replacement' | 'AC System Check' | 'Routine Inspection' | 'Battery Diagnostic';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  maintenanceCostLkr: number;
  serviceProvider: string;
  status: MaintenanceStatus;
  technicianName: string;
}

export interface FeedbackReview {
  id: string;
  tripId: string;
  tripName: string;
  passengerId: string;
  passengerName: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  vehicleRating: number; // 1 to 5
  driverRating: number; // 1 to 5
  overallRating: number;
  feedbackComment: string;
  complaintCategory?: 'None' | 'Delay' | 'AC / Comfort' | 'Driver Behavior' | 'Cleanliness' | 'Ticketing';
  reviewDate: string;
  status: 'Published' | 'Under Review' | 'Resolved';
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Trip Delay' | 'Service Cancellation' | 'Important Transport Notice' | 'Expressway Update';
  priority: 'Urgent' | 'High' | 'Normal';
  affectedRoutes: string[];
  message: string;
  publishedDate: string;
  validUntil: string;
  active: boolean;
}

export interface CommunityReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: UserRole;
  routeTag?: string;
  title: string;
  content: string;
  likesCount: number;
  createdAt: string;
  replies: CommunityReply[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'alert' | 'maintenance' | 'system';
}
