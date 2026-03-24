import { redirect } from "next/navigation";
import { getAuthenticatedUser, authorizeListAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodoListView } from "@/components/list-view/todo-list-view";
import { JoinListPage } from "@/components/list-view/join-list-page";
import { logAudit } from "@/lib/audit";

export default async function ListPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/");
  }

  const { hash } = await params;

  const listExists = await prisma.todoList.findUnique({
    where: { hash },
    select: { id: true, title: true },
  });

  if (!listExists) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-500 mb-4">This list does not exist.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Back to dashboard
          </a>
        </div>
      </main>
    );
  }

  // Check authorization
  const access = await authorizeListAccess(user.id, hash);

  if (!access) {
    return <JoinListPage hash={hash} listTitle={listExists.title} />;
  }

  void logAudit({
    userId: user.id,
    action: "list.access",
    targetType: "list",
    targetId: access.list.id,
  });

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <TodoListView
        hash={hash}
        title={access.list.title}
        role={access.role}
      />
    </main>
  );
}
