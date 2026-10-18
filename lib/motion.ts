export const MOTION = {
  duration: 0.2,
  stagger: 0.04,
  ease: "power2.out",
  maxEnter: 6,
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
