import type React from "react";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { palettes, templates } from "../data/templates";
import { limits } from "../data/limits";
import {
  defaultImageSettings,
  imageAspectRatioOptions,
  imageCropPositionOptions,
  imageObjectFitOptions,
  imageShapeOptions,
  toImageContentStyle,
  toImageFrameStyle,
} from "../config/imageSettings";
import { resolveSectionLayoutSettings } from "../config/sectionLayoutSettings";
import {
  defaultBreakpointWidths,
  resolveBreakpointWidths,
} from "../config/breakpointSettings";
import { resolveBodyLayout } from "../config/bodySettings";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { useEditorStore } from "../store/editorStore";
import {
  BoxSpacing,
  CertificationItem,
  ColorPalette,
  ElementSettings,
  ImageAsset,
  PortfolioSection,
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
import { findCustomLayer } from "../utils/customLayers";
import {
  Box,
  Button,
  Checkbox,
  Field,
  Input,
  NativeSelect,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuChevronRight,
  LuClipboardPen,
  LuImagePlus,
  LuPaintbrush,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import {
  BoxModelPreview,
  BoxSpacingInput,
  LayoutStructurePreview,
  resolveBoxSpacing,
  useComputedBoxModel,
  useComputedLayoutStructure,
  type ComputedBoxModel,
  type ComputedLayoutStructure,
} from "./boxmodel";
import {
  BoxShadowInput,
  ColorInput,
  FontFamilyPicker,
  InputField,
  normalizeColor,
  NumberInput,
  SizeInput,
  TextAreaInput,
  TextInput,
  TypographyUnitInput,
} from "./inputs";
import { SectionLayoutControls } from "./properties/SectionLayoutControls";
import { ElementLayoutControls } from "./properties/ElementLayoutControls";
import {
  customLayerIdFromSelection,
  isNativeContainerLayerId,
} from "./editor/layerHelpers";

export function PropertiesPanel() {
  const { portfolio, selected } = useEditorStore(
    useShallow((state) => ({
      portfolio: state.portfolio,
      selected: state.selected,
    })),
  );
  const store = useEditorStore(
    useShallow((state) => ({
      addCollectionItem: state.addCollectionItem,
      deleteCollectionItem: state.deleteCollectionItem,
      updateCollectionItem: state.updateCollectionItem,
      updateCustomLayer: state.updateCustomLayer,
      updateElementSettings: state.updateElementSettings,
      updatePortfolioSettings: state.updatePortfolioSettings,
      updateSection: state.updateSection,
      updateSectionContent: state.updateSectionContent,
      updateSectionImage: state.updateSectionImage,
    })),
  );
  const computedBoxModel = useComputedBoxModel(selected);
  const computedLayoutStructure = useComputedLayoutStructure(selected);
  const palette = useMemo(
    () => palettes.find((item) => item.id === portfolio?.paletteId) || palettes[0],
    [portfolio?.paletteId],
  );
  const swatches = useMemo(() => paletteSwatches(palette), [palette]);
  if (!portfolio || !selected) {
    return (
      <Stack
        bg="bg"
        borderLeft="1px solid"
        borderLeftColor="border"
        as="aside"
        p={4}
        gap={2}
        height="full"
        minHeight={0}
        maxHeight="full"
        overflowX="hidden"
        overflowY="auto"
      >
        <Text color="fg" fontWeight="semibold">
          Properties
        </Text>
        <Text>Select a section or element.</Text>
      </Stack>
    );
  }

  if (selected.kind === "head") {
    return (
      <Stack
        bg="bg"
        borderLeft="1px solid"
        borderLeftColor="border"
        as="aside"
        p={4}
        gap={4}
        height="full"
        minHeight={0}
        maxHeight="full"
        overflowX="hidden"
        overflowY="auto"
      >
        <Text color="fg" fontWeight="semibold">
          Page Head
        </Text>
        <Text color="fg.muted">
          Use the center form to edit page metadata. These values are saved in
          the portfolio JSON under <code>head</code>.
        </Text>
      </Stack>
    );
  }

  if (selected.kind === "body") {
    const bodyLayout = resolveBodyLayout(portfolio.settings.bodyLayout);
    const breakpointWidths = resolveBreakpointWidths(
      portfolio.settings.breakpointWidths,
    );
    const updateBreakpointWidth = (
      mode: "tablet" | "mobile",
      value?: number,
    ) => {
      store.updatePortfolioSettings({
        breakpointWidths: resolveBreakpointWidths({
          ...breakpointWidths,
          [mode]: value ?? defaultBreakpointWidths[mode],
        }),
      });
    };
    return (
      <Stack
        bg="bg"
        borderLeft="1px solid"
        borderLeftColor="border"
        as="aside"
        p={4}
        gap={4}
        height="full"
        minHeight={0}
        maxHeight="full"
        overflowX="hidden"
        overflowY="auto"
      >
        <Text color="fg" fontWeight="semibold">
          Page Body
        </Text>
        <Text color="fg.muted">
          Body contains all visible portfolio sections. Select a child section
          to edit its layout and styles.
        </Text>
        <Stack gap={4} pt={2}>
          <Text color="fg" fontWeight="semibold">
            Layout
          </Text>
          <ElementLayoutControls
            settings={bodyLayout}
            onChange={(updates) =>
              store.updatePortfolioSettings({
                bodyLayout: { ...bodyLayout, ...updates },
              })
            }
          />
        </Stack>
        <Stack gap={4} pt={2}>
          <Text color="fg" fontWeight="semibold">
            Breakpoint widths
          </Text>
          <Text color="fg.muted" fontSize="xs">
            Desktop always follows the full viewport width. Tablet cannot be
            narrower than Mobile, and Mobile has a minimum width of 240px.
          </Text>
          <Field.Root>
            <Field.Label>Desktop width</Field.Label>
            <Input value="100vw" readOnly aria-readonly="true" />
            <Field.HelperText>
              Desktop always uses 100% of the viewport width.
            </Field.HelperText>
          </Field.Root>
          <NumberInput
            label="Tablet width (px)"
            value={breakpointWidths.tablet}
            min={breakpointWidths.mobile}
            onChange={(value) => updateBreakpointWidth("tablet", value)}
          />
          <NumberInput
            label="Mobile width (px)"
            value={breakpointWidths.mobile}
            min={240}
            onChange={(value) => updateBreakpointWidth("mobile", value)}
          />
        </Stack>
      </Stack>
    );
  }

  const section =
    "sectionId" in selected
      ? portfolio.sections.find((item) => item.id === selected.sectionId)
      : undefined;
  const template = templates.find((item) => item.id === portfolio.templateId)!;
  const templateFontFamily =
    template.id === "minimalist"
      ? "ui-sans-serif, system-ui, sans-serif"
      : 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  if (!section) return null;

  const selectedKey =
    selected.kind === "section" ? undefined : selectedElementKey(selected);
  const selectedCustomLayerId = customLayerIdFromSelection(selected);
  const selectedCustomLayer = selectedCustomLayerId
    ? findCustomLayer(section.customLayers, selectedCustomLayerId)
    : undefined;
  const selectedIsContainer =
    selectedCustomLayer?.type === "div" ||
    (selected.kind === "layer" && isNativeContainerLayerId(selected.layerId));
  const elementSettings = selectedKey
    ? getElementSettings(section, selectedKey)
    : undefined;
  const displayedLayoutStructure =
    selected.kind === "section"
      ? configuredSectionLayout(section, computedLayoutStructure)
      : computedLayoutStructure;
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
      <Text px={4} pt={4} color="fg" fontWeight="semibold">
        Properties
      </Text>
      <Tabs.Root defaultValue="content" variant="line">
        <Tabs.List>
          <Tabs.Trigger flex={1} value="content">
            <LuClipboardPen />
            Content
          </Tabs.Trigger>
          <Tabs.Trigger flex={1} value="styling">
            <LuPaintbrush />
            Styling
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="content" p={0}>
          {selected.kind === "section" && (
            <PropertyGroup title="Section" defaultOpen>
              <InputField
                label="Internal Section Label"
                value={section.label}
                limit={16}
                onChange={(value) =>
                  store.updateSection(section.id, { label: value })
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
                onCheckedChange={(event) =>
                  store.updateSection(section.id, {
                    visible: !!event.checked,
                  })
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Visible</Checkbox.Label>
              </Checkbox.Root>
            </PropertyGroup>
          )}

          {selected.kind === "text" && (
            <PropertyGroup title="Content" defaultOpen>
              <TextAreaInput
                label={selected.label}
                value={String(
                  section.content[selected.field] ||
                    (section.type === "projects" &&
                    selected.field === "description"
                      ? section.content.subtitle
                      : "") ||
                    "",
                )}
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
          )}

          {selected.kind === "layer" && (
            <Stack gap={0}>
              {selectedCustomLayer && (
                <PropertyGroup title="Custom layer" defaultOpen>
                  <InputField
                    label="Layer name"
                    value={selectedCustomLayer.name}
                    onChange={(value) =>
                      store.updateCustomLayer(
                        section.id,
                        selectedCustomLayer.id,
                        {
                          name: value,
                        },
                      )
                    }
                  />
                  {selectedCustomLayer.type === "div" && (
                    <Text p={4} color="fg.muted" fontSize="sm">
                      Select this Div, then use Add layer to place Text, Image,
                      or another Div inside it.
                    </Text>
                  )}
                  {selectedCustomLayer.type === "text" && (
                    <TextAreaInput
                      label="Text content"
                      value={selectedCustomLayer.text || ""}
                      limit={1000}
                      onChange={(text) =>
                        store.updateCustomLayer(
                          section.id,
                          selectedCustomLayer.id,
                          { text: text.slice(0, 1000) },
                        )
                      }
                    />
                  )}
                  {selectedCustomLayer.type === "image" && (
                    <ImageInspector
                      image={selectedCustomLayer.image}
                      slot={`custom-${selectedCustomLayer.id}`}
                      label={selectedCustomLayer.name}
                      projectId={portfolio.id}
                      onChange={(image) =>
                        store.updateCustomLayer(
                          section.id,
                          selectedCustomLayer.id,
                          { image },
                        )
                      }
                    />
                  )}
                </PropertyGroup>
              )}
              {section.type === "header" &&
                !selectedCustomLayer &&
                selected.layerId === "navigation" && (
                  <ResponsiveNavigationControls
                    section={section}
                    onChange={(field, value) =>
                      store.updateSectionContent(section.id, field, value)
                    }
                  />
                )}
              {!selectedCustomLayer && getNestedImageTarget(selected) && (
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
              {!(
                section.type === "header" && selected.layerId === "navigation"
              ) &&
                !selectedCustomLayer &&
                !getNestedImageTarget(selected) && (
                  <Text p={4} color="fg.muted" fontSize="sm">
                    This layer has styling controls only.
                  </Text>
                )}
            </Stack>
          )}

          {selected.kind === "image" && (
            <PropertyGroup title="Image" defaultOpen>
              <ImageInspector
                image={
                  section.content[selected.field] as ImageAsset | undefined
                }
                slot={selected.slot}
                label={selected.label}
                projectId={portfolio.id}
                onChange={(image) =>
                  store.updateSectionImage(section.id, selected.field, image)
                }
              />
            </PropertyGroup>
          )}

          {selected.kind === "project" && (
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
          )}

          {selected.kind === "certification" && (
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
          )}

          {selected.kind === "service" && (
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
          )}
        </Tabs.Content>

        <Tabs.Content value="styling" p={0}>
          <Tabs.Root defaultValue="structure" variant="line">
            <Tabs.List>
              <Tabs.Trigger flex={1} value="structure">
                Structure
              </Tabs.Trigger>
              <Tabs.Trigger flex={1} value="box-model">
                Box Model
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="structure" p={0}>
              <LayoutStructurePreview layout={displayedLayoutStructure} />
            </Tabs.Content>
            <Tabs.Content value="box-model" p={0}>
              <BoxModelPreview
                margin={sectionMargin}
                padding={sectionPadding}
                borderWidth={
                  section.settings.borderWidth ?? computedBoxModel?.borderWidth
                }
              />
            </Tabs.Content>
          </Tabs.Root>

          {selected.kind === "section" && (
            <Stack gap={0}>
              <PropertyGroup
                title="Layout"
                defaultOpen={section.type !== "custom"}
              >
                <SectionLayoutControls
                  section={section}
                  onChange={(updates) =>
                    store.updateSection(section.id, {
                      settings: { ...section.settings, ...updates },
                    })
                  }
                />
                <Field.Root>
                  <Field.Label>Text alignment</Field.Label>
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
                <Field.Root>
                  <Field.Label>Content Width</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
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
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </PropertyGroup>
              {section.type === "custom" && (
                <PropertyGroup title="Sizing" defaultOpen>
                  <SizeInput
                    label="Width"
                    value={resolvedSizeValue(
                      section.settings.width,
                      computedBoxModel?.width,
                    )}
                    onChange={(width) =>
                      store.updateSection(section.id, {
                        settings: { ...section.settings, width },
                      })
                    }
                  />
                  <SizeInput
                    label="Height"
                    value={resolvedSizeValue(
                      section.settings.height,
                      computedBoxModel?.height,
                    )}
                    onChange={(height) =>
                      store.updateSection(section.id, {
                        settings: { ...section.settings, height },
                      })
                    }
                  />
                  <SizeInput
                    label="Minimum height"
                    value={resolvedSizeValue(
                      section.settings.minHeight,
                      computedBoxModel?.minHeight,
                    )}
                    onChange={(minHeight) =>
                      store.updateSection(section.id, {
                        settings: { ...section.settings, minHeight },
                      })
                    }
                  />
                </PropertyGroup>
              )}
              <PropertyGroup title="Color">
                <ColorInput
                  label="Background color"
                  value={section.settings.backgroundColor || ""}
                  fallback={palette.background}
                  swatches={swatches}
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
                  swatches={swatches}
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
                  label="Border Color"
                  value={section.settings.borderColor || ""}
                  fallback={palette.border}
                  swatches={swatches}
                  onChange={(value) =>
                    store.updateSection(section.id, {
                      settings: { ...section.settings, borderColor: value },
                    })
                  }
                />
                <NumberInput
                  label="Border Width"
                  value={section.settings.borderWidth}
                  onChange={(borderWidth) =>
                    store.updateSection(section.id, {
                      settings: { ...section.settings, borderWidth },
                    })
                  }
                />
                <Field.Root>
                  <Field.Label>Border Style</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
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
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
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
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                defaultFontFamily={templateFontFamily}
                includeText
                onChange={updateSelectedElement}
              />
            </Stack>
          )}

          {selected.kind === "layer" && (
            <Stack gap={0}>
              {selectedIsContainer && (
                <PropertyGroup title="Layout" defaultOpen>
                  <ElementLayoutControls
                    settings={elementSettings || {}}
                    onChange={updateSelectedElement}
                  />
                </PropertyGroup>
              )}
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                defaultFontFamily={templateFontFamily}
                includeSize={!getNestedImageTarget(selected)}
                includeText={
                  selectedCustomLayer?.type === "text" ||
                  (section.type === "header" &&
                    (selected.layerId === "navigation" ||
                      selected.layerId.startsWith("navigation-link:")))
                }
                onChange={updateSelectedElement}
              />
            </Stack>
          )}

          {selected.kind === "image" && (
            <Stack gap={0}>
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                includeSize={false}
                onChange={updateSelectedElement}
              />
            </Stack>
          )}

          {selected.kind === "project" && (
            <Stack gap={0}>
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                onChange={updateSelectedElement}
              />
            </Stack>
          )}

          {selected.kind === "certification" && (
            <Stack gap={0}>
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                onChange={updateSelectedElement}
              />
            </Stack>
          )}

          {selected.kind === "service" && (
            <div className="inspector-stack">
              <ElementStyleControls
                selected={selected}
                settings={elementSettings || {}}
                fallbackColor={section.settings.textColor || palette.text}
                swatches={swatches}
                computedBoxModel={computedBoxModel}
                onChange={updateSelectedElement}
              />
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}

function ResponsiveNavigationControls({
  section,
  onChange,
}: {
  section: PortfolioSection;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <PropertyGroup title="Responsive navigation" defaultOpen>
      <Text color="fg.muted" fontSize="xs">
        Desktop always uses text links.
      </Text>
      <Field.Root>
        <Field.Label>Tablet navigation</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={
              section.content.tabletNavigationMode === "menu" ? "menu" : "text"
            }
            onChange={(event) =>
              onChange("tabletNavigationMode", event.target.value)
            }
          >
            <option value="text">Text links</option>
            <option value="menu">Burger + dropdown</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label>Mobile navigation</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={
              section.content.mobileNavigationMode === "menu" ? "menu" : "text"
            }
            onChange={(event) =>
              onChange("mobileNavigationMode", event.target.value)
            }
          >
            <option value="text">Text links</option>
            <option value="menu">Burger + dropdown</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
    </PropertyGroup>
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
      px={4}
      pt={2}
      pb={isOpen ? 4 : 2}
      gap={isOpen ? 4 : 0}
      asChild
      borderBottom="1px solid"
      borderBottomColor="border"
    >
      <details
        {...{ name: "properties-panel-group" }}
        open={isOpen}
        onToggle={(event) => {
          setIsOpen(event.currentTarget.open);
        }}
      >
        <Text
          fontWeight="semibold"
          color="fg"
          className="properties-panel-summary"
          as="summary"
        >
          {isOpen ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
          {title}
        </Text>
        <Stack px={2} gap={4}>
          {children}
        </Stack>
      </details>
    </Stack>
  );
}

function ElementStyleControls({
  selected,
  settings,
  fallbackColor,
  swatches,
  computedBoxModel,
  defaultFontFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
  includeSize = true,
  includeText = false,
  onChange,
}: {
  selected: SelectedElement;
  settings: ElementSettings;
  fallbackColor: string;
  swatches: string[];
  computedBoxModel?: ComputedBoxModel;
  defaultFontFamily?: string;
  includeSize?: boolean;
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
      {includeText && (
        <PropertyGroup title="Typography" defaultOpen>
          <FontFamilyPicker
            value={settings.fontFamily}
            defaultFontFamily={defaultFontFamily}
            onChange={(fontFamily) => onChange({ fontFamily })}
          />
          <TypographyUnitInput
            label="Font size"
            value={settings.fontSize}
            unit={settings.fontSizeUnit || "px"}
            onChange={(fontSize, fontSizeUnit) =>
              onChange({ fontSize, fontSizeUnit })
            }
          />
          <NumberInput
            label="Font weight"
            value={settings.fontWeight}
            onChange={(fontWeight) => onChange({ fontWeight })}
          />
          <TypographyUnitInput
            label="Line height"
            value={settings.lineHeight}
            unit={settings.lineHeightUnit || "px"}
            onChange={(lineHeight, lineHeightUnit) =>
              onChange({ lineHeight, lineHeightUnit })
            }
          />
          <TypographyUnitInput
            label="Letter spacing"
            value={settings.letterSpacing}
            unit={settings.letterSpacingUnit || "px"}
            onChange={(letterSpacing, letterSpacingUnit) =>
              onChange({ letterSpacing, letterSpacingUnit })
            }
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
      {includeSize && (
        <PropertyGroup title="Size">
          <SizeInput
            label="Width"
            value={resolvedSizeValue(settings.width, computedBoxModel?.width)}
            onChange={(width) => onChange({ width })}
          />
          <SizeInput
            label="Height"
            value={resolvedSizeValue(settings.height, computedBoxModel?.height)}
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
      )}
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
        <Field.Root>
          <Field.Label>Border Style</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
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
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
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
      const uploadedImage = await uploadImageToSupabase({
        file,
        projectId,
        slot,
        alt: image?.alt || label,
        label: `Uploading ${label}`,
      });
      onChange({
        ...uploadedImage,
        objectFit: image?.objectFit || uploadedImage.objectFit,
        objectPosition: image?.objectPosition || uploadedImage.objectPosition,
        shape: image?.shape,
        width: image?.width,
        height: image?.height,
        aspectRatio: image?.aspectRatio,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        console.error(error);
    }
  };

  return (
    <Stack gap={4}>
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
        <Box style={toImageFrameStyle(image)} maxW="full">
          <img
            className="inspector-image"
            style={toImageContentStyle(image)}
            src={image.url}
            alt={image.alt}
          />
        </Box>
      )}
      <TextInput
        label="Alt text"
        limit={125}
        value={image?.alt || ""}
        onChange={(alt) => onChange(image ? { ...image, alt } : undefined)}
      />
      {image && (
        <>
          <SizeInput
            label="Image width"
            value={image.width}
            onChange={(width) => onChange({ ...image, width })}
          />
          <SizeInput
            label="Image height"
            value={image.height}
            onChange={(height) => onChange({ ...image, height })}
          />
          <Field.Root>
            <Field.Label>Aspect Ratio</Field.Label>
            <NativeSelect.Root size="xs">
              <NativeSelect.Field
                value={image.aspectRatio || defaultImageSettings.aspectRatio}
                onChange={(event) =>
                  onChange({
                    ...image,
                    aspectRatio: event.target.value as NonNullable<
                      ImageAsset["aspectRatio"]
                    >,
                  })
                }
              >
                {imageAspectRatioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label>Crop Position</Field.Label>
            <NativeSelect.Root size="xs">
              <NativeSelect.Field
                value={
                  image.objectPosition || defaultImageSettings.objectPosition
                }
                onChange={(event) =>
                  onChange({ ...image, objectPosition: event.target.value })
                }
              >
                {imageCropPositionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root>
            <Field.Label>Crop Position</Field.Label>
            <NativeSelect.Root size="xs">
              <NativeSelect.Field
                value={image.shape || defaultImageSettings.shape}
                onChange={(event) => {
                  const shape = event.target.value as NonNullable<
                    ImageAsset["shape"]
                  >;
                  onChange({
                    ...image,
                    shape,
                    aspectRatio:
                      shape === "circle" ? "1 / 1" : image.aspectRatio,
                  });
                }}
              >
                {imageShapeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </>
      )}
      <Button
        variant="outline"
        size="lg"
        colorPalette="red"
        onClick={() => onChange(undefined)}
      >
        <LuTrash2 /> Remove Image
      </Button>
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
          <TextAreaInput
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
          <TextAreaInput
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

function resolvedSizeValue(saved?: SizeValue, computed?: number): SizeValue | undefined {
  if (saved?.value !== undefined) return saved;
  return computed !== undefined ? { value: computed, unit: "px" } : undefined;
}

function legacySectionMargin(settings: SectionSettings): BoxSpacing {
  return {
    top: settings.margin?.top ?? settings.marginTop,
    right: settings.margin?.right,
    bottom: settings.margin?.bottom ?? settings.marginBottom,
    left: settings.margin?.left,
    unit: settings.margin?.unit || "px",
  };
}

function legacySectionPadding(settings: SectionSettings): BoxSpacing {
  return {
    top: settings.padding?.top ?? settings.paddingTop,
    right: settings.padding?.right ?? settings.paddingInline,
    bottom: settings.padding?.bottom ?? settings.paddingBottom,
    left: settings.padding?.left ?? settings.paddingInline,
    unit: settings.padding?.unit || "px",
  };
}

function configuredSectionLayout(
  section: PortfolioSection,
  computed?: ComputedLayoutStructure,
): ComputedLayoutStructure {
  const layout = resolveSectionLayoutSettings(section);
  const isGrid = layout.layoutMode === "grid";
  const stackGap = `${layout.stackGap || 0}px`;
  const rowGap = `${layout.gridGapY || 0}px`;
  const columnGap = `${layout.gridGapX || 0}px`;

  return {
    type: isGrid ? "grid" : "flex",
    direction: layout.stackDirection || "column",
    columns: isGrid ? layout.gridColumns || 1 : 1,
    rows: computed?.rows || 1,
    gap: isGrid ? `${rowGap} ${columnGap}` : stackGap,
    rowGap: isGrid ? rowGap : stackGap,
    columnGap: isGrid ? columnGap : stackGap,
    wrap: isGrid
      ? layout.layoutWrap
        ? "rows"
        : "nowrap"
      : layout.layoutWrap
        ? "wrap"
        : "nowrap",
    alignItems: isGrid
      ? computed?.alignItems || "stretch"
      : layout.stackAlign || "stretch",
    justifyContent: isGrid
      ? computed?.justifyContent || "normal"
      : layout.stackJustify || "flex-start",
    childCount: computed?.childCount || 0,
    childTags: computed?.childTags || [],
  };
}
