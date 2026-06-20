"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettings(settings: { key: string; value: string }[]) {
  await prisma.$transaction(
    settings.map((setting) => 
      prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    )
  );

  revalidatePath("/", "layout"); // Revalidate entire app to reflect new settings
}
