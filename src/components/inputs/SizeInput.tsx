import { Field, HStack, Input, NativeSelect } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { SizeValue } from "../../types/portfolio";

export function SizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SizeValue;
  onChange: (value: SizeValue | undefined) => void;
}) {
  const unit = value?.unit || "px";
  const externalValue = value?.value?.toString() ?? "";
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = (
    nextUnit: SizeValue["unit"] = unit,
    preserveEmptyUnit = false,
  ) => {
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
          size="xs"
          type="number"
          min="0"
          max={unit === "%" ? "100" : "2000"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        <NativeSelect.Root size="xs" w="128px">
          <NativeSelect.Field
            value={unit}
            onChange={(event) => {
              const nextUnit = event.target.value as SizeValue["unit"];
              commit(nextUnit, true);
            }}
          >
            <option value="px">px</option>
            <option value="%">%</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Field.Root>
  );
}
