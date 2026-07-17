import { Button, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { Eye, Redo2, Save, Undo2, UploadCloud } from "lucide-react";
import { palettes, templates } from "../../data/templates";
import { Portfolio } from "../../types/portfolio";
import { LuFlagTriangleRight, LuSettings } from "react-icons/lu";
import { ColorModeButton } from "../ui/color-mode";
import { EditorTourButton } from "./EditorTourButton";

export function EditorToolbar({
  portfolio,
  unsaved,
  onUndo,
  onRedo,
  onSave,
  onSettings,
  onStartTour,
  alwaysOpenTour,
  onPreview,
  onPublish,
}: {
  portfolio: Portfolio;
  unsaved: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onSettings: () => void;
  onStartTour: () => void;
  alwaysOpenTour: boolean;
  onPreview: () => void;
  onPublish: () => void;
}) {
  const palette = palettes.find((item) => item.id === portfolio.paletteId)!;
  const template = templates.find((item) => item.id === portfolio.templateId)!;

  return (
    <>
      <HStack
        bg="bg"
        borderBottom="1px solid"
        borderBottomColor="border"
        p={0}
        as="header"
        align="center"
        justify="space-between"
        // gap="3"
      >
        <Stack pl={4} gap={0}>
          <Text color="fg" fontWeight="bold">
            {portfolio.title}
          </Text>
          <Text color="fg.muted" fontSize="10px" fontWeight="semibold">
            {template.name} · {palette.name} {unsaved ? "· Unsaved" : "· Saved"}
          </Text>
        </Stack>

        <HStack gap={0} p={0}>
          <IconButton
            aria-label="Undo"
            title="Undo"
            onClick={onUndo}
            variant="ghost"
            rounded={0}
          >
            <Undo2 size={16} />
          </IconButton>
          <IconButton
            aria-label="Redo"
            title="Redo"
            onClick={onRedo}
            variant="ghost"
            rounded={0}
          >
            <Redo2 size={16} />
          </IconButton>
          <IconButton
            onClick={onSettings}
            aria-label="Project settings"
            title="Project settings"
            variant="ghost"
            rounded={0}
          >
            <LuSettings size={16} />
          </IconButton>
          <EditorTourButton
            alwaysOpen={alwaysOpenTour}
            onBeforeStart={onStartTour}
          />
          <ColorModeButton size="md" variant="ghost" />
          <Button rounded={0} title="Save" onClick={onSave} variant="ghost">
            <Save size={16} /> Save
          </Button>
          <Button colorPalette="blue" onClick={onPreview} rounded={0}>
            <Eye size={16} /> Preview
          </Button>
          <Button onClick={onPublish} rounded={0}>
            <LuFlagTriangleRight size={16} /> Go Live
          </Button>
        </HStack>
      </HStack>
    </>
  );
}
