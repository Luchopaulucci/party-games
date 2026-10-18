import Link from "next/link";

export function Shell({
  children,
  backHref = "/",
  kicker = "la previa",
}: {
  children: React.ReactNode;
  backHref?: string;
  kicker?: string;
}) {
  return (
    <div className="shell">
      <div className="topbar">
        <Link href={backHref} className="brand">
          <b>La Previa</b>
          <span>{kicker}</span>
        </Link>
        <span className="pill">🇦🇷 rioplatense</span>
      </div>
      {children}
    </div>
  );
}
