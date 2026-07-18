import {
  Field,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  SimpleGrid,
} from "@chakra-ui/react";
import { RotateCcw } from "lucide-react";
import type {
  BorderRadiusValues,
  BoxSpacing,
  SpacingUnit,
} from "../../types/portfolio";
import { useEditorControlSize } from "../editor/EditorSizeContext";

const widthUnits: SpacingUnit[] = ["px", "rem", "em", "vw", "vh"];
const radiusUnits: SpacingUnit[] = ["px", "rem", "em", "%", "vw", "vh"];

export function BorderWidthInput({
  value = {},
  onChange,
}: {
  value?: BoxSpacing;
  onChange: (value: BoxSpacing) => void;
}) {
  const unit = value.unit || "px";
  return (
    <FourValueInput
      label="Border width"
      unit={unit}
      units={widthUnits}
      values={[
        ["Top", value.top],
        ["Right", value.right],
        ["Bottom", value.bottom],
        ["Left", value.left],
      ]}
      onUnitChange={(unit) => onChange({ ...value, unit })}
      onValueChange={(index, next) => {
        const keys = ["top", "right", "bottom", "left"] as const;
        onChange({ ...value, [keys[index]]: next, unit });
      }}
      onReset={() =>
        onChange({ top: 0, right: 0, bottom: 0, left: 0, unit })
      }
    />
  );
}

export function BorderRadiusInput({
  value = {},
  onChange,
}: {
  value?: BorderRadiusValues;
  onChange: (value: BorderRadiusValues) => void;
}) {
  const unit = value.unit || "px";
  return (
    <FourValueInput
      label="Border radius"
      unit={unit}
      units={radiusUnits}
      values={[
        ["Top left", value.topLeft],
        ["Top right", value.topRight],
        ["Bottom right", value.bottomRight],
        ["Bottom left", value.bottomLeft],
      ]}
      onUnitChange={(unit) => onChange({ ...value, unit })}
      onValueChange={(index, next) => {
        const keys = [
          "topLeft",
          "topRight",
          "bottomRight",
          "bottomLeft",
        ] as const;
        onChange({ ...value, [keys[index]]: next, unit });
      }}
      onReset={() =>
        onChange({
          topLeft: 0,
          topRight: 0,
          bottomRight: 0,
          bottomLeft: 0,
          unit,
        })
      }
    />
  );
}

function FourValueInput({
  label,
  unit,
  units,
  values,
  onUnitChange,
  onValueChange,
  onReset,
}: {
  label: string;
  unit: SpacingUnit;
  units: SpacingUnit[];
  values: Array<[string, number | undefined]>;
  onUnitChange: (unit: SpacingUnit) => void;
  onValueChange: (index: number, value: number | undefined) => void;
  onReset: () => void;
}) {
  const controlSize = useEditorControlSize();
  return (
    <Field.Root>
      <HStack justify="space-between" align="center">
        <Field.Label mb="0">{label}</Field.Label>
        <HStack gap="1">
          <IconButton
            aria-label={`Reset ${label.toLowerCase()} to zero`}
            title={`Reset ${label.toLowerCase()} to zero`}
            size="xs"
            variant="ghost"
            onClick={onReset}
          >
            <RotateCcw size={14} />
          </IconButton>
          <NativeSelect.Root size={controlSize} width="76px">
            <NativeSelect.Field
              aria-label={`${label} unit`}
              value={unit}
              onChange={(event) =>
                onUnitChange(event.currentTarget.value as SpacingUnit)
              }
            >
              {units.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </HStack>
      </HStack>
      <SimpleGrid columns={4} gapX="1" width="full">
        {values.map(([side, value], index) => (
          <Field.Root key={side}>
            <Field.Label fontSize="xs">{side}</Field.Label>
            <Input
              aria-label={`${label} ${side.toLowerCase()}`}
              size={controlSize}
              type="number"
              min="0"
              max="999"
              value={value ?? ""}
              placeholder="0"
              onChange={(event) =>
                onValueChange(
                  index,
                  event.currentTarget.value === ""
                    ? undefined
                    : Math.max(Number(event.currentTarget.value), 0),
                )
              }
            />
          </Field.Root>
        ))}
      </SimpleGrid>
    </Field.Root>
  );
}
