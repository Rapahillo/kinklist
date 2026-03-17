"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton({ email }: { email: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete account");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-500 hover:text-red-700"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="border border-red-300 rounded-lg p-4 bg-red-50 max-w-md">
      <p className="text-sm text-red-800 font-medium mb-2">
        This will permanently delete your account and all your data.
      </p>
      <p className="text-sm text-red-700 mb-3">
        Type <strong>{email}</strong> to confirm:
      </p>
      <input
        type="email"
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full border border-red-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        disabled={loading}
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading || confirmEmail.toLowerCase().trim() !== email.toLowerCase()}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Deleting…" : "Permanently delete"}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setConfirmEmail("");
            setError("");
          }}
          disabled={loading}
          className="text-sm text-gray-600 px-4 py-2 rounded hover:text-gray-800 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
