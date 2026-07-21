---
day: 2
slug: day-2
label: Structural editing pass
title: The canvas follows the tree
summary: Template elements now respond to the same structural editing model as custom layers, with faster controls and clearer property workflows.
---

## Changes and updates

- **Template layers become movable** — Connected the template layer tree to the canvas renderer so protected hero elements can be reordered and reparented, including text, images, content containers, and CTA groups.
- **Faster layer-tree workflows** — Added right-click context menus, keyboard selection, expand and collapse controls, layer reordering, move-to-root actions, and guarded removal states.
- **Properties panel refinements** — Added linked margin and padding controls, moved custom-layer settings directly into Content, and kept layout, typography, color, sizing, spacing, and border controls visible without accordions.
- **Canvas and editor reliability** — Repaired tree-to-canvas updates after structural changes, preserved nested section rendering, and verified representative reorder and reparent workflows interactively.
- **Settings and save feedback** — Redesigned project settings with Chakra UI primitives and added saving, saved, and failure tooltips to both editor and settings save actions.

## Plans for tomorrow

- **Optimize the canvas editor** — Profile rendering, selection, dragging, zooming, and preview updates; reduce unnecessary work and improve responsiveness as documents become more complex.
- **Refine the properties panel** — Improve control hierarchy, discoverability, editing speed, and state feedback across content, layout, styling, and responsive settings.
- **Build a better templating system** — Move toward more declarative template definitions with flexible element order, parent relationships, variants, and predictable responsive rendering.
