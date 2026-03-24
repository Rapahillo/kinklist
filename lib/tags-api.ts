import type { Tag, TodoItem } from "@/lib/types";

export async function fetchTags(hash: string): Promise<Tag[]> {
  const res = await fetch(`/api/lists/${hash}/tags`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.tags;
}

export async function createTag(
  hash: string,
  name: string,
  color: string | null
): Promise<{ tag: Tag | null; error: string | null }> {
  const res = await fetch(`/api/lists/${hash}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  });
  if (res.ok) {
    const tag = await res.json();
    return { tag, error: null };
  }
  const data = await res.json().catch(() => null);
  return { tag: null, error: data?.error ?? "Failed to create tag" };
}

export async function deleteTag(
  hash: string,
  tagId: string
): Promise<boolean> {
  const res = await fetch(`/api/lists/${hash}/tags/${tagId}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function addTagToItem(
  hash: string,
  itemId: string,
  tagId: string
): Promise<TodoItem | null> {
  const res = await fetch(`/api/lists/${hash}/items/${itemId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function removeTagFromItem(
  hash: string,
  itemId: string,
  tagId: string
): Promise<TodoItem | null> {
  const res = await fetch(`/api/lists/${hash}/items/${itemId}/tags/${tagId}`, {
    method: "DELETE",
  });
  if (!res.ok) return null;
  return res.json();
}
