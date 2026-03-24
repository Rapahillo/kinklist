"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import { TagChip } from "@/components/list-view/tag-chip";
import { CreateTagForm } from "@/components/list-view/create-tag-form";

export function TagsPanel({
  hash,
  tags,
  onTagCreated,
  onTagDeleted,
}: {
  hash: string;
  tags: Tag[];
  onTagCreated: (tag: Tag) => void;
  onTagDeleted: (tagId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
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
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        Tags ({tags.length})
      </button>

      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: expanded ? "500px" : "0" }}
      >
        <div className="mt-3 space-y-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} onDelete={onTagDeleted} />
              ))}
            </div>
          )}
          <CreateTagForm hash={hash} onTagCreated={onTagCreated} />
        </div>
      </div>
    </div>
  );
}
