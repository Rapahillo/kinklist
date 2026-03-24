"use client";

import { useState, useEffect, useRef } from "react";

export function useInlineEdit(
  initialValue: string,
  onSave: (trimmed: string) => Promise<void>
) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setValue(initialValue);
  }, [initialValue, editing]);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setEditing(true);
  }

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      setValue(initialValue);
    } else if (trimmed !== initialValue) {
      await onSave(trimmed);
    }
    setEditing(false);
  }

  function cancel() {
    setValue(initialValue);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  }

  return { editing, value, setValue, ref, startEditing, save, cancel, handleKeyDown };
}
