import { Field, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useEditorControlSize } from "../editor/EditorSizeContext";

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
  const controlSize = useEditorControlSize();
  const externalValue = String(value);
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size={controlSize}
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
