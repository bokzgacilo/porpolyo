import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowUpRight, LuCheck, LuCircleDashed } from "react-icons/lu";
import { brandFont, TAGLINE } from "../../data/brand";
import { ColorModeButton } from "../../components/ui/color-mode";

const sprintOneFeatures = [
  {
    title: "Supabase foundation",
    detail:
      "Google authentication, owner-scoped portfolio records, protected image uploads, public portfolio reads, and row-level security.",
  },
  {
    title: "Project lifecycle",
    detail:
      "Create, list, edit, preview, save, publish, and delete portfolios with clear draft and live states.",
  },
  {
    title: "Visual portfolio builder",
    detail:
      "Canvas selection, section and layer trees, drag reordering, undo and redo, zoom, pan, and responsive preview modes.",
  },
  {
    title: "Section and element controls",
    detail:
      "Editable content, visibility, duplication, locking, alignment, spacing, content width, colors, borders, shadows, and sizing.",
  },
  {
    title: "Box-model inspector",
    detail:
      "Rendered margin and padding values, visual canvas overlays, and per-side spacing controls for selected elements.",
  },
  {
    title: "Portfolio content system",
    detail:
      "Header, hero, projects, certifications, services, about, and footer sections across three templates and ten palettes.",
  },
  {
    title: "Images and metadata",
    detail:
      "Supabase image storage, profile and project assets, page metadata, Open Graph previews, and Twitter/X previews.",
  },
  {
    title: "Launch tooling",
    detail:
      "Public username routes, save-before-publish behavior, analytics summaries, UTM URL generation, and project settings.",
  },
];

const sprintTwoPriorities = [
  {
    title: "Make every layout variant functional",
    detail:
      "Connect template and section variant choices to real responsive compositions instead of display-only settings.",
  },
  {
    title: "Autosave and durable versions",
    detail:
      "Add debounced autosave, recovery states, and named portfolio versions that survive browser sessions.",
  },
  {
    title: "Publishing confidence",
    detail:
      "Add pre-publish validation for missing content, broken links, image alt text, metadata, and username availability.",
  },
  {
    title: "Real custom domains",
    detail:
      "Move beyond the current placeholder with domain verification, DNS instructions, connection status, and canonical URLs.",
  },
  {
    title: "Deeper analytics",
    detail:
      "Track page views, referrers, campaigns, and project interactions with useful time-range and source breakdowns.",
  },
  {
    title: "Quality and accessibility pass",
    detail:
      "Complete keyboard workflows, responsive QA, empty and error states, performance checks, and public-page accessibility.",
  },
];

export default function DevelopmentPage() {
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
          <Flex align="center" justify="space-between" gap="4">
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
              <Link
                href="#sprint-1"
                color="fg.muted"
                display={{ base: "none", sm: "inline-flex" }}
              >
                Sprint 1
              </Link>
              <Link
                href="#sprint-2"
                color="fg.muted"
                display={{ base: "none", sm: "inline-flex" }}
              >
                Sprint 2
              </Link>
              <ColorModeButton />
              <Button colorPalette="blue" asChild>
                <NextLink color="button.inverted" href="/dashboard">
                  Dashboard <LuArrowUpRight />
                </NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl">
        <Grid
          py={{ base: 16, md: 24 }}
          gap={{ base: 12, lg: 20 }}
          templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 280px" }}
          alignItems="end"
        >
          <Stack gap="7" maxW="4xl">
            <HStack gap="3" flexWrap="wrap">
              <Badge
                colorPalette="blue"
                variant="subtle"
                size="lg"
                rounded="full"
                px={3}
              >
                Sprint 1 in progress
              </Badge>
              <Text color="fg.muted" fontSize="sm">
                Estimated duration · 1–2 weeks
              </Text>
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl" }}
              lineHeight="1.05"
              letterSpacing="-0.02em"
              maxW="900px"
            >
              Build the editor foundation.
            </Heading>
            <Text
              fontFamily={brandFont}
              fontWeight="bold"
              fontSize={{ base: "xl", md: "2xl" }}
              color="blue.solid"
            >
              building in public.
            </Text>
            <Text
              color="fg.muted"
              fontSize={{ base: "lg", md: "xl" }}
              maxW="720px"
            >
              Sprint 1 turns Porpolyo into a complete portfolio workflow: start
              with a template, edit visually, save safely, and publish a live
              portfolio from Supabase.
            </Text>
          </Stack>

          <Box borderTopWidth="1px" borderColor="border" pt="5">
            <Text
              color="fg.muted"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Sprint outcome
            </Text>
            <Text mt="3" fontSize="lg" fontWeight="700">
              A reliable end-to-end builder that is ready for focused product
              iteration.
            </Text>
          </Box>
        </Grid>

        <Box
          id="sprint-1"
          scrollMarginTop="6"
          borderTopWidth="1px"
          borderColor="border"
        >
          <SprintHeading
            number="01"
            label="Current sprint"
            title="Foundation and complete workflow"
            description="Ship the essential creation, editing, persistence, and publishing loop before expanding the product surface."
          />

          <Box borderTopWidth="1px" borderColor="border">
            {sprintOneFeatures.map((feature, index) => (
              <FeatureRow
                key={feature.title}
                index={index + 1}
                title={feature.title}
                detail={feature.detail}
                complete
              />
            ))}
          </Box>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={{ base: 8, md: 12 }}
            py={{ base: 12, md: 16 }}
            borderTopWidth="1px"
            borderColor="border"
          >
            <SprintMetric value="3" label="Portfolio templates" />
            <SprintMetric value="10" label="Color palettes" />
            <SprintMetric value="7" label="Editable section types" />
          </SimpleGrid>
        </Box>
      </Container>

      <Box
        id="sprint-2"
        scrollMarginTop="6"
        bg="bg.subtle"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Container maxW="6xl">
          <SprintHeading
            number="02"
            label="Up next"
            title="Reliability, depth, and launch confidence"
            description="Sprint 2 strengthens what is already built, closes placeholder workflows, and makes publishing safer for real portfolio owners."
          />

          <Grid
            pb={{ base: 16, md: 24 }}
            gap={{ base: 10, lg: 20 }}
            templateColumns={{ base: "1fr", lg: "280px minmax(0, 1fr)" }}
          >
            <Stack
              gap="5"
              alignSelf="start"
              position={{ lg: "sticky" }}
              top={{ lg: "8" }}
            >
              <Badge
                alignSelf="flex-start"
                variant="outline"
                colorPalette="blue"
              >
                Planned
              </Badge>
              <Text fontSize="2xl" fontWeight="700" lineHeight="1.2">
                Move from a capable foundation to a dependable product.
              </Text>
              <Text color="fg.muted">
                Priorities are ordered by user risk and workflow completeness,
                not by visual novelty.
              </Text>
            </Stack>

            <Box borderTopWidth="1px" borderColor="border">
              {sprintTwoPriorities.map((feature, index) => (
                <FeatureRow
                  key={feature.title}
                  index={index + 1}
                  title={feature.title}
                  detail={feature.detail}
                />
              ))}
            </Box>
          </Grid>
        </Container>
      </Box>

      <Box
        as="section"
        bg="bg.subtle"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Container maxW="4xl" py={{ base: 16, md: 24 }}>
          <Stack
            gap={6}
            align="center"
            textAlign="center"
            p={{ base: 8, md: 12 }}
            rounded="2xl"
            bg="blue.solid"
            color="white"
          >
            <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              Build with the current sprint.
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="xl" opacity={0.9}>
              Try the workflow that Sprint 1 is shaping, from template selection
              to a live portfolio.
            </Text>
            <Button
              asChild
              size="xl"
              bg="white"
              color="blue.solid"
              _hover={{ bg: "whiteAlpha.900" }}
            >
              <NextLink href="/builder/new">
                Start a portfolio <LuArrowUpRight aria-hidden="true" />
              </NextLink>
            </Button>
          </Stack>
        </Container>
      </Box>

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
                <NextLink href="/">Back home</NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

function SprintHeading({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <Grid
      py={{ base: 12, md: 18 }}
      gap={{ base: 8, md: 12 }}
      templateColumns={{ base: "1fr", md: "140px minmax(0, 1fr)" }}
    >
      <Text
        color="blue.solid"
        fontSize={{ base: "6xl", md: "8xl" }}
        fontWeight="800"
        lineHeight="0.8"
        letterSpacing="-0.06em"
      >
        {number}
      </Text>
      <Stack gap="4" maxW="3xl">
        <Text
          color="fg.muted"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.12em"
        >
          {label}
        </Text>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          letterSpacing="-0.035em"
        >
          {title}
        </Heading>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
          {description}
        </Text>
      </Stack>
    </Grid>
  );
}

function FeatureRow({
  index,
  title,
  detail,
  complete = false,
}: {
  index: number;
  title: string;
  detail: string;
  complete?: boolean;
}) {
  return (
    <Grid
      py={{ base: 6, md: 8 }}
      gap={{ base: 4, md: 8 }}
      templateColumns={{
        base: "36px minmax(0, 1fr)",
        md: "56px minmax(220px, 0.7fr) minmax(0, 1fr)",
      }}
      borderBottomWidth="1px"
      borderColor="border"
      transition="background 160ms ease, padding 160ms ease"
      _hover={{ bg: "bg.subtle" }}
    >
      <Flex color={complete ? "blue.solid" : "fg.muted"} pt="1">
        {complete ? (
          <LuCheck aria-hidden="true" />
        ) : (
          <LuCircleDashed aria-hidden="true" />
        )}
      </Flex>
      <HStack align="flex-start" gap="3">
        <Text color="fg.muted" fontSize="xs" pt="1">
          {String(index).padStart(2, "0")}
        </Text>
        <Text
          fontWeight="700"
          fontSize={{ base: "lg", md: "xl" }}
          lineHeight="1.25"
        >
          {title}
        </Text>
      </HStack>
      <Text
        gridColumn={{ base: "2", md: "auto" }}
        color="fg.muted"
        maxW="680px"
      >
        {detail}
      </Text>
    </Grid>
  );
}

function SprintMetric({ value, label }: { value: string; label: string }) {
  return (
    <Stack gap="1">
      <Text
        color="blue.solid"
        fontSize="5xl"
        fontWeight="800"
        letterSpacing="-0.05em"
      >
        {value}
      </Text>
      <Text color="fg.muted">{label}</Text>
    </Stack>
  );
}
