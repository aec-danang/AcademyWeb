"use client";

import { useEffect } from "react";

export function EasterEgg() {
  useEffect(() => {
    console.log(
      "%cBuilt by \n" + 
      "%c- Nguyen Binh Minh\n" +
      "- Nguyen Minh Son\n" +
      "- Tran Ly Nghia\n\n" +
      "%c23AI Class\n" + 
      "Vietnam-Korea University (VKU)\n" +
      "Class of 2026",
      "color: #f68d2e; font-size: 16px; font-weight: bold; padding-bottom: 4px;",
      "color: #2c2d65; font-size: 14px; font-weight: bold; font-family: monospace; padding-bottom: 8px;",
      "color: #f68d2e; font-size: 13px; font-weight: bold; background-color: #fef4eb; padding: 6px 10px; border-radius: 6px; border: 1px solid #f68d2e;"
    );
  }, []);

  return null;
}
