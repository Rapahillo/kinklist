"use client";

import { useState } from "react";
import { InlineConfirm } from "@/components/ui/inline-confirm";

export function ItemDeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-1 shrink-0">
      {confirmDelete ? (
        <InlineConfirm
          onConfirm={() => {
            onConfirm();
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
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
  );
}
