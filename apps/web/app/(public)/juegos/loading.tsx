import { Breadcrumbs } from "@/components/public/breadcrumbs";

export default function GamesLoading() {
  return (
    <main aria-busy="true" className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Juegos" }]} />
      <h1 className="mt-8 text-4xl font-medium tracking-tight text-paper sm:mt-10">Juegos de Fallout</h1>
      <p className="mt-5 text-muted" role="status">Cargando los mundos del Yermo…</p>
      <div aria-hidden="true" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div className="card-surface min-h-52 p-5" key={item}>
            <div className="h-3 w-20 bg-panel-raised" />
            <div className="mt-12 h-3 w-24 bg-panel-raised" />
            <div className="mt-3 h-6 w-3/4 bg-panel-raised" />
            <div className="mt-5 h-3 w-1/2 bg-panel-raised" />
          </div>
        ))}
      </div>
    </main>
  );
}
