import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import { Portfolio } from "../../types/portfolio";

export function JsonModal({
  portfolio,
  onClose,
}: {
  portfolio: Portfolio;
  onClose: () => void;
}) {
  return (
    <Box className="json-modal-backdrop" onClick={onClose}>
      <Box className="json-modal" onClick={(event) => event.stopPropagation()}>
        <HStack justify="space-between" align="center">
          <Box>
            <Text as="strong">Portfolio JSON</Text>
            <Text as="small">Layout, content, section order, and style settings</Text>
          </Box>
          <IconButton aria-label="Close JSON viewer" size="sm" variant="outline" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </HStack>
        <pre>{JSON.stringify(portfolio, null, 2)}</pre>
      </Box>
    </Box>
  );
}
