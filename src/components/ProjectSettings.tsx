import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  BarChart3,
  Copy,
  ExternalLink,
  FileJson,
  ImagePlus,
  Link2,
  Save,
  Settings,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { palettes, templates } from "../data/templates";
import { getProjectAnalytics } from "../lib/projects";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { ImageAsset, Portfolio } from "../types/portfolio";
import { JsonModal } from "./editor/JsonModal";

type UtmForm = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

export function ProjectSettings({
  portfolio,
  onBack,
  onChange,
  onSave,
  onDelete,
}: {
  portfolio: Portfolio;
  onBack: () => void;
  onChange: (portfolio: Portfolio) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const [origin, setOrigin] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"project" | "editor">("project");
  const [analytics, setAnalytics] = useState<number[]>(Array.from({ length: 30 }, () => 0));
  const [utm, setUtm] = useState<UtmForm>({
    source: "twitter",
    medium: "social",
    campaign: "portfolio_launch",
    content: "",
    term: "",
  });
  useEffect(() => setOrigin(window.location.origin), []);

  const publicPath = `${origin}/${portfolio.owner.username}`;
  const publicUrl = portfolio.settings.customDomain?.trim()
    ? `https://${portfolio.settings.customDomain.trim()}`
    : publicPath;
  const utmUrl = buildUtmUrl(publicUrl, utm);
  const ogImage = portfolio.head.ogImage || portfolio.head.twitterImage || portfolio.owner.profileImage?.url || "";
  const twitterImage = portfolio.head.twitterImage || portfolio.head.ogImage || portfolio.owner.profileImage?.url || "";
  const editorSettings = portfolio.settings.editor || {};
  const propertiesPanelMinWidth = editorSettings.propertiesPanelMinWidth ?? 280;
  const propertiesPanelMaxWidth = editorSettings.propertiesPanelMaxWidth ?? 520;
  const propertiesPanelWidth = clampNumber(editorSettings.propertiesPanelWidth ?? 340, propertiesPanelMinWidth, propertiesPanelMaxWidth);

  const updatePortfolio = (updates: Partial<Portfolio>) => onChange({ ...portfolio, ...updates });
  const updateHead = (updates: Partial<Portfolio["head"]>) => onChange({ ...portfolio, head: { ...portfolio.head, ...updates } });
  const updateSettings = (updates: Partial<Portfolio["settings"]>) =>
    onChange({ ...portfolio, settings: { ...portfolio.settings, ...updates } });
  const updateEditorSettings = (updates: NonNullable<Portfolio["settings"]["editor"]>) =>
    updateSettings({ editor: { ...portfolio.settings.editor, ...updates } });
  const updateOwner = (updates: Partial<Portfolio["owner"]>) =>
    onChange({ ...portfolio, owner: { ...portfolio.owner, ...updates } });

  useEffect(() => {
    let cancelled = false;
    const loadAnalytics = async () => {
      try {
        const values = await getProjectAnalytics(portfolio.id);
        if (!cancelled) setAnalytics(values);
      } catch {
        if (!cancelled) setAnalytics(Array.from({ length: 30 }, () => 0));
      }
    };
    void loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [portfolio.id]);

  const uploadPreviewImage = async (file?: File, target: "open-graph" | "twitter" = "open-graph") => {
    if (!file) return;
    let image: ImageAsset;
    try {
      image = await uploadImageToSupabase({
        file,
        projectId: portfolio.id,
        slot: `${target}-preview`,
        alt: `${portfolio.title} social preview`,
        label: `Uploading ${target === "twitter" ? "Twitter" : "Open Graph"} preview image`,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
      return;
    }
    if (target === "twitter") {
      updateHead({ twitterImage: image.url });
      return;
    }
    updateHead({ ogImage: image.url });
  };

  return (
    <Box as="main" className="settings-page" bg="bg.subtle" color="fg.default">
      <Flex as="header" className="settings-header" align="center" justify="space-between" gap="3">
        <HStack gap="3">
          <Button onClick={onBack} size="sm" variant="outline"><ArrowLeft size={16} /> Editor</Button>
          <Box>
            <Text as="strong" fontSize="sm">Project settings</Text>
            <Text as="p" color="fg.muted" fontSize="xs">{portfolio.title}</Text>
          </Box>
        </HStack>
        <HStack gap="2">
          <Button onClick={() => setShowJson(true)} size="sm" variant="outline"><FileJson size={16} /> JSON</Button>
          <Button onClick={onSave} size="sm" colorPalette="blue"><Save size={16} /> Save settings</Button>
        </HStack>
      </Flex>

      <HStack className="settings-tabs" gap="2">
        <Button
          onClick={() => setActiveSettingsTab("project")}
          size="sm"
          variant={activeSettingsTab === "project" ? "solid" : "outline"}
        >
          <Settings size={16} /> Project settings
        </Button>
        <Button
          onClick={() => setActiveSettingsTab("editor")}
          size="sm"
          variant={activeSettingsTab === "editor" ? "solid" : "outline"}
        >
          <SlidersHorizontal size={16} /> Editor settings
        </Button>
      </HStack>

      {activeSettingsTab === "project" ? (
      <Grid className="settings-grid" gap="5">
        <SettingsSection icon={<Settings size={18} />} title="Project">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <SettingsField label="Project name" value={portfolio.title} onChange={(title) => updatePortfolio({ title })} />
            <SettingsField label="Published username / slug" value={portfolio.owner.username} onChange={(username) => updateOwner({ username: slugify(username) })} />
            <label className="field">
              <span>Template</span>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field value={portfolio.templateId} onChange={(event) => updatePortfolio({ templateId: event.target.value })}>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </label>
            <label className="field">
              <span>Color palette</span>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field value={portfolio.paletteId} onChange={(event) => updatePortfolio({ paletteId: event.target.value })}>
                  {palettes.map((palette) => <option key={palette.id} value={palette.id}>{palette.name}</option>)}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </label>
            <SettingsField label="Public URL" value={publicPath} readOnly />
            <SettingsField label="Custom domain placeholder" value={portfolio.settings.customDomain || ""} onChange={(customDomain) => updateSettings({ customDomain })} placeholder="portfolio.example.com" />
          </SimpleGrid>
        </SettingsSection>

        <SettingsSection icon={<ExternalLink size={18} />} title="LinkedIn / Open Graph Preview">
          <SocialPreview
            title={portfolio.head.ogTitle || portfolio.head.title}
            description={portfolio.head.ogDescription || portfolio.head.description}
            image={ogImage}
            url={publicUrl}
          />
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <SettingsField label="Preview title" value={portfolio.head.ogTitle || ""} onChange={(ogTitle) => updateHead({ ogTitle })} />
            <SettingsField label="Preview description" value={portfolio.head.ogDescription || ""} onChange={(ogDescription) => updateHead({ ogDescription })} textarea />
            <SettingsField label="Preview image URL" value={portfolio.head.ogImage || ""} onChange={(ogImage) => updateHead({ ogImage })} />
            <UploadField label="Upload / replace preview image" onUpload={(file) => uploadPreviewImage(file, "open-graph")} />
          </SimpleGrid>
        </SettingsSection>

        <SettingsSection icon={<ExternalLink size={18} />} title="Twitter Preview">
          <TwitterPreview
            title={portfolio.head.twitterTitle || portfolio.head.ogTitle || portfolio.head.title}
            description={portfolio.head.twitterDescription || portfolio.head.ogDescription || portfolio.head.description}
            image={twitterImage}
            url={publicUrl}
          />
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <SettingsField label="Twitter title" value={portfolio.head.twitterTitle || ""} onChange={(twitterTitle) => updateHead({ twitterTitle })} />
            <SettingsField label="Twitter description" value={portfolio.head.twitterDescription || ""} onChange={(twitterDescription) => updateHead({ twitterDescription })} textarea />
            <SettingsField label="Twitter image URL" value={portfolio.head.twitterImage || ""} onChange={(twitterImage) => updateHead({ twitterImage })} />
            <UploadField label="Upload / replace Twitter image" onUpload={(file) => uploadPreviewImage(file, "twitter")} />
          </SimpleGrid>
        </SettingsSection>

        <SettingsSection icon={<BarChart3 size={18} />} title="Analytics">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
            <MetricCard label="Last 7 days" value={sum(analytics.slice(-7))} />
            <MetricCard label="Last 30 days" value={sum(analytics)} />
            <MetricCard label="Daily average" value={Math.round(sum(analytics) / analytics.length)} />
          </SimpleGrid>
          <AnalyticsGraph values={analytics} />
        </SettingsSection>

        <SettingsSection icon={<Link2 size={18} />} title="UTM Tracker">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <SettingsField label="Source" value={utm.source} onChange={(source) => setUtm((current) => ({ ...current, source }))} placeholder="twitter" />
            <SettingsField label="Medium" value={utm.medium} onChange={(medium) => setUtm((current) => ({ ...current, medium }))} placeholder="social" />
            <SettingsField label="Campaign" value={utm.campaign} onChange={(campaign) => setUtm((current) => ({ ...current, campaign }))} placeholder="portfolio_launch" />
            <SettingsField label="Content" value={utm.content} onChange={(content) => setUtm((current) => ({ ...current, content }))} placeholder="profile_link" />
            <SettingsField label="Term" value={utm.term} onChange={(term) => setUtm((current) => ({ ...current, term }))} placeholder="optional keyword" />
          </SimpleGrid>
          <Box className="utm-output">
            <Text as="span">
              {utmUrl || "Enter a valid custom domain to generate a tracking URL."}
            </Text>
            <Button
              size="sm"
              variant="outline"
              disabled={!utmUrl}
              onClick={() => navigator.clipboard?.writeText(utmUrl)}
            >
              <Copy size={16} /> Copy URL
            </Button>
          </Box>
        </SettingsSection>

        <SettingsSection icon={<Trash2 size={18} />} title="Danger Zone">
          <Text color="fg.muted" fontSize="sm">Delete this project and remove it from the dashboard. This cannot be undone.</Text>
          <Button alignSelf="flex-start" colorPalette="red" onClick={onDelete} variant="outline">
            <Trash2 size={16} /> Delete project
          </Button>
        </SettingsSection>
      </Grid>
      ) : (
        <Grid className="settings-grid" gap="5">
          <SettingsSection icon={<SlidersHorizontal size={18} />} title="Editor Settings">
            <Text color="fg.muted" fontSize="sm">
              These settings control the builder interface for this portfolio. The properties panel width is clamped between the min and max values below.
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
              <SettingsNumberField
                label="Properties panel min width"
                max={propertiesPanelMaxWidth}
                min={220}
                value={propertiesPanelMinWidth}
                onChange={(propertiesPanelMinWidth) => {
                  const nextMin = propertiesPanelMinWidth ?? 280;
                  updateEditorSettings({
                    propertiesPanelMinWidth: nextMin,
                    propertiesPanelWidth: clampNumber(propertiesPanelWidth, nextMin, propertiesPanelMaxWidth),
                  });
                }}
              />
              <SettingsNumberField
                label="Properties panel width"
                max={propertiesPanelMaxWidth}
                min={propertiesPanelMinWidth}
                value={propertiesPanelWidth}
                onChange={(propertiesPanelWidth) =>
                  updateEditorSettings({
                    propertiesPanelWidth: clampNumber(propertiesPanelWidth ?? 340, propertiesPanelMinWidth, propertiesPanelMaxWidth),
                  })
                }
              />
              <SettingsNumberField
                label="Properties panel max width"
                max={760}
                min={propertiesPanelMinWidth}
                value={propertiesPanelMaxWidth}
                onChange={(propertiesPanelMaxWidth) => {
                  const nextMax = propertiesPanelMaxWidth ?? 520;
                  updateEditorSettings({
                    propertiesPanelMaxWidth: nextMax,
                    propertiesPanelWidth: clampNumber(propertiesPanelWidth, propertiesPanelMinWidth, nextMax),
                  });
                }}
              />
            </SimpleGrid>
          </SettingsSection>
        </Grid>
      )}

      {showJson && <JsonModal portfolio={portfolio} onClose={() => setShowJson(false)} />}
    </Box>
  );
}

function SettingsSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Stack as="section" className="settings-section" gap="4">
      <HStack gap="2">
        {icon}
        <Text as="strong">{title}</Text>
      </HStack>
      {children}
    </Stack>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} />
      )}
    </label>
  );
}

function SettingsNumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      />
      {(min !== undefined || max !== undefined) && (
        <small>
          {min !== undefined ? `Min ${min}px` : ""}{min !== undefined && max !== undefined ? " · " : ""}{max !== undefined ? `Max ${max}px` : ""}
        </small>
      )}
    </label>
  );
}

function UploadField({ label, onUpload }: { label: string; onUpload: (file?: File) => void }) {
  return (
    <label className="upload-slot settings-upload">
      <ImagePlus size={18} />
      <span>{label}</span>
      <input type="file" accept="image/*" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

function SocialPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  return (
    <Box className="social-preview-card">
      <Box className="social-preview-image">{image ? <img src={image} alt="" /> : <span>Preview image</span>}</Box>
      <Box className="social-preview-body">
        <Text as="small">{url.replace(/^https?:\/\//, "")}</Text>
        <Text as="strong">{title || "Portfolio preview title"}</Text>
        <Text as="p">{description || "Preview description for LinkedIn and other Open Graph surfaces."}</Text>
      </Box>
    </Box>
  );
}

function TwitterPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  return (
    <Box className="twitter-preview-card">
      <Box className="twitter-preview-image">{image ? <img src={image} alt="" /> : <span>Twitter image</span>}</Box>
      <Box className="twitter-preview-body">
        <Text as="strong">{title || "Portfolio preview title"}</Text>
        <Text as="p">{description || "Preview description for Twitter/X cards."}</Text>
        <Text as="small">{url.replace(/^https?:\/\//, "")}</Text>
      </Box>
    </Box>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Box className="metric-card">
      <Text as="span">{label}</Text>
      <Text as="strong">{value.toLocaleString()}</Text>
    </Box>
  );
}

function AnalyticsGraph({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <Box className="analytics-graph" aria-label="Portfolio views over the last 30 days">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} title={`Day ${index + 1}: ${value} views`} style={{ height: `${Math.max((value / max) * 100, 6)}%` }} />
      ))}
    </Box>
  );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function buildUtmUrl(baseUrl: string, form: UtmForm) {
  const value = baseUrl.trim();
  if (!value) return "";

  const isRelative = value.startsWith("/");
  if (!isRelative && !/^https?:\/\//i.test(value)) return "";

  let url: URL;
  try {
    url = new URL(value, "https://portfolio.local");
  } catch {
    return "";
  }

  const params: Record<string, string> = {
    utm_source: form.source,
    utm_medium: form.medium,
    utm_campaign: form.campaign,
    utm_content: form.content,
    utm_term: form.term,
  };
  Object.entries(params).forEach(([key, value]) => {
    if (value.trim()) url.searchParams.set(key, value.trim());
  });
  return isRelative
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
