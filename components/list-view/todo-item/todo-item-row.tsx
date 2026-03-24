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
