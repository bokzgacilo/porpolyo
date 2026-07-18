import {
  Field,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link2, RotateCcw, Unlink2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { BoxSpacing, SpacingUnit } from "../../types/portfolio";
import { useEditorControlSize } from "../editor/EditorSizeContext";

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
  const controlSize = useEditorControlSize();
  const [sidesLinked, setSidesLinked] = useState(false);
  const setSide = (side: BoxSide, next: number | undefined) =>
    onChange({ ...value, [side]: next });
  const setAllSides = (next: number | undefined) =>
    onChange({
      ...value,
      top: next,
      right: next,
      bottom: next,
      left: next,
    });
  const unit = value.unit || "px";

  const toggleLinkedSides = () => {
    if (!sidesLinked) {
      const linkedValue =
        value.top ?? value.right ?? value.bottom ?? value.left;
      setAllSides(linkedValue);
    }

    setSidesLinked((current) => !current);
  };

  return (
    <Field.Root>
      <HStack justify="space-between" align="center">
        <Field.Label mb={0}>{label}</Field.Label>
        <HStack gap="1">
          <IconButton
            aria-label={`${sidesLinked ? "Unlink" : "Link"} ${label.toLowerCase()} sides`}
            aria-pressed={sidesLinked}
            title={`${sidesLinked ? "Unlink" : "Link"} ${label.toLowerCase()} sides`}
            size="xs"
            variant={sidesLinked ? "subtle" : "ghost"}
            colorPalette={sidesLinked ? "blue" : "gray"}
            onClick={toggleLinkedSides}
          >
            {sidesLinked ? <Unlink2 size={14} /> : <Link2 size={14} />}
          </IconButton>
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
          <NativeSelect.Root size={controlSize} width="76px">
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
      <SimpleGrid columns={sidesLinked ? 1 : 4} gapX={1} width="full">
        {sidesLinked ? (
          <NumberMini
            label="All sides"
            value={value.top}
            onChange={setAllSides}
          />
        ) : (
          <>
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
          </>
        )}
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
  const controlSize = useEditorControlSize();
  const externalValue = value?.toString() ?? "";
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = () => {
    if (draft === externalValue) return;
    if (draft === "") {
      onChange(undefined);
      return;
    }
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(externalValue);
      return;
    }
    const next = Math.min(Math.max(parsed, 0), 240);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size={controlSize}
        type="number"
        min="0"
        max="240"
        value={draft}
        placeholder="Auto"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </Field.Root>
  );
}
