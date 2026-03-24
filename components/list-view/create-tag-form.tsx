"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import { createTag } from "@/lib/tags-api";

const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

interface CreateTagFormProps {
  hash: string;
  onTagCreated: (tag: Tag) => void;
}

export function CreateTagForm({ hash, onTagCreated }: CreateTagFormProps) {
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { tag, error: err } = await createTag(hash, trimmed, selectedColor);
      if (err) {
        setError(err);
      } else if (tag) {
        onTagCreated(tag);
        setNewName("");
        setSelectedColor(null);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={submitting}
          maxLength={50}
        />
        <button
          type="submit"
          disabled={!newName.trim() || submitting}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Add tag
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Color:</span>
        <button
          type="button"
          onClick={() => setSelectedColor(null)}
          className={`w-5 h-5 rounded-full bg-gray-300 ring-offset-1 ${selectedColor === null ? "ring-2 ring-blue-500" : ""}`}
          title="No color (gray)"
        />
        {TAG_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedColor(c)}
            className={`w-5 h-5 rounded-full ring-offset-1 ${selectedColor === c ? "ring-2 ring-blue-500" : ""}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
