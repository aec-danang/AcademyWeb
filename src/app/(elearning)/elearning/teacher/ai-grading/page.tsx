import { requireUser } from "@/lib/session";
import { AIGradingView } from "./AIGradingView";

export default async function TeacherAIGradingPage() {
  // Ensure only TEACHER or ADMIN can access this page
  await requireUser(["TEACHER", "ADMIN"]);

  return <AIGradingView />;
}
