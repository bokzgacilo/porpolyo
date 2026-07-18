import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  FileJson,
  Keyboard,
  Link2,
  Save,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { palettes, templates } from "../data/templates";
import { getProjectAnalytics } from "../lib/projects";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { ImageAsset, Portfolio } from "../types/portfolio";
import { JsonModal } from "./editor/JsonModal";
import { ImageUploadDropzone } from "./inputs";
import { Tooltip } from "./ui/tooltip";
import { useSaveFeedback } from "../hooks/useSaveFeedback";

const AnalyticsChart = dynamic(() =>
  import("./settings/AnalyticsChart").then((module) => module.AnalyticsChart),
);

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
  onSave: () => void | Promise<void>;
  onDelete: () => void;
}) {
  const [origin, setOrigin] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "project" | "metrics" | "seo" | "editor"
  >("project");
  const [analytics, setAnalytics] = useState<number[]>(Array.from({ length: 30 }, () => 0));
  const [utm, setUtm] = useState<UtmForm>({
    source: "twitter",
    medium: "social",
    campaign: "portfolio_launch",
    content: "",
    term: "",
  });
  const { save, status: saveStatus } = useSaveFeedback(onSave);
  useEffect(() => setOrigin(window.location.origin), []);

  const saveTooltip =
    saveStatus === "saving"
      ? "Saving project settings…"
      : saveStatus === "saved"
        ? "Project settings saved"
        : saveStatus === "error"
          ? "Settings could not be saved. Try again."
          : "Save project settings";

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
    <Box as="main" minH="100svh" bg="bg.subtle" color="fg">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        borderBottom="1px solid"
        borderColor="border"
        bg="bg"
      >
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Flex minH="16" align="center" justify="space-between" gap="4">
            <HStack minW="0" gap="3">
              <Button
                aria-label="Back to editor"
                onClick={onBack}
                size="sm"
                variant="ghost"
              >
                <ArrowLeft size={16} />
                <Text display={{ base: "none", sm: "inline" }}>Editor</Text>
              </Button>
              <Box minW="0" borderLeft="1px solid" borderColor="border" ps="3">
                <Text fontWeight="semibold" fontSize="sm" truncate>
                  Settings
                </Text>
                <Text color="fg.muted" fontSize="xs" truncate>
                  {portfolio.title}
                </Text>
              </Box>
            </HStack>
            <HStack flexShrink="0" gap="2">
              <Button
                aria-label="View project JSON"
                onClick={() => setShowJson(true)}
                size="sm"
                variant="ghost"
              >
                <FileJson size={16} />
                <Text display={{ base: "none", sm: "inline" }}>JSON</Text>
              </Button>
              <Tooltip content={saveTooltip} showArrow openDelay={200}>
                <Button
                  aria-label={saveTooltip}
                  onClick={() => void save()}
                  size="sm"
                  colorPalette="blue"
                  loading={saveStatus === "saving"}
                  loadingText="Saving"
                >
                  {saveStatus === "saved" ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  <Text display={{ base: "none", sm: "inline" }}>
                    {saveStatus === "saved" ? "Settings saved" : "Save changes"}
                  </Text>
                  <Text display={{ base: "inline", sm: "none" }}>
                    {saveStatus === "saved" ? "Saved" : "Save"}
                  </Text>
                </Button>
              </Tooltip>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 5, md: 9 }}>
        <Grid
          templateColumns={{ base: "minmax(0, 1fr)", lg: "220px minmax(0, 1fr)" }}
          gap={{ base: 6, lg: 12 }}
          alignItems="start"
        >
          <SettingsNavigation
            active={activeSettingsTab}
            onChange={setActiveSettingsTab}
          />

          <Stack minW="0" gap={{ base: 5, md: 7 }}>
            <SettingsIntro tab={activeSettingsTab} />

            <Stack
              gap="0"
              overflow="hidden"
              rounded={{ base: "xl", md: "2xl" }}
              border="1px solid"
              borderColor="border"
              bg="bg.panel"
              shadow="xs"
            >
              {activeSettingsTab === "project" && (
                <>
                  <SettingsSection
                    icon={Settings}
                    title="Project details"
                    description="The identity and public address used across the dashboard and published site."
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
                      <SettingsField
                        label="Project name"
                        value={portfolio.title}
                        onChange={(title) => updatePortfolio({ title })}
                      />
                      <SettingsField
                        label="Published username / slug"
                        value={portfolio.owner.username}
                        onChange={(username) =>
                          updateOwner({ username: slugify(username) })
                        }
                      />
                      <SettingsSelect
                        label="Template"
                        value={portfolio.templateId}
                        onChange={(templateId) => updatePortfolio({ templateId })}
                        options={templates.map((template) => ({
                          label: template.name,
                          value: template.id,
                        }))}
                      />
                      <SettingsSelect
                        label="Color palette"
                        value={portfolio.paletteId}
                        onChange={(paletteId) => updatePortfolio({ paletteId })}
                        options={palettes.map((palette) => ({
                          label: palette.name,
                          value: palette.id,
                        }))}
                      />
                      <SettingsField
                        label="Public URL"
                        value={publicPath}
                        readOnly
                        help="Generated from your published username."
                      />
                      <SettingsField
                        label="Custom domain"
                        value={portfolio.settings.customDomain || ""}
                        onChange={(customDomain) => updateSettings({ customDomain })}
                        placeholder="portfolio.example.com"
                        help="Domain connection is shown as a placeholder for now."
                      />
                    </SimpleGrid>
                  </SettingsSection>

                  <SettingsSection
                    icon={Trash2}
                    title="Delete project"
                    description="Permanently remove this project and its dashboard entry."
                    tone="danger"
                    last
                  >
                    <HStack
                      align={{ base: "stretch", sm: "center" }}
                      justify="space-between"
                      flexDir={{ base: "column", sm: "row" }}
                      gap="4"
                    >
                      <Text color="fg.muted" fontSize="sm" maxW="lg">
                        This action cannot be undone. Export the project JSON first
                        if you need a backup.
                      </Text>
                      <Button
                        flexShrink="0"
                        colorPalette="red"
                        onClick={onDelete}
                        variant="outline"
                      >
                        <Trash2 size={16} /> Delete project
                      </Button>
                    </HStack>
                  </SettingsSection>
                </>
              )}

              {activeSettingsTab === "metrics" && (
                <>
                  <SettingsSection
                    icon={BarChart3}
                    title="Portfolio views"
                    description="A rolling 30-day view of traffic to this published portfolio."
                  >
                    <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                      <MetricCard label="Last 7 days" value={sum(analytics.slice(-7))} />
                      <MetricCard label="Last 30 days" value={sum(analytics)} />
                      <MetricCard
                        label="Daily average"
                        value={Math.round(sum(analytics) / analytics.length)}
                      />
                    </SimpleGrid>
                    <Box mt="6" minW="0">
                      <AnalyticsChart values={analytics} />
                    </Box>
                  </SettingsSection>

                  <SettingsSection
                    icon={Link2}
                    title="Campaign URL"
                    description="Add UTM parameters before sharing your portfolio."
                    last
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
                      <SettingsField label="Source" value={utm.source} onChange={(source) => setUtm((current) => ({ ...current, source }))} placeholder="twitter" />
                      <SettingsField label="Medium" value={utm.medium} onChange={(medium) => setUtm((current) => ({ ...current, medium }))} placeholder="social" />
                      <SettingsField label="Campaign" value={utm.campaign} onChange={(campaign) => setUtm((current) => ({ ...current, campaign }))} placeholder="portfolio_launch" />
                      <SettingsField label="Content" value={utm.content} onChange={(content) => setUtm((current) => ({ ...current, content }))} placeholder="profile_link" />
                      <SettingsField label="Term" value={utm.term} onChange={(term) => setUtm((current) => ({ ...current, term }))} placeholder="optional keyword" />
                    </SimpleGrid>
                    <Flex
                      mt="5"
                      align={{ base: "stretch", sm: "center" }}
                      justify="space-between"
                      direction={{ base: "column", sm: "row" }}
                      gap="3"
                      p="4"
                      rounded="lg"
                      border="1px solid"
                      borderColor="blue.muted"
                      bg="blue.subtle"
                    >
                      <Text minW="0" overflowWrap="anywhere" color="blue.fg" fontSize="sm" fontWeight="medium">
                        {utmUrl || "Enter a valid custom domain to generate a tracking URL."}
                      </Text>
                      <Button size="sm" variant="outline" disabled={!utmUrl} onClick={() => navigator.clipboard?.writeText(utmUrl)}>
                        <Copy size={16} /> Copy URL
                      </Button>
                    </Flex>
                  </SettingsSection>
                </>
              )}

              {activeSettingsTab === "seo" && (
                <>
                  <SettingsSection
                    icon={ExternalLink}
                    title="Open Graph"
                    description="Preview the link card used by LinkedIn and other social platforms."
                  >
                    <SocialPreview
                      title={portfolio.head.ogTitle || portfolio.head.title}
                      description={portfolio.head.ogDescription || portfolio.head.description}
                      image={ogImage}
                      url={publicUrl}
                    />
                    <SimpleGrid mt="6" columns={{ base: 1, md: 2 }} gap="5">
                      <SettingsField label="Preview title" value={portfolio.head.ogTitle || ""} onChange={(ogTitle) => updateHead({ ogTitle })} />
                      <SettingsField label="Preview description" value={portfolio.head.ogDescription || ""} onChange={(ogDescription) => updateHead({ ogDescription })} textarea />
                      <SettingsField label="Preview image URL" value={portfolio.head.ogImage || ""} onChange={(ogImage) => updateHead({ ogImage })} />
                      <UploadField label="Upload / replace preview image" onUpload={(file) => uploadPreviewImage(file, "open-graph")} />
                    </SimpleGrid>
                  </SettingsSection>

                  <SettingsSection
                    icon={ExternalLink}
                    title="X / Twitter card"
                    description="Control the title, copy, and image shown when the portfolio is shared."
                    last
                  >
                    <TwitterPreview
                      title={portfolio.head.twitterTitle || portfolio.head.ogTitle || portfolio.head.title}
                      description={portfolio.head.twitterDescription || portfolio.head.ogDescription || portfolio.head.description}
                      image={twitterImage}
                      url={publicUrl}
                    />
                    <SimpleGrid mt="6" columns={{ base: 1, md: 2 }} gap="5">
                      <SettingsField label="Twitter title" value={portfolio.head.twitterTitle || ""} onChange={(twitterTitle) => updateHead({ twitterTitle })} />
                      <SettingsField label="Twitter description" value={portfolio.head.twitterDescription || ""} onChange={(twitterDescription) => updateHead({ twitterDescription })} textarea />
                      <SettingsField label="Twitter image URL" value={portfolio.head.twitterImage || ""} onChange={(twitterImage) => updateHead({ twitterImage })} />
                      <UploadField label="Upload / replace Twitter image" onUpload={(file) => uploadPreviewImage(file, "twitter")} />
                    </SimpleGrid>
                  </SettingsSection>
                </>
              )}

              {activeSettingsTab === "editor" && (
                <>
                  <SettingsSection
                    icon={SlidersHorizontal}
                    title="Editor interface"
                    description="Adjust control density and choose which canvas guidance appears while editing."
                  >
                    <SettingsSelect
                      label="Panel size"
                      value={editorSettings.panelSize ?? "default"}
                      maxW="sm"
                      help="Small fits more controls; Large improves readability and touch targets."
                      onChange={(panelSize) =>
                        updateEditorSettings({
                          panelSize: panelSize as NonNullable<Portfolio["settings"]["editor"]>["panelSize"],
                        })
                      }
                      options={[
                        { value: "small", label: "Small (−1 px)" },
                        { value: "default", label: "Default" },
                        { value: "large", label: "Large (+1 px)" },
                      ]}
                    />
                    <Stack mt="6" gap="0" border="1px solid" borderColor="border" rounded="xl" overflow="hidden">
                      <PreferenceRow label="Always open the editor tour" description="Start the guided panel walkthrough whenever this builder opens." checked={editorSettings.alwaysOpenTour ?? false} onChange={(alwaysOpenTour) => updateEditorSettings({ alwaysOpenTour })} />
                      <PreferenceRow label="Show structure overlay" description="Display selection outlines and hover guides on canvas elements." checked={editorSettings.showStructureOverlay ?? true} onChange={(showStructureOverlay) => updateEditorSettings({ showStructureOverlay })} experimental />
                      <PreferenceRow label="Show box model overlay" description="Display margin and padding guides around the selected canvas element." checked={editorSettings.showBoxModelOverlay ?? true} onChange={(showBoxModelOverlay) => updateEditorSettings({ showBoxModelOverlay })} experimental />
                      <PreferenceRow label="Show Structure tab" description="Show the selected element's layout structure preview in properties." checked={editorSettings.showStructureTab ?? true} onChange={(showStructureTab) => updateEditorSettings({ showStructureTab })} experimental />
                      <PreferenceRow label="Show Box Model tab" description="Show margin, border, and padding details. Disable both tab settings to remove the tab strip." checked={editorSettings.showBoxModelTab ?? true} onChange={(showBoxModelTab) => updateEditorSettings({ showBoxModelTab })} experimental last />
                    </Stack>
                  </SettingsSection>

                  <SettingsSection
                    icon={SlidersHorizontal}
                    title="Panel dimensions"
                    description="Keep the properties panel within a comfortable range for this project."
                  >
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap="5">
                      <SettingsNumberField label="Minimum width" max={propertiesPanelMaxWidth} min={220} value={propertiesPanelMinWidth} onChange={(value) => { const nextMin = value ?? 280; updateEditorSettings({ propertiesPanelMinWidth: nextMin, propertiesPanelWidth: clampNumber(propertiesPanelWidth, nextMin, propertiesPanelMaxWidth) }); }} />
                      <SettingsNumberField label="Default width" max={propertiesPanelMaxWidth} min={propertiesPanelMinWidth} value={propertiesPanelWidth} onChange={(value) => updateEditorSettings({ propertiesPanelWidth: clampNumber(value ?? 340, propertiesPanelMinWidth, propertiesPanelMaxWidth) })} />
                      <SettingsNumberField label="Maximum width" max={760} min={propertiesPanelMinWidth} value={propertiesPanelMaxWidth} onChange={(value) => { const nextMax = value ?? 520; updateEditorSettings({ propertiesPanelMaxWidth: nextMax, propertiesPanelWidth: clampNumber(propertiesPanelWidth, propertiesPanelMinWidth, nextMax) }); }} />
                    </SimpleGrid>
                  </SettingsSection>

                  <SettingsSection
                    icon={Keyboard}
                    title="Keyboard shortcuts"
                    description="Current editor bindings are available for reference."
                    last
                  >
                    <HStack mb="4" justify="flex-end">
                      <Badge variant="subtle">Read-only</Badge>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="2">
                      <ShortcutRow action="Zoom in" keys="⌘/Ctrl/Alt + +" />
                      <ShortcutRow action="Zoom out" keys="⌘/Ctrl/Alt + −" />
                      <ShortcutRow action="Pan canvas" keys="Space + drag" />
                      <ShortcutRow action="Deselect element" keys="Esc" />
                      <ShortcutRow action="Duplicate element" keys="⌘/Ctrl + D" />
                      <ShortcutRow action="Remove element" keys="Delete / Backspace" />
                      <ShortcutRow action="Bold selected text" keys="⌘/Ctrl + B" />
                      <ShortcutRow action="Open layer menu" keys="Shift + F10" />
                      <ShortcutRow action="Select tree layer" keys="Enter / Space" />
                      <ShortcutRow action="Expand or collapse layer" keys="← / →" />
                      <ShortcutRow action="Move layer up or down" keys="Alt + ↑ / ↓" />
                      <ShortcutRow action="Move layer to section root" keys="Alt + Shift + ←" />
                    </SimpleGrid>
                  </SettingsSection>
                </>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Container>

      {showJson && (
        <JsonModal portfolio={portfolio} onClose={() => setShowJson(false)} />
      )}
    </Box>
  );
}

type SettingsTab = "project" | "metrics" | "seo" | "editor";

const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "project", label: "Project", icon: Settings },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "seo", label: "SEO / social", icon: Search },
  { id: "editor", label: "Editor", icon: SlidersHorizontal },
];

const settingsIntro: Record<
  SettingsTab,
  { eyebrow: string; title: string; description: string }
> = {
  project: {
    eyebrow: "Project",
    title: "General settings",
    description: "Manage the identity, appearance, and public address for this portfolio.",
  },
  metrics: {
    eyebrow: "Performance",
    title: "Metrics and tracking",
    description: "Review recent traffic and prepare campaign links for sharing.",
  },
  seo: {
    eyebrow: "Discovery",
    title: "SEO and social previews",
    description: "Control how the portfolio appears when it is shared across the web.",
  },
  editor: {
    eyebrow: "Workspace",
    title: "Editor preferences",
    description: "Tune the builder interface without changing the published portfolio.",
  },
};

function SettingsNavigation({
  active,
  onChange,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <Box
      as="nav"
      aria-label="Settings categories"
      position={{ base: "static", lg: "sticky" }}
      top={{ lg: "24" }}
      minW="0"
    >
      <Text
        display={{ base: "none", lg: "block" }}
        mb="3"
        px="3"
        color="fg.muted"
        fontSize="xs"
        fontWeight="semibold"
        letterSpacing="wide"
        textTransform="uppercase"
      >
        Settings
      </Text>
      <Flex
        gap="1"
        direction={{ base: "row", lg: "column" }}
        overflowX={{ base: "auto", lg: "visible" }}
        pb={{ base: "1", lg: "0" }}
      >
        {settingsTabs.map((item) => {
          const selected = active === item.id;
          return (
            <Button
              key={item.id}
              flex={{ base: "0 0 auto", lg: "initial" }}
              justifyContent="flex-start"
              size="sm"
              variant="ghost"
              bg={selected ? "blue.subtle" : "transparent"}
              color={selected ? "blue.fg" : "fg.muted"}
              fontWeight={selected ? "semibold" : "medium"}
              aria-current={selected ? "page" : undefined}
              onClick={() => onChange(item.id)}
              _hover={{ bg: selected ? "blue.subtle" : "bg.muted", color: "fg" }}
              transition="background 120ms ease, color 120ms ease"
            >
              <item.icon size={16} /> {item.label}
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
}

function SettingsIntro({ tab }: { tab: SettingsTab }) {
  const content = settingsIntro[tab];
  return (
    <Stack gap="2">
      <Text color="blue.fg" fontSize="xs" fontWeight="semibold" letterSpacing="wide" textTransform="uppercase">
        {content.eyebrow}
      </Text>
      <Heading as="h1" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight">
        {content.title}
      </Heading>
      <Text maxW="2xl" color="fg.muted" fontSize={{ base: "sm", md: "md" }}>
        {content.description}
      </Text>
    </Stack>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  tone = "default",
  last = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "default" | "danger";
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Grid
      as="section"
      templateColumns={{ base: "minmax(0, 1fr)", md: "190px minmax(0, 1fr)" }}
      gap={{ base: 5, md: 8 }}
      p={{ base: 5, md: 7 }}
      borderBottom={last ? "0" : "1px solid"}
      borderColor={tone === "danger" ? "red.muted" : "border"}
      bg={tone === "danger" ? "red.subtle" : "transparent"}
    >
      <Stack align="start" gap="2">
        <Center boxSize="8" rounded="lg" bg={tone === "danger" ? "red.muted" : "bg.muted"} color={tone === "danger" ? "red.fg" : "fg"}>
          <Icon as={icon} boxSize="4" />
        </Center>
        <Text fontWeight="semibold">{title}</Text>
        <Text color={tone === "danger" ? "red.fg" : "fg.muted"} fontSize="xs" lineHeight="1.6">
          {description}
        </Text>
      </Stack>
      <Box minW="0">{children}</Box>
    </Grid>
  );
}

function SettingsSelect({
  label,
  value,
  options,
  onChange,
  help,
  maxW,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  help?: string;
  maxW?: string;
}) {
  return (
    <Field.Root maxW={maxW}>
      <Field.Label>{label}</Field.Label>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      {help && <Field.HelperText>{help}</Field.HelperText>}
    </Field.Root>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  onChange,
  experimental = false,
  last = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  experimental?: boolean;
  last?: boolean;
}) {
  return (
    <Flex
      align="start"
      justify="space-between"
      gap="5"
      p="4"
      borderBottom={last ? "0" : "1px solid"}
      borderColor="border"
      bg={checked ? "bg.subtle" : "transparent"}
      transition="background 120ms ease"
    >
      <Stack minW="0" gap="1">
        <HStack gap="2" flexWrap="wrap">
          <Text fontSize="sm" fontWeight="medium">{label}</Text>
          {experimental && <Badge size="sm" variant="subtle">Experimental</Badge>}
        </HStack>
        <Text color="fg.muted" fontSize="xs">{description}</Text>
      </Stack>
      <Checkbox.Root
        flexShrink="0"
        checked={checked}
        onCheckedChange={(details) => onChange(details.checked === true)}
        aria-label={label}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    </Flex>
  );
}

function ShortcutRow({ action, keys }: { action: string; keys: string }) {
  return (
    <HStack
      justify="space-between"
      gap="3"
      minW={0}
      px="3"
      py="2.5"
      rounded="md"
      border="1px solid"
      borderColor="border"
      bg="bg.subtle"
    >
      <Text fontSize="sm">{action}</Text>
      <Box
        as="kbd"
        flexShrink={0}
        px="2"
        py="1"
        rounded="sm"
        border="1px solid"
        borderColor="border"
        bg="bg"
        color="fg.muted"
        fontFamily="mono"
        fontSize="xs"
      >
        {keys}
      </Box>
    </HStack>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  textarea = false,
  help,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  textarea?: boolean;
  help?: string;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {textarea ? (
        <Textarea minH="28" resize="vertical" value={value} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} />
      ) : (
        <Input value={value} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} />
      )}
      {help && <Field.HelperText>{help}</Field.HelperText>}
    </Field.Root>
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
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      />
      {(min !== undefined || max !== undefined) && (
        <Field.HelperText>
          {min !== undefined ? `Min ${min}px` : ""}{min !== undefined && max !== undefined ? " · " : ""}{max !== undefined ? `Max ${max}px` : ""}
        </Field.HelperText>
      )}
    </Field.Root>
  );
}

function UploadField({ label, onUpload }: { label: string; onUpload: (file?: File) => void }) {
  return <ImageUploadDropzone label={label} onUpload={onUpload} />;
}

function SocialPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", sm: "220px minmax(0, 1fr)" }}
      overflow="hidden"
      rounded="xl"
      border="1px solid"
      borderColor="border"
      bg="bg.subtle"
    >
      <AspectRatio ratio={1.45} minW="0">
        {image ? (
          <Image src={image} alt="" objectFit="cover" />
        ) : (
          <Center bg="bg.muted" color="fg.muted" fontSize="xs" fontWeight="semibold">
            Preview image
          </Center>
        )}
      </AspectRatio>
      <Stack alignSelf="center" minW="0" gap="2" p={{ base: 4, md: 5 }}>
        <Text color="fg.muted" fontSize="xs" letterSpacing="wide" textTransform="uppercase" truncate>
          {url.replace(/^https?:\/\//, "")}
        </Text>
        <Text fontSize="lg" fontWeight="semibold" lineHeight="1.25">
          {title || "Portfolio preview title"}
        </Text>
        <Text color="fg.muted" fontSize="sm" lineClamp="2">
          {description || "Preview description for LinkedIn and other Open Graph surfaces."}
        </Text>
      </Stack>
    </Grid>
  );
}

function TwitterPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", sm: "180px minmax(0, 1fr)" }}
      overflow="hidden"
      rounded="2xl"
      border="1px solid"
      borderColor="border"
      bg="bg.subtle"
    >
      <AspectRatio ratio={1.2} minW="0">
        {image ? (
          <Image src={image} alt="" objectFit="cover" />
        ) : (
          <Center bg="bg.muted" color="fg.muted" fontSize="xs" fontWeight="semibold">
            X / Twitter image
          </Center>
        )}
      </AspectRatio>
      <Stack alignSelf="center" minW="0" gap="2" p={{ base: 4, md: 5 }}>
        <Text fontSize="lg" fontWeight="semibold" lineHeight="1.25">
          {title || "Portfolio preview title"}
        </Text>
        <Text color="fg.muted" fontSize="sm" lineClamp="2">
          {description || "Preview description for Twitter/X cards."}
        </Text>
        <Text color="fg.muted" fontSize="xs" truncate>
          {url.replace(/^https?:\/\//, "")}
        </Text>
      </Stack>
    </Grid>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Stack gap="2" p="4" rounded="xl" border="1px solid" borderColor="border" bg="bg.subtle">
      <Text color="fg.muted" fontSize="xs" fontWeight="semibold" letterSpacing="wide" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold" letterSpacing="tight" lineHeight="1">
        {value.toLocaleString()}
      </Text>
    </Stack>
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
