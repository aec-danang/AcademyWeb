import { prisma } from "@/lib/prisma";
import SponsorsClient from "./SponsorsClient";

export default async function SponsorsAdminPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { order: "asc" },
  });

  return <SponsorsClient initialSponsors={sponsors} />;
}
