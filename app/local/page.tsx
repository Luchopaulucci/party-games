"use client";

import { LocalMatchApp } from "@/components/local/LocalMatchApp";
import { Shell } from "@/components/Shell";

export default function LocalPage() {
  return (
    <Shell backHref="/" kicker="un solo celu">
      <LocalMatchApp />
    </Shell>
  );
}
