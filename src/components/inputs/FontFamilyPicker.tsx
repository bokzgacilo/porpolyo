"use client";

import {
  Box,
  Button,
  Field,
  HStack,
  Input,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import { LuCheck, LuChevronDown, LuSearch } from "react-icons/lu";
import { useEditorControlSize } from "../editor/EditorSizeContext";

type FontOption = {
  label: string;
  value: string;
  category: string;
};

const availableFontOptions: FontOption[] = [
  {
    label: "Inter",
    value: "Inter, ui-sans-serif, system-ui, sans-serif",
    category: "Sans serif",
  },
  {
    label: "Roboto",
    value: "Roboto, Arial, sans-serif",
    category: "Sans serif",
  },
  {
    label: "Arial",
    value: "Arial, Helvetica, sans-serif",
    category: "Sans serif",
  },
  {
    label: "Helvetica",
    value: "Helvetica, Arial, sans-serif",
    category: "Sans serif",
  },
  {
    label: "Verdana",
    value: "Verdana, Geneva, sans-serif",
    category: "Sans serif",
  },
  {
    label: "Trebuchet MS",
    value: '"Trebuchet MS", Arial, sans-serif',
    category: "Sans serif",
  },
  { label: "Georgia", value: "Georgia, serif", category: "Serif" },
  {
    label: "Times New Roman",
    value: '"Times New Roman", Times, serif',
    category: "Serif",
  },
  {
    label: "Courier New",
    value: '"Courier New", Courier, monospace',
    category: "Monospace",
  },
  {
    label: "Menlo",
    value: "Menlo, Monaco, Consolas, monospace",
    category: "Monospace",
  },
  {
    label: "System Sans",
    value: "ui-sans-serif, system-ui, sans-serif",
    category: "System",
  },
  {
    label: "System Serif",
    value: "ui-serif, Georgia, serif",
    category: "System",
  },
  {
    label: "System Mono",
    value:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    category: "System",
  },
];

const PopoverTrigger = Popover.Trigger as ComponentType<
  PropsWithChildren<{ asChild?: boolean }>
>;
const PopoverPositioner = Popover.Positioner as ComponentType<PropsWithChildren>;

export function FontFamilyPicker({
  value = "",
  defaultFontFamily,
  onChange,
}: {
  value?: string;
  defaultFontFamily: string;
  onChange: (value: string | undefined) => void;
}) {
  const controlSize = useEditorControlSize();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const defaultFont: FontOption = {
    label: fontFamilyName(defaultFontFamily),
    value: "",
    category: "Current template",
  };
  const fontOptions = [defaultFont, ...availableFontOptions];
  const selectedFont =
    fontOptions.find((font) => font.value === value) ??
    ({ label: fontFamilyName(value), value, category: "Custom" } satisfies FontOption);
  const selectedPreviewValue = selectedFont.value || defaultFontFamily;
  const visibleFonts = (() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return fontOptions;

    return fontOptions.filter((font) =>
      `${font.label} ${font.category} ${font.value}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  })();

  const selectFont = (font: FontOption) => {
    onChange(font.value || undefined);
    setOpen(false);
    setQuery("");
  };

  return (
    <Field.Root>
      <Field.Label>Font family</Field.Label>
      <Popover.Root
        open={open}
        onOpenChange={(details) => {
          setOpen(details.open);
          if (!details.open) setQuery("");
        }}
        positioning={{ placement: "left-start" }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            width="full"
            justifyContent="space-between"
            fontWeight="normal"
            aria-label={`Font family: ${selectedFont.label}`}
          >
            <Text
              truncate
              fontFamily={selectedPreviewValue}
              textAlign="left"
            >
              {selectedFont.label}
            </Text>
            <LuChevronDown />
          </Button>
        </PopoverTrigger>

        <Portal>
          <PopoverPositioner>
            <Popover.Content width="320px" maxWidth="calc(100vw - 24px)" p={2}>
              <Box position="relative" mb={2}>
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  color="fg.muted"
                  pointerEvents="none"
                  zIndex={1}
                >
                  <LuSearch />
                </Box>
                <Input
                  size={controlSize}
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fonts…"
                  aria-label="Search fonts"
                  ps={9}
                />
              </Box>

              <Stack gap={1} maxHeight="280px" overflowY="auto">
                {visibleFonts.map((font) => {
                  const isSelected = font.value === value;

                  return (
                    <Button
                      key={`${font.label}-${font.value}`}
                      variant="ghost"
                      height="auto"
                      minHeight="54px"
                      px={3}
                      py={2}
                      justifyContent="stretch"
                      onClick={() => selectFont(font)}
                      aria-pressed={isSelected}
                    >
                      <HStack width="full" justify="space-between" gap={3}>
                        <Stack gap={0} minWidth={0} align="start">
                          <Text
                            fontFamily={font.value || defaultFontFamily}
                            fontSize="md"
                            fontWeight="medium"
                            truncate
                          >
                            {font.label}
                          </Text>
                          <Text
                            fontFamily={font.value || defaultFontFamily}
                            color="fg.muted"
                            fontSize="xs"
                            fontWeight="normal"
                            truncate
                          >
                            Aa The quick brown fox
                          </Text>
                        </Stack>
                        {isSelected && <LuCheck aria-hidden />}
                      </HStack>
                    </Button>
                  );
                })}

                {visibleFonts.length === 0 && (
                  <Text color="fg.muted" fontSize="sm" py={6} textAlign="center">
                    No fonts match “{query}”.
                  </Text>
                )}
              </Stack>
            </Popover.Content>
          </PopoverPositioner>
        </Portal>
      </Popover.Root>
    </Field.Root>
  );
}

function fontFamilyName(fontFamily: string) {
  const primaryFamily = fontFamily.split(",")[0]?.trim().replaceAll('"', "");

  if (primaryFamily === "ui-sans-serif" || primaryFamily === "system-ui") {
    return "System Sans";
  }
  if (primaryFamily === "ui-serif") return "System Serif";
  if (primaryFamily === "ui-monospace") return "System Mono";

  return primaryFamily || "Inherit";
}
