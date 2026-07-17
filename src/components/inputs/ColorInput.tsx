import { Box, ColorPicker, Field, HStack, Portal, parseColor } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function ColorInput({
  label,
  value,
  fallback = "#111827",
  swatches = [],
  onChange,
}: {
  label: string;
  value: string;
  fallback?: string;
  swatches?: string[];
  onChange: (value: string) => void;
}) {
  const current = normalizeColor(value || fallback);
  const [draft, setDraft] = useState(current);

  useEffect(() => setDraft(current), [current]);

  const commit = (next: string) => {
    const normalized = normalizeColor(next);
    setDraft(normalized);
    if (normalized !== current) onChange(normalized);
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <ColorPicker.Root
        value={parseColor(draft)}
        onValueChange={(details) =>
          setDraft(normalizeColor(details.value.toString("hex")))
        }
        onValueChangeEnd={(details) =>
          commit(details.value.toString("hex"))
        }
      >
        <ColorPicker.HiddenInput />
        <ColorPicker.Control>
          <ColorPicker.Input />
          <ColorPicker.Trigger />
        </ColorPicker.Control>
        <Portal>
          <ColorPicker.Positioner>
            <ColorPicker.Content>
              <ColorPicker.Area />
              <HStack>
                <ColorPicker.EyeDropper size="xs" variant="outline" />
                <ColorPicker.Sliders />
              </HStack>
            </ColorPicker.Content>
          </ColorPicker.Positioner>
        </Portal>
      </ColorPicker.Root>
      {swatches.length > 0 && (
        <HStack gap={0}>
          {swatches.map((color) => {
            const normalized = normalizeColor(color);
            return (
              <Box
                cursor="pointer"
                boxSize="30px"
                key={`${label}-${color}`}
                borderWidth="3px"
                borderColor={normalized === current ? "blue.500" : "transparent"}
                bg={color}
                onClick={() => commit(normalized)}
              />
            );
          })}
        </HStack>
      )}
    </Field.Root>
  );
}

export function normalizeColor(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#111827";
}
