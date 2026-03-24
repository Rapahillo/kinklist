"use client";

import type { TodoItem } from "@/lib/types";
import { updateItem } from "@/lib/items-api";
import { usePropInput } from "@/hooks/use-prop-input";
import { PropChipList } from "./prop-chip-list";
import { PropAutocompleteInput } from "./prop-autocomplete-input";

export function ItemPropsEditor({
  hash,
  item,
  onItemUpdated,
}: {
  hash: string;
  item: Pick<TodoItem, "id" | "props">;
  onItemUpdated: (item: TodoItem) => void;
}) {
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

  return (
    <div className="mt-3 relative">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Props
      </label>
      <PropChipList props={item.props} onRemove={props.removeProp} />
      {item.props.length < 20 && (
        <PropAutocompleteInput
          input={props.input}
          suggestions={props.suggestions}
          showDropdown={props.showDropdown}
          inputRef={props.ref}
          onInputChange={props.handleInputChange}
          onKeyDown={props.handleKeyDown}
          onBlur={() => setTimeout(props.closeDropdown, 150)}
          onSelectSuggestion={props.addProp}
        />
      )}
    </div>
  );
}
