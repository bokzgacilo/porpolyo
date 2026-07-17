import { Button, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import {
  Eye,
  Redo2,
  Save,
  Undo2,
  UploadCloud,
} from "lucide-react";
import { palettes, templates } from "../../data/templates";
import { Portfolio } from "../../types/portfolio";
import { LuSettings } from "react-icons/lu";
import { ColorModeButton } from "../ui/color-mode";

export function EditorToolbar({
  portfolio,
  unsaved,
  onUndo,
  onRedo,
  onSave,
  onSettings,
  onPreview,
  onPublish,
}: {
  portfolio: Portfolio;
  unsaved: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onSettings: () => void;
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
        p={4}
        as="header"
        align="center"
        justify="space-between"
        gap="3"
      >
        <Stack gap={0}>
          <Text color="fg" fontWeight="bold">
            {portfolio.title}
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {template.name} · {palette.name} {unsaved ? "· Unsaved" : "· Saved"}
          </Text>
        </Stack>
        <HStack>
          <IconButton
            aria-label="Undo"
            title="Undo"
            onClick={onUndo}
            variant="outline"
          >
            <Undo2 size={16} />
          </IconButton>
          <IconButton
            aria-label="Redo"
            title="Redo"
            onClick={onRedo}
            variant="outline"
          >
            <Redo2 size={16} />
          </IconButton>
          <IconButton
            onClick={onSettings}
            aria-label="Project settings"
            title="Project settings"
            variant="outline"
          >
            <LuSettings size={16} />
          </IconButton>
          <IconButton
            aria-label="Preview portfolio"
            onClick={onPreview}
            title="Preview"
            variant="outline"
          >
            <Eye size={16} />
          </IconButton>
          <ColorModeButton variant="outline" />
          <Button title="Save" onClick={onSave} variant="outline">
            <Save size={16} /> Save
          </Button>
          <Button onClick={onPublish}>
            <UploadCloud size={16} /> Publish / Export
          </Button>
        </HStack>
      </HStack>
    </>
  );
}
