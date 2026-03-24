"use client";

export function InlineConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button
        onClick={onConfirm}
        className="text-xs text-red-600 hover:text-red-800 font-medium px-1"
      >
        Confirm
      </button>
      <button
        onClick={onCancel}
        className="text-xs text-gray-400 hover:text-gray-600 px-1"
      >
        Cancel
      </button>
    </>
  );
}
