import Link from "next/link";

export function Shell({
  children,
  backHref = "/",
  kicker,
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
          {kicker ? <span>{kicker}</span> : null}
        </Link>
      </div>
      {children}
    </div>
  );
}
