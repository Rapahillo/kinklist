"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";

interface TagChipProps {
  tag: Tag;
  onDelete: (tagId: string) => void;
}

export function TagChip({ tag, onDelete }: TagChipProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: tag.color ?? "#6b7280" }}
    >
      {tag.name}
      {confirming ? (
        <>
          <button
            onClick={() => onDelete(tag.id)}
            className="ml-1 underline hover:no-underline"
            title="Confirm delete"
          >
            del?
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="hover:opacity-75"
            title="Cancel"
          >
            ✕
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="hover:opacity-75 ml-0.5"
          title="Delete tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
