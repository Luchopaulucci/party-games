"use client";

import { LocalMatchApp } from "@/components/local/LocalMatchApp";
import { Shell } from "@/components/Shell";

export default function LocalPage() {
  return (
    <Shell backHref="/" kicker="compartiendo">
      <LocalMatchApp />
    </Shell>
  );
}
