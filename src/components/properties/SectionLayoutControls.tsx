import {
  Checkbox,
  Field,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  getSectionLayoutDefaults,
  resolveSectionLayoutSettings,
  stackAlignOptions,
  stackDirectionOptions,
  stackJustifyOptions,
} from "../../config/sectionLayoutSettings";
import type { PortfolioSection, SectionSettings } from "../../types/portfolio";

export function SectionLayoutControls({
  section,
  onChange,
}: {
  section: PortfolioSection;
  onChange: (updates: Partial<SectionSettings>) => void;
}) {
  const layout = resolveSectionLayoutSettings(section);
  const mode = layout.layoutMode || "stack";
  const update = (updates: Partial<SectionSettings>) =>
    onChange({ layoutMode: mode, ...updates });

  return (
    <Stack gap="4">
      <Field.Root>
        <Field.Label>Layout type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={mode}
            onChange={(event) => {
              const layoutMode = event.currentTarget.value as "grid" | "stack";
              onChange(getSectionLayoutDefaults(section.type, layoutMode));
            }}
          >
            <option value="stack">Stack (flex)</option>
            <option value="grid">Grid</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.HelperText>
          Controls how the section arranges its direct child layers.
        </Field.HelperText>
      </Field.Root>

      {mode === "grid" ? (
        <SimpleGrid columns={2} gap="3">
          <NumberField
            label="Columns"
            min={1}
            max={12}
            value={layout.gridColumns ?? 2}
            onChange={(gridColumns) => update({ gridColumns })}
          />
          <NumberField
            label="Gap X"
            min={0}
            max={240}
            suffix="px"
            value={layout.gridGapX ?? 16}
            onChange={(gridGapX) => update({ gridGapX })}
          />
          <NumberField
            label="Gap Y"
            min={0}
            max={240}
            suffix="px"
            value={layout.gridGapY ?? 16}
            onChange={(gridGapY) => update({ gridGapY })}
          />
        </SimpleGrid>
      ) : (
        <Stack gap="3">
          <SimpleGrid columns={2} gap="3">
            <SelectField
              label="Direction"
              value={layout.stackDirection || "column"}
              options={stackDirectionOptions}
              onChange={(stackDirection) =>
                update({
                  stackDirection:
                    stackDirection as SectionSettings["stackDirection"],
                })
              }
            />
            <NumberField
              label="Gap"
              min={0}
              max={240}
              suffix="px"
              value={layout.stackGap ?? 0}
              onChange={(stackGap) => update({ stackGap })}
            />
          </SimpleGrid>
          <SimpleGrid columns={2} gap="3">
            <SelectField
              label="Align"
              value={layout.stackAlign || "stretch"}
              options={stackAlignOptions}
              onChange={(stackAlign) =>
                update({ stackAlign: stackAlign as SectionSettings["stackAlign"] })
              }
            />
            <SelectField
              label="Justify"
              value={layout.stackJustify || "flex-start"}
              options={stackJustifyOptions}
              onChange={(stackJustify) =>
                update({
                  stackJustify:
                    stackJustify as SectionSettings["stackJustify"],
                })
              }
            />
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="1">
        <Checkbox.Root
          checked={layout.layoutWrap ?? false}
          onCheckedChange={(details) =>
            update({ layoutWrap: details.checked === true })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Enable wrapping</Checkbox.Label>
        </Checkbox.Root>
        <Text ps="7" color="fg.muted" fontSize="xs">
          {mode === "grid"
            ? "Move extra items into new rows after the selected column count."
            : "Allow child layers to continue on another line when space runs out."}
        </Text>
      </Stack>
    </Stack>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const externalValue = String(value);
  const [draft, setDraft] = useState(externalValue);

  useEffect(() => setDraft(externalValue), [externalValue]);

  const commit = () => {
    const next = clampNumber(Number(draft), min, max);
    if (next !== value) onChange(next);
    setDraft(String(next));
  };

  return (
    <Field.Root>
      <Field.Label>
        {label} {suffix && <Text as="span" color="fg.muted">({suffix})</Text>}
      </Field.Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
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
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <NativeSelect.Root>
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

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}
