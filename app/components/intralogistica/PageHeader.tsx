// app/components/intralogistica/PageHeader.tsx
"use client";
import { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumb: string;
  titulo: ReactNode;
  subtitulo?: string;
  children?: ReactNode;
}

export default function PageHeader({ breadcrumb, titulo, subtitulo, children }: PageHeaderProps) {
  return (
    <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
      <div>
        <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
          {breadcrumb}
        </div>
        <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[var(--text-secondary)] text-xs mt-2">{subtitulo}</p>
        )}
      </div>
      {children}
    </div>
  );
}