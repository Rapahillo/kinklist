import type { Tag, TodoItem } from "@/lib/types";
import { ItemDescription } from "./item-description";
import { ItemTagsEditor } from "./item-tags-editor";
import { ItemPropsEditor } from "./item-props-editor";
import { ItemMetadataFooter } from "./item-metadata-footer";

export function ItemDetailsPanel({
  item,
  hash,
  expanded,
  availableTags,
  onItemUpdated,
  onAddTag,
  onRemoveTag,
}: {
  item: TodoItem;
  hash: string;
  expanded: boolean;
  availableTags: Tag[];
  onItemUpdated: (item: TodoItem) => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}) {
  return (
    <div
      className="grid transition-all duration-200 ease-in-out"
      style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
    >
      <div className="min-h-0">
      <div className="px-4 pb-3 pt-0 border-t border-gray-100">
        <ItemDescription hash={hash} item={item} onItemUpdated={onItemUpdated} />
        <ItemTagsEditor
          assignedTags={item.tags}
          availableTags={availableTags}
          onAdd={onAddTag}
          onRemove={onRemoveTag}
        />
        <ItemPropsEditor hash={hash} item={item} onItemUpdated={onItemUpdated} />
        <ItemMetadataFooter createdAt={item.createdAt} />
      </div>
      </div>
    </div>
  );
}
