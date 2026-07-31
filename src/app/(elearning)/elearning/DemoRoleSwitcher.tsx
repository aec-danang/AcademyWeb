"use client";

import { useState } from "react";
import { GraduationCap, Loader2, Presentation, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./elearning.module.css";

const roles = [
  { role: "ADMIN", label: "Admin", icon: ShieldCheck },
  { role: "TEACHER", label: "Teacher", icon: Presentation },
  { role: "STUDENT", label: "Student", icon: GraduationCap },
] as const;

export function DemoRoleSwitcher({ currentRole }: { currentRole: string }) {
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const current = roles.find((item) => item.role === currentRole) || roles[1];
  const CurrentIcon = current.icon;

  async function switchRole(role: (typeof roles)[number]["role"]) {
    if (role === currentRole) return;
    setPendingRole(role);
    try {
      const response = await fetch("/api/elearning/demo-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error("Could not switch demo role.");
      router.push(role === "ADMIN" ? "/management" : "/elearning");
      router.refresh();
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <div className={styles.demoRoleSwitcher} aria-label="Demo workspace switcher">
      <span className={styles.demoRoleCurrent}>
        <CurrentIcon size={15} />
        Demo {current.label}
      </span>
      <span className={styles.demoRoleOptions}>
        {roles.filter((item) => item.role !== currentRole).map((item) => (
          <button
            type="button"
            key={item.role}
            onClick={() => void switchRole(item.role)}
            disabled={pendingRole !== null}
            title={`Switch to ${item.label} workspace`}
          >
            {pendingRole === item.role ? <Loader2 size={13} className={styles.spinner} /> : item.label}
          </button>
        ))}
      </span>
    </div>
  );
}
