"use client";

import { useState, useEffect } from "react";
import type { TodoItem } from "@/lib/types";
import { updateItem } from "@/lib/items-api";

export function ItemDescription({
  hash,
  item,
  onItemUpdated,
}: {
  hash: string;
  item: Pick<TodoItem, "id" | "description">;
  onItemUpdated: (item: TodoItem) => void;
}) {
  const [descValue, setDescValue] = useState(item.description || "");

  useEffect(() => {
    setDescValue(item.description || "");
  }, [item.description]);

  async function handleBlur() {
    const trimmed = descValue.trim();
    const current = item.description || "";
    if (trimmed !== current) {
      const updated = await updateItem(hash, item.id, {
        description: trimmed || null,
      });
      if (updated) onItemUpdated(updated);
    }
  }

  return (
    <div className="mt-2">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Description
      </label>
      <textarea
        value={descValue}
        onChange={(e) => setDescValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add a description..."
        rows={3}
        className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
      />
    </div>
  );
}
