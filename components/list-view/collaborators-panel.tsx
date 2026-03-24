"use client";

import { CollaboratorRow } from "@/components/list-view/collaborator-row";
import { useCollaborators } from "@/hooks/use-collaborators";

interface CollaboratorsPanelProps {
  hash: string;
  role: "owner" | "collaborator";
}

export function CollaboratorsPanel({ hash, role }: CollaboratorsPanelProps) {
  const { collaborators, loading, handleRemoved, handleUpdated } =
    useCollaborators(hash);

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
