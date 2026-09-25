-- ============================================================
-- MARCAS: a sua base de prospecção e de campanhas
-- (a aba "Inbound pelo portfólio" continua usando a tabela marcas)
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================

create table if not exists public.base_marcas (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  nome           text not null,
  instagram      text,
  email          text,
  telefone       text,
  site           text,
  nicho          text,                     -- Skincare, Haircare, Beauty, Teens...
  origem         text not null default 'outro'
                 check (origem in ('instagram', 'x', 'linkedin', 'tiktok', 'email', 'google', 'indicacao', 'portfolio', 'outro')),
  situacao       text not null default 'quero_prospectar'
                 check (situacao in ('quero_prospectar', 'prospectada', 'em_conversa', 'ja_trabalhei', 'sem_interesse')),
  obs            text,
  ultimo_contato date,
  nao_enviar     boolean not null default false,   -- pediu para não receber campanha
  exemplo        boolean not null default false
);

create index if not exists base_marcas_nome_idx on public.base_marcas (lower(nome));

drop trigger if exists base_marcas_updated_at on public.base_marcas;
create trigger base_marcas_updated_at before update on public.base_marcas
  for each row execute function public.toca_updated_at();

-- A TRANCA: só você, logada, lê e escreve. Nada para quem não está logado.
alter table public.base_marcas enable row level security;

drop policy if exists "dona faz tudo" on public.base_marcas;
create policy "dona faz tudo" on public.base_marcas
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

revoke all on public.base_marcas from anon;
grant select, insert, update, delete on public.base_marcas to authenticated;

-- Uma linha de exemplo, só para você ver o formato. Pode apagar.
insert into public.base_marcas (nome, instagram, email, nicho, origem, situacao, obs, exemplo)
select 'Marca Exemplo', '@marcaexemplo', 'contato@marcaexemplo.com', 'Skincare', 'instagram', 'quero_prospectar',
       'Linha de exemplo. Pode apagar.', true
where not exists (select 1 from public.base_marcas);


-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
