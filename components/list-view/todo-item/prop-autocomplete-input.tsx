export function PropAutocompleteInput({
  input,
  suggestions,
  showDropdown,
  inputRef,
  onInputChange,
  onKeyDown,
  onBlur,
  onSelectSuggestion,
}: {
  input: string;
  suggestions: string[];
  showDropdown: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onSelectSuggestion: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder="Add a prop..."
        className="w-full text-sm rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {showDropdown && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md text-sm">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectSuggestion(s);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
