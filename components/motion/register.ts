"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

if (typeof window !== "undefined") {
  (window as Window & { gsap?: typeof gsap }).gsap = gsap;
}

export { gsap, useGSAP };
