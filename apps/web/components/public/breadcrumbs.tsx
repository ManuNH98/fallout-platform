import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-1 p-0 text-sm text-muted">
        {items.map((item, index) => (
          <li className="flex items-center gap-3" key={`${item.label}-${index}`}>
            {index > 0 && <span aria-hidden="true" className="text-phosphor/60">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-paper">{item.label}</span>
            ) : item.href ? (
              <Link className="text-link inline-flex min-h-11 items-center" href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
