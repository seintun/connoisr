"use client";

import { Order } from "@/types";
import { useEffect, useState } from "react";

export type UrgencyLevel = "new" | "process" | "delayed" | "ready" | "served";

interface OrderTimerState {
  elapsed: number; // seconds
  urgency: UrgencyLevel;
  formattedTime: string;
}

export function useOrderTimer(createdAt: Date, status: Order["status"]): OrderTimerState {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Initial calculation
    const start = new Date(createdAt).getTime();
    setElapsed(Math.floor((Date.now() - start) / 1000));

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const getUrgency = (status: Order["status"], seconds: number): UrgencyLevel => {
    if (status === "ready") return "ready";
    if (status === "served") return "served";
    
    // Logic for active orders
    if (status === "pending") return "new"; // Coral
    
    // In "cooking" state
    if (seconds > 60 * 15) return "delayed"; // > 15 mins (Amber)
    return "process"; // Indigo
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    elapsed,
    urgency: getUrgency(status, elapsed),
    formattedTime: formatTime(elapsed),
  };
}
