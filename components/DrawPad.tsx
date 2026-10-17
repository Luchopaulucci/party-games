"use client";

import { useRef } from "react";
import type { DrawStroke } from "@/shared/games/draw/logic";

export function DrawPad({
  strokes,
  color,
  disabled,
  onStroke,
}: {
  strokes: DrawStroke[];
  color: string;
  disabled?: boolean;
  onStroke: (stroke: DrawStroke) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<{ points: { x: number; y: number }[] } | null>(null);

  function paint(canvas: HTMLCanvasElement, all: DrawStroke[]) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff8f0";
    ctx.fillRect(0, 0, width, height);
    for (const stroke of all) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0]!.x * width, stroke.points[0]!.y * height);
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x * width, p.y * height);
      ctx.stroke();
    }
  }

  function rel(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        if (node) paint(node, strokes);
      }}
      className="draw-pad"
      width={360}
      height={360}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drawing.current = { points: [rel(e)] };
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        drawing.current.points.push(rel(e));
        if (canvasRef.current) paint(canvasRef.current, [...strokes, { color, points: drawing.current.points }]);
      }}
      onPointerUp={() => {
        if (!drawing.current || drawing.current.points.length < 2) {
          drawing.current = null;
          return;
        }
        onStroke({ color, points: drawing.current.points });
        drawing.current = null;
      }}
    />
  );
}
