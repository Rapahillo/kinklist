import type { Tag, TodoItem } from "@/lib/types";
import { TodoItemRow } from "@/components/list-view/todo-item/todo-item-row";

interface ActiveItemsListProps {
  loading: boolean;
  items: TodoItem[];
  hash: string;
  availableTags: Tag[];
  expandedItemId: string | null;
  onToggleExpand: (id: string) => void;
  onItemUpdated: (item: TodoItem) => void;
  onItemDeleted: (id: string) => void;
}

export function ActiveItemsList({
  loading,
  items,
  hash,
  availableTags,
  expandedItemId,
  onToggleExpand,
  onItemUpdated,
  onItemDeleted,
}: ActiveItemsListProps) {
  if (loading) {
    return <p className="text-gray-500 text-sm mt-4">Loading items...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center mt-4">
        <p className="text-gray-500">No items yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-1">
      {items.map((item) => (
        <TodoItemRow
          key={item.id}
          item={item}
          hash={hash}
          availableTags={availableTags}
          expanded={expandedItemId === item.id}
          onToggle={() => onToggleExpand(item.id)}
          onItemUpdated={onItemUpdated}
          onItemDeleted={onItemDeleted}
        />
      ))}
    </ul>
  );
}
