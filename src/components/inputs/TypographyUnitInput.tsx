import {
  Field,
  HStack,
  NativeSelect,
  NumberInput,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { TypographyUnit } from "../../types/portfolio";
import { useEditorControlSize } from "../editor/EditorSizeContext";

const typographyUnits: TypographyUnit[] = ["rem", "em", "px", "%", "ch"];

export function TypographyUnitInput({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value?: number;
  unit: TypographyUnit;
  onChange: (value: number | undefined, unit: TypographyUnit) => void;
}) {
  const controlSize = useEditorControlSize();
  const externalValue = value?.toString() ?? "";
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = (nextUnit: TypographyUnit = unit) => {
    const nextValue = draft === "" ? undefined : Number(draft);
    if (nextValue !== undefined && !Number.isFinite(nextValue)) return;
    if (nextValue !== value || nextUnit !== unit) onChange(nextValue, nextUnit);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <HStack gap="2" align="stretch">
        <NumberInput.Root
          flex="1"
          minW={0}
          size={controlSize}
          value={draft}
          onValueChange={(details) => setDraft(details.value)}
        >
          <NumberInput.Control />
          <NumberInput.Input
            onBlur={() => commit()}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        </NumberInput.Root>
        <NativeSelect.Root size={controlSize} width="88px" flexShrink={0}>
          <NativeSelect.Field
            aria-label={`${label} unit`}
            value={unit}
            onChange={(event) =>
              commit(event.currentTarget.value as TypographyUnit)
            }
          >
            {typographyUnits.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Field.Root>
  );
}
