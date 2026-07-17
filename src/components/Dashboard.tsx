"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Eye,
  FolderPlus,
  LayoutGrid,
  Pencil,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Portfolio } from "../types/portfolio";
import { palettes, templates } from "../data/templates";
import { brandFont } from "../data/brand";
import { PortfolioPreview } from "./PortfolioPreview";
import { ColorModeButton } from "./ui/color-mode";

type OpenTarget = "editor" | "settings" | "preview";

type DashboardProps = {
  authUser: User | null;
  portfolios: Portfolio[];
  loading: boolean;
  onNew: () => void;
  onOpen: (item: Portfolio, target: OpenTarget) => void;
};

function formatUpdated(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PortfolioThumbnail({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Box
      aria-hidden="true"
      position="absolute"
      inset={0}
      overflow="hidden"
      pointerEvents="none"
      bg="bg.subtle"
    >
      <Box
        width="400%"
        height="400%"
        transform="scale(0.25)"
        transformOrigin="top left"
      >
        <PortfolioPreview
          portfolio={portfolio}
          selected={undefined}
          onSelect={() => undefined}
        />
      </Box>
    </Box>
  );
}

export function Dashboard({
  authUser,
  portfolios,
  loading,
  onNew,
  onOpen,
}: DashboardProps) {
  const displayName =
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.email ||
    "User";
  const avatarUrl =
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    "";

  return (
    <Box bg="bg" color="fg" minH="100vh">
      {/* Header */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="docked"
        bg="bg/80"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="border"
      >
        <Container maxW="6xl" py={3}>
          <Flex justify="space-between" align="center" gap={4}>
            <HStack gap={2.5} align="baseline">
              <Heading
                as="span"
                fontFamily={brandFont}
                fontWeight="bold"
                fontSize="2xl"
                letterSpacing="-0.01em"
                lineHeight="1"
              >
                porpolyo
              </Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                display={{ base: "none", sm: "block" }}
              >
                / dashboard
              </Text>
            </HStack>
            <HStack gap={{ base: 2, md: 3 }}>
              <ColorModeButton />
              <Button colorPalette="blue" onClick={onNew}>
                <Plus size={16} />
                <Box as="span" display={{ base: "none", sm: "inline" }}>
                  New portfolio
                </Box>
              </Button>
              {authUser && (
                <Avatar.Root size="sm">
                  <Avatar.Fallback name={displayName} />
                  <Avatar.Image src={avatarUrl} alt={displayName} />
                </Avatar.Root>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Body */}
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
          mb={8}
          direction={{ base: "column", sm: "row" }}
        >
          <Stack gap={1}>
            <HStack gap={3}>
              <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
                Your portfolios
              </Heading>
              {!loading && portfolios.length > 0 && (
                <Badge colorPalette="blue" variant="subtle" rounded="full" px={2.5}>
                  {portfolios.length}
                </Badge>
              )}
            </HStack>
            <Text color="fg.muted">
              Create, edit, and publish your portfolio sites.
            </Text>
          </Stack>
        </Flex>

        {/* Loading */}
        {loading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Stack
                key={index}
                gap={0}
                rounded="xl"
                border="1px solid"
                borderColor="border"
                overflow="hidden"
              >
                <Skeleton aspectRatio={16 / 9} />
                <Stack p={5} gap={3}>
                  <Skeleton height="5" width="70%" />
                  <Skeleton height="4" width="50%" />
                  <Skeleton height="8" mt={2} />
                </Stack>
              </Stack>
            ))}
          </SimpleGrid>
        )}

        {/* Empty */}
        {!loading && portfolios.length === 0 && (
          <VStack
            gap={5}
            py={16}
            px={6}
            textAlign="center"
            rounded="2xl"
            border="1px dashed"
            borderColor="border"
            bg="bg.subtle"
          >
            <Flex
              align="center"
              justify="center"
              boxSize={14}
              rounded="full"
              bg="blue.subtle"
              color="blue.fg"
            >
              <Icon as={LayoutGrid} boxSize={7} />
            </Flex>
            <Stack gap={1}>
              <Heading size="lg">No portfolios yet</Heading>
              <Text color="fg.muted" maxW="md">
                Create your first portfolio, pick a template and palette, then
                publish it to your own link.
              </Text>
            </Stack>
            <Button colorPalette="blue" size="lg" onClick={onNew}>
              <FolderPlus size={18} />
              Create your first portfolio
            </Button>
          </VStack>
        )}

        {/* Grid */}
        {!loading && portfolios.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {portfolios.map((item) => {
              const template = templates.find((t) => t.id === item.templateId);
              const palette = palettes.find((p) => p.id === item.paletteId);
              const isPublic = item.settings.public;
              return (
                <Stack
                  key={item.id}
                  as="article"
                  gap={0}
                  rounded="xl"
                  bg="bg.panel"
                  border="1px solid"
                  borderColor="border"
                  overflow="hidden"
                  transition="border-color 0.2s, box-shadow 0.2s, transform 0.2s"
                  _hover={{
                    borderColor: "blue.solid",
                    shadow: "md",
                    transform: "translateY(-2px)",
                  }}
                >
                  {/* Live portfolio thumbnail */}
                  <Box
                    position="relative"
                    aspectRatio={16 / 9}
                  >
                    <PortfolioThumbnail portfolio={item} />
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      colorPalette={isPublic ? "green" : "gray"}
                      variant="solid"
                      rounded="full"
                    >
                      {isPublic ? "Published" : "Draft"}
                    </Badge>
                    <Badge
                      position="absolute"
                      bottom={3}
                      left={3}
                      variant="solid"
                      colorPalette="gray"
                      rounded="full"
                    >
                      {template?.name || item.templateId}
                    </Badge>
                  </Box>

                  {/* Body */}
                  <Stack p={5} gap={3} flex={1}>
                    <Stack gap={1}>
                      <Heading size="md" lineClamp={1}>
                        {item.title}
                      </Heading>
                      <Text fontSize="sm" color="fg.muted" lineClamp={1}>
                        {palette?.name || item.paletteId}
                      </Text>
                      <Text fontSize="xs" color="fg.subtle">
                        {isPublic ? `/${item.owner.username}` : "Not published"} ·
                        Updated {formatUpdated(item.updatedAt)}
                      </Text>
                    </Stack>

                    {/* Actions */}
                    <HStack gap={2} mt="auto" pt={2}>
                      <Button
                        flex={1}
                        size="sm"
                        variant="outline"
                        onClick={() => onOpen(item, "editor")}
                      >
                        <Pencil size={15} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Settings for ${item.title}`}
                        onClick={() => onOpen(item, "settings")}
                      >
                        <SettingsIcon size={15} />
                      </Button>
                      <Button
                        size="sm"
                        colorPalette="blue"
                        aria-label={`Preview ${item.title}`}
                        onClick={() => onOpen(item, "preview")}
                      >
                        <Eye size={15} />
                      </Button>
                    </HStack>
                  </Stack>
                </Stack>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
