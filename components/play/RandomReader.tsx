"use client";

export function RandomReader({
  name,
  color,
  prompt = "Lee en voz alta",
}: {
  name: string;
  color?: string;
  prompt?: string;
}) {
  return (
    <div className="card stack" data-testid="random-reader">
      <p className="kicker">{prompt}</p>
      <h2 style={{ margin: 0 }}>
        {color ? <span className="swatch" style={{ background: color, marginRight: 8 }} /> : null}
        {name}
      </h2>
      <p className="lead" style={{ margin: 0 }}>
        El resto escucha. Si te trabás, improvisá con dignidad.
      </p>
    </div>
  );
}
