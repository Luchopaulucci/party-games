export function HeadingPair({ left, right }: { left: string; right: string }) {
  return (
    <h1 className="heading-pair">
      <span>{left}</span> <span className="heading-pair-accent">{right}</span>
    </h1>
  );
}
