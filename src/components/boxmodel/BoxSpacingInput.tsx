import {
  Field,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  SimpleGrid,
} from "@chakra-ui/react";
import { RotateCcw } from "lucide-react";
import type { BoxSpacing, SpacingUnit } from "../../types/portfolio";

const spacingUnits: SpacingUnit[] = ["px", "rem", "em", "%", "vw", "vh"];
type BoxSide = "top" | "right" | "bottom" | "left";

export function BoxSpacingInput({
  label,
  value = {},
  onChange,
}: {
  label: string;
  value?: BoxSpacing;
  onChange: (value: BoxSpacing) => void;
}) {
  const setSide = (side: BoxSide, next: number | undefined) =>
    onChange({ ...value, [side]: next });
  const unit = value.unit || "px";

  return (
    <Field.Root>
      <HStack justify="space-between" align="center">
        <Field.Label mb={0}>{label}</Field.Label>
        <HStack gap="1">
          <IconButton
            aria-label={`Reset ${label.toLowerCase()} to zero`}
            title={`Reset ${label.toLowerCase()} to zero`}
            size="xs"
            variant="ghost"
            onClick={() =>
              onChange({
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                unit,
              })
            }
          >
            <RotateCcw size={14} />
          </IconButton>
          <NativeSelect.Root size="xs" width="76px">
            <NativeSelect.Field
              aria-label={`${label} unit`}
              value={unit}
              onChange={(event) =>
                onChange({
                  ...value,
                  unit: event.currentTarget.value as SpacingUnit,
                })
              }
            >
              {spacingUnits.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </HStack>
      </HStack>
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
