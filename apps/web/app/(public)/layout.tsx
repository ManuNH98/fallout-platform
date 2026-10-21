import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="sr-only z-50 rounded bg-phosphor px-4 py-2 text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#contenido">
        Saltar al contenido
      </a>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
