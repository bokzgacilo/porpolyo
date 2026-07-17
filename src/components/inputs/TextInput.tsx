import { Field, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function TextInput({
  label,
  value,
  limit,
  onChange,
}: {
  label: string;
  value: string;
  limit?: number;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft !== value) onChange(draft);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size="xs"
        value={draft}
        maxLength={limit}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {limit && (
        <Field.HelperText>
          {limit - draft.length} characters remaining
        </Field.HelperText>
      )}
    </Field.Root>
  );
}
