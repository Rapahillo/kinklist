"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchCollaborators,
  type Collaborator,
} from "@/lib/collaborators-api";

export function useCollaborators(hash: string) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollaborators = useCallback(async () => {
    try {
      const data = await fetchCollaborators(hash);
      setCollaborators(data);
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  function handleRemoved(id: string) {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  }

  function handleUpdated(updated: Collaborator) {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }

  return { collaborators, loading, handleRemoved, handleUpdated };
}
