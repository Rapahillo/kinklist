"use client";

import { useState, useEffect } from "react";
import type { Tag, TodoItem } from "@/lib/types";
import { InlineConfirm } from "@/components/ui/inline-confirm";
import { updateItem, deleteItem } from "@/lib/items-api";
import { addTagToItem, removeTagFromItem } from "@/lib/tags-api";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { usePropInput } from "@/hooks/use-prop-input";

export function TodoItemRow({
  item,
  hash,
  availableTags,
  expanded,
  onToggle,
  onItemUpdated,
  onItemDeleted,
}: {
  item: TodoItem;
  hash: string;
  availableTags: Tag[];
  expanded: boolean;
  onToggle: () => void;
  onItemUpdated: (item: TodoItem) => void;
  onItemDeleted: (id: string) => void;
}) {
  const [descValue, setDescValue] = useState(item.description || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDescValue(item.description || "");
  }, [item.description]);

  const title = useInlineEdit(item.title, async (trimmed) => {
    const updated = await updateItem(hash, item.id, { title: trimmed });
    if (updated) onItemUpdated(updated);
  });

  const props = usePropInput(
    item.props,
    async (newProps) => {
      const updated = await updateItem(hash, item.id, { props: newProps });
      if (updated) onItemUpdated(updated);
    },
    async (newProps) => {
      const updated = await updateItem(hash, item.id, { props: newProps });
      if (updated) onItemUpdated(updated);
    }
  );

  async function handleDescBlur() {
    const trimmed = descValue.trim();
    const current = item.description || "";
    if (trimmed !== current) {
      const updated = await updateItem(hash, item.id, {
        description: trimmed || null,
      });
      if (updated) onItemUpdated(updated);
    }
  }

  async function handleToggleStatus() {
    const newStatus = item.status === "COMPLETED" ? "OPEN" : "COMPLETED";
    const updated = await updateItem(hash, item.id, { status: newStatus });
    if (updated) onItemUpdated(updated);
  }

  async function handleDelete() {
    const ok = await deleteItem(hash, item.id);
    if (ok) onItemDeleted(item.id);
  }

  async function handleAddTag(tagId: string) {
    const updated = await addTagToItem(hash, item.id, tagId);
    if (updated) onItemUpdated(updated);
  }

  async function handleRemoveTag(tagId: string) {
    const updated = await removeTagFromItem(hash, item.id, tagId);
    if (updated) onItemUpdated(updated);
  }

  const unassignedTags = availableTags.filter(
    (t) => !item.tags.some((it) => it.id === t.id)
  );

  const isCompleted = item.status === "COMPLETED";

  return (
    <li className="rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
      <div className="flex items-start gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggleStatus}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
        />

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={title.editing ? undefined : onToggle}
        >
          {title.editing ? (
            <input
              ref={title.ref}
              type="text"
              value={title.value}
              onChange={(e) => title.setValue(e.target.value)}
              onBlur={title.save}
              onKeyDown={title.handleKeyDown}
              className="w-full text-sm rounded border border-blue-300 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span
              className={`text-sm block truncate ${
                isCompleted ? "line-through text-gray-400" : ""
              }`}
              onClick={(e) => { e.stopPropagation(); title.startEditing(); }}
            >
              {item.title}
            </span>
          )}

          {(item.tags.length > 0 || item.props.length > 0) && !title.editing && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color ?? "#6b7280" }}
                >
                  {tag.name}
                </span>
              ))}
              {item.props.map((prop) => (
                <span
                  key={prop}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                >
                  {prop}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <InlineConfirm
              onConfirm={() => {
                handleDelete();
                setConfirmDelete(false);
              }}
              onCancel={() => setConfirmDelete(false)}
            />
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
              title="Delete item"
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
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: expanded ? "2000px" : "0" }}
      >
        <div className="px-4 pb-3 pt-0 border-t border-gray-100">
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Add a description..."
              rows={3}
              className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color ?? "#6b7280" }}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:opacity-75 ml-0.5"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
              {unassignedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  title={`Add tag: ${tag.name}`}
                >
                  + {tag.name}
                </button>
              ))}
              {availableTags.length === 0 && (
                <span className="text-xs text-gray-400 italic">
                  No tags yet — add some in the Tags panel below
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Props
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {item.props.map((prop) => (
                <span
                  key={prop}
                  className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                >
                  {prop}
                  <button
                    onClick={() => props.removeProp(prop)}
                    className="hover:text-red-500 ml-0.5"
                    title="Remove prop"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {item.props.length < 20 && (
              <div className="relative">
                <input
                  ref={props.ref}
                  type="text"
                  value={props.input}
                  onChange={(e) => props.handleInputChange(e.target.value)}
                  onKeyDown={props.handleKeyDown}
                  onBlur={() => setTimeout(props.closeDropdown, 150)}
                  placeholder="Add a prop..."
                  className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {props.showDropdown && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md text-sm">
                    {props.suggestions.map((s) => (
                      <li key={s}>
                        <button
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            props.addProp(s);
                          }}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
