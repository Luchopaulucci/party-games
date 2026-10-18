"use client";

export function ConfirmExit({
  open,
  title = "¿Salís?",
  body = "Se corta esta partida. Lo que iba, iba.",
  confirmLabel = "Sí, salir",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  body?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="confirm-exit" data-testid="confirm-exit" role="dialog" aria-modal="true" aria-labelledby="confirm-exit-title">
      <div className="card stack">
        <h2 id="confirm-exit-title">{title}</h2>
        <p className="lead">{body}</p>
        <button className="btn btn-primary" type="button" data-testid="confirm-exit-yes" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Me quedo
        </button>
      </div>
    </div>
  );
}
