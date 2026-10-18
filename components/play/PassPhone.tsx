"use client";

import { HandoffScreen } from "@/components/HandoffScreen";

export function PassPhone({
  name,
  color,
  onReady,
}: {
  name: string;
  color: string;
  onReady: () => void;
}) {
  return <HandoffScreen name={name} color={color} onReady={onReady} />;
}
