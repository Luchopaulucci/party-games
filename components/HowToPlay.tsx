"use client";

import { useState } from "react";

export function HowToPlay({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        ¿Cómo se juega?
      </button>
      {open ? <p className="lead" style={{ margin: 0 }}>{text}</p> : null}
    </div>
  );
}
