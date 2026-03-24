"use client";

import { useState, useRef } from "react";
import { usePropInput } from "@/hooks/use-prop-input";
import { PropChipList } from "./todo-item/prop-chip-list";
import { PropAutocompleteInput } from "./todo-item/prop-autocomplete-input";

export function AddItemForm({
  onAdd,
}: {
  onAdd: (title: string, description?: string, props?: string[]) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [props, setProps] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const propInput = usePropInput(
    props,
    async (newProps) => setProps(newProps),
    async (newProps) => setProps(newProps)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd(
        trimmed,
        description.trim() || undefined,
        props.length > 0 ? props : undefined
      );
      setTitle("");
      setDescription("");
      setProps([]);
      setShowDetails(false);
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new item..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="self-start text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showDetails ? "− Hide details" : "+ Add details"}
      </button>

      {showDetails && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Props
            </label>
            <PropChipList props={props} onRemove={propInput.removeProp} />
            {props.length < 20 && (
              <PropAutocompleteInput
                input={propInput.input}
                suggestions={propInput.suggestions}
                showDropdown={propInput.showDropdown}
                inputRef={propInput.ref}
                onInputChange={propInput.handleInputChange}
                onKeyDown={propInput.handleKeyDown}
                onBlur={() => setTimeout(propInput.closeDropdown, 150)}
                onSelectSuggestion={propInput.addProp}
              />
            )}
          </div>
        </div>
      )}
    </form>
  );
}
