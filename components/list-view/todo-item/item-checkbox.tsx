export function ItemCheckbox({
  isCompleted,
  onToggle,
}: {
  isCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={isCompleted}
      onChange={onToggle}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
    />
  );
}
