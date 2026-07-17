export function TextAreaInput({ label, value, limit, onChange }: {
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} maxLength={limit} onChange={(event) => onChange(event.target.value)} />
      <small>{limit - value.length} characters remaining</small>
    </label>
  );
}
