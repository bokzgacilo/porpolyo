import { Box, Text } from "@chakra-ui/react";
import { useEditorStore } from "../../store/editorStore";

export function HeadMetadataEditor() {
  const portfolio = useEditorStore((state) => state.portfolio);
  const updateHead = useEditorStore((state) => state.updateHead);
  if (!portfolio) return null;
  const head = portfolio.head;

  return (
    <Box as="section" className="head-editor">
      <Box className="head-editor-panel">
        <Text as="strong">Page Head</Text>
        <Text as="p">Metadata saved into the portfolio JSON and used for published portfolio pages.</Text>
        <div className="head-form-grid">
          <HeadField label="Title" value={head.title} onChange={(title) => updateHead({ title })} />
          <HeadField label="Description" value={head.description} onChange={(description) => updateHead({ description })} textarea />
          <HeadField label="Keywords" value={head.keywords || ""} onChange={(keywords) => updateHead({ keywords })} />
          <HeadField label="Author" value={head.author || ""} onChange={(author) => updateHead({ author })} />
          <HeadField label="Canonical URL" value={head.canonicalUrl || ""} onChange={(canonicalUrl) => updateHead({ canonicalUrl })} />
          <HeadField label="Favicon URL" value={head.favicon || ""} onChange={(favicon) => updateHead({ favicon })} />
          <HeadField label="Open Graph title" value={head.ogTitle || ""} onChange={(ogTitle) => updateHead({ ogTitle })} />
          <HeadField label="Open Graph description" value={head.ogDescription || ""} onChange={(ogDescription) => updateHead({ ogDescription })} textarea />
          <HeadField label="Open Graph image" value={head.ogImage || ""} onChange={(ogImage) => updateHead({ ogImage })} />
          <label className="field">
            <span>Robots</span>
            <select
              value={head.robots || "index,follow"}
              onChange={(event) => updateHead({ robots: event.target.value as "index,follow" | "noindex,nofollow" })}
            >
              <option value="index,follow">index,follow</option>
              <option value="noindex,nofollow">noindex,nofollow</option>
            </select>
          </label>
        </div>
      </Box>
    </Box>
  );
}

function HeadField({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
