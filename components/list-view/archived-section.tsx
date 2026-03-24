"use client";

import { useState } from "react";
import type { TodoItem } from "@/lib/types";

interface ArchivedSectionProps {
  items: TodoItem[];
  hasCompleted: boolean;
  onArchiveCompleted: () => void;
  onUnarchive: (itemId: string) => void;
}

export function ArchivedSection({
  items,
  hasCompleted,
  onArchiveCompleted,
  onUnarchive,
}: ArchivedSectionProps) {
  const [showArchived, setShowArchived] = useState(false);

  return (
    <>
      {hasCompleted && (
        <div className="mt-4">
          <button
            onClick={onArchiveCompleted}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Archive completed items
          </button>
        </div>
      )}

      {items.length > 0 && (
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
            Archived ({items.length})
          </button>
          {showArchived && (
            <ul className="mt-2 space-y-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-2 bg-gray-50 text-gray-400"
                >
                  <span className="flex-1 line-through text-sm truncate">
                    {item.title}
                  </span>
                  <button
                    onClick={() => onUnarchive(item.id)}
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
    </>
  );
}
