import { Field, Input, SimpleGrid, Stack } from "@chakra-ui/react";
import type { BoxSpacing } from "../../types/portfolio";

export function BoxSpacingInput({
  label,
  value = {},
  onChange,
}: {
  label: string;
  value?: BoxSpacing;
  onChange: (value: BoxSpacing) => void;
}) {
  const setSide = (side: keyof BoxSpacing, next: number | undefined) =>
    onChange({ ...value, [side]: next });

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <SimpleGrid columns={4} gapX={1} width="full">
        <NumberMini
          label="Top"
          value={value.top}
          onChange={(next) => setSide("top", next)}
        />
        <NumberMini
          label="Right"
          value={value.right}
          onChange={(next) => setSide("right", next)}
        />
        <NumberMini
          label="Bottom"
          value={value.bottom}
          onChange={(next) => setSide("bottom", next)}
        />
        <NumberMini
          label="Left"
          value={value.left}
          onChange={(next) => setSide("left", next)}
        />
      </SimpleGrid>
    </Field.Root>
  );
}

function NumberMini({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size="xs"
        type="number"
        min="0"
        max="240"
        value={value ?? ""}
        placeholder="Auto"
        onChange={(event) =>
          onChange(
            event.target.value === "" ? undefined : Number(event.target.value),
          )
        }
      />
    </Field.Root>
  );
}
