import { getPrograms } from "./actions";
import ProgramsClient from "./ProgramsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Programs - AEC Admin",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="p-6 h-full w-full">
      <ProgramsClient initialPrograms={programs} />
    </div>
  );
}
