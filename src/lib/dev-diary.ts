import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type DevDiaryEntry = {
  day: number;
  slug: string;
  label: string;
  title: string;
  summary: string;
  sourceFile: string;
  markdown: string;
};

const diaryDirectory = path.join(process.cwd(), "src/content/dev-diary");

function parseFrontmatter(source: string, filename: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Invalid frontmatter in ${filename}`);
  }

  const metadata = Object.fromEntries(
    match[1]
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");

        if (separator === -1) {
          throw new Error(`Invalid metadata line in ${filename}: ${line}`);
        }

        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );

  return { metadata, body: match[2] };
}

function parseDiaryEntry(filename: string): DevDiaryEntry {
  const source = readFileSync(path.join(diaryDirectory, filename), "utf8");
  const { metadata, body } = parseFrontmatter(source, filename);
  const day = Number(metadata.day);

  if (
    !Number.isInteger(day) ||
    !metadata.slug ||
    !metadata.label ||
    !metadata.title ||
    !metadata.summary
  ) {
    throw new Error(`Missing or invalid diary metadata in ${filename}`);
  }

  return {
    day,
    slug: metadata.slug,
    label: metadata.label,
    title: metadata.title,
    summary: metadata.summary,
    sourceFile: filename,
    markdown: body.trim(),
  };
}

export function getDevDiaryEntries(): DevDiaryEntry[] {
  return readdirSync(diaryDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map(parseDiaryEntry)
    .sort((a, b) => b.day - a.day);
}
