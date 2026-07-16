"use client";

import { useState } from "react";
import { submitLead } from "./actions";
import styles from "./contact.module.css";
import { Loader2 } from "lucide-react";

export default function ContactFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMsg(result.error || "An error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className={styles.alertSuccess}>
          <div>
            <strong>Thank you!</strong><br />
            Your registration has been submitted successfully. We will contact you soon.
          </div>
        </div>
      )}
      {errorMsg && (
        <div className={styles.alertError}>
          {errorMsg}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Full Name</label>
        <input name="name" type="text" required className={styles.formInput} placeholder="John Doe" />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Phone Number</label>
        <input name="phone" type="tel" required className={styles.formInput} placeholder="0901234567" />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Program of Interest</label>
        <select name="program" className={styles.formSelect}>
          <option value="Kids & Teens">Kids & Teens</option>
          <option value="IELTS / Test Prep">IELTS / Test Prep</option>
          <option value="Adults / Communication">Adults / Communication</option>
          <option value="Corporate English">Corporate English</option>
        </select>
      </div>
      
      <button type="submit" disabled={isSubmitting} className={`btn-primary ${styles.submitBtn}`} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : "Submit Registration"}
      </button>
    </form>
  );
}
