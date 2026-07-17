import type React from "react";
import { useState } from "react";
import { palettes, templates } from "../data/templates";
import { limits } from "../data/limits";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { useEditorStore } from "../store/editorStore";
import {
  BoxSpacing,
  CertificationItem,
  ColorPalette,
  ElementSettings,
  ImageAsset,
  ProjectItem,
  SectionSettings,
  SelectedElement,
  ServiceItem,
  SizeValue,
} from "../types/portfolio";
import {
  getElementSettings,
  selectedElementKey,
} from "../utils/elementSettings";
import {
  Checkbox,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuChevronRight,
  LuImagePlus,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import {
  BoxModelPreview,
  BoxSpacingInput,
  resolveBoxSpacing,
  useComputedBoxModel,
  type ComputedBoxModel,
} from "./boxmodel";
import { InputField } from "./custom/InputField";

export function PropertiesPanel() {
  const store = useEditorStore();
  const { portfolio, selected } = store;
  const computedBoxModel = useComputedBoxModel(selected, portfolio);
  if (!portfolio || !selected) {
    return (
      <aside className="right-panel">
        <Text>Properties</Text>
        <p>Select a section or element.</p>
      </aside>
    );
  }

  if (selected.kind === "head") {
    return (
      <aside className="right-panel">
        <Text>Properties</Text>
        <div className="inspector-meta">
          <span>Page Head</span>
        </div>
        <p className="panel-note">
          Use the center form to edit page metadata. These values are saved in
          the portfolio JSON under <code>head</code>.
        </p>
      </aside>
    );
  }

  if (selected.kind === "body") {
    return (
      <aside className="right-panel">
        <Text>Properties</Text>
        <div className="inspector-meta">
          <span>Page Body</span>
        </div>
        <p className="panel-note">
          Body contains all visible portfolio sections. Select a child section
          to edit its layout and styles.
        </p>
      </aside>
    );
  }

  const section =
    "sectionId" in selected
      ? portfolio.sections.find((item) => item.id === selected.sectionId)
      : undefined;
  const palette = palettes.find((item) => item.id === portfolio.paletteId)!;
  const template = templates.find((item) => item.id === portfolio.templateId)!;
  if (!section) return null;

  const selectedKey =
    selected.kind === "section" ? undefined : selectedElementKey(selected);
  const elementSettings = selectedKey
    ? getElementSettings(section, selectedKey)
    : undefined;
  const sectionMargin = resolveBoxSpacing(
    legacySectionMargin(section.settings),
    computedBoxModel?.margin,
  );
  const sectionPadding = resolveBoxSpacing(
    legacySectionPadding(section.settings),
    computedBoxModel?.padding,
  );
  const updateSelectedElement = (updates: Partial<ElementSettings>) => {
    if (selectedKey)
      store.updateElementSettings(section.id, selectedKey, updates);
  };

  return (
    <Stack
      bg="bg"
      borderLeft="1px solid"
      borderLeftColor="border"
      as="aside"
      pb={12}
      gap={0}
      height="full"
      minHeight={0}
      maxHeight="full"
      overflowX="hidden"
      overflowY="auto"
    >
      <Text p={4} color="fg" fontSize="22px" fontWeight="semibold">
        Properties
      </Text>
      <BoxModelPreview
        margin={sectionMargin}
        padding={sectionPadding}
        borderWidth={
          section.settings.borderWidth ?? computedBoxModel?.borderWidth
        }
      />

      {selected.kind === "section" && (
        <Stack gap={0}>
          <PropertyGroup title="Section" defaultOpen>
            <InputField
              label="Internal Section Label"
              value={section.label}
              limit={16}
              onChange={(event) =>
                store.updateSection(section.id, { label: event.target.value })
              }
            />
            {section.type === "header" && (
              <>
                <InputField
                  label="Logo / Name"
                  value={String(
                    section.content.logoText || portfolio.owner.fullName,
                  )}
                  limit={60}
                  onChange={(value) =>
                    store.updateSectionContent(section.id, "logoText", value)
                  }
                />
                <InputField
                  label="Contact Button"
                  value={String(section.content.contactButton || "Contact")}
                  limit={40}
                  onChange={(value) =>
                    store.updateSectionContent(
                      section.id,
                      "contactButton",
                      value,
                    )
                  }
                />
              </>
            )}
            {section.type === "footer" && (
              <>
                <TextInput
                  label="Footer name / logo"
                  value={String(
                    section.content.logoText || portfolio.owner.fullName,
                  )}
                  limit={60}
                  onChange={(value) =>
                    store.updateSectionContent(section.id, "logoText", value)
                  }
                />
                <TextInput
                  label="Footer message"
                  value={String(section.content.message || "")}
                  limit={160}
                  onChange={(value) =>
                    store.updateSectionContent(section.id, "message", value)
                  }
                />
                <TextInput
                  label="Copyright text"
                  value={String(section.content.copyright || "")}
                  limit={160}
                  onChange={(value) =>
                    store.updateSectionContent(section.id, "copyright", value)
                  }
                />
              </>
            )}
            {isCollectionSection(section.type) && (
              <button onClick={() => store.addCollectionItem(section.id)}>
                <LuPlus /> Add {collectionLabel(section.type)}
              </button>
            )}
            <Checkbox.Root
              checked={section.visible}
              onCheckedChange={(e) =>
                store.updateSection(section.id, {
                  visible: !!e.checked,
                })
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Visible</Checkbox.Label>
            </Checkbox.Root>
          </PropertyGroup>

          <PropertyGroup title="Layout" defaultOpen>
            <Field.Root>
              <Field.Label>Alignment</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={section.settings.alignment || "left"}
                  onChange={(event) =>
                    store.updateSection(section.id, {
                      settings: {
                        ...section.settings,
                        alignment: event.currentTarget.value as never,
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label>Section Spacing</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={section.settings.spacing || "medium"}
                  onChange={(event) =>
                    store.updateSection(section.id, {
                      settings: {
                        ...section.settings,
                        spacing: event.target.value as never,
                      },
                    })
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <label className="field">
              <span>Content width</span>
              <select
                value={section.settings.contentWidth || "standard"}
                onChange={(event) =>
                  store.updateSection(section.id, {
                    settings: {
                      ...section.settings,
                      contentWidth: event.target.value as never,
                    },
                  })
                }
              >
                <option value="narrow">Narrow</option>
                <option value="standard">Standard</option>
                <option value="wide">Wide</option>
              </select>
            </label>
          </PropertyGroup>
          <PropertyGroup title="Color">
            <ColorInput
              label="Background color"
              value={section.settings.backgroundColor || ""}
              fallback={palette.background}
              swatches={paletteSwatches(palette)}
              onChange={(value) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, backgroundColor: value },
                })
              }
            />
            <ColorInput
              label="Text color"
              value={section.settings.textColor || ""}
              fallback={palette.text}
              swatches={paletteSwatches(palette)}
              onChange={(value) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, textColor: value },
                })
              }
            />
          </PropertyGroup>
          <PropertyGroup title="Spacing">
            <BoxSpacingInput
              label="Margin"
              value={sectionMargin}
              onChange={(margin) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, margin },
                })
              }
            />
            <BoxSpacingInput
              label="Padding"
              value={sectionPadding}
              onChange={(padding) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, padding },
                })
              }
            />
          </PropertyGroup>
          <PropertyGroup title="Border">
            <ColorInput
              label="Border color"
              value={section.settings.borderColor || ""}
              fallback={palette.border}
              swatches={paletteSwatches(palette)}
              onChange={(value) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, borderColor: value },
                })
              }
            />
            <NumberInput
              label="Border width"
              value={section.settings.borderWidth}
              onChange={(borderWidth) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, borderWidth },
                })
              }
            />
            <label className="field">
              <span>Border style</span>
              <select
                value={section.settings.borderStyle || "none"}
                onChange={(event) =>
                  store.updateSection(section.id, {
                    settings: {
                      ...section.settings,
                      borderStyle: event.target.value as never,
                    },
                  })
                }
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </label>
            <NumberInput
              label="Border radius"
              value={section.settings.borderRadius}
              onChange={(borderRadius) =>
                store.updateSection(section.id, {
                  settings: { ...section.settings, borderRadius },
                })
              }
            />
          </PropertyGroup>
        </Stack>
      )}

      {selected.kind === "text" && (
        <Stack gap={0}>
          <PropertyGroup title="Content" defaultOpen>
            <TextArea
              label={selected.label}
              value={String(section.content[selected.field] || "")}
              limit={selected.limit}
              onChange={(value) =>
                store.updateSectionContent(
                  section.id,
                  selected.field,
                  value.slice(0, selected.limit),
                )
              }
            />
          </PropertyGroup>
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            includeText
            onChange={updateSelectedElement}
          />
          <label className="toggle-line">
            <input type="checkbox" defaultChecked /> Visibility
          </label>
        </Stack>
      )}

      {selected.kind === "layer" && (
        <Stack gap={0}>
          {getNestedImageTarget(selected) && (
            <PropertyGroup title="Image" defaultOpen>
              <NestedImageInspector
                selected={selected}
                section={section}
                projectId={portfolio.id}
                onChange={(itemId, field, image) =>
                  store.updateCollectionItem(section.id, itemId, {
                    [field]: image,
                  })
                }
              />
            </PropertyGroup>
          )}
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            onChange={updateSelectedElement}
          />
        </Stack>
      )}

      {selected.kind === "image" && (
        <Stack gap={0}>
          <PropertyGroup title="Image" defaultOpen>
            <ImageInspector
              image={section.content[selected.field] as ImageAsset | undefined}
              slot={selected.slot}
              label={selected.label}
              projectId={portfolio.id}
              onChange={(image) =>
                store.updateSectionImage(section.id, selected.field, image)
              }
            />
          </PropertyGroup>
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            onChange={updateSelectedElement}
          />
        </Stack>
      )}

      {selected.kind === "project" && (
        <Stack gap={0}>
          <CollectionInspector
            type="project"
            item={(section.content.items as ProjectItem[]).find(
              (item) => item.id === selected.itemId,
            )}
            onAdd={() => store.addCollectionItem(section.id)}
            onDelete={() =>
              store.deleteCollectionItem(section.id, selected.itemId)
            }
            onChange={(value) =>
              store.updateCollectionItem(section.id, selected.itemId, value)
            }
          />
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            onChange={updateSelectedElement}
          />
        </Stack>
      )}

      {selected.kind === "certification" && (
        <Stack gap={0}>
          <CollectionInspector
            type="certification"
            item={(section.content.items as CertificationItem[]).find(
              (item) => item.id === selected.itemId,
            )}
            onAdd={() => store.addCollectionItem(section.id)}
            onDelete={() =>
              store.deleteCollectionItem(section.id, selected.itemId)
            }
            onChange={(value) =>
              store.updateCollectionItem(section.id, selected.itemId, value)
            }
          />
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            onChange={updateSelectedElement}
          />
        </Stack>
      )}

      {selected.kind === "service" && (
        <div className="inspector-stack">
          <CollectionInspector
            type="service"
            item={(section.content.items as ServiceItem[]).find(
              (item) => item.id === selected.itemId,
            )}
            onAdd={() => store.addCollectionItem(section.id)}
            onDelete={() =>
              store.deleteCollectionItem(section.id, selected.itemId)
            }
            onChange={(value) =>
              store.updateCollectionItem(section.id, selected.itemId, value)
            }
          />
          <ElementStyleControls
            selected={selected}
            settings={elementSettings || {}}
            fallbackColor={section.settings.textColor || palette.text}
            swatches={paletteSwatches(palette)}
            computedBoxModel={computedBoxModel}
            onChange={updateSelectedElement}
          />
        </div>
      )}
    </Stack>
  );
}

function TextInput({
  label,
  value,
  limit,
  onChange,
}: {
  label: string;
  value: string;
  limit?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        value={value}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value)}
      />
      {limit && <small>{limit - value.length} characters remaining</small>}
    </label>
  );
}

function PropertyGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Stack
      p={4}
      gap={isOpen ? 4 : 0}
      asChild
      borderBottom="1px solid"
      borderBottomColor="border"
    >
      <details
        open={isOpen}
        onToggle={(event) => {
          setIsOpen(event.currentTarget.open);
        }}
      >
        <Text
          color="fg"
          fontSize="16px"
          className="properties-panel-summary"
          as="summary"
        >
          {isOpen ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
          {title}
        </Text>
        <Stack gap={4}>{children}</Stack>
      </details>
    </Stack>
  );
}

function TextArea({
  label,
  value,
  limit,
  onChange,
}: {
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value)}
      />
      <small>{limit - value.length} characters remaining</small>
    </label>
  );
}

function ColorInput({
  label,
  value,
  fallback = "#111827",
  swatches = [],
  onChange,
}: {
  label: string;
  value: string;
  fallback?: string;
  swatches?: string[];
  onChange: (value: string) => void;
}) {
  const current = normalizeColor(value || fallback);
  return (
    <div className="field color-picker-field">
      <div className="color-field">
        <span>{label}</span>
        <input
          type="color"
          value={current}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {swatches.length > 0 && (
        <div className="color-swatches">
          {swatches.map((color) => {
            const normalized = normalizeColor(color);
            return (
              <button
                key={`${label}-${color}`}
                type="button"
                className={normalized === current ? "selected" : ""}
                title={color}
                style={{ background: color }}
                onClick={() => onChange(normalized)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max="240"
        value={value ?? ""}
        placeholder="Template default"
        onChange={(event) =>
          onChange(
            event.target.value === "" ? undefined : Number(event.target.value),
          )
        }
      />
    </label>
  );
}

function ElementStyleControls({
  selected,
  settings,
  fallbackColor,
  swatches,
  computedBoxModel,
  includeText = false,
  onChange,
}: {
  selected: SelectedElement;
  settings: ElementSettings;
  fallbackColor: string;
  swatches: string[];
  computedBoxModel?: ComputedBoxModel;
  includeText?: boolean;
  onChange: (updates: Partial<ElementSettings>) => void;
}) {
  const margin = resolveBoxSpacing(settings.margin, computedBoxModel?.margin);
  const padding = resolveBoxSpacing(
    settings.padding,
    computedBoxModel?.padding,
  );

  return (
    <Stack gap={0}>
      <strong>
        {selected.kind === "layer" ? selected.label : "Element settings"}
      </strong>
      {includeText && (
        <PropertyGroup title="Typography" defaultOpen>
          <label className="field">
            <span>Font family</span>
            <select
              value={settings.fontFamily || ""}
              onChange={(event) =>
                onChange({ fontFamily: event.target.value || undefined })
              }
            >
              <option value="">Template default</option>
              <option value="Inter, ui-sans-serif, system-ui, sans-serif">
                Inter
              </option>
              <option value="Roboto, Arial, sans-serif">Roboto</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">
                Mono
              </option>
            </select>
          </label>
          <NumberInput
            label="Font size"
            value={settings.fontSize}
            onChange={(fontSize) => onChange({ fontSize })}
          />
          <NumberInput
            label="Font weight"
            value={settings.fontWeight}
            onChange={(fontWeight) => onChange({ fontWeight })}
          />
          <NumberInput
            label="Line height"
            value={settings.lineHeight}
            onChange={(lineHeight) => onChange({ lineHeight })}
          />
          <NumberInput
            label="Letter spacing"
            value={settings.letterSpacing}
            onChange={(letterSpacing) => onChange({ letterSpacing })}
          />
          <label className="field">
            <span>Text alignment</span>
            <select
              value={settings.textAlign || ""}
              onChange={(event) =>
                onChange({
                  textAlign: (event.target.value ||
                    undefined) as ElementSettings["textAlign"],
                })
              }
            >
              <option value="">Template default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </PropertyGroup>
      )}
      <PropertyGroup title="Color" defaultOpen={!includeText}>
        <ColorInput
          label="Text color"
          value={settings.color || ""}
          fallback={fallbackColor}
          swatches={swatches}
          onChange={(color) => onChange({ color })}
        />
        <ColorInput
          label="Background color"
          value={settings.backgroundColor || ""}
          fallback="#ffffff"
          swatches={swatches}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      </PropertyGroup>
      <PropertyGroup title="Size">
        <SizeInput
          label="Width"
          value={settings.width}
          onChange={(width) => onChange({ width })}
        />
        <SizeInput
          label="Height"
          value={settings.height}
          onChange={(height) => onChange({ height })}
        />
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={!!settings.spanSection}
            onChange={(event) =>
              onChange({ spanSection: event.target.checked })
            }
          />
          Span section width
        </label>
      </PropertyGroup>
      <PropertyGroup title="Spacing">
        <BoxSpacingInput
          label="Margin"
          value={margin}
          onChange={(margin) => onChange({ margin })}
        />
        <BoxSpacingInput
          label="Padding"
          value={padding}
          onChange={(padding) => onChange({ padding })}
        />
      </PropertyGroup>
      <PropertyGroup title="Border & Shadow">
        <ColorInput
          label="Border color"
          value={settings.borderColor || ""}
          fallback="#111827"
          swatches={swatches}
          onChange={(borderColor) => onChange({ borderColor })}
        />
        <NumberInput
          label="Border width"
          value={settings.borderWidth}
          onChange={(borderWidth) => onChange({ borderWidth })}
        />
        <label className="field">
          <span>Border style</span>
          <select
            value={settings.borderStyle || "none"}
            onChange={(event) =>
              onChange({
                borderStyle: event.target
                  .value as ElementSettings["borderStyle"],
              })
            }
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>
        <NumberInput
          label="Border radius"
          value={settings.borderRadius}
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
        <BoxShadowInput
          value={settings.boxShadow}
          onChange={(boxShadow) => onChange({ boxShadow })}
        />
      </PropertyGroup>
    </Stack>
  );
}

function BoxShadowInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const presets = [
    { label: "None", value: "" },
    { label: "Small", value: "0 2px 8px rgba(15, 23, 42, 0.12)" },
    { label: "Medium", value: "0 12px 30px rgba(15, 23, 42, 0.16)" },
    { label: "Large", value: "0 24px 60px rgba(15, 23, 42, 0.22)" },
    { label: "Hard offset", value: "6px 6px 0 rgba(15, 23, 42, 0.95)" },
    { label: "Glow", value: "0 0 0 4px rgba(37, 99, 255, 0.18)" },
    { label: "Custom", value: "__custom__" },
  ];
  const presetValue = presets.some((preset) => preset.value === (value || ""))
    ? value || ""
    : "__custom__";

  return (
    <>
      <label className="field">
        <span>Box shadow</span>
        <select
          value={presetValue}
          onChange={(event) => {
            if (event.target.value === "__custom__") return;
            onChange(event.target.value || undefined);
          }}
        >
          {presets.map((preset) => (
            <option key={preset.label} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Custom shadow</span>
        <input
          value={value || ""}
          placeholder="0 12px 30px rgba(15, 23, 42, 0.16)"
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      </label>
    </>
  );
}

function SizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SizeValue;
  onChange: (value: SizeValue | undefined) => void;
}) {
  const unit = value?.unit || "px";
  return (
    <label className="field size-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          min="0"
          max={unit === "%" ? "100" : "2000"}
          value={value?.value ?? ""}
          placeholder="Auto"
          onChange={(event) =>
            onChange(
              event.target.value === ""
                ? undefined
                : { value: Number(event.target.value), unit },
            )
          }
        />
        <select
          value={unit}
          onChange={(event) => {
            if (value?.value === undefined) {
              onChange({ unit: event.target.value as SizeValue["unit"] });
              return;
            }
            onChange({
              value: value.value,
              unit: event.target.value as SizeValue["unit"],
            });
          }}
        >
          <option value="px">px</option>
          <option value="%">%</option>
        </select>
      </div>
    </label>
  );
}

function ImageInspector({
  image,
  slot,
  label,
  projectId,
  onChange,
}: {
  image?: ImageAsset;
  slot: string;
  label: string;
  projectId: string;
  onChange: (image?: ImageAsset) => void;
}) {
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      onChange(
        await uploadImageToSupabase({
          file,
          projectId,
          slot,
          alt: image?.alt || label,
          label: `Uploading ${label}`,
        }),
      );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        console.error(error);
    }
  };

  return (
    <Stack gap={0}>
      <label className="upload-slot compact">
        <LuImagePlus />
        <span>{image ? "Replace image" : "Upload image"}</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>
      {image?.url && (
        <img className="inspector-image" src={image.url} alt={image.alt} />
      )}
      <TextInput
        label="Alt text"
        value={image?.alt || ""}
        onChange={(alt) => onChange(image ? { ...image, alt } : undefined)}
      />
      <label className="field">
        <span>Object fit</span>
        <select
          value={image?.objectFit || "cover"}
          onChange={(event) =>
            image &&
            onChange({ ...image, objectFit: event.target.value as never })
          }
        >
          <option>cover</option>
          <option>contain</option>
        </select>
      </label>
      <label className="field">
        <span>Crop position</span>
        <input
          value={image?.objectPosition || "center"}
          onChange={(event) =>
            image && onChange({ ...image, objectPosition: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Image shape</span>
        <select
          value={image?.shape || "rounded"}
          onChange={(event) =>
            image && onChange({ ...image, shape: event.target.value as never })
          }
        >
          <option>square</option>
          <option>rounded</option>
          <option>circle</option>
          <option>arch</option>
        </select>
      </label>
      <button className="danger" onClick={() => onChange(undefined)}>
        <LuTrash2 /> Remove image
      </button>
    </Stack>
  );
}

function NestedImageInspector({
  selected,
  section,
  projectId,
  onChange,
}: {
  selected: Extract<SelectedElement, { kind: "layer" }>;
  section: { content: Record<string, unknown> };
  projectId: string;
  onChange: (
    itemId: string,
    field: "image" | "icon",
    image?: ImageAsset,
  ) => void;
}) {
  const target = getNestedImageTarget(selected);
  if (!target) return null;
  const items = (section.content.items || []) as Array<Record<string, unknown>>;
  const item = items.find((item) => item.id === target.itemId);
  const image = item?.[target.field] as ImageAsset | undefined;

  return (
    <ImageInspector
      image={image}
      slot={target.slot}
      label={selected.label}
      projectId={projectId}
      onChange={(nextImage) => onChange(target.itemId, target.field, nextImage)}
    />
  );
}

function CollectionInspector({
  type,
  item,
  onAdd,
  onDelete,
  onChange,
}: {
  type: "project" | "certification" | "service";
  item?: ProjectItem | CertificationItem | ServiceItem;
  onAdd: () => void;
  onDelete: () => void;
  onChange: (value: Record<string, unknown>) => void;
}) {
  if (!item) {
    return (
      <button onClick={onAdd}>
        <LuPlus /> Add {type}
      </button>
    );
  }

  return (
    <PropertyGroup title="Content" defaultOpen>
      <button onClick={onAdd}>
        <LuPlus /> Add {type}
      </button>
      {type === "project" && isProject(item) && (
        <>
          <TextInput
            label="Project title"
            value={item.title}
            limit={limits.projectTitle}
            onChange={(title) => onChange({ title })}
          />
          <TextArea
            label="Project description"
            value={item.description}
            limit={limits.projectDescription}
            onChange={(description) => onChange({ description })}
          />
          <TextInput
            label="Technologies or tags"
            value={item.tags.join(", ")}
            onChange={(tags) =>
              onChange({
                tags: tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          />
          <TextInput
            label="Project URL"
            value={item.projectUrl || ""}
            onChange={(projectUrl) => onChange({ projectUrl })}
          />
          <TextInput
            label="Repository URL"
            value={item.repositoryUrl || ""}
            onChange={(repositoryUrl) => onChange({ repositoryUrl })}
          />
          <TextInput
            label="Role"
            value={item.role || ""}
            onChange={(role) => onChange({ role })}
          />
          <TextInput
            label="Completion date"
            value={item.completionDate || ""}
            onChange={(completionDate) => onChange({ completionDate })}
          />
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={item.featured}
              onChange={(event) => onChange({ featured: event.target.checked })}
            />{" "}
            Featured
          </label>
        </>
      )}
      {type === "certification" && isCertification(item) && (
        <>
          <TextInput
            label="Certification name"
            value={item.name}
            limit={limits.certificationTitle}
            onChange={(name) => onChange({ name })}
          />
          <TextInput
            label="Issuing organization"
            value={item.organization}
            onChange={(organization) => onChange({ organization })}
          />
          <TextInput
            label="Issue date"
            value={item.issueDate || ""}
            onChange={(issueDate) => onChange({ issueDate })}
          />
          <TextInput
            label="Expiration date"
            value={item.expirationDate || ""}
            onChange={(expirationDate) => onChange({ expirationDate })}
          />
          <TextInput
            label="Credential ID"
            value={item.credentialId || ""}
            onChange={(credentialId) => onChange({ credentialId })}
          />
          <TextInput
            label="Credential URL"
            value={item.credentialUrl || ""}
            onChange={(credentialUrl) => onChange({ credentialUrl })}
          />
        </>
      )}
      {type === "service" && isService(item) && (
        <>
          <TextInput
            label="Service title"
            value={item.title}
            limit={limits.serviceTitle}
            onChange={(title) => onChange({ title })}
          />
          <TextArea
            label="Service description"
            value={item.description}
            limit={limits.serviceDescription}
            onChange={(description) => onChange({ description })}
          />
          <TextInput
            label="Starting price"
            value={item.startingPrice || ""}
            onChange={(startingPrice) => onChange({ startingPrice })}
          />
          <TextInput
            label="Call-to-action text"
            value={item.ctaText}
            onChange={(ctaText) => onChange({ ctaText })}
          />
          <TextInput
            label="Contact link"
            value={item.contactLink || ""}
            onChange={(contactLink) => onChange({ contactLink })}
          />
        </>
      )}
      <button className="danger" onClick={onDelete}>
        <LuTrash2 size={16} /> Delete {type}
      </button>
    </PropertyGroup>
  );
}

function isProject(
  item: ProjectItem | CertificationItem | ServiceItem,
): item is ProjectItem {
  return "tags" in item;
}

function isCertification(
  item: ProjectItem | CertificationItem | ServiceItem,
): item is CertificationItem {
  return "organization" in item && "name" in item;
}

function isService(
  item: ProjectItem | CertificationItem | ServiceItem,
): item is ServiceItem {
  return "ctaText" in item;
}

function isCollectionSection(type: string) {
  return (
    type === "projects" || type === "certifications" || type === "services"
  );
}

function collectionLabel(type: string) {
  if (type === "projects") return "project";
  if (type === "certifications") return "certification";
  return "service";
}

function getNestedImageTarget(selected: SelectedElement) {
  if (selected.kind !== "layer") return undefined;
  const projectMatch = selected.layerId.match(/^project:([^:]+):image$/);
  if (projectMatch)
    return {
      itemId: projectMatch[1],
      field: "image" as const,
      slot: "project-thumbnail",
    };
  const certificationMatch = selected.layerId.match(
    /^certification:([^:]+):image$/,
  );
  if (certificationMatch)
    return {
      itemId: certificationMatch[1],
      field: "image" as const,
      slot: "certification-image",
    };
  const serviceMatch = selected.layerId.match(/^service:([^:]+):icon$/);
  if (serviceMatch)
    return {
      itemId: serviceMatch[1],
      field: "icon" as const,
      slot: "service-icon",
    };
  return undefined;
}

function paletteSwatches(palette: ColorPalette) {
  return Array.from(
    new Set(
      [
        palette.primary,
        palette.secondary,
        palette.accent,
        palette.background,
        palette.surface,
        palette.text,
        palette.muted,
        palette.border,
      ].map(normalizeColor),
    ),
  );
}

function normalizeColor(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#111827";
}

function legacySectionMargin(settings: SectionSettings): BoxSpacing {
  return {
    top: settings.margin?.top ?? settings.marginTop,
    right: settings.margin?.right,
    bottom: settings.margin?.bottom ?? settings.marginBottom,
    left: settings.margin?.left,
  };
}

function legacySectionPadding(settings: SectionSettings): BoxSpacing {
  return {
    top: settings.padding?.top ?? settings.paddingTop,
    right: settings.padding?.right ?? settings.paddingInline,
    bottom: settings.padding?.bottom ?? settings.paddingBottom,
    left: settings.padding?.left ?? settings.paddingInline,
  };
}
