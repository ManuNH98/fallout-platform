import type { ReactNode } from "react";

interface ContentStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function ContentState({ title, description, children }: ContentStateProps) {
  return (
    <div className="card-surface border-dashed p-6 sm:p-9">
      <h2 className="text-xl font-medium tracking-tight text-paper">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{description}</p>
      {children && <div className="mt-6 flex flex-wrap gap-4">{children}</div>}
    </div>
  );
}
