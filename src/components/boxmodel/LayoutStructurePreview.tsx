import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import type { ComputedLayoutStructure } from "./useComputedLayoutStructure";

export function LayoutStructurePreview({
  layout,
}: {
  layout?: ComputedLayoutStructure;
}) {
  const slots = layout
    ? layout.childTags.length > 0
      ? layout.childTags
      : ["content"]
    : [];
  const direction = layout?.type === "flex" ? layout.direction : "column";
  const columnCount = Math.min(Math.max(layout?.columns || 1, 1), 4);

  return (
    <Stack p={4} gap={3} borderBottom="1px solid" borderBottomColor="border">
      <HStack justify="space-between" align="baseline">
        <Text fontSize="sm" fontWeight="semibold">
          Layout structure
        </Text>
        {layout && (
          <Text
            color="fg.muted"
            fontFamily="mono"
            fontSize="xs"
            textTransform="uppercase"
          >
            {layout.type}
            {layout.type === "flex" ? ` · ${layout.direction}` : ""}
          </Text>
        )}
      </HStack>

      {layout ? (
        <Box
          aria-label={`${layout.type} layout with ${layout.childCount} child slots`}
          minH="116px"
          p={3}
          display={layout.type === "grid" ? "grid" : "flex"}
          gridTemplateColumns={
            layout.type === "grid" ? `repeat(${columnCount}, 1fr)` : undefined
          }
          flexDirection={layout.type === "flex" ? direction : "column"}
          flexWrap={layout.type === "flex" && layout.wrap === "wrap" ? "wrap" : "nowrap"}
          alignItems="stretch"
          alignContent="start"
          gap={2}
          rounded="md"
          border="1px dashed"
          borderColor="border.emphasized"
          bg="bg.subtle"
        >
          {slots.map((tag, index) => (
            <Box
              key={`${tag}-${index}`}
              minH={layout.type === "flex" && direction === "column" ? 8 : 14}
              flex={
                layout.type === "flex" && direction === "row"
                  ? "1 1 0"
                  : undefined
              }
              px={2}
              py={1.5}
              display="grid"
              placeItems="center"
              rounded="sm"
              border="1px solid"
              borderColor="blue.muted"
              bg="blue.subtle"
              color="blue.fg"
            >
              <Text fontSize="xs" fontWeight="semibold">
                {index + 1} · {tag}
              </Text>
            </Box>
          ))}
          {layout.childCount > slots.length && (
            <Text alignSelf="center" color="fg.muted" fontSize="xs">
              +{layout.childCount - slots.length} more
            </Text>
          )}
        </Box>
      ) : (
        <Box
          minH="80px"
          display="grid"
          placeItems="center"
          rounded="md"
          border="1px dashed"
          borderColor="border"
          bg="bg.subtle"
        >
          <Text color="fg.muted" fontSize="xs">
            Select a rendered element to inspect its layout.
          </Text>
        </Box>
      )}

      {layout && (
        <HStack gap={3} flexWrap="wrap" color="fg.muted" fontSize="xs">
          <Text>{layout.childCount} slots</Text>
          {layout.type === "grid" && <Text>{layout.columns} columns</Text>}
          {layout.type === "grid" ? (
            <Text>Gap {layout.columnGap} × {layout.rowGap}</Text>
          ) : (
            <Text>Gap {layout.gap}</Text>
          )}
          <Text>Wrap {layout.wrap}</Text>
          <Text>Align {layout.alignItems}</Text>
          <Text>Justify {layout.justifyContent}</Text>
        </HStack>
      )}
    </Stack>
  );
}
