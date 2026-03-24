export function PropChipList({
  props,
  onRemove,
}: {
  props: string[];
  onRemove: (prop: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 mb-1.5">
      {props.map((prop) => (
        <span
          key={prop}
          className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
        >
          {prop}
          <button
            onClick={() => onRemove(prop)}
            className="hover:text-red-500 ml-0.5"
            title="Remove prop"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
