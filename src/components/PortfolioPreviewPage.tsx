import {
  Box,
  Button,
  Flex,
  HStack,
  NativeSelect,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import type { Portfolio, PreviewMode } from "../types/portfolio";
import { breakpointWidth } from "../config/breakpointSettings";
import { PortfolioPreview } from "./PortfolioPreview";

export function PortfolioPreviewPage({
  portfolio,
  previewMode,
  onPreviewModeChange,
  onBack,
  onPublish,
}: {
  portfolio: Portfolio;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onBack: () => void;
  onPublish: () => void;
}) {
  const previewWidth = breakpointWidth(
    previewMode,
    portfolio.settings.breakpointWidths,
  );

  return (
    <Box h="100dvh" overflow="hidden" bg="bg.subtle" pt="64px">
      <Flex
        as="header"
        position="fixed"
        insetX={0}
        top={0}
        zIndex="sticky"
        h="64px"
        px={{ base: 3, md: 5 }}
        align="center"
        justify="space-between"
        gap={3}
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg/95"
        backdropFilter="blur(12px)"
      >
        <Button size="sm" variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <Text as="span" display={{ base: "none", sm: "inline" }}>
            Back to editor
          </Text>
        </Button>

        <HStack gap={2}>
          <NativeSelect.Root size="sm" width={{ base: "126px", sm: "150px" }}>
            <NativeSelect.Field
              aria-label="Preview breakpoint"
              value={previewMode}
              onChange={(event) =>
                onPreviewModeChange(event.target.value as PreviewMode)
              }
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Button size="sm" colorPalette="blue" onClick={onPublish}>
            <UploadCloud size={16} />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              Publish
            </Text>
          </Button>
        </HStack>
      </Flex>

      <Box
        h="calc(100dvh - 64px)"
        overflow="auto"
        p={{ base: 3, md: 6 }}
      >
        <Box
          className="preview-device-frame"
          width={previewWidth}
          minWidth={previewWidth}
          h="full"
          minH="full"
          display="flex"
          flexDirection="column"
          mx="auto"
          bg="bg"
          boxShadow="xl"
        >
          <PortfolioPreview
            portfolio={portfolio}
            selected={undefined}
            onSelect={() => undefined}
          />
        </Box>
      </Box>
    </Box>
  );
}
