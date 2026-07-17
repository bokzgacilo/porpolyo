import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import { LuHistory } from "react-icons/lu";
import type { EditorHistoryEntry } from "../../store/editorStore";

export function HistoryPanel({
  history,
  currentLabel,
  onRestore,
}: {
  history: EditorHistoryEntry[];
  currentLabel: string;
  onRestore: (entryId: string) => void;
}) {
  const recentHistory = history.slice(-5).reverse();

  return (
    <Stack gap={0}>
      <HStack
        gap={3}
        px={3}
        py={3}
        borderBottom="1px solid"
        borderBottomColor="border"
        bg="bg.subtle"
      >
        <Box boxSize="8px" rounded="full" bg="blue.500" flexShrink={0} />
        <Stack gap={0} minW={0}>
          <Text fontSize="sm" fontWeight="semibold" truncate>
            {currentLabel}
          </Text>
          <Text color="fg.muted" fontSize="xs">
            Current state
          </Text>
        </Stack>
      </HStack>

      {recentHistory.map((entry, index) => (
        <Button
          key={entry.id}
          variant="ghost"
          width="full"
          height="auto"
          minHeight="50px"
          justifyContent="flex-start"
          rounded={0}
          px={3}
          py={2}
          borderBottom="1px solid"
          borderBottomColor="border"
          onClick={() => onRestore(entry.id)}
        >
          <LuHistory />
          <Stack gap={0} minW={0} align="start">
            <Text fontSize="sm" fontWeight="medium" truncate>
              {entry.label}
            </Text>
            <Text color="fg.muted" fontSize="xs" fontWeight="normal">
              {index + 1} {index === 0 ? "change" : "changes"} back
            </Text>
          </Stack>
        </Button>
      ))}

      {recentHistory.length === 0 && (
        <Text color="fg.muted" fontSize="sm" px={3} py={6} textAlign="center">
          Your last five changes will appear here.
        </Text>
      )}

      <Text color="fg.muted" fontSize="xs" px={3} py={3}>
        Restoring a state keeps newer changes available through Redo.
      </Text>
    </Stack>
  );
}
