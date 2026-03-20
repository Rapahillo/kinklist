import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { SessionsPanel } from "@/components/sessions-panel";
import { TodoListsPanel } from "@/components/todo-lists-panel";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <section>
        <h2 className="text-lg font-semibold mb-4">Your Lists</h2>
        <TodoListsPanel />
      </section>
      <section className="mt-8 pt-8 border-t border-gray-200">
        <SessionsPanel />
      </section>
      <footer className="mt-8 pt-8 border-t border-gray-200">
        <DeleteAccountButton email={user.email} />
      </footer>
    </main>
  );
}
