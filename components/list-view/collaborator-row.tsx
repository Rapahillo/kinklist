"use client";

import { useState } from "react";
import { InlineConfirm } from "@/components/ui/inline-confirm";
import { updateCollaborator, removeCollaborator, type Collaborator } from "@/lib/collaborators-api";
import { useInlineEdit } from "@/hooks/use-inline-edit";

export function CollaboratorRow({
  collaborator,
  hash,
  isOwner,
  onRemoved,
  onUpdated,
}: {
  collaborator: Collaborator;
  hash: string;
  isOwner: boolean;
  onRemoved: (id: string) => void;
  onUpdated: (c: Collaborator) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const nickname = useInlineEdit(
    collaborator.nickname || "",
    async (trimmed) => {
      const updated = await updateCollaborator(hash, collaborator.id, {
        nickname: trimmed || null,
      });
      if (updated) onUpdated(updated);
    }
  );

  async function handleRemove() {
    const ok = await removeCollaborator(hash, collaborator.id);
    if (ok) onRemoved(collaborator.id);
  }

  return (
    <li className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        {isOwner && nickname.editing ? (
          <input
            ref={nickname.ref}
            type="text"
            value={nickname.value}
            onChange={(e) => nickname.setValue(e.target.value)}
            onBlur={nickname.save}
            onKeyDown={nickname.handleKeyDown}
            placeholder="Set nickname..."
            className="w-full rounded border border-blue-300 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div>
            <span
              className={`block truncate ${isOwner ? "cursor-pointer hover:text-blue-600" : ""}`}
              onClick={isOwner ? nickname.startEditing : undefined}
              title={isOwner ? "Click to edit nickname" : undefined}
            >
              {collaborator.nickname || (
                <span className="text-gray-400 italic">No nickname</span>
              )}
            </span>
            {isOwner && collaborator.email && (
              <span className="text-xs text-gray-400 block truncate">
                {collaborator.email}
              </span>
            )}
          </div>
        )}
      </div>

      {isOwner && (
        <div className="shrink-0">
          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <InlineConfirm
                onConfirm={() => {
                  handleRemove();
                  setConfirmRemove(false);
                }}
                onCancel={() => setConfirmRemove(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
              title="Remove collaborator"
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
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </li>
  );
}
