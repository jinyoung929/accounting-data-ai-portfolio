alter table public.projects
  add column if not exists readme_markdown text not null default '';
