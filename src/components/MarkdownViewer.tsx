import type { ReactNode } from "react";
import {
  Box,
  Code,
  Heading,
  Link,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";

export function MarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <Stack gap={6} className="markdown-viewer">
      {renderBlocks(markdown)}
    </Stack>
  );
}

function renderBlocks(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <Box
          as="pre"
          key={`code-${index}`}
          overflowX="auto"
          rounded="lg"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border"
          p={4}
          fontSize="sm"
        >
          {language && (
            <Text color="fg.muted" fontSize="xs" mb={3}>
              {language}
            </Text>
          )}
          <Code bg="transparent" whiteSpace="pre">
            {code.join("\n")}
          </Code>
        </Box>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 6) as 2 | 3 | 4 | 5 | 6;
      blocks.push(
        <Heading
          as={`h${level}` as "h2" | "h3" | "h4" | "h5" | "h6"}
          key={`heading-${index}`}
          fontSize={level <= 3 ? { base: "xl", md: "2xl" } : "lg"}
          letterSpacing="-0.02em"
          pt={2}
        >
          {renderInline(heading[2])}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <List.Root key={`list-${index}`} gap={3} ps={5}>
          {items.map((item, itemIndex) => (
            <List.Item key={`${item}-${itemIndex}`} color="fg.muted" ps={1}>
              {renderInline(item)}
            </List.Item>
          ))}
        </List.Root>,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <Text key={`paragraph-${index}`} color="fg.muted" lineHeight="1.8">
        {renderInline(paragraph.join(" "))}
      </Text>,
    );
  }

  return blocks;
}

function renderInline(source: string): ReactNode[] {
  const tokens = source.split(/(\*\*.+?\*\*|`.+?`|\[.+?\]\(.+?\))/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <Text as="strong" key={`${token}-${index}`} color="fg" fontWeight="700">
          {token.slice(2, -2)}
        </Text>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <Code key={`${token}-${index}`}>{token.slice(1, -1)}</Code>;
    }
    const link = token.match(/^\[(.+?)\]\((.+?)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <Link
          key={`${token}-${index}`}
          href={link[2]}
          color="blue.fg"
          textDecoration="underline"
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {link[1]}
        </Link>
      );
    }
    return token;
  });
}
