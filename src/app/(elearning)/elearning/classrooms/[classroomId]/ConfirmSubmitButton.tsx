"use client";

import type { MouseEvent } from "react";

export function ConfirmSubmitButton({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return <button type="submit" className={className} onClick={handleClick}>{children}</button>;
}
