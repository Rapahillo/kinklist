"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tag, TodoItem } from "@/lib/types";
import { CollaboratorsPanel } from "@/components/list-view/collaborators-panel";
import { ShareButton } from "@/components/ui/share-button";
import { AddItemForm } from "@/components/list-view/add-item-form";
import { TagsPanel } from "@/components/list-view/tags-panel";
import { TodoItemRow } from "@/components/list-view/todo-item-row";
import { fetchItems, createItem, archiveCompleted, updateItem } from "@/lib/items-api";
import { fetchTags } from "@/lib/tags-api";

interface TodoListViewProps {
  hash: string;
  title: string;
  role: "owner" | "collaborator";
}

export function TodoListView({ hash, title, role }: TodoListViewProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [loadedItems, loadedTags] = await Promise.all([
        fetchItems(hash),
        fetchTags(hash),
      ]);
      setItems(loadedItems);
      setTags(loadedTags);
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddItem(itemTitle: string) {
    const item = await createItem(hash, itemTitle);
    if (item) setItems((prev) => [item, ...prev]);
  }

  async function handleArchiveCompleted() {
    const ok = await archiveCompleted(hash);
    if (ok) {
      setItems((prev) =>
        prev.map((i) =>
          i.status === "COMPLETED" ? { ...i, status: "ARCHIVED" } : i
        )
      );
    }
  }

  async function handleUnarchive(itemId: string) {
    const updated = await updateItem(hash, itemId, { status: "OPEN" });
    if (updated) setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
  }

  function handleItemUpdated(updated: TodoItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleItemDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (expandedItemId === id) setExpandedItemId(null);
  }

  function handleTagCreated(tag: Tag) {
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function handleTagDeleted(tagId: string) {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setItems((prev) =>
      prev.map((i) => ({ ...i, tags: i.tags.filter((t) => t.id !== tagId) }))
    );
  }

  const activeItems = items.filter((i) => i.status !== "ARCHIVED");
  const archivedItems = items.filter((i) => i.status === "ARCHIVED");
  const hasCompleted = activeItems.some((i) => i.status === "COMPLETED");

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Back to dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-2xl font-bold">{title}</h1>
          {role === "collaborator" && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              shared
            </span>
          )}
          <div className="ml-auto">
            <ShareButton hash={hash} />
          </div>
        </div>
      </header>

      <AddItemForm onAdd={handleAddItem} />

      {loading ? (
        <p className="text-gray-500 text-sm mt-4">Loading items...</p>
      ) : activeItems.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center mt-4">
          <p className="text-gray-500">
            No items yet. Add one above to get started!
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {activeItems.map((item) => (
            <TodoItemRow
              key={item.id}
              item={item}
              hash={hash}
              availableTags={tags}
              expanded={expandedItemId === item.id}
              onToggle={() =>
                setExpandedItemId(expandedItemId === item.id ? null : item.id)
              }
              onItemUpdated={handleItemUpdated}
              onItemDeleted={handleItemDeleted}
            />
          ))}
        </ul>
      )}

      {hasCompleted && (
        <div className="mt-4">
          <button
            onClick={handleArchiveCompleted}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Archive completed items
          </button>
        </div>
      )}

      {archivedItems.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showArchived ? "rotate-90" : ""}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            Archived ({archivedItems.length})
          </button>
          {showArchived && (
            <ul className="mt-2 space-y-1">
              {archivedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-2 bg-gray-50 text-gray-400"
                >
                  <span className="flex-1 line-through text-sm truncate">
                    {item.title}
                  </span>
                  <button
                    onClick={() => handleUnarchive(item.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
                  >
                    Unarchive
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <TagsPanel
          hash={hash}
          tags={tags}
          onTagCreated={handleTagCreated}
          onTagDeleted={handleTagDeleted}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <CollaboratorsPanel hash={hash} role={role} />
      </div>
    </div>
  );
}
