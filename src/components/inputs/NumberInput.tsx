import {
  Field,
  NumberInputControl,
  NumberInputInput,
  NumberInputRoot,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useEditorControlSize } from "../editor/EditorSizeContext";

type NumberInputProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number | undefined) => void;
};

export function NumberInput({ label, value, min, max, onChange }: NumberInputProps) {
  const controlSize = useEditorControlSize();
  const externalValue = value?.toString() ?? "";
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = () => {
    if (draft === externalValue) return;
    const parsed = draft === "" ? undefined : Number(draft);
    if (parsed === undefined) {
      onChange(undefined);
      return;
    }
    if (!Number.isFinite(parsed)) return;
    onChange(Math.min(Math.max(parsed, min ?? -Infinity), max ?? Infinity));
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>

      <NumberInputRoot
        w="full"
        size={controlSize}
        value={draft}
        min={min}
        max={max}
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
