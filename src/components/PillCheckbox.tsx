interface PillCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  isFree?: boolean;
}

export function PillCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  isFree = false,
}: PillCheckboxProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-md text-sm transition-all border ${
        checked
          ? "bg-blue-600 border-blue-500 text-white hover:brightness-110"
          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:brightness-110"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${
        isFree ? "ring-1 ring-green-500" : ""
      }`}
      title={isFree ? "Free content (owned by all users)" : undefined}
    >
      {label}
      {isFree && <span className="ml-1 text-xs text-green-400">★</span>}
    </button>
  );
}
