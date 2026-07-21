---
day: 1
slug: day-1
label: Alpha 1 editor pass
title: The builder becomes composable
summary: Recent working changes organized into the first daily development entry after the committed Day 0 baseline.
---

## Changes and updates

- **Canvas and responsive preview workflow** — Stabilized fixed desktop, tablet, and mobile canvas widths; repaired Space-drag panning, outside-canvas deselection, reset-to-fit centering, and the fixed preview breakpoint toolbar.
- **Nested layer builder** — Converted Layers into a Chakra UI tree and added nested custom Div, Text, and Image layers with drag ordering, Div nesting, template-container drop targets, deletion, rendering, and persisted JSON data.
- **Layout and property controls** — Added Stack and Grid controls for sections and element containers, Structure and Box Model guides, single-open property accordions, configurable image behavior, searchable font selection, and typography units.
- **Editor history and onboarding** — Added five-step change history, grouped input edits, undo and redo restoration, a Driver.js editor tour, and persisted editor preferences for tours, panel sizing, and box-model overlays.
- **Project settings and metrics** — Separated Project Settings, Metrics, SEO/AEO, and Editor Settings; introduced a responsive Recharts analytics visualization; and retained social previews and UTM tracking tools.
- **Maintainability and release preparation** — Moved reusable property inputs and image configuration into focused modules, expanded repository documentation and safeguards, and added privacy, terms, and development-diary pages.

## Plans for tomorrow

- **Validate custom layers across templates** — Test nesting, layout, image behavior, history restoration, saving, publishing, and responsive output across every section and template.
- **Define template-element ordering** — Design a safe ordering model for protected template elements without breaking their semantic structure or responsive renderer.
- **Deepen metrics and SEO/AEO** — Add useful time ranges, traffic sources, interactions, metadata validation, structured-data guidance, and pre-publish checks.
