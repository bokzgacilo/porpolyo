import { Portfolio } from "../types/portfolio";
import { supabase } from "./supabase";

type ProjectRow = {
  id: string;
  title: string;
  username: string;
  template_id: string;
  palette_id: string;
  head: Portfolio["head"];
  owner_profile: Portfolio["owner"];
  sections: Portfolio["sections"];
  settings: Portfolio["settings"];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

const projectColumns = [
  "id",
  "title",
  "username",
  "template_id",
  "palette_id",
  "head",
  "owner_profile",
  "sections",
  "settings",
  "is_public",
  "created_at",
  "updated_at",
].join(",");

function toPortfolio(row: ProjectRow): Portfolio {
  return {
    id: row.id,
    title: row.title,
    templateId: row.template_id,
    paletteId: row.palette_id,
    head: row.head,
    owner: { ...row.owner_profile, username: row.username },
    sections: row.sections,
    settings: { ...row.settings, public: row.is_public },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectPayload(portfolio: Portfolio, ownerId: string) {
  const isPublic = portfolio.settings.public;

  return {
    id: portfolio.id,
    owner_id: ownerId,
    title: portfolio.title,
    username: portfolio.owner.username,
    template_id: portfolio.templateId,
    palette_id: portfolio.paletteId,
    head: portfolio.head,
    owner_profile: portfolio.owner,
    sections: portfolio.sections,
    settings: portfolio.settings,
    is_public: isPublic,
    published_at: isPublic ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

export async function listProjects(ownerId: string): Promise<Portfolio[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as ProjectRow[]).map(toPortfolio);
}

export async function getProject(id: string, ownerId: string): Promise<Portfolio> {
  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single();

  if (error) throw error;
  return toPortfolio(data as unknown as ProjectRow);
}

export async function getPublicProject(username: string): Promise<Portfolio> {
  const { data, error } = await supabase.rpc("get_public_project", {
    project_username: username,
  });

  if (error) throw error;
  if (!data) throw new Error("Portfolio not found");
  return data as unknown as Portfolio;
}

export async function getProjectAnalytics(id: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("daily_views")
    .eq("id", id)
    .single();

  if (error) throw error;
  const dailyViews = (data as unknown as { daily_views: Record<string, number> }).daily_views;

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + index - 29);
    return dailyViews[date.toISOString().slice(0, 10)] || 0;
  });
}

export async function saveProject(portfolio: Portfolio, ownerId: string): Promise<Portfolio> {
  const { data, error } = await supabase
    .from("projects")
    .upsert(projectPayload(portfolio, ownerId), { onConflict: "id" })
    .select(projectColumns)
    .single();

  if (error) throw error;
  return toPortfolio(data as unknown as ProjectRow);
}

export async function publishProject(portfolio: Portfolio, ownerId: string): Promise<Portfolio> {
  const settings = { ...portfolio.settings, public: true };
  const { data, error } = await supabase
    .from("projects")
    .update({
      settings,
      is_public: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolio.id)
    .eq("owner_id", ownerId)
    .select(projectColumns)
    .single();

  if (error) throw error;
  return toPortfolio(data as unknown as ProjectRow);
}

export async function deleteProject(id: string, ownerId: string): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) throw error;
}
