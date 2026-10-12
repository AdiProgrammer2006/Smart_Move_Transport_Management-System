require("dotenv").config();

const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

let mongoDb;

// Oracle connection configuration
const oracleConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING
};

// Connect to MongoDB
async function connectMongoDB() {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  mongoDb = client.db(process.env.MONGODB_DB);

  console.log("MongoDB connected successfully");
}

// Test API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SmartMove backend is running"
  });
});

// Fetch trips from Oracle
app.get("/api/trips", async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection(oracleConfig);

    const result = await connection.execute(
      `SELECT
         T.TRIP_ID, T.ROUTE_ID, T.VEHICLE_ID, T.DRIVER_ID, T.SCHEDULED_ARRIVAL, T.TOTAL_SEATS,
         R.ROUTE_NAME,
         R.ORIGIN_CITY,
         R.DESTINATION_CITY,
         T.SCHEDULED_DEPARTURE,
         T.AVAILABLE_SEATS,
         T.STATUS
       FROM TRIPS T
       JOIN ROUTES R ON T.ROUTE_ID = R.ROUTE_ID
       ORDER BY T.SCHEDULED_DEPARTURE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch trips" });
  } finally {
    if (connection) await connection.close();
  }
});

// Fetch announcements from MongoDB
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await mongoDb
      .collection("announcements")
      .find({ is_active: true })
      .toArray();

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch announcements" });
  }
});


// Live Oracle read endpoints. Explicit table allowlist prevents arbitrary SQL.
const oracleReadTables = { trips: 'TRIPS', vehicles: 'VEHICLES', drivers: 'DRIVERS', routes: 'ROUTES', passengers: 'PASSENGERS', bookings: 'BOOKINGS', payments: 'PAYMENTS', maintenance: 'VEHICLE_MAINTENANCE', feedback: 'FEEDBACK_REVIEWS' };
for (const [resource, table] of Object.entries(oracleReadTables)) {
  app.get(`/api/${resource}`, async (_req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(oracleConfig);
      const result = await connection.execute(`SELECT * FROM ${table} FETCH FIRST 500 ROWS ONLY`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.json(result.rows);
    } catch (error) {
      console.error(`Oracle ${resource}:`, error);
      res.status(500).json({ error: `Unable to fetch ${resource}` });
    } finally {
      if (connection) await connection.close();
    }
  });
}


// Persistent Oracle fleet writes. Bind variables protect values; IDs come from the
// existing SEQ_VEHICLES sequence in the supplied schema.
const vehicleColumns = {
  registrationNumber: 'REGISTRATION_NO', vinNumber: 'VIN_NUMBER',
  vehicleType: 'VEHICLE_TYPE', model: 'MODEL_NAME',
  seatingCapacity: 'SEATING_CAPACITY', manufactureYear: 'MANUFACTURE_YEAR',
  mileageKm: 'CURRENT_MILEAGE_KM', nextServiceMileageKm: 'NEXT_SERVICE_MILEAGE_KM',
  nextServiceDate: 'NEXT_SERVICE_DATE', fuelType: 'FUEL_TYPE',
  status: 'STATUS', primaryDriverId: 'PRIMARY_DRIVER_ID'
};
const vehicleTypes = ['LUXURY_COACH','ELECTRIC_EXPRESS','EXECUTIVE_VAN','MINI_SHUTTLE','DOUBLE_DECKER'];
const vehicleStatuses = ['ACTIVE','MAINTENANCE','INSPECTION','OUT_OF_SERVICE'];
const vehicleFuels = ['ELECTRIC','DIESEL','HYBRID','CNG'];
function validateVehicle(body, isUpdate = false) {
  const required = ['registrationNumber','vinNumber','vehicleType','model','seatingCapacity',
    'manufactureYear','mileageKm','nextServiceMileageKm','nextServiceDate','fuelType','status'];
  const missing = required.filter(k => body[k] === undefined || body[k] === null || body[k] === '');
  if (missing.length) return `Missing fields: ${missing.join(', ')}`;
  if (!vehicleTypes.includes(body.vehicleType)) return 'Invalid vehicle type';
  if (!vehicleStatuses.includes(body.status)) return 'Invalid vehicle status';
  if (!vehicleFuels.includes(body.fuelType)) return 'Invalid fuel type';
  for (const k of ['seatingCapacity','manufactureYear','mileageKm','nextServiceMileageKm']) {
    if (!Number.isFinite(Number(body[k])) || Number(body[k]) < 0) return `Invalid ${k}`;
  }
  if (!Number.isInteger(Number(body.seatingCapacity)) || Number(body.seatingCapacity) < 4 || Number(body.seatingCapacity) > 120) return 'Seating capacity must be 4–120';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.nextServiceDate) || Number.isNaN(Date.parse(body.nextServiceDate))) return 'Next service date must be YYYY-MM-DD';
  if (body.primaryDriverId != null && body.primaryDriverId !== '' && !Number.isInteger(Number(body.primaryDriverId))) return 'Invalid primary driver ID';
  return null;
}
function vehicleBinds(body) {
  return {
    registrationNumber: body.registrationNumber.trim(), vinNumber: body.vinNumber.trim(),
    vehicleType: body.vehicleType, model: body.model.trim(),
    seatingCapacity: Number(body.seatingCapacity), manufactureYear: Number(body.manufactureYear),
    mileageKm: Number(body.mileageKm), nextServiceMileageKm: Number(body.nextServiceMileageKm),
    nextServiceDate: body.nextServiceDate, fuelType: body.fuelType, status: body.status,
    primaryDriverId: body.primaryDriverId == null || body.primaryDriverId === '' ? null : Number(body.primaryDriverId)
  };
}
function writeError(res, error) {
  console.error('Oracle write:', error);
  const code = error.errorNum;
  const status = [1, 1400, 2290, 2291, 2292, 12899].includes(code) ? 400 : 500;
  res.status(status).json({ error: status === 400 ? 'Oracle constraint rejected the record. Check unique fields and related records.' : 'Database write failed', code: error.code });
}
app.post('/api/vehicles', async (req,res) => {
  const problem = validateVehicle(req.body || {});
  if (problem) return res.status(400).json({error:problem});
  let connection;
  try {
    connection = await oracledb.getConnection(oracleConfig);
    const fields = Object.entries(vehicleColumns);
    const cols = fields.map(([,col]) => col).join(', ');
    const vals = fields.map(([key]) => key === 'nextServiceDate' ? `TO_DATE(:${key}, 'YYYY-MM-DD')` : `:${key}`).join(', ');
    const result = await connection.execute(`INSERT INTO VEHICLES (VEHICLE_ID, ${cols}) VALUES (SEQ_VEHICLES.NEXTVAL, ${vals}) RETURNING VEHICLE_ID INTO :newId`,
      {...vehicleBinds(req.body), newId: {dir:oracledb.BIND_OUT, type:oracledb.NUMBER}}, {autoCommit:true});
    res.status(201).json({id:String(result.outBinds.newId[0])});
  } catch(error) {writeError(res,error);} finally {if(connection) await connection.close();}
});
app.put('/api/vehicles/:id', async (req,res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({error:'Invalid vehicle ID'});
  const problem = validateVehicle(req.body || {},true);
  if (problem) return res.status(400).json({error:problem});
  let connection;
  try {
    connection = await oracledb.getConnection(oracleConfig);
    const setters = Object.entries(vehicleColumns).map(([key,col]) => `${col} = ${key === 'nextServiceDate' ? `TO_DATE(:${key}, 'YYYY-MM-DD')` : `:${key}`}`).join(', ');
    const result = await connection.execute(`UPDATE VEHICLES SET ${setters} WHERE VEHICLE_ID = :id`, {...vehicleBinds(req.body),id}, {autoCommit:true});
    if (!result.rowsAffected) return res.status(404).json({error:'Vehicle not found'});
    res.json({id:String(id)});
  } catch(error) {writeError(res,error);} finally {if(connection) await connection.close();}
});
app.delete('/api/vehicles/:id', async (req,res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({error:'Invalid vehicle ID'});
  let connection;
  try {
    connection = await oracledb.getConnection(oracleConfig);
    const result = await connection.execute('DELETE FROM VEHICLES WHERE VEHICLE_ID = :id', {id}, {autoCommit:true});
    if (!result.rowsAffected) return res.status(404).json({error:'Vehicle not found'});
    res.json({deleted:true});
  } catch(error) {writeError(res,error);} finally {if(connection) await connection.close();}
});


// Oracle-backed driver writes. License expiry, address and emergency contact are
// not columns in the supplied DRIVERS table and are not persisted.
const driverStatuses = ['ON_DUTY', 'RESTING', 'IN_TRANSIT', 'ON_LEAVE'];
function driverPayload(body) {
  const required = ['fullName', 'licenseNumber', 'licenseClass', 'contactNumber', 'email', 'employmentDate'];
  const missing = required.filter(k => !String(body[k] ?? '').trim());
  if (missing.length) throw new Error(`Missing fields: ${missing.join(', ')}`);
  const status = ({'Active':'ON_DUTY','On Trip':'IN_TRANSIT','Resting':'RESTING','On Leave':'ON_LEAVE'})[body.status] || body.status || 'ON_DUTY';
  if (!driverStatuses.includes(status)) throw new Error('Invalid driver status');
  const date = String(body.employmentDate).slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error('Invalid employment date');
  const experience = Number(body.yearsExperience ?? 1);
  const safety = Number(body.safetyScore ?? 100);
  const rating = Number(body.safetyRating ?? 5);
  const trips = Number(body.totalTripsCompleted ?? 0);
  if (!Number.isInteger(experience) || experience < 0 || experience > 99 || !Number.isInteger(safety) || safety < 0 || safety > 100 || !Number.isFinite(rating) || rating < 1 || rating > 5 || !Number.isInteger(trips) || trips < 0) throw new Error('Invalid driver numeric fields');
  const vehicle = body.assignedVehicleId == null || body.assignedVehicleId === '' ? null : Number(body.assignedVehicleId);
  if (vehicle !== null && (!Number.isInteger(vehicle) || vehicle < 1)) throw new Error('Invalid assigned vehicle');
  return {fullName:String(body.fullName).trim(),licenseNumber:String(body.licenseNumber).trim(),licenseClass:String(body.licenseClass).trim(),contactNumber:String(body.contactNumber).trim(),email:String(body.email).trim(),employmentDate:date,yearsExperience:experience,safetyScore:safety,rating,totalTripsCompleted:trips,assignedVehicleId:vehicle,status};
}
const driverFields = {fullName:'FULL_NAME',licenseNumber:'LICENSE_NUMBER',licenseClass:'LICENSE_CLASS',contactNumber:'PHONE_NUMBER',email:'EMAIL',employmentDate:'HIRE_DATE',yearsExperience:'YEARS_EXPERIENCE',safetyScore:'SAFETY_SCORE',rating:'RATING',totalTripsCompleted:'TOTAL_TRIPS_COMPLETED',assignedVehicleId:'ASSIGNED_VEHICLE_ID',status:'STATUS'};
function driverValidation(req,res) {try{return driverPayload(req.body || {});}catch(e){res.status(400).json({error:e.message});return null;}}
app.post('/api/drivers',async(req,res)=>{
 const binds=driverValidation(req,res);if(!binds)return;
 let connection;
 try {connection=await oracledb.getConnection(oracleConfig);
 const fields=Object.entries(driverFields);
 const cols=fields.map(([,v])=>v).join(', ');
 const values=fields.map(([k])=>k==='employmentDate'?"TO_DATE(:employmentDate, 'YYYY-MM-DD')":`:${k}`).join(', ');
 const result=await connection.execute(`INSERT INTO DRIVERS (DRIVER_ID, ${cols}) VALUES (SEQ_DRIVERS.NEXTVAL, ${values}) RETURNING DRIVER_ID INTO :newId`,{...binds,newId:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}},{autoCommit:true});
 res.status(201).json({id:String(result.outBinds.newId[0])});
 }catch(e){writeError(res,e);}finally{if(connection)await connection.close();}
});
app.put('/api/drivers/:id',async(req,res)=>{
 const id=Number(req.params.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:'Invalid driver ID'});
 const binds=driverValidation(req,res);if(!binds)return;
 let connection;
 try {connection=await oracledb.getConnection(oracleConfig);
 const sets=Object.entries(driverFields).map(([k,v])=>`${v} = ${k==='employmentDate'?"TO_DATE(:employmentDate, 'YYYY-MM-DD')":`:${k}`}`).join(', ');
 const result=await connection.execute(`UPDATE DRIVERS SET ${sets} WHERE DRIVER_ID = :id`,{...binds,id},{autoCommit:true});
 if(!result.rowsAffected)return res.status(404).json({error:'Driver not found'});
 res.json({id:String(id)});
 }catch(e){writeError(res,e);}finally{if(connection)await connection.close();}
});
app.delete('/api/drivers/:id',async(req,res)=>{
 const id=Number(req.params.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:'Invalid driver ID'});
 let connection;
 try{connection=await oracledb.getConnection(oracleConfig);
 const result=await connection.execute('DELETE FROM DRIVERS WHERE DRIVER_ID = :id',{id},{autoCommit:true});
 if(!result.rowsAffected)return res.status(404).json({error:'Driver not found'});
 res.json({deleted:true});
 }catch(e){writeError(res,e);}finally{if(connection)await connection.close();}
});


// Schema-based CRUD. Identifiers are hardcoded in the server-side allowlist;
// user input is always bound, never interpolated into SQL.
const schemaResources = {"routes": {"table": "ROUTES", "pk": "ROUTE_ID", "seq": "SEQ_ROUTES", "fields": {"routeCode": "ROUTE_CODE", "routeName": "ROUTE_NAME", "startingLocation": "ORIGIN_CITY", "destination": "DESTINATION_CITY", "distanceKm": "TOTAL_DISTANCE_KM", "estimatedDurationMins": "ESTIMATED_DURATION_MINS", "baseFareLkr": "BASE_FARE", "category": "CATEGORY"}, "required": ["routeCode", "routeName", "startingLocation", "destination", "distanceKm", "estimatedDurationMins", "baseFareLkr"], "defaults": {"category": "METRO_COMMUTER"}, "numeric": ["distanceKm", "estimatedDurationMins", "baseFareLkr"], "dates": []}, "passengers": {"table": "PASSENGERS", "pk": "PASSENGER_ID", "seq": "SEQ_PASSENGERS", "fields": {"firstName": "FIRST_NAME", "lastName": "LAST_NAME", "email": "EMAIL", "phoneNumber": "PHONE_NUMBER", "passengerTier": "PASSENGER_TIER", "organizationName": "ORGANIZATION_NAME", "walletBalance": "WALLET_BALANCE", "loyaltyPoints": "LOYALTY_POINTS"}, "required": ["firstName", "lastName", "email", "phoneNumber"], "defaults": {"passengerTier": "REGULAR_COMMUTER", "walletBalance": 0, "loyaltyPoints": 0}, "numeric": ["walletBalance", "loyaltyPoints"], "dates": []}, "trips": {"table": "TRIPS", "pk": "TRIP_ID", "seq": "SEQ_TRIPS", "fields": {"routeId": "ROUTE_ID", "vehicleId": "VEHICLE_ID", "driverId": "DRIVER_ID", "departureDateTime": "SCHEDULED_DEPARTURE", "estimatedArrivalDateTime": "SCHEDULED_ARRIVAL", "status": "STATUS", "availableSeats": "AVAILABLE_SEATS", "totalSeats": "TOTAL_SEATS"}, "required": ["routeId", "vehicleId", "driverId", "departureDateTime", "estimatedArrivalDateTime", "totalSeats"], "defaults": {"status": "SCHEDULED"}, "numeric": ["routeId", "vehicleId", "driverId", "availableSeats", "totalSeats"], "dates": ["departureDateTime", "estimatedArrivalDateTime"]}, "payments": {"table": "PAYMENTS", "pk": "PAYMENT_ID", "seq": "SEQ_PAYMENTS", "fields": {"bookingId": "BOOKING_ID", "amountLkr": "AMOUNT", "paymentMethod": "PAYMENT_METHOD", "referenceNumber": "TRANSACTION_REFERENCE", "paymentStatus": "PAYMENT_STATUS"}, "required": ["bookingId", "amountLkr", "paymentMethod", "referenceNumber"], "defaults": {"paymentStatus": "PENDING"}, "numeric": ["bookingId", "amountLkr"], "dates": []}, "maintenance": {"table": "VEHICLE_MAINTENANCE", "pk": "MAINTENANCE_ID", "seq": "SEQ_MAINTENANCE", "fields": {"vehicleId": "VEHICLE_ID", "scheduledDate": "SERVICE_DATE", "odometerReadingKm": "ODOMETER_READING_KM", "maintenanceType": "SERVICE_TYPE", "technicianName": "TECHNICIAN_NAME", "serviceProvider": "SERVICE_CENTER", "description": "NOTES", "maintenanceCostLkr": "COST_AMOUNT", "nextServiceOdometerKm": "NEXT_SERVICE_ODOMETER_KM", "status": "STATUS"}, "required": ["vehicleId", "scheduledDate", "odometerReadingKm", "maintenanceType", "technicianName", "serviceProvider", "maintenanceCostLkr", "nextServiceOdometerKm"], "defaults": {"status": "SCHEDULED"}, "numeric": ["vehicleId", "odometerReadingKm", "maintenanceCostLkr", "nextServiceOdometerKm"], "dates": ["scheduledDate"]}, "feedback": {"table": "FEEDBACK_REVIEWS", "pk": "REVIEW_ID", "seq": "SEQ_FEEDBACK", "fields": {"passengerId": "PASSENGER_ID", "tripId": "TRIP_ID", "vehicleId": "VEHICLE_ID", "driverId": "DRIVER_ID", "driverRating": "DRIVER_RATING", "vehicleRating": "VEHICLE_RATING", "cleanlinessRating": "CLEANLINESS_RATING", "punctualityRating": "PUNCTUALITY_RATING", "overallRating": "AVERAGE_SCORE", "feedbackComment": "REVIEW_COMMENT", "sentiment": "SENTIMENT", "status": "ACTION_STATUS"}, "required": ["passengerId", "tripId", "vehicleId", "driverId", "driverRating", "vehicleRating", "cleanlinessRating", "punctualityRating", "overallRating"], "defaults": {"sentiment": "POSITIVE", "status": "RESOLVED"}, "numeric": ["passengerId", "tripId", "vehicleId", "driverId", "driverRating", "vehicleRating", "cleanlinessRating", "punctualityRating", "overallRating"], "dates": []}};
function normalizeSchemaBody(spec, input) {
  const body = {...spec.defaults, ...input};
  for (const name of spec.required) if (body[name] === undefined || body[name] === null || body[name] === '') throw new Error(`${name} is required`);
  for (const name of spec.numeric) if (body[name] !== undefined && body[name] !== null && body[name] !== '') {
    if (!Number.isFinite(Number(body[name]))) throw new Error(`${name} must be a number`);
    body[name] = Number(body[name]);
  }
  for (const name of spec.dates) if (body[name] != null && body[name] !== '') {
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/.test(String(body[name])) || Number.isNaN(Date.parse(body[name]))) throw new Error(`${name} is an invalid date`);
    body[name] = String(body[name]).replace('T',' ').replace(/Z$/,'').slice(0,19);
  }
  return body;
}
for (const [resource, spec] of Object.entries(schemaResources)) {
  const fields = Object.entries(spec.fields);
  const valueExpr = key => spec.dates.includes(key) ? (resource === 'trips' ? `TO_TIMESTAMP(:${key}, 'YYYY-MM-DD HH24:MI:SS')` : `TO_DATE(:${key}, 'YYYY-MM-DD')`) : `:${key}`;
  const perform = async (req,res,action) => {
    let conn;
    try {
      const id = action === 'create' ? null : Number(req.params.id);
      if (action !== 'create' && (!Number.isSafeInteger(id) || id < 1)) return res.status(400).json({error:'Invalid ID'});
      const payload = action === 'delete' ? {} : normalizeSchemaBody(spec, req.body || {});
      const binds = {};
      for (const [key] of fields) binds[key] = payload[key] === '' || payload[key] === undefined ? null : payload[key];
      conn = await oracledb.getConnection(oracleConfig);
      let sql;
      if (action === 'create') sql = `INSERT INTO ${spec.table} (${spec.pk}, ${fields.map(([,v])=>v).join(', ')}) VALUES (${spec.seq}.NEXTVAL, ${fields.map(([k])=>valueExpr(k)).join(', ')}) RETURNING ${spec.pk} INTO :newId`;
      if (action === 'update') {sql = `UPDATE ${spec.table} SET ${fields.map(([k,v])=>`${v} = ${valueExpr(k)}`).join(', ')} WHERE ${spec.pk} = :id`;binds.id=id;}
      if (action === 'delete') {sql = `DELETE FROM ${spec.table} WHERE ${spec.pk} = :id`;binds.id=id;}
      if (action === 'create') binds.newId = {dir:oracledb.BIND_OUT,type:oracledb.NUMBER};
      const result = await conn.execute(sql,binds,{autoCommit:true});
      if (action !== 'create' && !result.rowsAffected) return res.status(404).json({error:'Record not found'});
      res.status(action === 'create' ? 201 : 200).json(action === 'create' ? {id:String(result.outBinds.newId[0])} : {id:String(id),updated:action==='update',deleted:action==='delete'});
    } catch(err) {
      if (err.message && (err.message.includes('required') || err.message.includes('must be') || err.message.includes('invalid date'))) return res.status(400).json({error:err.message});
      writeError(res,err);
    } finally {if(conn) await conn.close();}
  };
  app.post(`/api/${resource}`,(req,res)=>perform(req,res,'create'));
  app.put(`/api/${resource}/:id`,(req,res)=>perform(req,res,'update'));
  app.delete(`/api/${resource}/:id`,(req,res)=>perform(req,res,'delete'));
}


// Booking writes use the existing seat triggers. A cancelled booking remains as an audit record.
app.post('/api/bookings',async(req,res)=>{
 const {tripId,passengerId,seats,totalAmountLkr}=req.body||{};
 if(!Number.isSafeInteger(Number(tripId))||!Number.isSafeInteger(Number(passengerId))||!Array.isArray(seats)||seats.length!==1||!String(seats[0]).trim())return res.status(400).json({error:'A trip, passenger and exactly one seat are required'});
 let conn;
 try {conn=await oracledb.getConnection(oracleConfig);
   const lock=await conn.execute('SELECT AVAILABLE_SEATS, STATUS FROM TRIPS WHERE TRIP_ID=:id FOR UPDATE',{id:Number(tripId)},{outFormat:oracledb.OUT_FORMAT_OBJECT});
   if(!lock.rows.length||lock.rows[0].AVAILABLE_SEATS<1||!['SCHEDULED','BOARDING'].includes(lock.rows[0].STATUS))return res.status(409).json({error:'Trip has no bookable seats'});
   const fare=Number(totalAmountLkr);if(!Number.isFinite(fare)||fare<0)return res.status(400).json({error:'Invalid fare'});
   const result=await conn.execute(`INSERT INTO BOOKINGS (BOOKING_ID,TRIP_ID,PASSENGER_ID,SEAT_NUMBER,FARE_AMOUNT,DISCOUNT_APPLIED,TOTAL_PAID,STATUS)
      VALUES (SEQ_BOOKINGS.NEXTVAL,:tripId,:passengerId,:seat,:fare,0,:fare,'CONFIRMED') RETURNING BOOKING_ID INTO :newId`,
      {tripId:Number(tripId),passengerId:Number(passengerId),seat:String(seats[0]).trim(),fare,newId:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}});
   await conn.commit();res.status(201).json({id:String(result.outBinds.newId[0])});
 }catch(e){if(conn)await conn.rollback();writeError(res,e);}finally{if(conn)await conn.close();}
});
app.put('/api/bookings/:id',async(req,res)=>{
 const id=Number(req.params.id),status=({'Confirmed':'CONFIRMED','Cancelled':'CANCELLED','Pending':'CONFIRMED'})[req.body.bookingStatus];
 if(!Number.isSafeInteger(id)||!status)return res.status(400).json({error:'Invalid booking update'});
 let conn;try{conn=await oracledb.getConnection(oracleConfig);
 const old=await conn.execute('SELECT STATUS FROM BOOKINGS WHERE BOOKING_ID=:id FOR UPDATE',{id},{outFormat:oracledb.OUT_FORMAT_OBJECT});
 if(!old.rows.length)return res.status(404).json({error:'Booking not found'});
 if(old.rows[0].STATUS==='CANCELLED'&&status!=='CANCELLED')return res.status(409).json({error:'Cancelled bookings cannot be reopened'});
 const result=await conn.execute('UPDATE BOOKINGS SET STATUS=:status WHERE BOOKING_ID=:id',{id,status},{autoCommit:true});res.json({id:String(id),updated:!!result.rowsAffected});
 }catch(e){writeError(res,e);}finally{if(conn)await conn.close();}
});
app.delete('/api/bookings/:id',(_req,res)=>res.status(405).json({error:'Cancel a booking instead of deleting its audit record'}));
// MongoDB announcements and community posts. Object IDs are converted to UI IDs.
const {ObjectId}=require('mongodb');
for(const [resource,collection] of [['announcements','announcements'],['community','community_posts']]){
 app.get(`/api/${resource}/all`,async(_req,res)=>{try{res.json((await mongoDb.collection(collection).find({}).limit(500).toArray()).map(x=>({...x,id:String(x._id)})));}catch(e){res.status(500).json({error:'Unable to load '+resource});}});
 app.post(`/api/${resource}`,async(req,res)=>{try{const doc={...req.body};delete doc.id;delete doc._id;
 const result=await mongoDb.collection(collection).insertOne(doc);res.status(201).json({id:String(result.insertedId)});
 }catch(e){res.status(500).json({error:'Unable to save '+resource});}});
 app.put(`/api/${resource}/:id`,async(req,res)=>{try{if(!ObjectId.isValid(req.params.id))return res.status(400).json({error:'Invalid ID'});
 const doc={...req.body};delete doc.id;delete doc._id;const result=await mongoDb.collection(collection).updateOne({_id:new ObjectId(req.params.id)},{$set:doc});
 if(!result.matchedCount)return res.status(404).json({error:'Not found'});res.json({id:req.params.id});
 }catch(e){res.status(500).json({error:'Unable to update '+resource});}});
 app.delete(`/api/${resource}/:id`,async(req,res)=>{try{if(!ObjectId.isValid(req.params.id))return res.status(400).json({error:'Invalid ID'});
 const result=await mongoDb.collection(collection).deleteOne({_id:new ObjectId(req.params.id)});if(!result.deletedCount)return res.status(404).json({error:'Not found'});res.json({deleted:true});
 }catch(e){res.status(500).json({error:'Unable to delete '+resource});}});
}

// Start server
async function startServer() {
  try {
    await connectMongoDB();

    app.listen(process.env.PORT || 5000, () => {
      console.log("SmartMove backend running on port 5000");
    });
  } catch (error) {
    console.error("Backend startup failed:", error);
    process.exit(1);
  }

}

startServer();
