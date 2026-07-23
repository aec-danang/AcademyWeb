"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);
  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== q) {
      formRef.current?.requestSubmit();
    }
  }, [debouncedSearchTerm, q]);

  return (
    <div className={styles.quizFilterPanel}>
      <div className={styles.quizFilterHeader}>
        <div>
          <span className={styles.cockpitEyebrow}><SlidersHorizontal size={16} /> Khám phá thư viện</span>
          <h2>Tìm kiếm đề thi</h2>
        </div>
      </div>

      <form ref={formRef} method="get" className={styles.quizFilterGrid}>
        <input type="hidden" name="tab" value="tests" />
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
            defaultValue={program}
            onChange={() => {
              if (unitRef.current) unitRef.current.value = "";
              formRef.current?.requestSubmit();
            }}
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
            ref={unitRef}
            name="unit" 
            defaultValue={unit}
            onChange={() => formRef.current?.requestSubmit()}
          >
            <option value="">All units</option>
            {unitOptions.map((u) => (
              <option key={u} value={u}>Unit {u}</option>
            ))}
          </select>
        </label>
      </form>
    </div>
  );
}
