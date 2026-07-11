import React, { useState, useMemo } from 'react';
import { icons } from 'lucide-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IconSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function IconSelector({ value, onValueChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Convert PascalCase to kebab-case
  const toKebabCase = (str: string) => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  };

  // Convert kebab-case to PascalCase
  const toPascalCase = (str: string) => {
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  };

  const iconNames = useMemo(() => {
    // Some exports from lucide-react are not icons, like createLucideIcon.
    // Real icons start with a capital letter.
    const allIcons = Object.keys(icons).filter(key => /^[A-Z]/.test(key));
    const filtered = allIcons.filter(key => 
      key.toLowerCase().includes(search.toLowerCase())
    );
    // Limit to 100 to prevent performance issues
    return filtered.slice(0, 100);
  }, [search]);

  const SelectedIcon = value ? (icons as any)[toPascalCase(value)] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 truncate">
            {SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : <Search className="h-4 w-4 opacity-50" />}
            {value || "Select an icon..."}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <ScrollArea className="h-72 p-2">
          {iconNames.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No icons found.</div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {iconNames.map((name) => {
                const IconComponent = (icons as any)[name];
                if (!IconComponent) return null;
                const kebabName = toKebabCase(name);
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 shrink-0 ${value === kebabName ? 'bg-orange/10 text-orange border border-orange/20' : ''}`}
                    onClick={() => {
                      onValueChange(kebabName);
                      setOpen(false);
                    }}
                    title={kebabName}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
