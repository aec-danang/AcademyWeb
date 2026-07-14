"use server";

import { prisma } from "@/lib/prisma";

export async function submitLead(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const program = formData.get("program") as string;

    if (!name || !phone) {
      return { success: false, error: "Name and phone are required." };
    }

    await prisma.lead.create({
      data: {
        name,
        phone,
        message: `Interested in: ${program}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit lead:", error);
    return { success: false, error: "An error occurred while submitting." };
  }
}
