import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Flight,
  Disruption,
  ImpactReport,
  Recommendation,
  WebSocketEvent,
  DashboardStats,
} from "@/types";

interface AppState {
  flights: Flight[];
  disruptions: Disruption[];
  impactReports: ImpactReport[];
  recommendations: Recommendation[];
  recentEvents: WebSocketEvent[];
  stats: DashboardStats;
  isConnected: boolean;
  connectionError: string | null;

  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  addEvent: (event: WebSocketEvent) => void;
  updateFlight: (flight: Flight) => void;
  addDisruption: (disruption: Disruption) => void;
  addImpactReport: (report: ImpactReport) => void;
  addRecommendation: (recommendation: Recommendation) => void;
  updateRecommendationStatus: (
    id: string,
    status: "APPLIED" | "REJECTED",
  ) => void;
  updateStats: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      flights: [],
      disruptions: [],
      impactReports: [],
      recommendations: [],
      recentEvents: [],
      stats: {
        totalFlights: 0,
        activeFlights: 0,
        delayedFlights: 0,
        cancelledFlights: 0,
        totalDisruptions: 0,
        pendingRecommendations: 0,
      },
      isConnected: false,
      connectionError: null,

      setConnected: (connected) => set({ isConnected: connected }),

      setConnectionError: (error) => set({ connectionError: error }),

      addEvent: (event) =>
        set((state) => ({
          recentEvents: [event, ...state.recentEvents].slice(0, 50),
        })),

      updateFlight: (flight) =>
        set((state) => {
          const exists = state.flights.find((f) => f.id === flight.id);
          const flights = exists
            ? state.flights.map((f) => (f.id === flight.id ? flight : f))
            : [flight, ...state.flights];
          return { flights };
        }),

      addDisruption: (disruption) =>
        set((state) => {
          const exists = state.disruptions.find((d) => d.id === disruption.id);
          if (exists) return state;
          return {
            disruptions: [disruption, ...state.disruptions].slice(0, 100),
          };
        }),

      addImpactReport: (report) =>
        set((state) => {
          const exists = state.impactReports.find((r) => r.id === report.id);
          if (exists) return state;
          return {
            impactReports: [report, ...state.impactReports].slice(0, 100),
          };
        }),

      addRecommendation: (recommendation) =>
        set((state) => {
          const exists = state.recommendations.find(
            (r) => r.id === recommendation.id,
          );
          if (exists) return state;
          return {
            recommendations: [recommendation, ...state.recommendations].slice(
              0,
              100,
            ),
          };
        }),

      updateRecommendationStatus: (id, status) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
        })),

      updateStats: () => {
        const { flights, disruptions, recommendations } = get();
        set({
          stats: {
            totalFlights: flights.length,
            activeFlights: flights.filter((f) =>
              ["SCHEDULED", "BOARDING", "DEPARTED", "DELAYED"].includes(
                f.status,
              ),
            ).length,
            delayedFlights: flights.filter((f) => f.status === "DELAYED")
              .length,
            cancelledFlights: flights.filter((f) => f.status === "CANCELLED")
              .length,
            totalDisruptions: disruptions.length,
            pendingRecommendations: recommendations.filter(
              (r) => r.status === "PENDING",
            ).length,
          },
        });
      },
    }),
    {
      name: "airline-ops-store",
      partialize: (state) => ({
        flights: state.flights,
        disruptions: state.disruptions,
        impactReports: state.impactReports,
        recommendations: state.recommendations,
      }),
    },
  ),
);
