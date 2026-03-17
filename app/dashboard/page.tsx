// app/dashboard/page.tsx - Redirects the old dashboard route to the task list.
import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/tasks");
}
