-- ============================================================
-- PROSPECÇÃO POR E-MAIL (aba Prospecção do painel)
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================

-- 1. A caixinha de seleção da aba Marcas passa a ficar salva no banco.
--    Você marca as marcas lá, e a aba Prospecção sabe quem são.
alter table public.base_marcas add column if not exists selecionada boolean not null default false;

-- 2. O histórico: uma linha para cada e-mail enviado (ou que falhou).
create table if not exists public.email_envios (
  id         uuid primary key default gen_random_uuid(),
  data       timestamptz not null default now(),
  email      text not null,
  marca      text,                               -- nome da marca, para achar fácil no histórico
  marca_id   uuid,                               -- a marca da aba Marcas (se veio de lá)
  assunto    text,
  via        text not null default 'resend'
             check (via in ('resend', 'gmail', 'teste')),   -- resend = automático, gmail = fila no Gmail
  status     text not null default 'ok'
             check (status in ('ok', 'erro')),
  erro       text,                               -- o motivo, quando falhou
  resend_id  text                                -- o número que o Resend devolve (para achar lá, se precisar)
);
create index if not exists email_envios_email_idx on public.email_envios (lower(email));
create index if not exists email_envios_data_idx on public.email_envios (data desc);

-- 3. Quem pediu para não receber mais: nunca mais recebe nada.
create table if not exists public.email_optout (
  id     uuid primary key default gen_random_uuid(),
  data   timestamptz not null default now(),
  email  text not null,
  motivo text
);
create unique index if not exists email_optout_email_idx on public.email_optout (lower(email));

-- A TRANCA: só você, logada, lê e escreve. Nada para quem não está logado.
-- (a função enviar-emails grava o histórico por dentro do Supabase, com a chave dela)
alter table public.email_envios enable row level security;
drop policy if exists "dona faz tudo" on public.email_envios;
create policy "dona faz tudo" on public.email_envios
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());
revoke all on public.email_envios from anon;
grant select, insert, update, delete on public.email_envios to authenticated;

alter table public.email_optout enable row level security;
drop policy if exists "dona faz tudo" on public.email_optout;
create policy "dona faz tudo" on public.email_optout
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());
revoke all on public.email_optout from anon;
grant select, insert, update, delete on public.email_optout to authenticated;

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
