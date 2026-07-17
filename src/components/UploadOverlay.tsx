"use client";

import { Box, Button, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import { useUploadStore } from "../store/uploadStore";

export function UploadOverlay() {
  const { active, label, cancel } = useUploadStore();

  if (!active) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="overlay"
      bg="blackAlpha.700"
      display="grid"
      placeItems="center"
      cursor="wait"
    >
      <Stack
        gap="4"
        align="center"
        bg="bg.panel"
        color="fg.default"
        borderWidth="1px"
        borderColor="border.subtle"
        rounded="lg"
        shadow="xl"
        px="8"
        py="7"
        minW="300px"
        cursor="default"
      >
        <Spinner size="lg" color="blue.500" />
        <Stack gap="1" textAlign="center">
          <Text fontWeight="semibold">{label}</Text>
          <Text fontSize="sm" color="fg.muted">Saving image to Supabase Storage...</Text>
        </Stack>
        <HStack>
          <Button size="sm" variant="outline" onClick={cancel}>
            <X size={16} /> Cancel
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
