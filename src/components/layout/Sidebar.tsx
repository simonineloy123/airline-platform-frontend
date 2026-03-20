"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Brain,
  BarChart3,
  Plane,
  Wifi,
  WifiOff,
  Map,
  List,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flights", label: "Vuelos", icon: List },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/operations", label: "Operaciones", icon: AlertTriangle },
  { href: "/recommendations", label: "IA", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, stats } = useAppStore();
  const [seenDisruptions, setSeenDisruptions] = useState(0);
  const [seenRecs, setSeenRecs] = useState(0);

  // Cargar valor guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem("seenDisruptions");
    if (saved) setSeenDisruptions(Number(saved));
  }, []);

  // Marcar como visto cuando entrás a /operations
  useEffect(() => {
    if (pathname === "/operations") {
      setSeenDisruptions(stats.totalDisruptions);
      localStorage.setItem(
        "seenDisruptions",
        stats.totalDisruptions.toString(),
      );
    }
  }, [pathname, stats.totalDisruptions]);

  useEffect(() => {
    if (pathname === "/recommendations") {
      setSeenRecs(stats.pendingRecommendations);
    }
  }, [pathname, stats.pendingRecommendations]);

  const unseenDisruptions = stats.totalDisruptions - seenDisruptions;
  const unseenRecs = stats.pendingRecommendations - seenRecs;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-slate-800">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Airline Ops</h1>
            <p className="text-xs text-slate-400">Intelligence Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          const badge =
            label === "IA"
              ? unseenRecs > 0
                ? unseenRecs
                : 0
              : label === "Operaciones"
                ? unseenDisruptions > 0
                  ? unseenDisruptions
                  : 0
                : 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span
                  className={cn(
                    "ml-auto text-white text-xs px-1.5 py-0.5 rounded-full",
                    label === "IA" ? "bg-orange-500" : "bg-red-500",
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <div className="text-xs text-slate-500 px-3">
          <span>{stats.totalFlights} vuelos</span>
          <span className="mx-2">·</span>
          <span>{stats.totalDisruptions} disrupciones</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded-lg",
            isConnected
              ? "bg-green-900/50 text-green-400"
              : "bg-red-900/50 text-red-400",
          )}
        >
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {isConnected ? "Conectado en tiempo real" : "Reconectando..."}
        </div>
      </div>
    </aside>
  );
}
