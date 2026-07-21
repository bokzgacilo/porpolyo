import type { Metadata } from "next";
import NextLink from "next/link";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  LuArrowUpRight,
  LuBookOpen,
  LuChevronDown,
  LuFileText,
} from "react-icons/lu";
import { MarkdownViewer } from "../../components/MarkdownViewer";
import { ColorModeButton } from "../../components/ui/color-mode";
import { brandFont, TAGLINE } from "../../data/brand";
import { getDevDiaryEntries } from "../../lib/dev-diary";

export const metadata: Metadata = {
  title: "Changelogs · Porpolyo",
  description: "Development notes, shipped changes, and upcoming work for Porpolyo.",
};

export default function ChangelogsPage() {
  const entries = getDevDiaryEntries();

  return (
    <Box as="main" minH="100svh" bg="bg" color="fg">
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="docked"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg/80"
        backdropFilter="blur(10px)"
      >
        <Container maxW="6xl" py={3}>
          <Flex align="center" justify="space-between" gap={4}>
            <Link asChild _hover={{ textDecoration: "none" }}>
              <NextLink href="/">
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
              </NextLink>
            </Link>
            <HStack gap={{ base: 2, md: 4 }} fontSize="sm">
              <Link asChild color="fg.muted" display={{ base: "none", sm: "inline-flex" }}>
                <NextLink href="/dev">Development</NextLink>
              </Link>
              <ColorModeButton />
              <Button colorPalette="blue" asChild>
                <NextLink color="button.inverted" href="/dashboard">
                  Dashboard <LuArrowUpRight aria-hidden="true" />
                </NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="4xl">
        <Stack py={{ base: 14, md: 20 }} gap={6} maxW="3xl">
          <HStack gap={2} color="blue.solid">
            <LuBookOpen aria-hidden="true" />
            <Text
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Building in public
            </Text>
          </HStack>
          <Heading
            as="h1"
            fontSize={{ base: "5xl", md: "7xl" }}
            lineHeight="1"
            letterSpacing="-0.045em"
          >
            Changelogs
          </Heading>
          <Text color="fg.muted" fontSize={{ base: "lg", md: "xl" }} maxW="2xl">
            Short records of what shipped, what changed, and what the next work
            session should move forward.
          </Text>
        </Stack>

        <Stack gap={3} pb={{ base: 14, md: 20 }}>
          {entries.map((entry, index) => (
            <Box
              as="article"
              id={entry.slug}
              key={entry.slug}
              scrollMarginTop="20"
              rounded="xl"
              borderWidth="1px"
              borderColor="border"
              bg="bg.panel"
              overflow="hidden"
            >
              <Box
                asChild
                css={{
                  "&[open] .changelog-chevron": {
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <details open={index === 0}>
                  <Box
                    as="summary"
                    cursor="pointer"
                    listStyle="none"
                    p={{ base: 5, md: 7 }}
                    transition="background 160ms ease"
                    _hover={{ bg: "bg.subtle" }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: "blue.solid",
                      outlineOffset: "-2px",
                    }}
                    css={{ "&::-webkit-details-marker": { display: "none" } }}
                  >
                    <Stack gap={3}>
                      <Flex justify="space-between" align="center" gap={4}>
                        <HStack gap={3} flexWrap="wrap">
                          <Text color="blue.solid" fontWeight="800">
                            Day {entry.day}
                          </Text>
                          <Badge
                            colorPalette="blue"
                            variant={index === 0 ? "solid" : "subtle"}
                          >
                            {entry.label}
                          </Badge>
                        </HStack>
                        <Box
                          className="changelog-chevron"
                          color="fg.muted"
                          transition="transform 160ms ease"
                          flexShrink={0}
                        >
                          <LuChevronDown aria-hidden="true" />
                        </Box>
                      </Flex>
                      <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }}>
                        {entry.title}
                      </Heading>
                      <Text color="fg.muted">{entry.summary}</Text>
                    </Stack>
                  </Box>

                  <Stack
                    gap={6}
                    px={{ base: 5, md: 7 }}
                    pt={{ base: 5, md: 7 }}
                    pb={{ base: 7, md: 9 }}
                    borderTopWidth="1px"
                    borderColor="border"
                  >
                    <HStack gap={2} color="fg.muted" fontSize="xs">
                      <LuFileText aria-hidden="true" />
                      <Text as="code" fontFamily="mono">
                        {entry.sourceFile}
                      </Text>
                    </HStack>
                    <MarkdownViewer markdown={entry.markdown} />
                  </Stack>
                </details>
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>

      <Box as="footer" borderTopWidth="1px" borderColor="border">
        <Container maxW="6xl" py={8}>
          <Flex
            justify="space-between"
            align="center"
            gap={4}
            direction={{ base: "column", sm: "row" }}
          >
            <Heading
              as="span"
              fontFamily={brandFont}
              fontWeight="bold"
              fontSize="xl"
              letterSpacing="-0.01em"
              lineHeight="1"
            >
              porpolyo
            </Heading>
            <HStack gap={4}>
              <Text
                display={{ base: "none", md: "block" }}
                fontFamily={brandFont}
                fontWeight="bold"
                fontSize="sm"
                color="fg.muted"
              >
                {TAGLINE}
              </Text>
              <Button asChild size="sm" variant="outline">
                <NextLink href="/dev">Development roadmap</NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
