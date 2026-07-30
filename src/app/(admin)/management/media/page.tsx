import { getStudentLifeEvents } from "@/lib/mediaActions";
import { MediaManager } from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const events = await getStudentLifeEvents();
  
  return (
    <div className="py-6">
      <MediaManager initialEvents={events} />
    </div>
  );
}
