"use client";

import Link from "next/link";
import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
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
  const programRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState(q);
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(program || unit));
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const activeFilterCount = Number(Boolean(program)) + Number(Boolean(unit));
  const programLabel = programOptions.find((item) => item.id === program);

  const chooseProgram = (value: string) => {
    if (programRef.current) programRef.current.value = value;
    if (unitRef.current) unitRef.current.value = "";
    formRef.current?.requestSubmit();
  };

  const chooseUnit = (value: string) => {
    if (unitRef.current) unitRef.current.value = value;
    formRef.current?.requestSubmit();
  };

  useEffect(() => {
    if (debouncedSearchTerm !== q) {
      formRef.current?.requestSubmit();
    }
  }, [debouncedSearchTerm, q]);

  return (
    <form ref={formRef} method="get" className={styles.compactFilterBar}>
      <div className={styles.compactSearchField}>
        <Search size={17} />
        <input type="hidden" name="tab" value="quizzes" />
        <input
          name="q"
          value={searchTerm}
          aria-label="Search quizzes"
          placeholder="Search quizzes..."
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
      <button
        type="button"
        className={`${styles.compactFilterToggle} ${advancedOpen ? styles.compactFilterToggleActive : ""}`}
        onClick={() => setAdvancedOpen((current) => !current)}
        aria-expanded={advancedOpen}
      >
        <SlidersHorizontal size={16} />
        Filters{activeFilterCount ? ` · ${activeFilterCount}` : ""}
        <ChevronDown size={15} />
      </button>
      {(q || program || unit) ? <Link className={styles.compactFilterClear} href="/elearning/practice?tab=quizzes">Clear</Link> : null}

      {advancedOpen ? (
        <div className={styles.compactFilterAdvanced}>
          <div className={styles.compactChoiceField}>
            <span>Program</span>
            <input ref={programRef} type="hidden" name="program" defaultValue={program} />
            <details className={styles.compactSelect}>
              <summary>{programLabel ? `${programLabel.code} · ${programLabel.name}` : "All programs"} <ChevronDown size={16} /></summary>
              <div className={styles.compactSelectMenu}>
                <button type="button" className={!program ? styles.compactSelectActive : ""} onClick={() => chooseProgram("")}>
                  <span>All programs</span>{!program ? <Check size={15} /> : null}
                </button>
                {programOptions.map((item) => (
                  <button type="button" key={item.id} className={program === item.id ? styles.compactSelectActive : ""} onClick={() => chooseProgram(item.id)}>
                    <span><strong>{item.code}</strong><small>{item.name}</small></span>
                    {program === item.id ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            </details>
          </div>
          <div className={styles.compactChoiceField}>
            <span>Unit</span>
            <input ref={unitRef} type="hidden" name="unit" defaultValue={unit} />
            <details className={styles.compactSelect}>
              <summary>{unit ? `Unit ${unit}` : "All units"} <ChevronDown size={16} /></summary>
              <div className={styles.compactSelectMenu}>
                <button type="button" className={!unit ? styles.compactSelectActive : ""} onClick={() => chooseUnit("")}>
                  <span>All units</span>{!unit ? <Check size={15} /> : null}
                </button>
                {unitOptions.map((item) => (
                  <button type="button" key={item} className={unit === item ? styles.compactSelectActive : ""} onClick={() => chooseUnit(item)}>
                    <span>Unit {item}</span>{unit === item ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      ) : null}
    </form>
  );
}
