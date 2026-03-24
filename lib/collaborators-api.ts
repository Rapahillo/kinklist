export interface Collaborator {
  id: string;
  nickname: string | null;
  email?: string;
  addedAt: string;
}

export async function fetchCollaborators(hash: string): Promise<Collaborator[]> {
  const res = await fetch(`/api/lists/${hash}/collaborators`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.collaborators;
}

export async function updateCollaborator(
  hash: string,
  id: string,
  patch: { nickname: string | null }
): Promise<Collaborator | null> {
  const res = await fetch(`/api/lists/${hash}/collaborators/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function removeCollaborator(
  hash: string,
  id: string
): Promise<boolean> {
  const res = await fetch(`/api/lists/${hash}/collaborators/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
