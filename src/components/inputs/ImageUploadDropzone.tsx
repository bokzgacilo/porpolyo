import { FileUpload, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuImagePlus } from "react-icons/lu";

export function ImageUploadDropzone({
  label,
  compact = false,
  onUpload,
}: {
  label: string;
  compact?: boolean;
  onUpload: (file?: File) => void;
}) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <FileUpload.Root
      key={resetKey}
      accept="image/*"
      maxFiles={1}
      width="full"
      onFileAccept={(details) => {
        onUpload(details.files[0]);
        setResetKey((current) => current + 1);
      }}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone
        minH={compact ? "14" : "24"}
        px={compact ? "3" : "5"}
        py={compact ? "2" : "4"}
      >
        <FileUpload.DropzoneContent width="full">
          <HStack width="full" gap="3" textAlign="left">
            <Icon color="fg.muted" boxSize={compact ? "4" : "5"}>
              <LuImagePlus />
            </Icon>
            <Stack minW={0} gap="0">
              <Text fontWeight="medium" truncate>
                {label}
              </Text>
              <Text color="fg.muted" fontSize="xs">
                Drop an image here or click to browse
              </Text>
            </Stack>
          </HStack>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
    </FileUpload.Root>
  );
}
