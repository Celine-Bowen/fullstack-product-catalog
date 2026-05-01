"use client";

import { useEffect, useRef, useState } from "react";

export type AdminToast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export function useAdminToasts() {
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const nextToastId = useRef(0);
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      timers.current.forEach((timerId) => window.clearTimeout(timerId));
      timers.current.clear();
    };
  }, []);

  function dismissToast(id: string) {
    const timerId = timers.current.get(id);

    if (timerId) {
      window.clearTimeout(timerId);
      timers.current.delete(id);
    }

    setToasts((items) => items.filter((item) => item.id !== id));
  }

  function pushToast(message: string, type: AdminToast["type"] = "success", durationMs = type === "error" ? 6000 : 3000) {
    const toast = {
      id: String(nextToastId.current++),
      message,
      type,
    };

    setToasts((items) => [...items.slice(-2), toast]);

    const timerId = window.setTimeout(() => {
      timers.current.delete(toast.id);
      setToasts((items) => items.filter((item) => item.id !== toast.id));
    }, durationMs);

    timers.current.set(toast.id, timerId);
  }

  return {
    toasts,
    pushToast,
    dismissToast,
  };
}
