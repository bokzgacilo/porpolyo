import { Button, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { Check, Eye, Redo2, Save, Undo2, UploadCloud } from "lucide-react";
import { palettes, templates } from "../../data/templates";
import { Portfolio } from "../../types/portfolio";
import { LuFlagTriangleRight } from "react-icons/lu";
import { useSaveFeedback } from "../../hooks/useSaveFeedback";
import { Tooltip } from "../ui/tooltip";

export function EditorToolbar({
  portfolio,
  unsaved,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onPublish,
}: {
  portfolio: Portfolio;
  unsaved: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void | Promise<void>;
  onPreview: () => void;
  onPublish: () => void;
}) {
  const palette = palettes.find((item) => item.id === portfolio.paletteId)!;
  const template = templates.find((item) => item.id === portfolio.templateId)!;
  const { save, status: saveStatus } = useSaveFeedback(onSave);
  const saveTooltip =
    saveStatus === "saving"
      ? "Saving portfolio…"
      : saveStatus === "saved"
        ? "Portfolio saved"
        : saveStatus === "error"
          ? "Save failed. Try again."
          : unsaved
            ? "Save portfolio changes"
            : "All portfolio changes are saved";

  return (
    <>
      <HStack
        className="editor-toolbar"
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
          <Tooltip content={saveTooltip} showArrow openDelay={200}>
            <Button
              aria-label={saveTooltip}
              rounded={0}
              onClick={() => void save()}
              variant="ghost"
              loading={saveStatus === "saving"}
              loadingText="Saving"
            >
              {saveStatus === "saved" ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {saveStatus === "saved" ? "Saved" : "Save"}
            </Button>
          </Tooltip>
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
