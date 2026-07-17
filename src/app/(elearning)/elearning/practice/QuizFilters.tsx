"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import styles from "../elearning.module.css";

type QuizFiltersProps = {
  q: string;
  program: string;
  unit: string;
  programOptions: { id: string; code: string; name: string }[];
  unitOptions: string[];
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function QuizFilters({ q, program, unit, programOptions, unitOptions }: QuizFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearch = (term: string, newProgram: string, newUnit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) params.set("q", term);
    else params.delete("q");
    
    if (newProgram) params.set("program", newProgram);
    else params.delete("program");

    if (newUnit) params.set("unit", newUnit);
    else params.delete("unit");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    if (debouncedSearchTerm !== q) {
      handleSearch(debouncedSearchTerm, program, unit);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className={styles.quizFilterPanel}>
      <div className={styles.quizFilterHeader}>
        <div>
          <span className={styles.cockpitEyebrow}><SlidersHorizontal size={16} /> Khám phá thư viện</span>
          <h2>Tìm kiếm đề thi</h2>
        </div>
      </div>

      <div className={styles.quizFilterGrid} style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <label className={styles.quizSearchControl}>
          <span>Search</span>
          <div>
            <Search size={16} />
            <input 
              name="q" 
              value={searchTerm} 
              placeholder="Search quiz title, program, unit..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
        
        <label>
          <span>Program</span>
          <select 
            name="program" 
            value={program} 
            onChange={(e) => handleSearch(searchTerm, e.target.value, unit)}
          >
            <option value="">All programs</option>
            {programOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </label>
        
        <label>
          <span>Unit</span>
          <select 
            name="unit" 
            value={unit} 
            onChange={(e) => handleSearch(searchTerm, program, e.target.value)}
          >
            <option value="">All units</option>
            {unitOptions.map((u) => (
              <option key={u} value={u}>Unit {u}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
