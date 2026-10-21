import Link from "next/link";
import PublicLayout from "./(public)/layout";

export default function NotFound() {
  return (
    <PublicLayout>
      <main className="shell-width py-12 sm:py-16" id="contenido">
        <p className="eyebrow">ERROR 404 / SEÑAL NO ENCONTRADA</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-paper">Página no encontrada</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted">La dirección que buscas no está en el archivo. Puedes volver al inicio o explorar la wiki y los juegos.</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-phosphor">
          <Link className="text-link inline-flex min-h-11 items-center" href="/">Volver al inicio</Link>
          <Link className="text-link inline-flex min-h-11 items-center" href="/wiki">Explorar la wiki</Link>
          <Link className="text-link inline-flex min-h-11 items-center" href="/juegos">Ver los juegos</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
