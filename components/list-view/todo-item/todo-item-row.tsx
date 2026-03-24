"use client";

import type { Tag, TodoItem } from "@/lib/types";
import { updateItem, deleteItem } from "@/lib/items-api";
import { addTagToItem, removeTagFromItem } from "@/lib/tags-api";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { ItemCheckbox } from "./item-checkbox";
import { ItemTitle } from "./item-title";
import { ItemDeleteButton } from "./item-delete-button";
import { ItemDetailsPanel } from "./item-details-panel";

export function TodoItemRow({
  item,
  hash,
  availableTags,
  expanded,
  onToggle,
  onItemUpdated,
  onItemDeleted,
}: {
  item: TodoItem;
  hash: string;
  availableTags: Tag[];
  expanded: boolean;
  onToggle: () => void;
  onItemUpdated: (item: TodoItem) => void;
  onItemDeleted: (id: string) => void;
}) {
  const title = useInlineEdit(item.title, async (trimmed) => {
    const updated = await updateItem(hash, item.id, { title: trimmed });
    if (updated) onItemUpdated(updated);
  });

  const isCompleted = item.status === "COMPLETED";

  async function handleToggleStatus() {
    const newStatus = item.status === "COMPLETED" ? "OPEN" : "COMPLETED";
    const updated = await updateItem(hash, item.id, { status: newStatus });
    if (updated) onItemUpdated(updated);
  }

  async function handleDelete() {
    const ok = await deleteItem(hash, item.id);
    if (ok) onItemDeleted(item.id);
  }

  async function handleAddTag(tagId: string) {
    const updated = await addTagToItem(hash, item.id, tagId);
    if (updated) onItemUpdated(updated);
  }

  async function handleRemoveTag(tagId: string) {
    const updated = await removeTagFromItem(hash, item.id, tagId);
    if (updated) onItemUpdated(updated);
  }

  return (
    <li className="rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
      <div className="flex items-start gap-3 px-4 py-3">
        <ItemCheckbox isCompleted={isCompleted} onToggle={handleToggleStatus} />
        <ItemTitle
          item={item}
          isCompleted={isCompleted}
          title={title}
          onExpandToggle={onToggle}
        />
        <button
          type="button"
          onClick={onToggle}
          className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
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
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <ItemDeleteButton onConfirm={handleDelete} />
      </div>
      <ItemDetailsPanel
        item={item}
        hash={hash}
        expanded={expanded}
        availableTags={availableTags}
        onItemUpdated={onItemUpdated}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </li>
  );
}
