"use client";

import { useState, useEffect, useCallback } from "react";

interface SessionInfo {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

export function SessionsPanel() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLogoutOtherDevices = async () => {
    setRevoking(true);
    try {
      const res = await fetch("/api/auth/sessions", { method: "DELETE" });
      if (res.ok) {
        await fetchSessions();
      }
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading sessions...</p>;
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
      <ul className="space-y-2 mb-4">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="text-sm p-3 rounded border border-gray-200 flex justify-between items-center"
          >
            <div>
              <span className="font-medium">
                {session.isCurrent ? "Current session" : "Other session"}
              </span>
              <span className="text-gray-500 ml-2">
                Created {new Date(session.createdAt).toLocaleDateString()}
              </span>
              <span className="text-gray-400 ml-2">
                Last active{" "}
                {new Date(session.lastUsedAt).toLocaleString()}
              </span>
            </div>
            {session.isCurrent && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Current
              </span>
            )}
          </li>
        ))}
      </ul>
      {otherSessions.length > 0 && (
        <button
          onClick={handleLogoutOtherDevices}
          disabled={revoking}
          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {revoking ? "Logging out..." : "Log out all other devices"}
        </button>
      )}
    </div>
  );
}
