import { redirect } from "next/navigation";

export default function WrongQuestionsRedirect() {
  redirect("/elearning/practice?tab=wrong");
}
