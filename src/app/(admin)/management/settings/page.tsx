import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany();

  return <SettingsClient initialSettings={settings} />;
}
