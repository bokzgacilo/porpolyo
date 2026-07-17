import { nanoid } from "nanoid";
import { useUploadStore } from "../store/uploadStore";
import { ImageAsset } from "../types/portfolio";
import { supabase } from "./supabase";

type UploadImageOptions = {
  file: File;
  projectId: string;
  slot: string;
  alt: string;
  label?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function uploadImageToSupabase({
  file,
  projectId,
  slot,
  alt,
  label = "Uploading image",
}: UploadImageOptions): Promise<ImageAsset> {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("You must be signed in to upload images");

  const controller = new AbortController();
  useUploadStore.getState().start(label, controller);
  const userId = session.user.id;
  const safeProjectId = sanitizePathPart(projectId || "draft");
  const safeSlot = sanitizePathPart(slot || "image");
  const safeFileName = sanitizeFileName(file.name);
  const objectPath = `private/${userId}/${safeProjectId}/${safeSlot}/${Date.now()}-${nanoid()}-${safeFileName}`;
  const encodedPath = encodeStoragePath(objectPath);

  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/images/${encodedPath}`, {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const { data } = supabase.storage.from("images").getPublicUrl(objectPath);

    return {
      id: nanoid(),
      url: data.publicUrl,
      alt,
      slot,
      objectFit: "cover",
      objectPosition: "center",
    };
  } finally {
    useUploadStore.getState().finish();
  }
}

function sanitizePathPart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function sanitizeFileName(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "image";
}

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}
