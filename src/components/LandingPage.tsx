"use client";

import NextLink from "next/link";
import { useMemo } from "react";
import {
  Accordion,
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
  Span,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { LuHammer, LuLayoutDashboard } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import type { User } from "@supabase/supabase-js";
import { templates } from "../data/templates";
import { brandFont, TAGLINE } from "../data/brand";
import { ColorModeButton } from "./ui/color-mode";

type LandingPageProps = {
  authUser: User | null;
  authLoading: boolean;
  onLogin: () => void;
  onStart: () => void;
  onDashboard: () => void;
};

const features = [
  {
    icon: LayoutTemplate,
    title: "Curated templates",
    description:
      "Start from professionally designed layouts — Neo-Brutalism, Minimalist, or Bento Grid — each with section variants you can swap in seconds.",
  },
  {
    icon: Palette,
    title: "Ready-made palettes",
    description:
      "Ten hand-tuned color palettes keep your portfolio cohesive. Pick one during setup and every section updates to match.",
  },
  {
    icon: MousePointerClick,
    title: "Visual editor",
    description:
      "Refine content in a controlled canvas with a structure panel, layer tree, and properties panel — no layout code to touch.",
  },
  {
    icon: ImageIcon,
    title: "Image slots",
    description:
      "Upload photos and project shots straight into backed image slots so your work always looks its best.",
  },
  {
    icon: Smartphone,
    title: "Responsive previews",
    description:
      "Preview exactly how your portfolio behaves across mobile, tablet, and desktop before you ever hit publish.",
  },
  {
    icon: Search,
    title: "Built-in SEO",
    description:
      "Set titles, descriptions, Open Graph, Twitter cards, canonical URLs, and favicons from a dedicated metadata editor.",
  },
];

const whyReasons = [
  {
    icon: Rocket,
    title: "Ship in minutes, not weekends",
    description:
      "Skip the blank page. Choose a template and palette, drop in your content, and publish a polished site the same day.",
  },
  {
    icon: ShieldCheck,
    title: "Structure that stays consistent",
    description:
      "A controlled editor keeps spacing, typography, and layout on-system, so your portfolio looks intentional everywhere.",
  },
  {
    icon: Globe,
    title: "Your own public link",
    description:
      "Publish to a clean, shareable address at porpolyo.com/your-name — ready for recruiters, clients, and collaborators.",
  },
  {
    icon: Sparkles,
    title: "No code, no design debt",
    description:
      "You never edit layout code. Focus on your story and projects while the template handles the visual heavy lifting.",
  },
];

const steps = [
  {
    title: "Sign in with Google",
    description: "One click to create your account — no passwords to manage.",
  },
  {
    title: "Pick a template & palette",
    description: "Choose the look and color system that fits your work.",
  },
  {
    title: "Add your content",
    description: "Fill in your hero, projects, services, and about sections.",
  },
  {
    title: "Publish & share",
    description: "Go live at your own public URL and share it anywhere.",
  },
];

const faqs = [
  {
    value: "cost",
    question: "Do I need to know how to code?",
    answer:
      "Not at all. Porpolyo is built for people who want a great portfolio without writing HTML, CSS, or wrestling with layout. You work entirely in a visual editor.",
  },
  {
    value: "google",
    question: "Why do I sign in with Google?",
    answer:
      "Google sign-in lets you securely save your portfolios to your account and come back to edit them anytime, without creating another password.",
  },
  {
    value: "templates",
    question: "Can I change my template or palette later?",
    answer:
      "Yes. Your content is separate from your template and palette, so you can switch styles from project settings without starting over.",
  },
  {
    value: "publish",
    question: "Where does my portfolio live once it's published?",
    answer:
      "Published portfolios get a clean public link at porpolyo.com/your-username. Drafts stay private in your dashboard until you choose to publish.",
  },
  {
    value: "seo",
    question: "Is my portfolio optimized for search and sharing?",
    answer:
      "Every portfolio includes a metadata editor for titles, descriptions, Open Graph and Twitter cards, canonical URLs, and a favicon — so links look sharp when shared and are ready for search engines.",
  },
  {
    value: "multiple",
    question: "Can I build more than one portfolio?",
    answer:
      "Absolutely. Create as many portfolios as you like and manage them all from your dashboard — perfect for tailoring versions to different audiences.",
  },
];

export function LandingPage({
  authUser,
  authLoading,
  onLogin,
  onStart,
  onDashboard,
}: LandingPageProps) {
  const displayName =
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.email ||
    "User";
  const avatarUrl =
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    "";

  const primaryCta = useMemo(
    () => (authUser ? onStart : onLogin),
    [authUser, onStart, onLogin],
  );

  return (
    <Box bg="bg" color="fg" minH="100vh">
      {/* Navigation */}
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
            <HStack gap={{ base: 2, md: 4 }}>
              <ColorModeButton />
              {authUser ? (
                <>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={displayName} />
                    <Avatar.Image src={avatarUrl} alt={displayName} />
                  </Avatar.Root>
                  <Button
                    variant="outline"
                    onClick={onDashboard}
                    display={{ base: "none", sm: "inline-flex" }}
                  >
                    <LuLayoutDashboard />
                    Dashboard
                  </Button>
                  <Button colorPalette="blue" onClick={onStart}>
                    Start building <LuHammer />
                  </Button>
                </>
              ) : (
                <Button
                  loading={authLoading}
                  onClick={onLogin}
                  variant="outline"
                >
                  <FcGoogle />
                  Login with Google
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero */}
      <Box as="section" position="relative" overflow="hidden">
        <Container maxW="6xl" py={{ base: 16, md: 24 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 16 }} alignItems="center">
            <Stack gap={6}>
              <Badge
                colorPalette="blue"
                variant="subtle"
                size="lg"
                alignSelf="flex-start"
                rounded="full"
                px={3}
              >
                Template-based portfolio builder
              </Badge>
              <Heading
                size={{ base: "3xl", md: "5xl" }}
                lineHeight="1.05"
                letterSpacing="-0.02em"
              >
                Build a polished portfolio without touching layout code.
              </Heading>
              <Text
                fontFamily={brandFont}
                fontWeight="bold"
                fontSize={{ base: "xl", md: "2xl" }}
                color="blue.solid"
              >
                {TAGLINE}
              </Text>
              <Text fontSize={{ base: "lg", md: "xl" }} color="fg.muted" maxW="xl">
                Choose a template, palette, and content — then refine the result
                in a controlled visual editor with responsive previews and
                built-in image slots. Publish to your own public link in minutes.
              </Text>
              <HStack gap={3} flexWrap="wrap" pt={2}>
                <Button size="xl" colorPalette="blue" onClick={primaryCta}>
                  {authUser ? "Create portfolio" : "Get started free"}
                  <ArrowRight size={18} />
                </Button>
                {authUser ? (
                  <Button size="xl" variant="outline" onClick={onDashboard}>
                    <LuLayoutDashboard />
                    Go to dashboard
                  </Button>
                ) : (
                  <Button size="xl" variant="ghost" onClick={onLogin}>
                    <FcGoogle />
                    Login with Google
                  </Button>
                )}
              </HStack>
              <HStack gap={5} pt={2} color="fg.muted" flexWrap="wrap">
                <HStack gap={1.5}>
                  <Icon as={CheckCircle2} color="green.solid" boxSize={4} />
                  <Text fontSize="sm">No code required</Text>
                </HStack>
                <HStack gap={1.5}>
                  <Icon as={CheckCircle2} color="green.solid" boxSize={4} />
                  <Text fontSize="sm">Free to start</Text>
                </HStack>
                <HStack gap={1.5}>
                  <Icon as={CheckCircle2} color="green.solid" boxSize={4} />
                  <Text fontSize="sm">Publish in minutes</Text>
                </HStack>
              </HStack>
            </Stack>

            {/* Template preview cards */}
            <Stack gap={4}>
              {templates.map((template, index) => (
                <Box
                  key={template.id}
                  p={5}
                  rounded="xl"
                  bg="bg.panel"
                  border="1px solid"
                  borderColor="border"
                  shadow="sm"
                  transform={{ lg: `translateX(${index % 2 === 0 ? "0" : "24px"})` }}
                  transition="transform 0.2s, box-shadow 0.2s"
                  _hover={{ shadow: "md", transform: "translateX(0)" }}
                >
                  <HStack justify="space-between" mb={1}>
                    <Heading size="md">{template.name}</Heading>
                    <Badge colorPalette="blue" variant="surface" rounded="full">
                      Template
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted">
                    {template.thumbnail}
                  </Text>
                </Box>
              ))}
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* About */}
      <Box as="section" bg="bg.subtle" borderY="1px solid" borderColor="border">
        <Container maxW="4xl" py={{ base: 16, md: 20 }}>
          <VStack gap={5} textAlign="center">
            <Badge colorPalette="blue" variant="subtle" rounded="full" px={3}>
              About Porpolyo
            </Badge>
            <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              A portfolio builder that keeps you on-system
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="2xl">
              Porpolyo turns the tedious parts of building a personal site into a
              guided workflow. Instead of fighting a blank canvas, you start from
              a proven template and palette, then shape your hero, projects,
              services, and about sections in a focused visual editor. Every
              choice stays consistent with the design system, so the result looks
              deliberate — from the first section to the published link you share.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Features */}
      <Box as="section">
        <Container maxW="6xl" py={{ base: 16, md: 24 }}>
          <VStack gap={4} textAlign="center" mb={{ base: 10, md: 14 }}>
            <Badge colorPalette="blue" variant="subtle" rounded="full" px={3}>
              Features
            </Badge>
            <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              Everything you need to look professional
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="2xl">
              Thoughtful building blocks that handle the hard parts of design so
              you can focus on your work.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {features.map((feature) => (
              <Stack
                key={feature.title}
                gap={4}
                p={6}
                rounded="xl"
                bg="bg.panel"
                border="1px solid"
                borderColor="border"
                transition="border-color 0.2s, box-shadow 0.2s"
                _hover={{ borderColor: "blue.solid", shadow: "sm" }}
              >
                <Flex
                  align="center"
                  justify="center"
                  boxSize={11}
                  rounded="lg"
                  bg="blue.subtle"
                  color="blue.fg"
                >
                  <Icon as={feature.icon} boxSize={5} />
                </Flex>
                <Heading size="md">{feature.title}</Heading>
                <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
                  {feature.description}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Why use Porpolyo */}
      <Box as="section" bg="bg.subtle" borderY="1px solid" borderColor="border">
        <Container maxW="6xl" py={{ base: 16, md: 24 }}>
          <VStack gap={4} textAlign="center" mb={{ base: 10, md: 14 }}>
            <Badge colorPalette="blue" variant="subtle" rounded="full" px={3}>
              Why Porpolyo
            </Badge>
            <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              Why build your portfolio here
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="2xl">
              The fastest path from &ldquo;I should make a portfolio&rdquo; to a
              link you&rsquo;re proud to share.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={{ base: 12, md: 16 }}>
            {whyReasons.map((reason) => (
              <HStack
                key={reason.title}
                align="flex-start"
                gap={4}
                p={6}
                rounded="xl"
                bg="bg.panel"
                border="1px solid"
                borderColor="border"
              >
                <Flex
                  align="center"
                  justify="center"
                  boxSize={11}
                  flexShrink={0}
                  rounded="lg"
                  bg="blue.solid"
                  color="white"
                >
                  <Icon as={reason.icon} boxSize={5} />
                </Flex>
                <Stack gap={1}>
                  <Heading size="md">{reason.title}</Heading>
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
                    {reason.description}
                  </Text>
                </Stack>
              </HStack>
            ))}
          </SimpleGrid>

          {/* How it works steps */}
          <VStack gap={2} textAlign="center" mb={10}>
            <Heading size={{ base: "xl", md: "2xl" }}>How it works</Heading>
            <Text color="fg.muted">Four steps from sign-in to shareable.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
            {steps.map((step, index) => (
              <Stack key={step.title} gap={3}>
                <Flex
                  align="center"
                  justify="center"
                  boxSize={10}
                  rounded="full"
                  bg="blue.subtle"
                  color="blue.fg"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {index + 1}
                </Flex>
                <Heading size="sm">{step.title}</Heading>
                <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
                  {step.description}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box as="section">
        <Container maxW="3xl" py={{ base: 16, md: 24 }}>
          <VStack gap={4} textAlign="center" mb={{ base: 10, md: 12 }}>
            <Badge colorPalette="blue" variant="subtle" rounded="full" px={3}>
              FAQ
            </Badge>
            <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              Frequently asked questions
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted">
              Everything you might be wondering before you start.
            </Text>
          </VStack>
          <Accordion.Root collapsible defaultValue={["cost"]}>
            {faqs.map((faq) => (
              <Accordion.Item key={faq.value} value={faq.value}>
                <Accordion.ItemTrigger py={4} cursor="pointer">
                  <Span flex="1" textAlign="left" fontWeight="medium" fontSize="md">
                    {faq.question}
                  </Span>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody color="fg.muted" lineHeight="1.7" pb={4}>
                    {faq.answer}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box as="section" bg="bg.subtle" borderTop="1px solid" borderColor="border">
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
              Ready to build your portfolio?
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="xl" opacity={0.9}>
              Pick a template, add your work, and publish to your own link. It
              only takes a few minutes.
            </Text>
            <Button
              size="xl"
              bg="white"
              color="blue.solid"
              _hover={{ bg: "whiteAlpha.900" }}
              onClick={primaryCta}
            >
              {authUser ? "Create portfolio" : "Get started free"}
              <ArrowRight size={18} />
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" borderTop="1px solid" borderColor="border">
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
            <HStack gap={4} flexWrap="wrap" justify={{ base: "center", sm: "flex-end" }}>
              <Text
                display={{ base: "none", md: "block" }}
                fontFamily={brandFont}
                fontWeight="bold"
                fontSize="sm"
                color="fg.muted"
              >
                {TAGLINE}
              </Text>
              <Button asChild size="sm" variant="ghost">
                <NextLink href="/privacy">Privacy</NextLink>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <NextLink href="/terms">Terms</NextLink>
              </Button>
              <Button asChild size="sm" variant="outline">
                <NextLink href="/dev">Dev blog</NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
