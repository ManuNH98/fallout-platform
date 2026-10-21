export function PublicFooter() {
  return (
    <footer className="section-rule mt-24">
      <div className="shell-width flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-terminal text-xs tracking-[0.18em] text-paper">REFUGIO <span className="text-phosphor">/</span> ARCHIVO DEL YERMO</p>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted">Proyecto independiente y no oficial, creado por fans. Fallout es una marca de sus respectivos propietarios.</p>
        </div>
        <p className="font-terminal text-[0.65rem] tracking-wide text-muted">HECHO PARA QUIENES SIGUEN BUSCANDO</p>
      </div>
    </footer>
  );
}
