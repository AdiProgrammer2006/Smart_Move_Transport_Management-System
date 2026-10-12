import type { Vehicle, Driver, Route, Trip, Passenger, Booking, Payment, MaintenanceRecord, FeedbackReview, Announcement, CommunityPost } from '../types';
import { MOCK_VEHICLES, MOCK_DRIVERS, MOCK_ROUTES, MOCK_TRIPS, MOCK_PASSENGERS, MOCK_BOOKINGS, MOCK_PAYMENTS, MOCK_MAINTENANCE, MOCK_REVIEWS, MOCK_ANNOUNCEMENTS, MOCK_COMMUNITY_POSTS } from '../mockData';

/** Compatibility services for the original AI Studio screens.
 * These remain DEMO/localStorage data; they do not write to Oracle or MongoDB.
 * Live database reads are available separately through ./api.ts.
 */
function makeService<T extends { id: string }>(key: string, initial: T[]) {
  const storageKey = 'smartmove_demo_' + key;
  function load(): T[] {
    try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) as T[] : [...initial]; }
    catch { return [...initial]; }
  }
  function save(items: T[]) { localStorage.setItem(storageKey, JSON.stringify(items)); }
  return {
    async getAll(): Promise<T[]> { return load(); },
    async getById(id: string): Promise<T | undefined> { return load().find(x => x.id === id); },
    async create(data: Partial<T>): Promise<T> {
      const item = { ...data, id: data.id || `${key}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` } as T;
      save([...load(), item]); return item;
    },
    async update(id: string, data: Partial<T>): Promise<T | undefined> {
      const items = load(); const index = items.findIndex(x => x.id === id);
      if (index < 0) return undefined;
      items[index] = { ...items[index], ...data, id }; save(items); return items[index];
    },
    async delete(id: string): Promise<void> { save(load().filter(x => x.id !== id)); },
  };
}

export const vehicleService = makeService<Vehicle>('vehicles', MOCK_VEHICLES);
export const driverService = makeService<Driver>('drivers', MOCK_DRIVERS);
export const routeService = makeService<Route>('routes', MOCK_ROUTES);
const tripBase = makeService<Trip>('trips', MOCK_TRIPS);
export const tripService = {
  ...tripBase,
  async updateStatus(id: string, status: Trip['status']) { return tripBase.update(id, { status }); },
};
export const passengerService = makeService<Passenger>('passengers', MOCK_PASSENGERS);
const bookingBase = makeService<Booking>('bookings', MOCK_BOOKINGS);
export const bookingService = {
  ...bookingBase,
  async cancelBooking(id: string) { return bookingBase.update(id, { bookingStatus: 'Cancelled' }); },
};
const paymentBase = makeService<Payment>('payments', MOCK_PAYMENTS);
export const paymentService = {
  ...paymentBase,
  async updateStatus(id: string, status: Payment['paymentStatus']) { return paymentBase.update(id, { paymentStatus: status }); },
};
export const maintenanceService = makeService<MaintenanceRecord>('maintenance', MOCK_MAINTENANCE);
const feedbackBase = makeService<FeedbackReview>('feedback', MOCK_REVIEWS);
export const feedbackService = {
  ...feedbackBase,
  async updateStatus(id: string, status: FeedbackReview['status']) { return feedbackBase.update(id, { status }); },
};
export const reviewService = feedbackService;
export const announcementService = makeService<Announcement>('announcements', MOCK_ANNOUNCEMENTS);
const communityBase = makeService<CommunityPost>('community', MOCK_COMMUNITY_POSTS);
export const communityService = {
  ...communityBase,
  async updateLikes(id: string, likesCount: number) { return communityBase.update(id, { likesCount }); },
  async addReply(id: string, reply: CommunityPost['replies'][number]) {
    const post = await communityBase.getById(id);
    if (!post) return undefined;
    return communityBase.update(id, { replies: [...(post.replies || []), reply] });
  },
};

// Oracle read-only integration for the three foundational modules.
// The remaining screens still use their original local demonstration data.
import { getOracleRows } from './api';
vehicleService.getAll = async () => (await getOracleRows<any>('vehicles')).map((r: any) => ({
  id: String(r.VEHICLE_ID), registrationNumber: r.REGISTRATION_NO || '',
  vinNumber: r.VIN_NUMBER || '', nextServiceMileageKm: r.NEXT_SERVICE_MILEAGE_KM,
  nextServiceDate: r.NEXT_SERVICE_DATE ? String(r.NEXT_SERVICE_DATE).slice(0,10) : '',
  primaryDriverId: r.PRIMARY_DRIVER_ID == null ? undefined : String(r.PRIMARY_DRIVER_ID),
  oracleVehicleType: r.VEHICLE_TYPE, oracleStatus: r.STATUS, oracleFuelType: r.FUEL_TYPE,
  vehicleType: r.VEHICLE_TYPE === 'EXECUTIVE_VAN' ? 'Van' : r.VEHICLE_TYPE === 'LUXURY_COACH' ? 'Luxury Coach' : 'Bus',
  brand: String(r.MODEL_NAME || '').split(' ')[0], model: r.MODEL_NAME || '',
  seatingCapacity: r.SEATING_CAPACITY || 0, manufactureYear: r.MANUFACTURE_YEAR || 0,
  status: r.STATUS === 'MAINTENANCE' ? 'Maintenance' : r.STATUS === 'ACTIVE' ? 'Available' : 'Inactive',
  mileageKm: r.CURRENT_MILEAGE_KM || 0,
  fuelType: r.FUEL_TYPE === 'ELECTRIC' ? 'Electric' : r.FUEL_TYPE === 'HYBRID' ? 'Hybrid' : 'Diesel',
  image: '', documents: [], galleryImages: [],
}));
driverService.getAll = async () => (await getOracleRows<any>('drivers')).map((r: any) => ({
  id: String(r.DRIVER_ID), fullName: r.FULL_NAME || '', contactNumber: r.PHONE_NUMBER || '',
  email: r.EMAIL || '', licenseNumber: r.LICENSE_NUMBER || '', licenseClass: r.LICENSE_CLASS || '', licenseExpiryDate: '', safetyScore: r.SAFETY_SCORE,
  address: '', employmentDate: r.HIRE_DATE ? String(r.HIRE_DATE).slice(0,10) : '',
  status: r.STATUS === 'RESTING' ? 'Resting' : r.STATUS === 'ON_LEAVE' ? 'On Leave' : r.STATUS === 'IN_TRANSIT' ? 'On Trip' : 'Active',
  assignedVehicleId: r.ASSIGNED_VEHICLE_ID ? String(r.ASSIGNED_VEHICLE_ID) : undefined,
  yearsExperience: r.YEARS_EXPERIENCE || 0, safetyRating: r.RATING || 0,
  totalTripsCompleted: r.TOTAL_TRIPS_COMPLETED || 0, emergencyContact: '', avatar: '',
}));
routeService.getAll = async () => (await getOracleRows<any>('routes')).map((r: any) => ({
  id: String(r.ROUTE_ID), routeName: r.ROUTE_NAME || '', startingLocation: r.ORIGIN_CITY || '',
  destination: r.DESTINATION_CITY || '', distanceKm: r.TOTAL_DISTANCE_KM || 0,
  estimatedDuration: `${r.ESTIMATED_DURATION_MINS || 0} mins`, baseFareLkr: r.BASE_FARE || 0,
  status: 'Active', stops: [],
}));


// Vehicle mutations persist to Oracle. No localStorage fallback: a failed write
// must never be reported as a successful save.
const vehicleAPI = 'http://localhost:5000/api/vehicles';
function toOracleVehicle(v: Partial<Vehicle>) {
  const raw = v as Vehicle;
  if (raw.fuelType === 'Petrol') throw new Error('Oracle VEHICLES does not support Petrol fuel. Choose Diesel, Electric, or Hybrid.');
  return {
    registrationNumber: raw.registrationNumber,
    vinNumber: raw.vinNumber,
    vehicleType: raw.vehicleType === 'Van' ? 'EXECUTIVE_VAN' : raw.vehicleType === 'Luxury Coach' ? 'LUXURY_COACH' : (raw.oracleVehicleType && ['ELECTRIC_EXPRESS','MINI_SHUTTLE','DOUBLE_DECKER'].includes(raw.oracleVehicleType) ? raw.oracleVehicleType : 'MINI_SHUTTLE'),
    model: raw.model || raw.brand || '',
    seatingCapacity: raw.seatingCapacity, manufactureYear: raw.manufactureYear,
    mileageKm: raw.mileageKm, nextServiceMileageKm: raw.nextServiceMileageKm,
    nextServiceDate: raw.nextServiceDate,
    fuelType: raw.fuelType === 'Electric' ? 'ELECTRIC' : raw.fuelType === 'Hybrid' ? 'HYBRID' : 'DIESEL',
    status: raw.status === 'Maintenance' ? 'MAINTENANCE' : raw.status === 'Inactive' ? 'OUT_OF_SERVICE' : 'ACTIVE',
    primaryDriverId: raw.primaryDriverId || null
  };
}
async function vehicleWrite(path: string, method: string, data?: Partial<Vehicle>) {
  const response = await fetch(`${vehicleAPI}${path}`, {
    method, headers: {'Content-Type':'application/json'},
    ...(data ? {body:JSON.stringify(toOracleVehicle(data))} : {})
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Vehicle ${method} failed (${response.status})`);
  }
  return response.json();
}
vehicleService.create = async (data) => {
  const result = await vehicleWrite('', 'POST', data);
  return {...data, id:result.id} as Vehicle;
};
vehicleService.update = async (id, data) => {
  const current = (await vehicleService.getAll()).find(v => v.id === id);
  if (!current) return undefined;
  await vehicleWrite(`/${encodeURIComponent(id)}`, 'PUT', {...current,...data});
  return {...current,...data,id};
};
vehicleService.delete = async (id) => {
  await vehicleWrite(`/${encodeURIComponent(id)}`, 'DELETE');
};
vehicleService.getById = async (id) => (await vehicleService.getAll()).find(v => v.id === id);

// Driver create/update/delete persist to Oracle; no localStorage fallback.
const driverAPI = 'http://localhost:5000/api/drivers';
async function driverWrite(path: string, method: string, data?: Partial<Driver>) {
  const response = await fetch(`${driverAPI}${path}`, {
    method, headers: {'Content-Type':'application/json'},
    ...(data ? {body:JSON.stringify(data)} : {})
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || `Driver ${method} failed (${response.status})`);
  }
  return response.json();
}
driverService.create = async (data) => {
  const result = await driverWrite('', 'POST', data);
  return {...data, id:result.id} as Driver;
};
driverService.update = async (id, data) => {
  const current = (await driverService.getAll()).find(d => d.id === id);
  if (!current) return undefined;
  await driverWrite(`/${encodeURIComponent(id)}`, 'PUT', {...current,...data});
  return {...current,...data,id};
};
driverService.delete = async (id) => { await driverWrite(`/${encodeURIComponent(id)}`, 'DELETE'); };
driverService.getById = async (id) => (await driverService.getAll()).find(d => d.id === id);


// Persistent Oracle services. Read models match existing UI types; writes are bound by backend.
async function dbWrite(resource: string, method: string, id?: string, data?: object) {
  const response = await fetch(`http://localhost:5000/api/${resource}${id ? '/' + encodeURIComponent(id) : ''}`, {
    method, headers: {'Content-Type':'application/json'}, ...(data ? {body:JSON.stringify(data)} : {})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `${resource} ${method} failed`);
  return result;
}
function connectService<T extends {id:string}>(service: ReturnType<typeof makeService<T>>, resource:string, map:(row:any)=>T, serialize:(item:Partial<T>)=>object) {
  service.getAll = async () => (await getOracleRows<any>(resource as any)).map(map);
  service.getById = async id => (await service.getAll()).find(x=>x.id===id);
  service.create = async data => {const result=await dbWrite(resource,'POST',undefined,serialize(data));return {...data,id:result.id} as T;};
  service.update = async (id,data) => {
    const current=await service.getById(id);if(!current)return undefined;
    const updated={...current,...data,id};await dbWrite(resource,'PUT',id,serialize(updated));return updated;
  };
  service.delete = async id => {await dbWrite(resource,'DELETE',id);};
}
const dt=(v:any)=>v ? String(v).slice(0,16) : '';
const title=(v:any)=>String(v||'').toLowerCase().replace(/(^|_)([a-z])/g,(_m,p,c)=>p?' '+c.toUpperCase():c.toUpperCase());
connectService(routeService,'routes',r=>({
 id:String(r.ROUTE_ID),routeName:r.ROUTE_NAME,startingLocation:r.ORIGIN_CITY,destination:r.DESTINATION_CITY,
 distanceKm:r.TOTAL_DISTANCE_KM,estimatedDuration:`${r.ESTIMATED_DURATION_MINS} mins`,baseFareLkr:r.BASE_FARE,
 status:'Active',stops:[],routeCode:r.ROUTE_CODE,category:r.CATEGORY
} as Route), v=>({
 routeCode:(v as any).routeCode || `R${Date.now().toString().slice(-10)}`,routeName:v.routeName,startingLocation:v.startingLocation,
 destination:v.destination,distanceKm:v.distanceKm,estimatedDurationMins:Number(String(v.estimatedDuration||'0').match(/\d+/)?.[0]||0),
 baseFareLkr:v.baseFareLkr,category:(v as any).category||'METRO_COMMUTER'
}));
connectService(passengerService,'passengers',r=>({
 id:String(r.PASSENGER_ID),fullName:`${r.FIRST_NAME} ${r.LAST_NAME}`,email:r.EMAIL,phoneNumber:r.PHONE_NUMBER,
 address:'',registrationDate:dt(r.REGISTRATION_DATE),accountStatus:'Active',loyaltyPoints:r.LOYALTY_POINTS,
 tier:r.PASSENGER_TIER==='STUDENT'?'Student Pass':r.PASSENGER_TIER==='CORPORATE_EMPLOYEE'?'Corporate Partner':'Regular Commuter',
 walletBalance:r.WALLET_BALANCE,organizationName:r.ORGANIZATION_NAME
} as Passenger),v=>({
 firstName:String(v.fullName||'').trim().split(/\s+/)[0],lastName:String(v.fullName||'').trim().split(/\s+/).slice(1).join(' ')||'-',
 email:v.email,phoneNumber:v.phoneNumber,passengerTier:v.tier==='Student Pass'?'STUDENT':v.tier==='Corporate Partner'?'CORPORATE_EMPLOYEE':'REGULAR_COMMUTER',
 walletBalance:(v as any).walletBalance||0,loyaltyPoints:v.loyaltyPoints||0,organizationName:(v as any).organizationName||null
}));
connectService(tripBase,'trips',r=>({
 id:String(r.TRIP_ID),routeId:String(r.ROUTE_ID),routeName:'',startingLocation:'',destination:'',vehicleId:String(r.VEHICLE_ID),
 vehicleReg:'',vehicleType:'Bus',driverId:String(r.DRIVER_ID),driverName:'',departureDateTime:dt(r.SCHEDULED_DEPARTURE),
 estimatedArrivalDateTime:dt(r.SCHEDULED_ARRIVAL),ticketPriceLkr:0,availableSeats:r.AVAILABLE_SEATS,totalSeats:r.TOTAL_SEATS,
 status:({'SCHEDULED':'Scheduled','BOARDING':'Boarding','IN_TRANSIT':'In Progress','COMPLETED':'Completed','CANCELLED':'Cancelled'} as any)[r.STATUS]||'Scheduled',bookedSeats:[]
} as Trip),v=>({routeId:v.routeId,vehicleId:v.vehicleId,driverId:v.driverId,departureDateTime:v.departureDateTime,
 estimatedArrivalDateTime:v.estimatedArrivalDateTime,status:({'Scheduled':'SCHEDULED','Boarding':'BOARDING','In Progress':'IN_TRANSIT','Completed':'COMPLETED','Cancelled':'CANCELLED'} as any)[v.status||'Scheduled']||'SCHEDULED',
 availableSeats:v.availableSeats??v.totalSeats,totalSeats:v.totalSeats}));
tripService.getAll=tripBase.getAll;tripService.getById=tripBase.getById;tripService.create=tripBase.create;tripService.update=tripBase.update;tripService.delete=tripBase.delete;
tripService.updateStatus=async(id,status)=>tripBase.update(id,{status});
connectService(paymentBase,'payments',r=>({id:String(r.PAYMENT_ID),bookingId:String(r.BOOKING_ID),bookingReference:'',passengerName:'',
 amountLkr:r.AMOUNT,paymentMethod:r.PAYMENT_METHOD==='BANK_TRANSFER'?'Bank Transfer':'Card',
 paymentStatus:({'SUCCESS':'Paid','PENDING':'Pending','FAILED':'Failed','REFUNDED':'Refunded'} as any)[r.PAYMENT_STATUS]||'Pending',
 transactionDate:dt(r.PAYMENT_TIMESTAMP),referenceNumber:r.TRANSACTION_REFERENCE,receiptNumber:r.TRANSACTION_REFERENCE
} as Payment),v=>({bookingId:v.bookingId,amountLkr:v.amountLkr,paymentMethod:v.paymentMethod==='Bank Transfer'?'BANK_TRANSFER':'CREDIT_CARD',
 referenceNumber:v.referenceNumber||`SM${Date.now()}`,paymentStatus:({'Paid':'SUCCESS','Pending':'PENDING','Failed':'FAILED','Refunded':'REFUNDED'} as any)[v.paymentStatus||'Pending']}));
paymentService.getAll=paymentBase.getAll;paymentService.getById=paymentBase.getById;paymentService.create=paymentBase.create;paymentService.update=paymentBase.update;paymentService.delete=paymentBase.delete;
paymentService.updateStatus=async(id,status)=>paymentBase.update(id,{paymentStatus:status});
connectService(maintenanceService,'maintenance',r=>({id:String(r.MAINTENANCE_ID),vehicleId:String(r.VEHICLE_ID),vehicleReg:'',
 maintenanceType:title(r.SERVICE_TYPE) as any,description:r.NOTES||'',scheduledDate:dt(r.SERVICE_DATE),maintenanceCostLkr:r.COST_AMOUNT,
 serviceProvider:r.SERVICE_CENTER,status:({'SCHEDULED':'Scheduled','IN_PROGRESS':'In Progress','COMPLETED':'Completed'} as any)[r.STATUS]||'Scheduled',
 technicianName:r.TECHNICIAN_NAME,odometerReadingKm:r.ODOMETER_READING_KM,nextServiceOdometerKm:r.NEXT_SERVICE_ODOMETER_KM
} as MaintenanceRecord),v=>({vehicleId:v.vehicleId,scheduledDate:v.scheduledDate,odometerReadingKm:(v as any).odometerReadingKm??0,
 maintenanceType:String(v.maintenanceType||'Routine Inspection').toUpperCase().replace(/ /g,'_'),technicianName:v.technicianName,
 serviceProvider:v.serviceProvider,description:v.description,maintenanceCostLkr:v.maintenanceCostLkr,
 nextServiceOdometerKm:(v as any).nextServiceOdometerKm??5000,status:v.status==='In Progress'?'IN_PROGRESS':v.status==='Completed'?'COMPLETED':'SCHEDULED'}));
connectService(feedbackBase,'feedback',r=>({id:String(r.REVIEW_ID),tripId:String(r.TRIP_ID),tripName:'',passengerId:String(r.PASSENGER_ID),
 passengerName:'',vehicleId:String(r.VEHICLE_ID),vehicleReg:'',driverId:String(r.DRIVER_ID),driverName:'',vehicleRating:r.VEHICLE_RATING,
 driverRating:r.DRIVER_RATING,overallRating:r.AVERAGE_SCORE,feedbackComment:r.REVIEW_COMMENT||'',reviewDate:dt(r.CREATED_AT),
 status:r.ACTION_STATUS==='RESOLVED'?'Resolved':'Under Review',cleanlinessRating:r.CLEANLINESS_RATING,punctualityRating:r.PUNCTUALITY_RATING
} as FeedbackReview),v=>({passengerId:v.passengerId,tripId:v.tripId,vehicleId:v.vehicleId,driverId:v.driverId,
 driverRating:v.driverRating,vehicleRating:v.vehicleRating,cleanlinessRating:(v as any).cleanlinessRating??v.overallRating,
 punctualityRating:(v as any).punctualityRating??v.overallRating,overallRating:v.overallRating,feedbackComment:v.feedbackComment,
 sentiment:'POSITIVE',status:v.status==='Resolved'?'RESOLVED':'PENDING'}));
feedbackService.getAll=feedbackBase.getAll;feedbackService.getById=feedbackBase.getById;feedbackService.create=feedbackBase.create;feedbackService.update=feedbackBase.update;feedbackService.delete=feedbackBase.delete;
feedbackService.updateStatus=async(id,status)=>feedbackBase.update(id,{status});

connectService(bookingBase,'bookings',r=>({id:String(r.BOOKING_ID),bookingReference:`SM-${r.BOOKING_ID}`,tripId:String(r.TRIP_ID),
 routeName:'',startingLocation:'',destination:'',departureDateTime:'',passengerId:String(r.PASSENGER_ID),passengerName:'',passengerEmail:'',passengerPhone:'',
 seats:[r.SEAT_NUMBER],totalAmountLkr:r.TOTAL_PAID,bookingStatus:r.STATUS==='CANCELLED'?'Cancelled':'Confirmed',bookingDate:dt(r.BOOKING_TIMESTAMP),
 paymentMethod:'Card',paymentStatus:'Pending',vehicleReg:''} as Booking),v=>({tripId:v.tripId,passengerId:v.passengerId,seats:v.seats,
 totalAmountLkr:v.totalAmountLkr,bookingStatus:v.bookingStatus}));
bookingService.getAll=bookingBase.getAll;bookingService.getById=bookingBase.getById;bookingService.create=bookingBase.create;bookingService.update=bookingBase.update;bookingService.delete=bookingBase.delete;
bookingService.cancelBooking=async(id)=>bookingBase.update(id,{bookingStatus:'Cancelled'});
function mongoService<T extends {id:string}>(service:ReturnType<typeof makeService<T>>,resource:string){
 service.getAll=async()=>{const response=await fetch(`http://localhost:5000/api/${resource}/all`);if(!response.ok)throw new Error(`Unable to load ${resource}`);return response.json();};
 service.getById=async id=>(await service.getAll()).find(x=>x.id===id);
 service.create=async data=>{const result=await dbWrite(resource,'POST',undefined,data);return {...data,id:result.id} as T;};
 service.update=async(id,data)=>{const current=await service.getById(id);if(!current)return undefined;const updated={...current,...data,id};await dbWrite(resource,'PUT',id,updated);return updated;};
 service.delete=async id=>{await dbWrite(resource,'DELETE',id);};
}
mongoService(announcementService,'announcements');
mongoService(communityBase,'community');
communityService.getAll=communityBase.getAll;communityService.getById=communityBase.getById;communityService.create=communityBase.create;
communityService.update=communityBase.update;communityService.delete=communityBase.delete;
communityService.updateLikes=async(id,likesCount)=>communityBase.update(id,{likesCount});
communityService.addReply=async(id,reply)=>{const post=await communityBase.getById(id);if(!post)return undefined;return communityBase.update(id,{replies:[...(post.replies||[]),reply]});};
