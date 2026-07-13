import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Manage Features | Admin Dashboard",
};

export default async function FeaturesPage() {
  const features = await prisma.siteFeature.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="p-6">
      <FeaturesClient initialFeatures={features} />
    </div>
  );
}
