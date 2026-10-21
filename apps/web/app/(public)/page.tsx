import { featuredArticles, featuredGames, wikiCategories } from "@/lib/mocks/public-content";
import { ArticleCard, CategoryRow, GameCard } from "@/components/public/content-cards";

const futureModules = [
  { code: "02", title: "Guías", status: "EN PREPARACIÓN" },
  { code: "03", title: "Mods", status: "EN PREPARACIÓN" },
  { code: "04", title: "Builds", status: "EN PREPARACIÓN" },
];

export default function HomePage() {
  return (
    <main id="contenido">
      <section aria-labelledby="hero-title" className="shell-width grid gap-10 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <p className="eyebrow flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-phosphor" />TRANSMISIÓN 001 · ARCHIVO ABIERTO</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] text-paper sm:text-6xl lg:text-7xl xl:text-[5.5rem]" id="hero-title">
            El Yermo<br />tiene <span className="font-terminal text-phosphor">memoria.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">Un archivo en español para recorrer Fallout: sus mundos, sus habitantes y las decisiones que sobrevivieron a las bombas.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="inline-flex min-h-12 items-center gap-4 border border-phosphor bg-phosphor px-5 font-terminal text-xs font-semibold tracking-wide text-void transition-colors hover:bg-transparent hover:text-phosphor" href="#juegos">RECORRER LOS JUEGOS <span aria-hidden="true">↘</span></a>
            <a className="inline-flex min-h-12 items-center border border-line px-5 font-terminal text-xs tracking-wide text-paper transition-colors hover:border-phosphor/60 hover:text-phosphor" href="#archivo">ABRIR EL ARCHIVO</a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 font-terminal text-[0.65rem] tracking-wide text-muted">
            <span><span className="text-phosphor">06</span> CATEGORÍAS</span><span><span className="text-phosphor">04</span> MUNDOS</span><span>UNA HISTORIA COMPARTIDA</span>
          </div>
        </div>

        <div aria-label="Mapa esquemático del Yermo en una terminal de archivo" className="relative mx-auto w-full max-w-lg lg:max-w-none" role="img">
          <div className="corner-brackets scanline relative overflow-hidden border border-line bg-panel p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3 font-terminal text-[0.62rem] tracking-[0.14em] text-muted"><span>TERMINAL DE ARCHIVO / 01</span><span className="text-phosphor">EN LÍNEA</span></div>
            <div className="relative mt-5 aspect-[1.15/1] overflow-hidden border border-line bg-[#111811]">
              <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgb(193_215_123_/_8%)_1px,transparent_1px),linear-gradient(90deg,rgb(193_215_123_/_8%)_1px,transparent_1px)] [background-size:28px_28px]" />
              <svg aria-hidden="true" className="absolute inset-0 size-full" fill="none" viewBox="0 0 440 360">
                <path d="M54 251 101 206l14-67 57 13 31-54 56 22 54-40 57 47-17 45 38 52-52 20-30 63-61-26-54 28-34-49-73 7Z" stroke="#8da865" strokeDasharray="5 7" strokeWidth="1.4" />
                <path d="m108 206 60-54 72 28 45-64 55 56-12 55-65 37-62-32-54 28-39-54Z" stroke="#c1d77b" strokeOpacity=".55" />
                <path d="M137 217 179 187l49 21 34-36 36 21m-134 65 44-26 54 13 41-35" stroke="#c1d77b" strokeOpacity=".3" />
                <circle cx="228" cy="208" r="5" fill="#c1d77b" /><circle cx="228" cy="208" r="14" stroke="#c1d77b" strokeOpacity=".45" /><circle cx="228" cy="208" r="26" stroke="#c1d77b" strokeOpacity=".2" />
                <path d="M228 182v52m-26-26h52" stroke="#c1d77b" strokeOpacity=".45" />
                <circle cx="151" cy="173" r="2.5" fill="#d48b65" /><circle cx="300" cy="248" r="2.5" fill="#d48b65" /><circle cx="277" cy="138" r="2.5" fill="#d48b65" />
                <path d="M228 26v20m0 268v20M26 180h20m328 0h20" stroke="#8da865" strokeOpacity=".6" />
              </svg>
              <span className="absolute left-[50%] top-[57%] -translate-x-1/2 font-terminal text-[0.6rem] tracking-[0.2em] text-phosphor">MOJAVE</span>
              <span className="absolute left-[30%] top-[43%] font-terminal text-[0.55rem] tracking-wide text-muted">FALLOUT 3</span>
              <span className="absolute right-[13%] top-[32%] font-terminal text-[0.55rem] tracking-wide text-muted">COMMONWEALTH</span>
              <span className="absolute bottom-3 left-3 font-terminal text-[0.55rem] text-muted">LAT 36°10′ N</span><span className="absolute bottom-3 right-3 font-terminal text-[0.55rem] text-muted">SECTOR 04</span>
            </div>
            <div className="mt-4 flex items-center justify-between font-terminal text-[0.6rem] tracking-wide text-muted"><span>MAPA DE SEÑALES CONOCIDAS</span><span className="flex items-center gap-2"><span aria-hidden="true" className="size-1.5 rounded-full bg-rust" />3 ALERTAS</span></div>
          </div>
          <div aria-hidden="true" className="absolute -bottom-4 -right-2 hidden border border-line bg-panel px-4 py-3 font-terminal text-[0.6rem] leading-5 text-muted sm:block">REGISTRO<br /><span className="text-phosphor">VAULT-TEC / 2077</span></div>
        </div>
      </section>

      <section aria-labelledby="games-title" className="section-rule bg-[#131711] py-16 sm:py-20" id="juegos">
        <div className="shell-width">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">01 / PUNTOS DE PARTIDA</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-paper sm:text-4xl" id="games-title">Cada juego, un mundo.</h2></div><p className="max-w-sm text-sm leading-6 text-muted">Elige una señal para situarte en el tiempo y el lugar. Cada historia abre una puerta distinta.</p></div>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {featuredGames.map((game) => <GameCard game={game} key={game.slug} />)}
          </ul>
          <p className="mt-4 font-terminal text-[0.6rem] tracking-wide text-muted">FICHAS DE JUEGO · RECORRIDO VISUAL DE DEMOSTRACIÓN</p>
        </div>
      </section>

      <section aria-labelledby="categories-title" className="shell-width py-16 sm:py-20" id="categorias">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div><p className="eyebrow">02 / ÍNDICE DEL ARCHIVO</p><h2 className="mt-3 max-w-md text-3xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-4xl" id="categories-title">Todo lo que el Yermo dejó atrás.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted">Seis puertas para empezar a tirar del hilo. El archivo crece con cada nueva historia que merece recordarse.</p><p className="mt-8 font-terminal text-[0.65rem] tracking-widest text-phosphor">06 CATEGORÍAS DOCUMENTADAS</p></div>
          <ul className="m-0 list-none border-t border-line p-0">
            {wikiCategories.map((category) => <CategoryRow category={category} key={category.slug} />)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="archive-title" className="section-rule bg-[#131711] py-16 sm:py-20" id="archivo">
        <div className="shell-width">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">03 / LECTURAS RECUPERADAS</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-paper sm:text-4xl" id="archive-title">Historias que siguen aquí.</h2></div><p className="max-w-sm text-sm leading-6 text-muted">Un primer vistazo a las voces, refugios y facciones que dan forma a este universo.</p></div>
          <ul className="grid list-none gap-3 p-0 lg:grid-cols-3">
            {featuredArticles.map((article) => <ArticleCard article={article} key={article.slug} />)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="future-title" className="shell-width py-16 sm:py-20" id="futuro">
        <div className="corner-brackets relative overflow-hidden border border-line bg-panel p-6 sm:p-9 lg:p-11">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,transparent_65%,rgb(193_215_123_/_8%))]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-12"><div><p className="eyebrow">04 / LO QUE VIENE</p><h2 className="mt-3 max-w-xl text-3xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-4xl" id="future-title">El archivo es solo el comienzo.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-muted">Guías de supervivencia, recomendaciones para explorar y herramientas para preparar tu próxima aventura. El trabajo ya está en marcha.</p></div>
            <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-3 lg:grid-cols-1">{futureModules.map((module) => <li className="flex items-center justify-between gap-3 border-t border-line py-3 font-terminal text-xs" key={module.code}><span className="flex items-center gap-3 text-paper"><span className="text-phosphor">{module.code}</span>{module.title}</span><span className="text-[0.55rem] tracking-wide text-muted">{module.status}</span></li>)}</ul>
          </div>
        </div>
      </section>
    </main>
  );
}
