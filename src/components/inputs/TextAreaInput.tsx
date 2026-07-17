import { useEffect, useState } from "react";

export function TextAreaInput({ label, value, limit, onChange }: {
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={draft}
        maxLength={limit}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== value) onChange(draft);
        }}
      />
      <small>{limit - draft.length} characters remaining</small>
    </label>
  );
}
