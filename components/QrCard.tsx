"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCard({ value, code }: { value: string; code: string }) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { width: 240, margin: 1, color: { dark: "#140c33", light: "#fff8f0" } }).then((url) => {
      if (alive) setSrc(url);
    });
    return () => {
      alive = false;
    };
  }, [value]);

  return (
    <div className="card stack">
      <div className="code">{code}</div>
      <div className="qr">
        {src ? (
          // QR en data URL; next/image no aporta acá.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`QR sala ${code}`} width={220} height={220} />
        ) : (
          <p>Armando el QR…</p>
        )}
      </div>
      <p className="lead" style={{ margin: 0, textAlign: "center" }}>
        Escaneá o mandales el código. Si lo tiran en el grupo de WhatsApp, ya fue.
      </p>
    </div>
  );
}
