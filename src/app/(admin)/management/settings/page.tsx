import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  let user = null;

  const userId = (session?.user as any)?.id;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
  }

  const settings = await prisma.siteSetting.findMany();

  return <SettingsClient initialSettings={settings} user={user} />;
}
