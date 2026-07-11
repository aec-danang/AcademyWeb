import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LeadsClient from "./LeadsClient";

export const metadata: Metadata = {
  title: "Manage Leads | Admin Dashboard",
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6">
      <LeadsClient initialLeads={leads} />
    </div>
  );
}
