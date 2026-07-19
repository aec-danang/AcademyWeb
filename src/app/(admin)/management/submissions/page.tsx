import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SubmissionsClient from "./SubmissionsClient";

export const metadata: Metadata = {
  title: "Manage Submissions | Admin Dashboard",
};

export default async function SubmissionsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6">
      <SubmissionsClient initialLeads={leads} />
    </div>
  );
}
