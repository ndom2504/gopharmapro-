export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-1 h-12 w-full min-w-0 max-w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
