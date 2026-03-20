export type FlightStatus =
  | 'SCHEDULED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'LANDED'
  | 'DIVERTED'

export type DisruptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type ImpactSeverity     = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RecommendationType =
  | 'DELAY_FLIGHT'
  | 'CANCEL_FLIGHT'
  | 'REBOOK_PASSENGERS'
  | 'CHANGE_AIRCRAFT'
  | 'NOTIFY_PASSENGERS'
  | 'OFFER_COMPENSATION'
  | 'DIVERT_FLIGHT'
  | 'EXPEDITE_TURNAROUND'

export type RecommendationStatus = 'PENDING' | 'APPLIED' | 'REJECTED' | 'EXPIRED'


export interface Airport {
  id:        string
  name:      string
  city:      string
  country:   string
  timezone:  string
  latitude:  number
  longitude: number
}

export interface Flight {
  id:           string
  flightNumber: string
  origin:       string
  destination:  string
  aircraftId:   string
  scheduledDep: string
  scheduledArr: string
  actualDep:    string | null
  actualArr:    string | null
  status:       FlightStatus
  delayMinutes: number
  passengers:   number
  gate:         string
  isDelayed:    boolean
  createdAt:    string
  updatedAt:    string
}

export interface Disruption {
  id:           string
  flightId:     string
  flightNumber: string
  origin:       string
  destination:  string
  type:         string
  severity:     DisruptionSeverity
  description:  string
  delayMinutes: number
  passengers:   number
  detectedAt:   string
  resolved:     boolean
}

export interface ImpactReport {
  id:                  string
  disruptionId:        string
  flightNumber:        string
  origin:              string
  destination:         string
  disruptionType:      string
  affectedPassengers:  number
  affectedFlights:     number
  totalDelayMinutes:   number
  severity:            ImpactSeverity
  calculatedAt:        string
}

export interface Recommendation {
  id:                 string
  impactReportId:     string
  flightNumber:       string
  origin:             string
  destination:        string
  type:               RecommendationType
  status:             RecommendationStatus
  description:        string
  reasoning:          string
  confidenceScore:    number
  affectedPassengers: number
  generatedAt:        string
  appliedAt:          string | null
}

export type RealtimeEventType =
  | 'connected'
  | 'flight_event'
  | 'disruption_event'
  | 'impact_event'
  | 'recommendation_event'

export interface RealtimeEvent {
  eventType: RealtimeEventType
  topic:     string
  payload:   unknown
  timestamp: string
}

export interface DashboardStats {
  totalFlights:           number
  activeFlights:          number
  delayedFlights:         number
  cancelledFlights:       number
  totalDisruptions:       number
  pendingRecommendations: number
}

export interface WebSocketEvent {
  eventType: WebSocketEventType
  topic:     string
  payload:   Flight | Disruption | ImpactReport | Recommendation | Record<string, unknown>
  timestamp: string
}

export type WebSocketEventType =
  | 'connected'
  | 'flight_event'
  | 'disruption_event'
  | 'impact_event'
  | 'recommendation_event'