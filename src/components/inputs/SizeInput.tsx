import { Field, HStack, Input, NativeSelect } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { SizeValue } from "../../types/portfolio";
import { useEditorControlSize } from "../editor/EditorSizeContext";

export function SizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SizeValue;
  onChange: (value: SizeValue | undefined) => void;
}) {
  const controlSize = useEditorControlSize();
  const unit = value?.unit || "px";
  const externalValue =
    unit === "fill" ? "100" : (value?.value?.toString() ?? "");
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = (
    nextUnit: SizeValue["unit"] = unit,
    preserveEmptyUnit = false,
  ) => {
    if (nextUnit === "fill") {
      if (value?.unit !== "fill") onChange({ unit: "fill" });
      return;
    }
    const nextValue = draft === "" ? undefined : Number(draft);
    if (nextValue !== undefined && !Number.isFinite(nextValue)) return;
    const next = nextValue === undefined
      ? preserveEmptyUnit ? { unit: nextUnit } : undefined
      : { value: nextValue, unit: nextUnit };
    if (nextValue !== value?.value || nextUnit !== unit) onChange(next);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <HStack gap={1} w="full">
        <Input
          flex={1}
          size={controlSize}
          type="number"
          disabled={unit === "fill"}
          min="0"
          max={unit === "%" ? "100" : "2000"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        <NativeSelect.Root size={controlSize} w="128px">
          <NativeSelect.Field
            value={unit}
            onChange={(event) => {
              const nextUnit = event.target.value as SizeValue["unit"];
              if (nextUnit === "fill") setDraft("100");
              commit(nextUnit, true);
            }}
          >
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="fill">Fill (100%)</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Field.Root>
  );
}
