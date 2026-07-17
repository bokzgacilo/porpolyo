import { Field, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type InputFieldProps = {
  label: string;
  value: string | number;
  limit?: number;
  onChange: (value: string) => void;
};

export const InputField = ({
  label,
  value,
  limit,
  onChange,
}: InputFieldProps) => {
  const externalValue = String(value);
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        maxLength={limit}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== externalValue) onChange(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {limit !== undefined && (
        <Field.HelperText>
          {draft.length}/{limit} characters
        </Field.HelperText>
      )}
    </Field.Root>
  );
};
