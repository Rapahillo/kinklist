import type { TodoItem } from "@/lib/types";

export async function fetchItems(hash: string): Promise<TodoItem[]> {
  const res = await fetch(`/api/lists/${hash}/items`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items;
}

export async function createItem(
  hash: string,
  title: string,
  options?: { description?: string; props?: string[] }
): Promise<TodoItem | null> {
  const res = await fetch(`/api/lists/${hash}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, ...options }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateItem(
  hash: string,
  itemId: string,
  patch: Partial<Pick<TodoItem, "title" | "description" | "props" | "status">>
): Promise<TodoItem | null> {
  const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteItem(
  hash: string,
  itemId: string
): Promise<boolean> {
  const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function archiveCompleted(hash: string): Promise<boolean> {
  const res = await fetch(`/api/lists/${hash}/items/archive`, {
    method: "POST",
  });
  return res.ok;
}
