import {
  Field,
  NumberInputControl,
  NumberInputInput,
  NumberInputRoot,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

type NumberInputProps = {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
};

export function NumberInput({ label, value, onChange }: NumberInputProps) {
  const externalValue = value?.toString() ?? "";
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = () => {
    if (draft === externalValue) return;
    const parsed = draft === "" ? undefined : Number(draft);
    if (parsed === undefined || Number.isFinite(parsed)) onChange(parsed);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>

      <NumberInputRoot
        w="full"
        size="xs"
        value={draft}
        onValueChange={(details) => setDraft(details.value)}
      >
        <NumberInputControl />
        <NumberInputInput
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
      </NumberInputRoot>
    </Field.Root>
  );
}
