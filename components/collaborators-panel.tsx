"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Collaborator {
  id: string;
  nickname: string | null;
  email?: string;
  addedAt: string;
}

interface CollaboratorsPanelProps {
  hash: string;
  role: "owner" | "collaborator";
}

export function CollaboratorsPanel({ hash, role }: CollaboratorsPanelProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollaborators = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${hash}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators);
      }
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  function handleRemoved(id: string) {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  }

  function handleUpdated(updated: Collaborator) {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading collaborators...</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Collaborators</h3>

      {collaborators.length === 0 ? (
        <p className="text-sm text-gray-400">No collaborators yet.</p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map((c) => (
            <CollaboratorRow
              key={c.id}
              collaborator={c}
              hash={hash}
              isOwner={role === "owner"}
              onRemoved={handleRemoved}
              onUpdated={handleUpdated}
            />
          ))}
        </ul>
      )}

    </div>
  );
}

function CollaboratorRow({
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
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState(
    collaborator.nickname || ""
  );
  const [confirmRemove, setConfirmRemove] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNicknameValue(collaborator.nickname || "");
  }, [collaborator.nickname]);

  useEffect(() => {
    if (editingNickname) {
      nicknameRef.current?.focus();
      nicknameRef.current?.select();
    }
  }, [editingNickname]);

  async function saveNickname() {
    const trimmed = nicknameValue.trim();
    const current = collaborator.nickname || "";
    if (trimmed !== current) {
      const res = await fetch(
        `/api/lists/${hash}/collaborators/${collaborator.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: trimmed || null }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        onUpdated(updated);
      }
    }
    setEditingNickname(false);
  }

  function handleNicknameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveNickname();
    else if (e.key === "Escape") {
      setNicknameValue(collaborator.nickname || "");
      setEditingNickname(false);
    }
  }

  async function handleRemove() {
    const res = await fetch(
      `/api/lists/${hash}/collaborators/${collaborator.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      onRemoved(collaborator.id);
    }
  }

  return (
    <li className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        {isOwner && editingNickname ? (
          <input
            ref={nicknameRef}
            type="text"
            value={nicknameValue}
            onChange={(e) => setNicknameValue(e.target.value)}
            onBlur={saveNickname}
            onKeyDown={handleNicknameKeyDown}
            placeholder="Set nickname..."
            className="w-full rounded border border-blue-300 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div>
            <span
              className={`block truncate ${isOwner ? "cursor-pointer hover:text-blue-600" : ""}`}
              onClick={isOwner ? () => setEditingNickname(true) : undefined}
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
              <button
                onClick={() => {
                  handleRemove();
                  setConfirmRemove(false);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
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
