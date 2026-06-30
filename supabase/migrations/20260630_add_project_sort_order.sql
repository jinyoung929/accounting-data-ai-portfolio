alter table public.projects
add column if not exists sort_order integer;

with ranked as (
  select
    id,
    row_number() over (
      order by updated_at desc nulls last, created_at desc nulls last
    ) as position
  from public.projects
)
update public.projects as projects
set sort_order = ranked.position
from ranked
where projects.id = ranked.id;

alter table public.projects
alter column sort_order set default 0;

alter table public.projects
alter column sort_order set not null;
