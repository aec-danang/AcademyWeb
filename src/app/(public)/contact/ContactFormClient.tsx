"use client";

import { useState } from "react";
import { submitContactForm } from "./actions";
import styles from "./contact.module.css";
import { Loader2 } from "lucide-react";

export default function ContactFormClient({ programs = [] }: { programs?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

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
            <strong>Cảm ơn bạn!</strong><br />
            Đăng ký của bạn đã được gửi thành công. Chúng tôi sẽ sớm liên hệ với bạn.
          </div>
        </div>
      )}
      {errorMsg && (
        <div className={styles.alertError}>
          {errorMsg}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Họ và Tên</label>
        <input name="name" type="text" required className={styles.formInput} placeholder="Nguyễn Văn A" />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Số Điện Thoại</label>
        <input name="phone" type="tel" required className={styles.formInput} placeholder="0901234567" />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Chương trình quan tâm</label>
        <select name="program" className={styles.formSelect}>
          {programs.length > 0 ? (
            programs.map((p) => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))
          ) : (
            <>
              <option value="Kids & Teens">Tiếng Anh Trẻ em & Thiếu niên</option>
              <option value="IELTS / Test Prep">Luyện thi IELTS / Chứng chỉ</option>
              <option value="Adults / Communication">Tiếng Anh Giao tiếp / Người lớn</option>
              <option value="Corporate English">Tiếng Anh Doanh nghiệp</option>
            </>
          )}
        </select>
      </div>
      
      <button type="submit" disabled={isSubmitting} className={`btn-primary ${styles.submitBtn}`} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Đang gửi...</> : "Gửi Đăng Ký"}
      </button>
    </form>
  );
}
