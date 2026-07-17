# Porpolyo

Porpolyo is a no-code portfolio builder for creating, customizing, previewing, and publishing responsive personal websites.

Built with Next.js, TypeScript, Chakra UI, Zustand, and Supabase.

## Features

- Guided portfolio setup with templates and color palettes
- Visual section and layer editor with drag-and-drop ordering
- Editable typography, spacing, borders, images, and content
- Desktop, tablet, and mobile canvas previews
- Undo and redo support
- Collapsible editor navigation and responsive workspace controls
- Project dashboard with live portfolio thumbnails
- Draft saving and public portfolio publishing
- Google authentication through Supabase
- Image uploads through Supabase Storage
- Page metadata and social-sharing settings

## Tech stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) for editor state
- [dnd-kit](https://dndkit.com/) for drag-and-drop interactions
- [Supabase](https://supabase.com/) for authentication, data, and storage

## Prerequisites

- Node.js 20.9 or newer
- npm
- A configured Supabase project

The Supabase project must provide:

- Google authentication
- A `projects` table matching the portfolio data used in `src/lib/projects.ts`
- A `get_public_project` RPC function
- An `images` storage bucket with the required access policies

## Getting started

1. Clone the repository and enter the project directory.

   ```bash
   git clone <repository-url>
   cd porpolyo
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a local `.env` file with:

   ```env
   NEXT_PUBLIC_APP_NAME=Porpolyo
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Start the development server.

   ```bash
   npm run dev
   ```

5. Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build locally |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/dashboard` | Manage saved portfolios |
| `/builder/new` | Create a portfolio |
| `/builder/:id` | Edit a portfolio |
| `/builder/:id/settings` | Configure project settings |
| `/builder/:id/preview` | Preview before publishing |
| `/:username` | View a published portfolio |

## Project structure

```text
src/
├── app/                 Next.js routes and root layout
├── components/          Pages, editor panels, and shared UI
│   ├── editor/          Canvas, toolbar, structure, and layer tools
│   └── ui/              Chakra provider and UI helpers
├── data/                Templates, palettes, defaults, and limits
├── hooks/               Authentication hooks
├── lib/                 Supabase, project, and upload integrations
├── store/               Zustand editor and upload state
├── types/               Portfolio domain types
├── utils/               Editor and element-style utilities
└── styles.css            Global application and portfolio styles
```

## Security

Do not commit `.env` files, Supabase service-role keys, private credentials, local databases, or uploaded user data. Only the Supabase publishable key belongs in browser-exposed `NEXT_PUBLIC_*` variables; privileged keys must never be added to the frontend.
