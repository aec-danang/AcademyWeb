import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  parent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  parent?: { label: string; href: string };
}) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {parent ? (
        <div className="mb-3 flex items-center gap-1 text-xs font-bold text-slate-500">
          <Link href={parent.href} className="hover:text-indigo-600">{parent.label}</Link><ChevronRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-navy sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </header>
  );
}
