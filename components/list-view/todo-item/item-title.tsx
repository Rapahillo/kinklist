import type { Tag, TodoItem } from "@/lib/types";
import type { useInlineEdit } from "@/hooks/use-inline-edit";

export function ItemTitle({
  item,
  isCompleted,
  title,
  onExpandToggle,
}: {
  item: Pick<TodoItem, "title" | "tags" | "props">;
  isCompleted: boolean;
  title: ReturnType<typeof useInlineEdit>;
  onExpandToggle: () => void;
}) {
  return (
    <div
      className="flex-1 min-w-0 cursor-pointer"
      onClick={title.editing ? undefined : onExpandToggle}
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
          {item.tags.map((tag: Tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: tag.color ?? "#6b7280" }}
            >
              {tag.name}
            </span>
          ))}
          {item.props.map((prop: string) => (
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
  );
}
