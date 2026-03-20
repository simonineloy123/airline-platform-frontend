"use client";
import { Recommendation } from "@/types";
import {
  getRecommendationIcon,
  formatDateTime,
  RECOMMENDATION_TYPE_ES,
} from "@/lib/utils";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const { updateRecommendationStatus } = useAppStore();
  const pct = Math.round(recommendation.confidenceScore * 100);
  const handleAction = async (action: "APPLIED" | "REJECTED") => {
    updateRecommendationStatus(recommendation.id, action);
    if (action === "APPLIED") {
      toast.success(
        `✅ Recomendación aplicada — ${recommendation.flightNumber}`,
      );
    } else {
      toast.info(`❌ Recomendación rechazada — ${recommendation.flightNumber}`);
    }
  };
  return (
    <div
      className={`bg-slate-800 rounded-xl p-5 border ${
        recommendation.status === "APPLIED"
          ? "border-green-500/30"
          : recommendation.status === "REJECTED"
            ? "border-slate-600"
            : "border-purple-500/30"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {getRecommendationIcon(recommendation.type)}
          </span>
          <div>
            <p className="text-white font-bold text-sm">
              {recommendation.flightNumber}
            </p>
            <p className="text-slate-400 text-xs">
              {RECOMMENDATION_TYPE_ES[recommendation.type] ??
                recommendation.type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-purple-400">
            <Brain className="w-3 h-3" />
            <span className="text-xs font-bold">{pct}%</span>
          </div>
          <p className="text-xs text-slate-500">confianza</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-2">
        {recommendation.description}
      </p>

      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          {recommendation.reasoning}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {formatDateTime(recommendation.generatedAt)}
        </span>

        {recommendation.status === "PENDING" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("APPLIED")}
              className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3 h-3" /> Aplicar
            </button>
            <button
              onClick={() => handleAction("REJECTED")}
              className="flex items-center gap-1 text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <XCircle className="w-3 h-3" /> Rechazar
            </button>
          </div>
        )}
        {recommendation.status === "APPLIED" && (
          <span className="text-xs bg-green-900/50 text-green-400 px-3 py-1.5 rounded-lg">
            ✅ Aplicada
          </span>
        )}
        {recommendation.status === "REJECTED" && (
          <span className="text-xs bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg">
            ❌ Rechazada
          </span>
        )}
      </div>
    </div>
  );
}
