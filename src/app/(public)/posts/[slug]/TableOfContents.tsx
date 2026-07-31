'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0% -80% 0%' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hidden xl:block w-[280px] shrink-0 border-l border-gray-100 pl-6 py-2">
      <h4 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 font-montserrat">
        Mục lục
      </h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
            className="group flex items-start"
          >
            <ChevronRight 
              size={14} 
              className={cn(
                "mt-0.5 shrink-0 transition-colors mr-1.5",
                activeId === item.id ? "text-orange" : "text-transparent group-hover:text-orange/50"
              )} 
            />
            <a
              href={`#${item.id}`}
              className={cn(
                'text-sm transition-colors leading-snug hover:text-orange',
                activeId === item.id
                  ? 'text-orange font-semibold'
                  : 'text-navy/60 font-medium'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
