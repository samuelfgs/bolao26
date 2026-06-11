"use client";

import { useEffect } from "react";
import { triggerUpdate } from "@/lib/actions/pool";

export function LiveUpdateTrigger() {
  useEffect(() => {
    // We don't want to block the UI, so we don't await this
    triggerUpdate();
  }, []);

  return null;
}
