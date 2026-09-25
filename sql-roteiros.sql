-- ============================================================
-- ROTEIROS: biblioteca de transcrições (seus vídeos e de outras creators)
-- CONFIGURAÇÕES: onde fica guardada a sua chave da Supadata
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================


-- 1. QUEM É A DONA (a mesma regra das outras tabelas do painel)
create or replace function public.eh_dona()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'email') = 'cimarinho.ugc@gmail.com', false)
$$;

-- Atualiza a coluna updated_at sozinha sempre que uma linha muda
create or replace function public.toca_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;


-- 2. TABELA ROTEIROS
create table if not exists public.roteiros (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  fonte       text check (fonte in ('instagram', 'tiktok', 'youtube', 'manual')),
  url         text,
  perfil      text,                                   -- @ de quem postou
  de_quem     text not null default 'outra' check (de_quem in ('minha', 'outra')),
  titulo      text,
  transcricao text,
  legenda     text,                                   -- legenda do post
  postado_em  date,
  tags        text[] not null default '{}',
  obs         text,                                   -- as suas notas
  status      text not null default 'pronto' check (status in ('processando', 'pronto', 'falhou')),
  erro        text,                                   -- motivo, quando falha
  segmentos   jsonb                                   -- trechos com tempo, quando vierem
);

create index if not exists roteiros_created_at_idx on public.roteiros (created_at desc);

drop trigger if exists roteiros_updated_at on public.roteiros;
create trigger roteiros_updated_at before update on public.roteiros
  for each row execute function public.toca_updated_at();


-- 3. TABELA CONFIGURAÇÕES (chave e valor)
create table if not exists public.configuracoes (
  chave      text primary key,
  valor      text,
  updated_at timestamptz not null default now()
);

drop trigger if exists configuracoes_updated_at on public.configuracoes;
create trigger configuracoes_updated_at before update on public.configuracoes
  for each row execute function public.toca_updated_at();


-- 4. A TRANCA (RLS): só você, logada, lê e escreve. Nada para quem não está logado.
alter table public.roteiros      enable row level security;
alter table public.configuracoes enable row level security;

drop policy if exists "dona le"      on public.roteiros;
drop policy if exists "dona cria"    on public.roteiros;
drop policy if exists "dona muda"    on public.roteiros;
drop policy if exists "dona apaga"   on public.roteiros;
create policy "dona le"    on public.roteiros for select to authenticated using (public.eh_dona());
create policy "dona cria"  on public.roteiros for insert to authenticated with check (public.eh_dona());
create policy "dona muda"  on public.roteiros for update to authenticated using (public.eh_dona()) with check (public.eh_dona());
create policy "dona apaga" on public.roteiros for delete to authenticated using (public.eh_dona());

drop policy if exists "dona le"      on public.configuracoes;
drop policy if exists "dona cria"    on public.configuracoes;
drop policy if exists "dona muda"    on public.configuracoes;
drop policy if exists "dona apaga"   on public.configuracoes;
create policy "dona le"    on public.configuracoes for select to authenticated using (public.eh_dona());
create policy "dona cria"  on public.configuracoes for insert to authenticated with check (public.eh_dona());
create policy "dona muda"  on public.configuracoes for update to authenticated using (public.eh_dona()) with check (public.eh_dona());
create policy "dona apaga" on public.configuracoes for delete to authenticated using (public.eh_dona());

revoke all on public.roteiros, public.configuracoes from anon;
grant select, insert, update, delete on public.roteiros, public.configuracoes to authenticated;


-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
