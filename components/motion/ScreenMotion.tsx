"use client";

import { useRef, type ReactNode } from "react";
import { MOTION, prefersReducedMotion } from "@/lib/motion";
import { gsap, useGSAP } from "./register";

export function ScreenMotion({ children, replay }: { children: ReactNode; replay?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const items = [...el.querySelectorAll<HTMLElement>("[data-enter], .card, .tile, .secret")].slice(
        0,
        MOTION.maxEnter,
      );
      if (!items.length) return;
      gsap.from(items, {
        y: 8,
        autoAlpha: 0,
        duration: MOTION.duration,
        stagger: MOTION.stagger,
        ease: MOTION.ease,
      });
    },
    { scope: root, dependencies: [replay] },
  );

  return (
    <div ref={root} className="screen-motion">
      {children}
    </div>
  );
}
