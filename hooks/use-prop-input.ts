"use client";

import { useState, useRef } from "react";
import { searchPropSuggestions } from "@/lib/prop-suggestions";

export function usePropInput(
  existingProps: string[],
  onAdd: (newProps: string[]) => Promise<void>,
  onRemove: (newProps: string[]) => Promise<void>
) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function handleInputChange(val: string) {
    setInput(val);
    if (val.trim()) {
      const results = searchPropSuggestions(val).filter(
        (s) => !existingProps.includes(s)
      );
      setSuggestions(results.slice(0, 8));
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  async function addProp(value: string) {
    const trimmed = value.trim();
    if (!trimmed || existingProps.includes(trimmed) || existingProps.length >= 20)
      return;
    await onAdd([...existingProps, trimmed]);
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
    ref.current?.focus();
  }

  async function removeProp(prop: string) {
    await onRemove(existingProps.filter((p) => p !== prop));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addProp(input);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function closeDropdown() {
    setShowDropdown(false);
  }

  return {
    input,
    suggestions,
    showDropdown,
    ref,
    handleInputChange,
    addProp,
    removeProp,
    handleKeyDown,
    closeDropdown,
  };
}
