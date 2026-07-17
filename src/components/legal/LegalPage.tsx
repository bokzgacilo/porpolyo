import {
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
import NextLink from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft, LuArrowUpRight } from "react-icons/lu";
import { brandFont } from "../../data/brand";
import { ColorModeButton } from "../ui/color-mode";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <Box as="main" minH="100svh" bg="bg" color="fg">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="docked"
        bg="bg/85"
        backdropFilter="blur(12px)"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Container maxW="6xl" py="3">
          <Flex align="center" justify="space-between" gap="4">
            <Link asChild textDecoration="none">
              <NextLink href="/">
                <Heading
                  as="span"
                  fontFamily={brandFont}
                  fontSize="2xl"
                  fontWeight="bold"
                  letterSpacing="-0.01em"
                  lineHeight="1"
                >
                  porpolyo
                </Heading>
              </NextLink>
            </Link>
            <HStack gap="2">
              <ColorModeButton />
              <Button asChild size="sm" variant="outline">
                <NextLink href="/">
                  <LuArrowLeft aria-hidden="true" /> Home
                </NextLink>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={{ base: 14, md: 20 }}>
          <Stack gap="5" maxW="3xl">
            <Text
              color="blue.solid"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              {eyebrow}
            </Text>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl" }}
              letterSpacing="-0.045em"
              lineHeight="1"
            >
              {title}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} lineHeight="1.8">
              {description}
            </Text>
            <Text color="fg.subtle" fontSize="sm">
              Effective and last updated: {lastUpdated}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 12, md: 18 }}>
        <GridLayout>
          <Box as="nav" aria-label={`${title} sections`} alignSelf="start">
            <Stack
              gap="1"
              position={{ md: "sticky" }}
              top={{ md: "88px" }}
              pb={{ base: 8, md: 0 }}
              borderBottomWidth={{ base: "1px", md: "0" }}
              borderColor="border"
            >
              <Text
                mb="2"
                color="fg.subtle"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.1em"
                textTransform="uppercase"
              >
                On this page
              </Text>
              {sections.map((section, index) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  py="1.5"
                  color="fg.muted"
                  fontSize="sm"
                  textDecoration="none"
                  _hover={{ color: "blue.solid" }}
                >
                  {index + 1}. {section.title}
                </Link>
              ))}
            </Stack>
          </Box>

          <Stack as="article" gap="0" minW="0">
            {sections.map((section, index) => (
              <Box
                key={section.id}
                id={section.id}
                scrollMarginTop="24"
                py={index === 0 ? { base: 0, md: 1 } : { base: 9, md: 11 }}
                pb={{ base: 9, md: 11 }}
                borderBottomWidth="1px"
                borderColor="border"
              >
                <Heading as="h2" mb="4" fontSize={{ base: "xl", md: "2xl" }}>
                  {index + 1}. {section.title}
                </Heading>
                <Stack gap="4" color="fg.muted" lineHeight="1.8">
                  {section.content}
                </Stack>
              </Box>
            ))}
          </Stack>
        </GridLayout>
      </Container>

      <Box as="footer" borderTopWidth="1px" borderColor="border" bg="bg.subtle">
        <Container maxW="6xl" py="8">
          <Flex
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            gap="5"
          >
            <Stack gap="1">
              <Text fontWeight="700">Questions or legal requests?</Text>
              <Link href="mailto:bokzgacilo@gmail.com" color="blue.solid">
                bokzgacilo@gmail.com
              </Link>
            </Stack>
            <HStack gap="5" flexWrap="wrap">
              <Link asChild color="fg.muted">
                <NextLink href="/privacy">Privacy Policy</NextLink>
              </Link>
              <Link asChild color="fg.muted">
                <NextLink href="/terms">Terms and Conditions</NextLink>
              </Link>
              <Link href="https://bokzgacilo.com" target="_blank" rel="noreferrer" color="fg.muted">
                Developer website <LuArrowUpRight aria-hidden="true" />
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

function GridLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "220px minmax(0, 1fr)" }}
      gap={{ base: 0, md: 14 }}
    >
      {children}
    </Box>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <Box as="ul" ps="5">
      {children}
    </Box>
  );
}

export function LegalListItem({ children }: { children: ReactNode }) {
  return (
    <Box as="li" mb="2" _last={{ mb: 0 }}>
      {children}
    </Box>
  );
}
