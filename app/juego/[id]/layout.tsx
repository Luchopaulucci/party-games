import { juegoStaticParams } from "@/lib/static-routes";

export function generateStaticParams() {
  return juegoStaticParams();
}

export default function JuegoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
