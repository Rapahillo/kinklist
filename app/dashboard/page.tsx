import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500">{user.email}</span>
      </header>
      <p className="text-gray-600">Welcome! Your todo lists will appear here.</p>
    </main>
  );
}
