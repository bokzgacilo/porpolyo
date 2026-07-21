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
    unit === "fill"
      ? "100"
      : unit === "fit-content"
        ? ""
        : (value?.value?.toString() ?? "");
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = (
    nextUnit: SizeValue["unit"] = unit,
    preserveEmptyUnit = false,
  ) => {
    if (nextUnit === "fill" || nextUnit === "fit-content") {
      if (value?.unit !== nextUnit) onChange({ unit: nextUnit });
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
          disabled={unit === "fill" || unit === "fit-content"}
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
              if (nextUnit === "fit-content") setDraft("");
              commit(nextUnit, true);
            }}
          >
            <option value="px">Fixed (px)</option>
            <option value="%">Relative (%)</option>
            <option value="fill">Fill</option>
            <option value="fit-content">Fit content</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Field.Root>
  );
}
