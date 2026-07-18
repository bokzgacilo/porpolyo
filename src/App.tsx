"use client";

import {
  Edit3,
  ExternalLink,
  Eye,
  LayoutTemplate,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { createDefaultPortfolio } from "./data/defaultPortfolio";
import { useEditorStore } from "./store/editorStore";
import { Portfolio } from "./types/portfolio";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import {
  deleteProject,
  getProject,
  getPublicProject,
  listProjects,
  publishProject,
  saveProject,
} from "./lib/projects";

const Onboarding = dynamic(() =>
  import("./components/Onboarding").then((module) => module.Onboarding),
);
const LandingPage = dynamic(() =>
  import("./components/LandingPage").then((module) => module.LandingPage),
);
const Dashboard = dynamic(() =>
  import("./components/Dashboard").then((module) => module.Dashboard),
);
const Editor = dynamic(
  () => import("./components/Editor").then((module) => module.Editor),
  { ssr: false },
);
const PortfolioPreview = dynamic(() =>
  import("./components/PortfolioPreview").then(
    (module) => module.PortfolioPreview,
  ),
);
const PortfolioPreviewPage = dynamic(() =>
  import("./components/PortfolioPreviewPage").then(
    (module) => module.PortfolioPreviewPage,
  ),
);
const ProjectSettings = dynamic(() =>
  import("./components/ProjectSettings").then(
    (module) => module.ProjectSettings,
  ),
);

type Route =
  | "landing"
  | "onboarding"
  | "editor"
  | "project-settings"
  | "preview"
  | "dashboard"
  | "public";

export function App() {
  const pathname = usePathname();
  const router = useRouter();
  const route = routeFromPath(pathname);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [error, setError] = useState("");
  const { portfolio, previewMode } = useEditorStore(
    useShallow((state) => ({
      portfolio: state.portfolio,
      previewMode: state.previewMode,
    })),
  );
  const { setPortfolio, setPreviewMode, markSaved } = useEditorStore(
    useShallow((state) => ({
      setPortfolio: state.setPortfolio,
      setPreviewMode: state.setPreviewMode,
      markSaved: state.markSaved,
    })),
  );
  const auth = useSupabaseAuth();

  useEffect(() => {
    const path = pathname;
    const load = async () => {
      try {
        if (path.startsWith("/builder/") && auth.user) {
          const id = path.split("/")[2];
          if (id && id !== "new" && portfolio?.id !== id)
            setPortfolio(await getProject(id, auth.user.id));
        }
        if (
          path.startsWith("/portfolio/") &&
          portfolio?.owner.username !== path.split("/")[2]
        ) {
          setPortfolio(await getPublicProject(path.split("/")[2]));
        }
        if (
          isRootPublicPath(path) &&
          portfolio?.owner.username !== path.slice(1)
        ) {
          setPortfolio(await getPublicProject(path.slice(1)));
        }
        if (path.startsWith("/dashboard") && auth.user) {
          setPortfoliosLoading(true);
          setPortfolios(await listProjects(auth.user.id));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load portfolio",
        );
      } finally {
        if (path.startsWith("/dashboard")) setPortfoliosLoading(false);
      }
    };
    void load();
  }, [
    auth.user,
    pathname,
    portfolio?.id,
    portfolio?.owner.username,
    setPortfolio,
  ]);

  const navigate = (_nextRoute: Route, path: string) => {
    router.push(path);
  };

  const loginWithGoogle = async () => {
    try {
      await auth.signInWithGoogle();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not start Google login",
      );
    }
  };

  const startBuilding = () => {
    if (!auth.user) {
      void loginWithGoogle();
      return;
    }
    navigate("onboarding", "/builder/new");
  };

  const logout = async () => {
    try {
      await auth.signOut();
      router.replace("/");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Could not log out",
      );
    }
  };

  const openDashboard = () => {
    if (!auth.user) {
      void loginWithGoogle();
      return;
    }
    navigate("dashboard", "/dashboard");
  };

  const savePortfolio = async () => {
    if (!portfolio || !auth.user) return;
    const saved = await saveProject(portfolio, auth.user.id);
    markSaved(saved);
  };

  const publishPortfolio = async () => {
    if (!portfolio || !auth.user) return;
    const saved = await saveProject(portfolio, auth.user.id);
    markSaved(saved);
    const published = await publishProject(saved, auth.user.id);
    markSaved(published);
    navigate("public", `/${published.owner.username}`);
  };

  const deletePortfolio = async () => {
    if (!portfolio || !auth.user) return;
    const confirmed = window.confirm(
      `Delete "${portfolio.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    await deleteProject(portfolio.id, auth.user.id);
    setPortfolios((current) =>
      current.filter((item) => item.id !== portfolio.id),
    );
    navigate("dashboard", "/dashboard");
    setPortfolios(await listProjects(auth.user.id));
  };

  if (error) {
    return (
      <main className="error-screen">
        <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
        <p>{error}</p>
        <button onClick={() => navigate("landing", "/")}>Back home</button>
      </main>
    );
  }

  if (auth.loading && isProtectedRoute(route)) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        gap="3"
      >
        <Spinner />
        <Text color="fg.muted">Checking your session...</Text>
      </Flex>
    );
  }

  if (!auth.user && isProtectedRoute(route)) {
    return (
      <LandingPage
        authUser={auth.user}
        authLoading={auth.loading}
        onLogin={loginWithGoogle}
        onStart={startBuilding}
        onDashboard={openDashboard}
      />
    );
  }

  if (route === "onboarding") {
    return (
      <Onboarding
        onBack={() => navigate("dashboard", "/dashboard")}
        onBuild={async (templateId, paletteId, owner) => {
          if (!auth.user) throw new Error("Please sign in before creating a project.");
          const newPortfolio = createDefaultPortfolio(
            templateId,
            paletteId,
            owner,
          );
          const savedPortfolio = await saveProject(newPortfolio, auth.user.id);
          setPortfolio(savedPortfolio);
          setPortfolios((current) => [
            savedPortfolio,
            ...current.filter((item) => item.id !== savedPortfolio.id),
          ]);
          navigate("editor", `/builder/${savedPortfolio.id}`);
        }}
      />
    );
  }

  if (route === "editor" && portfolio) {
    return (
      <Editor
        onBack={() => navigate("dashboard", "/dashboard")}
        onSave={savePortfolio}
        onPreview={() =>
          navigate("preview", `/builder/${portfolio.id}/preview`)
        }
        onSettings={() =>
          navigate("project-settings", `/builder/${portfolio.id}/settings`)
        }
        onPublish={publishPortfolio}
      />
    );
  }

  if (route === "project-settings" && portfolio) {
    return (
      <ProjectSettings
        portfolio={portfolio}
        onBack={() => navigate("editor", `/builder/${portfolio.id}`)}
        onChange={setPortfolio}
        onSave={savePortfolio}
        onDelete={deletePortfolio}
      />
    );
  }

  if ((route === "preview" || route === "public") && portfolio) {
    return (
      <div>
        <PageMetadata portfolio={portfolio} />
        {route === "preview" ? (
          <PortfolioPreviewPage
            portfolio={portfolio}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            onBack={() => navigate("editor", `/builder/${portfolio.id}`)}
            onPublish={publishPortfolio}
          />
        ) : (
          <PortfolioPreview
            portfolio={portfolio}
            selected={undefined}
            onSelect={() => undefined}
          />
        )}
      </div>
    );
  }

  if (route === "dashboard") {
    return (
      <Dashboard
        authUser={auth.user}
        portfolios={portfolios}
        loading={portfoliosLoading}
        onNew={() => navigate("onboarding", "/builder/new")}
        onLogout={logout}
        onOpen={(item, target) => {
          setPortfolio(item);
          if (target === "editor") navigate("editor", `/builder/${item.id}`);
          else if (target === "settings")
            navigate("project-settings", `/builder/${item.id}/settings`);
          else navigate("public", `/${item.owner.username}`);
        }}
      />
    );
  }

  return (
    <LandingPage
      authUser={auth.user}
      authLoading={auth.loading}
      onLogin={loginWithGoogle}
      onStart={startBuilding}
      onDashboard={openDashboard}
    />
  );
}

function routeFromPath(path: string): Route {
  if (path === "/builder/new" || path.startsWith("/templates"))
    return "onboarding";
  if (path.startsWith("/builder/") && path.endsWith("/preview"))
    return "preview";
  if (path.startsWith("/builder/") && path.endsWith("/settings"))
    return "project-settings";
  if (path.startsWith("/builder/")) return "editor";
  if (path.startsWith("/portfolio/")) return "public";
  if (path.startsWith("/dashboard")) return "dashboard";
  if (isRootPublicPath(path)) return "public";
  return "landing";
}

function isProtectedRoute(route: Route) {
  return [
    "dashboard",
    "onboarding",
    "editor",
    "project-settings",
    "preview",
  ].includes(route);
}

function isRootPublicPath(path: string) {
  if (!path || path === "/") return false;
  const reserved = new Set([
    "builder",
    "dashboard",
    "templates",
    "settings",
    "portfolio",
    "privacy",
    "terms",
    "dev",
    "api",
    "uploads",
  ]);
  const [slug, extra] = path.slice(1).split("/");
  return !!slug && !extra && !reserved.has(slug);
}

function PageMetadata({ portfolio }: { portfolio: Portfolio }) {
  useEffect(() => {
    const head = portfolio.head;
    if (!head) return;
    document.title = head.title || portfolio.title;
    upsertMeta("description", head.description || "");
    upsertMeta("keywords", head.keywords || "");
    upsertMeta("author", head.author || portfolio.owner.fullName);
    upsertMeta("robots", head.robots || "index,follow");
    upsertMeta(
      "og:title",
      head.ogTitle || head.title || portfolio.title,
      "property",
    );
    upsertMeta(
      "og:description",
      head.ogDescription || head.description || "",
      "property",
    );
    upsertMeta("og:image", head.ogImage || "", "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta(
      "twitter:title",
      head.twitterTitle || head.ogTitle || head.title || portfolio.title,
    );
    upsertMeta(
      "twitter:description",
      head.twitterDescription || head.ogDescription || head.description || "",
    );
    upsertMeta("twitter:image", head.twitterImage || head.ogImage || "");
    upsertCanonical(head.canonicalUrl || "");
    upsertFavicon(head.favicon || "");
  }, [portfolio]);

  return null;
}

function upsertMeta(
  name: string,
  content: string,
  attr: "name" | "property" = "name",
) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${name}"]`,
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!href) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function upsertFavicon(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!href) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "icon";
    document.head.appendChild(tag);
  }
  tag.href = href;
}
