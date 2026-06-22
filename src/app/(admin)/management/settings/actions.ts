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

export async function updateAdminAccount(
  userId: string, 
  data: { name?: string; email?: string; password?: string }
) {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  
  if (data.password) {
    const bcrypt = require("bcryptjs");
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
