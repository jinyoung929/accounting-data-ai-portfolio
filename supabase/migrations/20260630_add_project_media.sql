alter table public.projects
  add column if not exists video_url text,
  add column if not exists figma_url text,
  add column if not exists pdf_url text;
