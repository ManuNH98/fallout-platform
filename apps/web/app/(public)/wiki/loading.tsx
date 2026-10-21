import { Breadcrumbs } from "@/components/public/breadcrumbs";

export default function WikiLoading() {
  return (
    <main aria-busy="true" className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Wiki" }]} />
      <h1 className="mt-8 text-4xl font-medium tracking-tight text-paper sm:mt-10">Wiki de Fallout</h1>
      <p className="mt-5 text-muted" role="status">Cargando el archivo del Yermo…</p>
      <div aria-hidden="true" className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div className="card-surface min-h-64 p-6" key={item}>
            <div className="h-3 w-24 bg-panel-raised" />
            <div className="mt-10 h-6 w-3/4 bg-panel-raised" />
            <div className="mt-5 h-3 w-full bg-panel-raised" />
            <div className="mt-3 h-3 w-5/6 bg-panel-raised" />
          </div>
        ))}
      </div>
    </main>
  );
}
