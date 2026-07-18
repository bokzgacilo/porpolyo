import {
  Box,
  Button,
  Checkbox,
  Field,
  HStack,
  Input,
  NativeSelect,
  Popover,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState, type ComponentType, type PropsWithChildren } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useEditorControlSize } from "../editor/EditorSizeContext";

const shadowPresets = [
  { label: "None", value: "" },
  { label: "Small", value: "0 2px 8px 0 rgba(15, 23, 42, 0.12)" },
  { label: "Medium", value: "0 12px 30px 0 rgba(15, 23, 42, 0.16)" },
  { label: "Large", value: "0 24px 60px 0 rgba(15, 23, 42, 0.22)" },
  { label: "Hard offset", value: "6px 6px 0 0 rgba(15, 23, 42, 0.95)" },
  { label: "Glow", value: "0 0 0 4px rgba(37, 99, 255, 0.18)" },
];

type ShadowDraft = {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
};

const defaultDraft: ShadowDraft = {
  enabled: true,
  x: 0,
  y: 12,
  blur: 30,
  spread: 0,
  color: "#0f172a",
  opacity: 0.16,
  inset: false,
};

const PopoverTrigger = Popover.Trigger as ComponentType<
  PropsWithChildren<{ asChild?: boolean }>
>;
const PopoverPositioner = Popover.Positioner as ComponentType<PropsWithChildren>;

export function BoxShadowInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const controlSize = useEditorControlSize();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseShadow(value));

  useEffect(() => {
    if (!open) setDraft(parseShadow(value));
  }, [open, value]);

  const shadow = toShadow(draft);
  const presetValue =
    shadowPresets.find((preset) => preset.value === (value || ""))?.value ||
    "custom";

  const update = (updates: Partial<ShadowDraft>) =>
    setDraft((current) => ({ ...current, enabled: true, ...updates }));

  return (
    <Field.Root>
      <Field.Label>Box shadow</Field.Label>
      <Popover.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        positioning={{ placement: "left-start" }}
      >
        <PopoverTrigger asChild>
          <Button
            width="full"
            variant="outline"
            justifyContent="space-between"
            fontWeight="normal"
            aria-label={`Box shadow: ${value || "None"}`}
          >
            <HStack minW={0} gap="2">
              <Box
                boxSize="6"
                flexShrink={0}
                rounded="sm"
                border="1px solid"
                borderColor="border"
                bg="bg"
                boxShadow={value || "none"}
              />
              <Text truncate>{presetValue === "custom" ? value : presetName(presetValue)}</Text>
            </HStack>
            <LuChevronDown />
          </Button>
        </PopoverTrigger>

        <Portal>
          <PopoverPositioner>
            <Popover.Content width="360px" maxW="calc(100vw - 24px)" p="4">
              <Stack gap="4">
                <Stack gap="1">
                  <Text fontWeight="semibold">Box shadow generator</Text>
                  <Text color="fg.muted" fontSize="xs">
                    Build a single CSS shadow and preview it before applying.
                  </Text>
                </Stack>

                <Box
                  display="grid"
                  minH="110px"
                  placeItems="center"
                  rounded="md"
                  bg="bg.subtle"
                  border="1px solid"
                  borderColor="border"
                >
                  <Box
                    width="120px"
                    height="56px"
                    rounded="md"
                    bg="bg"
                    border="1px solid"
                    borderColor="border"
                    boxShadow={shadow || "none"}
                  />
                </Box>

                <Field.Root>
                  <Field.Label>Preset</Field.Label>
                  <NativeSelect.Root size={controlSize}>
                    <NativeSelect.Field
                      value={
                        shadowPresets.some((preset) => preset.value === shadow)
                          ? shadow
                          : "custom"
                      }
                      onChange={(event) => {
                        if (event.currentTarget.value !== "custom") {
                          setDraft(parseShadow(event.currentTarget.value));
                        }
                      }}
                    >
                      {shadowPresets.map((preset) => (
                        <option key={preset.label} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="custom">Custom</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>

                <SimpleGrid columns={2} gap="3">
                  <ShadowNumber label="Horizontal" value={draft.x} onChange={(x) => update({ x })} />
                  <ShadowNumber label="Vertical" value={draft.y} onChange={(y) => update({ y })} />
                  <ShadowNumber label="Blur" value={draft.blur} min={0} onChange={(blur) => update({ blur })} />
                  <ShadowNumber label="Spread" value={draft.spread} onChange={(spread) => update({ spread })} />
                </SimpleGrid>

                <SimpleGrid columns={2} gap="3">
                  <Field.Root>
                    <Field.Label>Color</Field.Label>
                    <Input
                      size={controlSize}
                      type="color"
                      value={draft.color}
                      onChange={(event) => update({ color: event.target.value })}
                    />
                  </Field.Root>
                  <ShadowNumber
                    label="Opacity"
                    value={draft.opacity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(opacity) => update({ opacity })}
                  />
                </SimpleGrid>

                <Checkbox.Root
                  checked={draft.inset}
                  onCheckedChange={(details) =>
                    update({ inset: details.checked === true })
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>Inset shadow</Checkbox.Label>
                </Checkbox.Root>

                <Field.Root>
                  <Field.Label>Generated CSS</Field.Label>
                  <Input
                    size={controlSize}
                    value={shadow || "none"}
                    readOnly
                    fontFamily="mono"
                    fontSize="xs"
                  />
                </Field.Root>

                <HStack justify="space-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraft({ ...defaultDraft, enabled: false })}
                  >
                    Remove shadow
                  </Button>
                  <HStack gap="2">
                    <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      colorPalette="blue"
                      onClick={() => {
                        onChange(shadow || undefined);
                        setOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </HStack>
                </HStack>
              </Stack>
            </Popover.Content>
          </PopoverPositioner>
        </Portal>
      </Popover.Root>
    </Field.Root>
  );
}

function ShadowNumber({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const controlSize = useEditorControlSize();
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size={controlSize}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
      />
    </Field.Root>
  );
}

function toShadow(draft: ShadowDraft) {
  if (!draft.enabled) return "";
  const { r, g, b } = hexToRgb(draft.color);
  return `${draft.inset ? "inset " : ""}${draft.x}px ${draft.y}px ${draft.blur}px ${draft.spread}px rgba(${r}, ${g}, ${b}, ${draft.opacity})`;
}

function parseShadow(value?: string): ShadowDraft {
  if (!value || value === "none") return { ...defaultDraft, enabled: false };
  const inset = /^\s*inset\b/.test(value);
  const withoutInset = value.replace(/^\s*inset\s+/, "");
  const colorStart = withoutInset.search(/rgba?\(|#/i);
  const lengthSource = colorStart >= 0
    ? withoutInset.slice(0, colorStart)
    : withoutInset;
  const lengths = lengthSource.match(/-?\d*\.?\d+(?:px)?/g)?.slice(0, 4) || [];
  const rgba = withoutInset.match(/rgba?\(([^)]+)\)/i);
  const rgbaParts = rgba?.[1].split(",").map((part) => Number(part.trim()));
  const hex = withoutInset.match(/#[0-9a-f]{3,8}\b/i)?.[0];
  return {
    enabled: true,
    inset,
    x: numericLength(lengths[0]),
    y: numericLength(lengths[1]),
    blur: Math.max(numericLength(lengths[2]), 0),
    spread: numericLength(lengths[3]),
    color:
      hex && /^#[0-9a-f]{6}$/i.test(hex)
        ? hex
        : rgbaParts?.length
          ? rgbToHex(rgbaParts[0], rgbaParts[1], rgbaParts[2])
          : defaultDraft.color,
    opacity:
      rgbaParts && rgbaParts.length > 3 && Number.isFinite(rgbaParts[3])
        ? Math.min(Math.max(rgbaParts[3], 0), 1)
        : 1,
  };
}

function numericLength(value?: string) {
  const parsed = Number.parseFloat(value || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((part) => part + part).join("")
    : value.padEnd(6, "0").slice(0, 6);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const channel = (value: number) =>
    Math.min(Math.max(Math.round(value), 0), 255).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function presetName(value: string) {
  return shadowPresets.find((preset) => preset.value === value)?.label || "None";
}
