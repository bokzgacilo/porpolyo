# Portfolio template definitions

Each template owns a standalone `template.json` file:

- `blank/template.json` — scratch/blank canvas
- `neo-brutal/template.json` — flat/neo-brutal presentation
- `minimalist/template.json`
- `bento/template.json`

The top-level fields describe the template in the onboarding and settings UI.
`structure.settings` becomes the initial portfolio settings, while
`structure.sections` controls the sections, their order, initial content,
settings, and native layer order used when a new project is created.

## Dynamic content tokens

JSON content supports these owner-aware tokens:

- `{{owner.fullName}}`
- `{{owner.email}}`
- `{{owner.shortDescription}}`
- `{{owner.profileImage}}`
- `{{owner.professionalTitleLower}}`
- `{{heroHeadline}}`
- `{{aboutDescription}}`
- `{{year}}`

An exact token can resolve to a non-string value such as an image object.
Tokens embedded inside a longer string are converted to text.

## Layer order

Use semantic keys in a section's `layerOrder`. The project materializer converts
them into generated tree IDs after it creates the section ID:

```json
"layerOrder": ["hero-content", "image:image"]
```

Changing a definition affects newly created projects. Saved projects remain
independent snapshots in Supabase so a template edit cannot unexpectedly erase
a user's customized content.
