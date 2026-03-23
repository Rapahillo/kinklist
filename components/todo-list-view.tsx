"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CollaboratorsPanel } from "@/components/collaborators-panel";
import { ShareButton } from "@/components/share-button";

interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  status: "OPEN" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}

interface TodoListViewProps {
  hash: string;
  title: string;
  role: "owner" | "collaborator";
}

export function TodoListView({ hash, title, role }: TodoListViewProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${hash}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const activeItems = items.filter((i) => i.status !== "ARCHIVED");
  const archivedItems = items.filter((i) => i.status === "ARCHIVED");
  const hasCompleted = activeItems.some((i) => i.status === "COMPLETED");

  async function handleAddItem(itemTitle: string) {
    const res = await fetch(`/api/lists/${hash}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: itemTitle }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
    }
  }

  async function handleToggleStatus(item: TodoItem) {
    const newStatus = item.status === "COMPLETED" ? "OPEN" : "COMPLETED";
    const res = await fetch(`/api/lists/${hash}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    }
  }

  async function handleUpdateTitle(itemId: string, newTitle: string) {
    const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    }
  }

  async function handleUpdateDescription(
    itemId: string,
    description: string | null
  ) {
    const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description || "" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    }
  }

  async function handleDeleteItem(itemId: string) {
    const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if (expandedItemId === itemId) setExpandedItemId(null);
    }
  }

  async function handleArchiveCompleted() {
    const res = await fetch(`/api/lists/${hash}/items/archive`, {
      method: "POST",
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i.status === "COMPLETED" ? { ...i, status: "ARCHIVED" } : i
        )
      );
    }
  }

  async function handleUnarchive(itemId: string) {
    const res = await fetch(`/api/lists/${hash}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OPEN" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    }
  }

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
              expanded={expandedItemId === item.id}
              onToggle={() =>
                setExpandedItemId(
                  expandedItemId === item.id ? null : item.id
                )
              }
              onToggleStatus={() => handleToggleStatus(item)}
              onUpdateTitle={(t) => handleUpdateTitle(item.id, t)}
              onUpdateDescription={(d) =>
                handleUpdateDescription(item.id, d)
              }
              onDelete={() => handleDeleteItem(item.id)}
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
        <CollaboratorsPanel hash={hash} role={role} />
      </div>
    </div>
  );
}

function AddItemForm({ onAdd }: { onAdd: (title: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new item..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  );
}

function TodoItemRow({
  item,
  expanded,
  onToggle,
  onToggleStatus,
  onUpdateTitle,
  onUpdateDescription,
  onDelete,
}: {
  item: TodoItem;
  expanded: boolean;
  onToggle: () => void;
  onToggleStatus: () => void;
  onUpdateTitle: (title: string) => Promise<void>;
  onUpdateDescription: (description: string | null) => Promise<void>;
  onDelete: () => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title);
  const [descValue, setDescValue] = useState(item.description || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleValue(item.title);
    setDescValue(item.description || "");
  }, [item.title, item.description]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  function handleTitleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingTitle(true);
  }

  async function saveTitleEdit() {
    const trimmed = titleValue.trim();
    if (!trimmed) {
      setTitleValue(item.title);
    } else if (trimmed !== item.title) {
      await onUpdateTitle(trimmed);
    }
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      saveTitleEdit();
    } else if (e.key === "Escape") {
      setTitleValue(item.title);
      setEditingTitle(false);
    }
  }

  async function handleDescBlur() {
    const trimmed = descValue.trim();
    const current = item.description || "";
    if (trimmed !== current) {
      await onUpdateDescription(trimmed || null);
    }
  }

  const isCompleted = item.status === "COMPLETED";

  return (
    <li className="rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={onToggleStatus}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
        />

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={editingTitle ? undefined : onToggle}
        >
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitleEdit}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-sm rounded border border-blue-300 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span
              className={`text-sm block truncate ${
                isCompleted ? "line-through text-gray-400" : ""
              }`}
              onClick={handleTitleClick}
            >
              {item.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <>
              <button
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium px-1"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
              title="Delete item"
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
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-100">
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Add a description..."
              rows={3}
              className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span>
              Created {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </li>
  );
}
