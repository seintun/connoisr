"use client";

import { Order } from "@/types";
import { useEffect, useState } from "react";

export type UrgencyLevel = "new" | "process" | "delayed" | "ready" | "served";

export function useOrderTimer(createdAt: number, status: Order["status"]): { elapsed: number; urgency: UrgencyLevel; formattedTime: string } {
  const [elapsed, setElapsed] = useState(
    () => Math.floor((Date.now() - createdAt) / 1000),
  );

  useEffect(() => {
    const start = createdAt;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const getUrgency = (status: Order["status"], seconds: number): UrgencyLevel => {
    if (status === "ready") return "ready";
    if (status === "served") return "served";
    if (status === "paid") return "served"; // Treat paid as served/done
    
    // Logic for active orders
    if (status === "ordered") return "new"; // Coral
    
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
