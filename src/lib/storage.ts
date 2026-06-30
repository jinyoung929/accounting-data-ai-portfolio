import { supabase } from "./supabase";

const BUCKET = "portfolio-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type PortfolioImageKind =
  | "thumbnail"
  | "architecture"
  | "screen"
  | "content";

function getExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  return extension && /^[a-z0-9]+$/.test(extension)
    ? extension
    : "jpg";
}

export async function uploadPortfolioImage(
  file: File,
  kind: PortfolioImageKind,
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지 파일은 5MB 이하만 업로드할 수 있습니다.");
  }

  const path = `projects/${kind}-${Date.now()}-${crypto.randomUUID()}.${getExtension(file)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
