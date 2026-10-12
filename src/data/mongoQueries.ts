import {
  MONGO_DYNAMIC_REVIEWS,
  MONGO_VEHICLE_DOCS,
  MONGO_ANNOUNCEMENTS,
  MONGO_COMMUNITY_POSTS,
  MONGO_TRIP_TELEMETRY,
} from './seedData';
import { MongoDynamicReview, MongoVehicleDocumentMedia } from './relationalTypes';

export interface MongoDemoQuery {
  id: string;
  title: string;
  targetCollection: string;
  description: string;
  mqlCode: string;
  explanation: string;
  execute: (params?: Record<string, any>) => any;
  defaultParams?: Record<string, any>;
  paramInputs?: Array<{
    name: string;
    label: string;
    type: 'select' | 'text' | 'number';
    options?: Array<{ value: string; label: string }>;
    defaultValue: any;
  }>;
}

export const MONGO_DEMO_QUERIES: MongoDemoQuery[] = [
  {
    id: 'mongo_query_1_route_reviews',
    title: 'Query 1: Retrieve All Passenger Reviews for a Specific Route',
    targetCollection: 'passenger_reviews_dynamic',
    description: 'Fetches rich, unstructured passenger comments, sentiment tags, multimedia attachments, and aspect ratings for a chosen transit route.',
    mqlCode: `// MQL: Retrieve all reviews for Route SM-101 (route_id: 301)
// Sorted by timestamp descending with sentiment tags projection
db.passenger_reviews_dynamic.find(
  { route_id: NumberInt(301) },
  {
    review_id: 1,
    passenger_name: 1,
    passenger_tier: 1,
    overall_rating: 1,
    sentiment_tags: 1,
    feedback_text: 1,
    aspect_ratings: 1,
    photos_attached: 1,
    upvotes: 1,
    operator_response: 1,
    timestamp: 1
  }
).sort({ timestamp: -1 });`,
    explanation: 'Uses find() query with filter on route_id, projecting nested sentiment tags, aspect scores, and customer response threads.',
    paramInputs: [
      {
        name: 'route_id',
        label: 'Select Transit Route',
        type: 'select',
        defaultValue: 301,
        options: [
          { value: '301', label: 'SM-101: Metro Central ↔ Tech Innovation Park' },
          { value: '302', label: 'SM-204: Downtown ↔ Airport Express' },
          { value: '303', label: 'SM-305: Campus ↔ Medical Center' },
          { value: '304', label: 'SM-408: Capital City ↔ Harbor Bay' },
        ],
      },
      {
        name: 'min_rating',
        label: 'Minimum Star Rating',
        type: 'select',
        defaultValue: 1,
        options: [
          { value: '1', label: 'All Reviews (1+ Stars)' },
          { value: '3', label: 'Neutral & Positive (3+ Stars)' },
          { value: '4', label: 'Top Rated Only (4+ Stars)' },
        ],
      },
    ],
    execute: (params = { route_id: 301, min_rating: 1 }) => {
      const routeId = Number(params.route_id || 301);
      const minRating = Number(params.min_rating || 1);
      return MONGO_DYNAMIC_REVIEWS.filter(
        (r) => r.route_id === routeId && r.overall_rating >= minRating
      );
    },
  },
  {
    id: 'mongo_query_2_highest_rated',
    title: 'Query 2: Identify Highest-Rated Vehicles or Drivers (Aggregation Pipeline)',
    targetCollection: 'passenger_reviews_dynamic',
    description: 'Executes an aggregation pipeline with $group, $avg, and $sort to calculate dynamic ranking for fleet vehicles and driver captains.',
    mqlCode: `// MQL Aggregation Pipeline: Group by Driver and compute weighted metrics
db.passenger_reviews_dynamic.aggregate([
  {
    $group: {
      _id: "$driver_id",
      avgOverallRating: { $avg: "$overall_rating" },
      avgCleanliness: { $avg: "$aspect_ratings.cleanliness" },
      avgPunctuality: { $avg: "$aspect_ratings.punctuality" },
      totalReviews: { $sum: 1 },
      totalUpvotes: { $sum: "$upvotes" },
      sentimentSample: { $push: "$sentiment_tags" }
    }
  },
  {
    $lookup: {
      from: "drivers",
      localField: "_id",
      foreignField: "driver_id",
      as: "driver_details"
    }
  },
  {
    $project: {
      driver_id: "$_id",
      avgOverallRating: { $round: ["$avgOverallRating", 2] },
      avgCleanliness: { $round: ["$avgCleanliness", 2] },
      avgPunctuality: { $round: ["$avgPunctuality", 2] },
      totalReviews: 1,
      totalUpvotes: 1
    }
  },
  { $sort: { avgOverallRating: -1, totalReviews: -1 } }
]);`,
    explanation: 'Demonstrates MongoDB aggregation framework ($group, $avg, $lookup, $project, $sort) to extract real-time customer satisfaction analytics across drivers or vehicles.',
    paramInputs: [
      {
        name: 'groupBy',
        label: 'Aggregation Dimension',
        type: 'select',
        defaultValue: 'driver',
        options: [
          { value: 'driver', label: 'Highest Rated Drivers (Captains)' },
          { value: 'vehicle', label: 'Highest Rated Fleet Vehicles' },
        ],
      },
    ],
    execute: (params = { groupBy: 'driver' }) => {
      const isDriver = params.groupBy === 'driver';
      const grouped: Record<number, any> = {};

      MONGO_DYNAMIC_REVIEWS.forEach((rev: any) => {
        const id = Number(isDriver ? rev.driver_id : rev.vehicle_id) || 101;
        if (!grouped[id]) {
          grouped[id] = {
            id,
            targetType: isDriver ? 'Driver' : 'Vehicle',
            label: isDriver
              ? rev.driver_id === 201 ? 'Marcus Vance' : rev.driver_id === 202 ? 'Elena Rostova' : rev.driver_id === 204 ? 'Aisha Al-Mansoor' : rev.driver_id === 205 ? 'Robert Thornton' : 'Sarah Jenkins'
              : rev.vehicle_id === 101 ? 'SM-BUS-8801 (Volvo Grand Cruiser)' : rev.vehicle_id === 102 ? 'SM-EV-4420 (BYD Electric)' : rev.vehicle_id === 104 ? 'SM-VAN-2209 (Ford Transit)' : 'SM-BUS-9912 (Alexander Dennis)',
            ratings: [],
            cleanliness: [],
            punctuality: [],
            comfort: [],
            totalUpvotes: 0,
            reviewCount: 0,
          };
        }
        grouped[id].ratings.push(rev.overall_rating || (rev.ratings ? rev.ratings.comfort : 5));
        grouped[id].cleanliness.push(rev.aspect_ratings?.cleanliness || 5);
        grouped[id].punctuality.push(rev.aspect_ratings?.punctuality || rev.ratings?.punctuality || 5);
        grouped[id].comfort.push(rev.aspect_ratings?.comfort || rev.ratings?.comfort || 5);
        grouped[id].totalUpvotes += (rev.upvotes || 0);
        grouped[id].reviewCount += 1;
      });

      return Object.values(grouped).map((item: any) => ({
        id: item.id,
        target_name: item.label,
        avg_overall_rating: Number((item.ratings.reduce((a: number, b: number) => a + b, 0) / item.ratings.length).toFixed(2)),
        avg_cleanliness: Number((item.cleanliness.reduce((a: number, b: number) => a + b, 0) / item.cleanliness.length).toFixed(2)),
        avg_punctuality: Number((item.punctuality.reduce((a: number, b: number) => a + b, 0) / item.punctuality.length).toFixed(2)),
        total_reviews: item.reviewCount,
        community_upvotes: item.totalUpvotes,
        rating_stars: '★'.repeat(Math.round(item.ratings.reduce((a: number, b: number) => a + b, 0) / item.ratings.length)),
      })).sort((a, b) => b.avg_overall_rating - a.avg_overall_rating);
    },
  },
  {
    id: 'mongo_query_3_keyword_search',
    title: 'Query 3: Search Customer Complaints or Feedback Using Keywords',
    targetCollection: 'passenger_reviews_dynamic',
    description: 'Demonstrates text search / regex matching across feedback text, tags, and complaint resolution states.',
    mqlCode: `// MQL Text & Regex Query: Keyword search across feedback & tags
db.passenger_reviews_dynamic.find({
  $or: [
    { feedback_text: { $regex: "delay|delayed|clean|wifi|cold", $options: "i" } },
    { sentiment_tags: { $in: ["delayed-departure", "clean-seats", "high-speed-wifi"] } }
  ]
}, {
  review_id: 1,
  passenger_name: 1,
  feedback_text: 1,
  sentiment_tags: 1,
  complaint_status: 1,
  operator_response: 1
});`,
    explanation: 'Uses case-insensitive regex pattern or text indexes to instantly locate sensitive feedback, complaints, or service commendations.',
    paramInputs: [
      {
        name: 'keyword',
        label: 'Search Term / Keyword',
        type: 'text',
        defaultValue: 'delay',
      },
    ],
    execute: (params = { keyword: 'delay' }) => {
      const term = (params.keyword || 'delay').toLowerCase();
      return MONGO_DYNAMIC_REVIEWS.filter((rev: any) => {
        const feedbackText = (rev.feedback_text || rev.comment || '').toLowerCase();
        const sentimentTags = (rev.sentiment_tags || rev.tags || []) as string[];
        const hasTag = sentimentTags.some((t: string) => t.toLowerCase().includes(term));
        const passenger = (rev.passenger_name || '').toLowerCase();
        return feedbackText.includes(term) || hasTag || passenger.includes(term);
      });
    },
  },
  {
    id: 'mongo_query_4_vehicle_documents',
    title: 'Query 4: Retrieve Vehicle Documents & Multimedia Information',
    targetCollection: 'vehicle_documents_media',
    description: 'Retrieves unstructured PDF compliance links, insurance policies, 360-degree exterior views, and sensor telemetry dumps for fleet assets.',
    mqlCode: `// MQL: Retrieve vehicle compliance certificates and multimedia
db.vehicle_documents_media.find(
  { vehicle_id: NumberInt(101) },
  {
    registration_no: 1,
    "compliance_docs.insurance_policy": 1,
    "compliance_docs.roadworthiness_cert": 1,
    multimedia_gallery: 1,
    inspection_history: 1
  }
);`,
    explanation: 'Queries hierarchical document structure containing nested compliance policies and multimedia photo arrays.',
    paramInputs: [
      {
        name: 'vehicle_id',
        label: 'Select Fleet Asset',
        type: 'select',
        defaultValue: 101,
        options: [
          { value: '101', label: 'SM-BUS-8801: Volvo 9700 Grand Cruiser' },
          { value: '102', label: 'SM-EV-4420: BYD K9 Electric Metro' },
          { value: '103', label: 'SM-VAN-1105: Mercedes-Benz Sprinter (Service Required)' },
          { value: '104', label: 'SM-VAN-2209: Ford Transit Executive' },
        ],
      },
    ],
    execute: (params = { vehicle_id: 101 }) => {
      const vId = Number(params.vehicle_id || 101);
      return MONGO_VEHICLE_DOCS.filter((d) => d.vehicle_id === vId);
    },
  },
];
