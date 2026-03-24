"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tag, TodoItem } from "@/lib/types";
import { CollaboratorsPanel } from "@/components/list-view/collaborators-panel";
import { AddItemForm } from "@/components/list-view/add-item-form";
import { TagsPanel } from "@/components/list-view/tags-panel";
import { ListViewHeader } from "@/components/list-view/list-view-header";
import { ActiveItemsList } from "@/components/list-view/active-items-list";
import { ArchivedSection } from "@/components/list-view/archived-section";
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
      <ListViewHeader title={title} hash={hash} role={role} />

      <AddItemForm onAdd={handleAddItem} />

      <ActiveItemsList
        loading={loading}
        items={activeItems}
        hash={hash}
        availableTags={tags}
        expandedItemId={expandedItemId}
        onToggleExpand={(id) => setExpandedItemId(expandedItemId === id ? null : id)}
        onItemUpdated={handleItemUpdated}
        onItemDeleted={handleItemDeleted}
      />

      <ArchivedSection
        items={archivedItems}
        hasCompleted={hasCompleted}
        onArchiveCompleted={handleArchiveCompleted}
        onUnarchive={handleUnarchive}
      />

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
