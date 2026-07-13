import { redirect } from "next/navigation";

export default function ExercisesRedirect() {
  redirect("/elearning/practice?tab=quizzes");
}
