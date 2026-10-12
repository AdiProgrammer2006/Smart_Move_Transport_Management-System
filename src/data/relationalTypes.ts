export type RelationalVehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INSPECTION' | 'OUT_OF_SERVICE' | string;
export type RelationalVehicleType = 'LUXURY_COACH' | 'ELECTRIC_EXPRESS' | 'EXECUTIVE_VAN' | 'MINI_SHUTTLE' | 'DOUBLE_DECKER' | string;

export interface Vehicle {
  [key: string]: any;
  vehicle_id: number;
  registration_no: string;
  vin_number?: string;
  vehicle_type: RelationalVehicleType;
  model_name?: string;
  seating_capacity: number;
  manufacture_year?: number;
  current_mileage_km: number;
  next_service_mileage_km?: number;
  next_service_date?: string;
  fuel_type?: string;
  status: RelationalVehicleStatus;
  primary_driver_id?: number;
  image_url?: string;
}

export type RelationalDriverStatus = 'ON_DUTY' | 'RESTING' | 'ON_LEAVE' | 'SUSPENDED' | string;

export interface Driver {
  [key: string]: any;
  driver_id: number;
  full_name: string;
  nic_number?: string;
  driving_license_no?: string;
  license_expiry_date?: string;
  phone_number?: string;
  email_address?: string;
  assigned_vehicle_id?: number;
  employment_date?: string;
  status: RelationalDriverStatus;
  safety_score?: number;
  total_trips_completed?: number;
}

export interface RouteStop {
  [key: string]: any;
  stop_id: number;
  route_id?: number;
  stop_name: string;
  sequence_number?: number;
  stop_sequence?: number;
  arrival_offset_minutes?: number;
}

export interface TransportRoute {
  [key: string]: any;
  route_id: number;
  route_code: string;
  origin_city: string;
  destination_city: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  base_fare_lkr?: number;
  is_active?: string;
  stops: RouteStop[];
}

export interface Passenger {
  [key: string]: any;
  passenger_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  registered_at?: string;
  loyalty_tier?: string;
  passenger_tier?: string;
  account_status?: string;
}

export type RelationalTripStatus = 'SCHEDULED' | 'BOARDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED' | string;

export interface Trip {
  [key: string]: any;
  trip_id: number;
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  departure_time?: string;
  scheduled_departure?: string;
  scheduled_arrival?: string;
  estimated_arrival_time?: string;
  actual_arrival_time?: string;
  ticket_price_lkr?: number;
  available_seats: number;
  trip_status?: RelationalTripStatus;
}

export type RelationalBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | string;

export interface Booking {
  [key: string]: any;
  booking_id: number;
  trip_id: number;
  passenger_id: number;
  booking_reference?: string;
  seat_number: string;
  fare_amount?: number;
  discount_applied?: number;
  booking_timestamp?: string;
  booking_status?: RelationalBookingStatus;
  total_paid: number;
}

export interface Payment {
  [key: string]: any;
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_reference: string;
  payment_timestamp: string;
  payment_status: string;
  gateway_response_code?: string;
}

export interface VehicleMaintenance {
  [key: string]: any;
  maintenance_id: number;
  vehicle_id: number;
  service_date: string;
  service_type: string;
  cost_lkr?: number;
  odometer_reading_km?: number;
  service_center_name?: string;
  service_center?: string;
  invoice_reference?: string;
  technician_name?: string;
  notes?: string;
}

export interface FeedbackReview {
  [key: string]: any;
  review_id: number;
  trip_id: number;
  vehicle_id?: number;
  driver_id?: number;
  passenger_id: number;
  rating_cleanliness?: number;
  rating_punctuality?: number;
  rating_driver_behavior?: number;
  overall_rating?: number;
  comment_text?: string;
  created_at?: string;
}

export interface MongoVehicleDocumentMedia {
  [key: string]: any;
  _id: string;
  vehicle_id: number;
  registration_no?: string;
  document_type?: string;
  title?: string;
  file_format?: string;
  url?: string;
  file_size_kb?: number;
  expiry_date?: string;
  verified?: boolean;
  uploaded_at?: string;
}

export interface MongoDynamicReview {
  [key: string]: any;
  _id: string;
  review_id?: number;
  route_id?: number;
  route_code?: string;
  route_name?: string;
  vehicle_id?: number;
  driver_id?: number;
  passenger_id?: number;
  ratings?: {
    comfort?: number;
    wifi?: number;
    punctuality?: number;
    service?: number;
  };
  sentiment?: string;
  tags?: string[];
  comment?: string;
  upvotes?: number;
  created_at?: string;
}

export interface MongoTravelAnnouncement {
  [key: string]: any;
  _id: string;
  announcement_id?: number | string;
  priority?: string;
  title: string;
  affected_routes?: string[];
  broadcast_message?: string;
  author?: string;
  active?: boolean;
  expires_at?: string;
  created_at?: string;
}

export interface MongoTripTelemetry {
  [key: string]: any;
  _id: string;
  trip_id: number;
  route_id?: number;
  vehicle_id: number;
  speed_kph?: number;
  fuel_level_percent?: number;
  engine_temperature_c?: number;
  cabin_temperature_c?: number;
  passenger_count?: number;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp?: string;
}

export interface MongoCommunityPost {
  [key: string]: any;
  _id: string;
  post_id?: number | string;
  author_id?: number | string;
  author_name: string;
  role?: string;
  channel?: string;
  topic?: string;
  body?: string;
  likes?: number;
  replies_count?: number;
  created_at?: string;
}
