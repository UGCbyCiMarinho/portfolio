-- ============================================================
-- PRODUÇÃO: os seus vídeos, da ideia até o post
-- (aba 🎬 Produção do painel)
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- Rode DEPOIS do sql-inspiracao.sql.
-- ============================================================

create table if not exists public.producao (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  titulo          text not null,
  fase            text not null default 'ideia'
                  check (fase in ('ideia', 'roteiro', 'gravacao', 'edicao', 'thumbnail', 'programado', 'postado')),
  ordem           double precision not null default 0,   -- a posição dentro da coluna
  pilar           text check (pilar in ('portfolio', 'bastidores', 'educativo', 'lifestyle', 'fe', 'trends')),
  nicho           text,
  formato         text,
  inspiracao_id   uuid references public.inspiracoes (id) on delete set null,   -- de qual inspiração nasceu
  ideia           text,
  roteiro         text,
  texto_capa      text,        -- o texto da thumbnail
  legenda         text,
  hashtags        text,        -- as 5 hashtags
  palavras_chave  text,        -- a caixa de palavras-chave depois das hashtags
  programado_para timestamptz, -- quando vai ao ar (aparece no Calendário)
  redes           jsonb not null default '{}'::jsonb,   -- {"instagram": {"ok": true, "link": "..."}, "tiktok": ..., "youtube": ..., "x": ...}
  obs             text
);
create index if not exists producao_fase_idx on public.producao (fase, ordem);

drop trigger if exists producao_updated_at on public.producao;
create trigger producao_updated_at before update on public.producao
  for each row execute function public.toca_updated_at();

-- A TRANCA: só você, logada, lê e escreve.
alter table public.producao enable row level security;
drop policy if exists "dona faz tudo" on public.producao;
create policy "dona faz tudo" on public.producao
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());
revoke all on public.producao from anon;
grant select, insert, update, delete on public.producao to authenticated;

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
