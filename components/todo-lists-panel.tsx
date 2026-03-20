"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateListForm } from "@/components/create-list-form";
import { DeleteListButton } from "@/components/delete-list-button";

interface TodoListItem {
  hash: string;
  title: string;
  role: "owner" | "collaborator";
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export function TodoListsPanel() {
  const router = useRouter();
  const [lists, setLists] = useState<TodoListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLists() {
    try {
      const res = await fetch("/api/lists");
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLists();
  }, []);

  function handleCreated(newList: TodoListItem) {
    setLists((prev) => [newList, ...prev]);
  }

  function handleDeleted(hash: string) {
    setLists((prev) => prev.filter((l) => l.hash !== hash));
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading lists...</p>;
  }

  return (
    <div className="space-y-6">
      <CreateListForm onCreated={handleCreated} />

      {lists.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            You don&apos;t have any lists yet. Create one above to get started!
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li
              key={list.hash}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => router.push(`/list/${list.hash}`)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{list.title}</span>
                  {list.role === "collaborator" && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      shared
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span>
                    Created{" "}
                    {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
              {list.role === "owner" && (
                <DeleteListButton hash={list.hash} title={list.title} onDeleted={handleDeleted} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
