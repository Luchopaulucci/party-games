import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function HomePage() {
  return (
    <Shell>
      <p className="badge">v0.1 · previa edition</p>
      <h1 style={{ marginTop: 14 }}>Juegos para el celu, no para el PowerPoint del trabajo.</h1>
      <p className="lead">
        Online cada uno con su teléfono, o te pasás este mismo celu como si fuera una bandeja de
        fainá. Todo en criollo, con voseo y poca dignidad.
      </p>
      <div className="stack">
        <Link className="tile" href="/online">
          <span>📶</span>
          <b>En línea</b>
          <p>Creá una sala, mandá el QR y que cada uno se siente con su nombre. El server no le sopla los secretos a nadie.</p>
        </Link>
        <Link className="tile" href="/local">
          <span>📴</span>
          <b>Pasate el celu</b>
          <p>Un solo teléfono, sin internet. Funciona offline. Ideal para cuando el WiFi de la quinta es un mito.</p>
        </Link>
      </div>
      <p className="footer-note">Hecho para juntadas argentinas. Si gana tu cuñado, es problema tuyo.</p>
    </Shell>
  );
}
