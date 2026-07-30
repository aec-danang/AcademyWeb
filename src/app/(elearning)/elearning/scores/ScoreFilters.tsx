"use client";

import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import styles from "../elearning.module.css";

type Option = {
  id: string;
  label: string;
};

export function ScoreFilters({
  q,
  classroom,
  student,
  classrooms,
  students,
}: {
  q: string;
  classroom: string;
  student: string;
  classrooms: Option[];
  students: Option[];
}) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(classroom || student));
  const activeCount = Number(Boolean(classroom)) + Number(Boolean(student));

  return (
    <form className={styles.compactFilterBar} action="/elearning/scores">
      <div className={styles.compactSearchField}>
        <Search size={17} />
        <input name="q" defaultValue={q} aria-label="Search results" placeholder="Search class, student or work..." />
      </div>
      <button type="submit" className="btn-primary">Search</button>
      <button
        type="button"
        className={`${styles.compactFilterToggle} ${advancedOpen ? styles.compactFilterToggleActive : ""}`}
        onClick={() => setAdvancedOpen((current) => !current)}
        aria-expanded={advancedOpen}
      >
        <SlidersHorizontal size={16} />
        Filters{activeCount ? ` · ${activeCount}` : ""}
        <ChevronDown size={15} />
      </button>
      {(q || classroom || student) ? <Link className={styles.compactFilterClear} href="/elearning/scores">Clear</Link> : null}
      {advancedOpen ? (
        <div className={styles.compactFilterAdvanced}>
          <label>
            <span>Classroom</span>
            <select name="classroom" defaultValue={classroom}>
              <option value="">All classrooms</option>
              {classrooms.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Student</span>
            <select name="student" defaultValue={student}>
              <option value="">All students</option>
              {students.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button type="submit" className="btn-primary">Apply filters</button>
        </div>
      ) : null}
    </form>
  );
}
