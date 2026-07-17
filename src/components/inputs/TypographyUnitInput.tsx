import {
  Field,
  HStack,
  NativeSelect,
  NumberInput,
} from "@chakra-ui/react";
import type { TypographyUnit } from "../../types/portfolio";

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
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <HStack gap="2" align="stretch">
        <NumberInput.Root
          flex="1"
          minW={0}
          size="xs"
          value={value?.toString() ?? ""}
          onValueChange={(details) =>
            onChange(
              details.value === "" ? undefined : details.valueAsNumber,
              unit,
            )
          }
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
        <NativeSelect.Root size="xs" width="88px" flexShrink={0}>
          <NativeSelect.Field
            aria-label={`${label} unit`}
            value={unit}
            onChange={(event) =>
              onChange(value, event.currentTarget.value as TypographyUnit)
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
