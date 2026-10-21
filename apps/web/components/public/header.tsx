import Link from "next/link";

const navigation = [
  { href: "#juegos", label: "Juegos" },
  { href: "#archivo", label: "Archivo" },
  { href: "#categorias", label: "Explorar" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-void/90 backdrop-blur-md">
      <div className="shell-width flex min-h-18 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link aria-label="Refugio, inicio" className="group flex items-center gap-3" href="/">
          <span aria-hidden="true" className="grid size-10 place-items-center border border-phosphor/60 text-phosphor transition-colors group-hover:bg-phosphor group-hover:text-void">
            <span className="font-terminal text-lg font-bold">R</span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-terminal text-sm font-semibold tracking-[0.2em] text-paper">REFUGIO</span>
            <span className="font-terminal text-[0.6rem] tracking-[0.13em] text-muted">ARCHIVO DEL YERMO</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-2">
          {navigation.map((item) => (
            <a className="text-link inline-flex min-h-11 items-center px-3 font-terminal text-xs tracking-wide text-muted sm:px-4" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className="hidden items-center gap-2 font-terminal text-[0.65rem] tracking-widest text-muted lg:inline-flex">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-phosphor shadow-[0_0_10px_var(--phosphor)]" />
          SEÑAL ESTABLE
        </span>
      </div>
    </header>
  );
}

