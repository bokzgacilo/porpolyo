import {
  Checkbox,
  Field,
  Input,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  gridAlignItemsOptions,
  gridJustifyContentOptions,
  stackAlignOptions,
  stackDirectionOptions,
  stackJustifyOptions,
} from "../../config/sectionLayoutSettings";
import type { ElementSettings } from "../../types/portfolio";
import { useEditorControlSize } from "../editor/EditorSizeContext";

export function ElementLayoutControls({
  settings,
  onChange,
}: {
  settings: ElementSettings;
  onChange: (updates: Partial<ElementSettings>) => void;
}) {
  const controlSize = useEditorControlSize();
  const mode = settings.layoutMode || "stack";
  const update = (updates: Partial<ElementSettings>) =>
    onChange({ layoutMode: mode, ...updates });

  return (
    <Stack gap="4">
      <Field.Root>
        <Field.Label>Layout type</Field.Label>
        <NativeSelect.Root size={controlSize}>
          <NativeSelect.Field
            value={mode}
            onChange={(event) =>
              onChange({
                layoutMode: event.currentTarget.value as "grid" | "stack",
              })
            }
          >
            <option value="stack">Stack (flex)</option>
            <option value="grid">Grid</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.HelperText>
          Controls how this container arranges its direct child layers.
        </Field.HelperText>
      </Field.Root>

      {mode === "grid" ? (
        <Stack gap="3">
          <SimpleGrid columns={2} gap="3">
            <NumberField
              label="Columns"
              min={1}
              max={12}
              value={settings.gridColumns ?? 2}
              onChange={(gridColumns) => update({ gridColumns })}
            />
            <NumberField
              label="Gap X"
              min={0}
              max={240}
              value={settings.gridGapX ?? 16}
              onChange={(gridGapX) => update({ gridGapX })}
            />
            <NumberField
              label="Gap Y"
              min={0}
              max={240}
              value={settings.gridGapY ?? 16}
              onChange={(gridGapY) => update({ gridGapY })}
            />
          </SimpleGrid>
          <SimpleGrid columns={2} gap="3">
            <SelectField
              label="Align items"
              value={settings.gridAlignItems || "stretch"}
              options={gridAlignItemsOptions}
              onChange={(gridAlignItems) =>
                update({
                  gridAlignItems:
                    gridAlignItems as ElementSettings["gridAlignItems"],
                })
              }
            />
            <SelectField
              label="Justify content"
              value={settings.gridJustifyContent || "start"}
              options={gridJustifyContentOptions}
              onChange={(gridJustifyContent) =>
                update({
                  gridJustifyContent:
                    gridJustifyContent as ElementSettings["gridJustifyContent"],
                })
              }
            />
          </SimpleGrid>
        </Stack>
      ) : (
        <Stack gap="3">
          <SimpleGrid columns={2} gap="3">
            <SelectField
              label="Direction"
              value={settings.stackDirection || "column"}
              options={stackDirectionOptions}
              onChange={(stackDirection) =>
                update({
                  stackDirection:
                    stackDirection as ElementSettings["stackDirection"],
                })
              }
            />
            <NumberField
              label="Gap"
              min={0}
              max={240}
              value={settings.stackGap ?? 0}
              onChange={(stackGap) => update({ stackGap })}
            />
          </SimpleGrid>
          <SimpleGrid columns={2} gap="3">
            <SelectField
              label="Align"
              value={settings.stackAlign || "stretch"}
              options={stackAlignOptions}
              onChange={(stackAlign) =>
                update({
                  stackAlign: stackAlign as ElementSettings["stackAlign"],
                })
              }
            />
            <SelectField
              label="Justify"
              value={settings.stackJustify || "flex-start"}
              options={stackJustifyOptions}
              onChange={(stackJustify) =>
                update({
                  stackJustify: stackJustify as ElementSettings["stackJustify"],
                })
              }
            />
          </SimpleGrid>
        </Stack>
      )}

      <Checkbox.Root
        checked={settings.layoutWrap ?? false}
        onCheckedChange={(details) =>
          update({ layoutWrap: details.checked === true })
        }
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Enable wrapping</Checkbox.Label>
      </Checkbox.Root>
    </Stack>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const controlSize = useEditorControlSize();
  const externalValue = String(value);
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(externalValue);
      return;
    }
    const next = Math.min(Math.max(parsed, min), max);
    if (next !== value) onChange(next);
    setDraft(String(next));
  };

  return (
    <Field.Root>
      <Field.Label>
        {label}{" "}
        <Text as="span" color="fg.muted">
          {label === "Columns" ? "" : "(px)"}
        </Text>
      </Field.Label>

      <NumberInput.Root
        size={controlSize}
        min={min}
        max={max}
        value={draft}
        onValueChange={(details) => setDraft(details.value)}
      >
        <NumberInput.Control />
        <NumberInput.Input
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
      </NumberInput.Root>
    </Field.Root>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  const controlSize = useEditorControlSize();
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <NativeSelect.Root size={controlSize}>
        <NativeSelect.Field
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>
  );
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}
