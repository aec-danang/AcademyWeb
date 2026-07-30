"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function getStudentLifeEvents() {
  return prisma.studentLifeEvent.findMany({
    orderBy: { order: "asc" }
  });
}

export async function createStudentLifeEvent(title: string, imageUrl: string, order: number) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  return prisma.studentLifeEvent.create({
    data: { title, imageUrl, order }
  });
}

export async function deleteStudentLifeEvent(id: string) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  return prisma.studentLifeEvent.delete({
    where: { id }
  });
}

export async function updateStudentLifeEventOrder(items: { id: string, order: number }[]) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  // Using a transaction to update multiple
  const transactions = items.map(item => 
    prisma.studentLifeEvent.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  );
  
  await prisma.$transaction(transactions);
  return { success: true };
}

export async function uploadImageToCloudinary(base64Image: string): Promise<string> {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary configuration on server.");
  }

  // To use the Cloudinary REST API with authentication from the server:
  // We need to generate a signature or just upload base64 using basic auth or signed request.
  // The easiest way for server-to-server with base64 and cloudinary is using an unsigned upload preset if available.
  // BUT we don't have one. We can do a signed upload.
  // To avoid adding the 'crypto' logic manually, we can POST to cloudinary and use timestamp + signature.
  const timestamp = Math.round((new Date).getTime()/1000);
  
  // Since we don't have 'cloudinary' sdk installed (maybe?), let's use the REST API manually.
  // Signature = sha1("timestamp=" + timestamp + apiSecret)
  const crypto = require("crypto");
  const signature = crypto.createHash("sha1").update(`timestamp=${timestamp}${apiSecret}`).digest("hex");

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error(data.error?.message || "Failed to upload to Cloudinary");
  }
}
