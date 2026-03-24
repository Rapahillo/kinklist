import type { Tag } from "@/lib/types";

export function ItemTagsEditor({
  assignedTags,
  availableTags,
  onAdd,
  onRemove,
}: {
  assignedTags: Tag[];
  availableTags: Tag[];
  onAdd: (tagId: string) => void;
  onRemove: (tagId: string) => void;
}) {
  const unassignedTags = availableTags.filter(
    (t) => !assignedTags.some((it) => it.id === t.id)
  );

  return (
    <div className="mt-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Tags
      </label>
      <div className="flex flex-wrap gap-1">
        {assignedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color ?? "#6b7280" }}
          >
            {tag.name}
            <button
              onClick={() => onRemove(tag.id)}
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
            onClick={() => onAdd(tag.id)}
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
  );
}
