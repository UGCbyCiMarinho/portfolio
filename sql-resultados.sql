-- ============================================================
-- PROSPECTADO × FECHADO: contratos completos e abordagens
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================


-- 1. CONTRATOS (tabela campanhas): campos novos
alter table public.campanhas add column if not exists moeda         text    not null default 'CAD';
alter table public.campanhas add column if not exists pagamentos    jsonb   not null default '[]';  -- [{valor, data, via}]
alter table public.campanhas add column if not exists gift          boolean not null default false; -- produto, sem pagamento
alter table public.campanhas add column if not exists nicho         text;
alter table public.campanhas add column if not exists data_contrato date;
alter table public.campanhas add column if not exists vencimento    date;   -- previsão do que falta receber
alter table public.campanhas add column if not exists canal         text;   -- por onde fechou
alter table public.campanhas add column if not exists canal_detalhe text;   -- ex.: qual plataforma

alter table public.campanhas drop constraint if exists campanhas_moeda_check;
alter table public.campanhas add constraint campanhas_moeda_check check (moeda in ('CAD', 'USD', 'EUR'));
alter table public.campanhas drop constraint if exists campanhas_canal_check;
alter table public.campanhas add constraint campanhas_canal_check
  check (canal is null or canal in ('inbound', 'plataforma', 'manual', 'instagram_auto', 'onbento', 'indicacao', 'outro'));


-- 2. ABORDAGENS: quantas marcas você abordou, por dia e por canal
create table if not exists public.abordagens (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data       date not null,                 -- dia (ou começo do período)
  ate        date,                          -- fim do período, quando for o total da semana
  canal      text not null check (canal in ('manual', 'instagram_auto', 'onbento', 'plataforma', 'outro')),
  quantidade integer not null check (quantidade >= 0),
  detalhe    text,                          -- origem da marca, nome da plataforma...
  marca_id   uuid,                          -- quando veio do "📨 Prospectei"
  chave      text unique,                   -- usada pelo sincronizador do Instagram
  obs        text
);
create index if not exists abordagens_data_idx on public.abordagens (data);

alter table public.abordagens enable row level security;
drop policy if exists "dona faz tudo" on public.abordagens;
create policy "dona faz tudo" on public.abordagens
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());
revoke all on public.abordagens from anon;
grant select, insert, update, delete on public.abordagens to authenticated;


-- 3. PORTINHA DO INSTAGRAM AUTOMÁTICO
-- O SocialSellPro, no seu Mac, usa uma senha própria para mandar o número
-- de DMs do dia. Ela só serve para isso: não lê nada e não mexe em mais nada.
insert into public.configuracoes (chave, valor)
values ('senha_sincronizador', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (chave) do nothing;

create or replace function public.registrar_instagram_auto(senha text, dia date, qtd integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if senha is null or senha <> (select valor from public.configuracoes where chave = 'senha_sincronizador') then
    raise exception 'senha errada';
  end if;
  if qtd is null or qtd < 0 or qtd > 5000 or dia is null or dia > current_date + 1 then
    raise exception 'valor estranho';
  end if;
  insert into public.abordagens (data, canal, quantidade, detalhe, chave)
  values (dia, 'instagram_auto', qtd, 'SocialSellPro', 'instagram_auto:' || dia)
  on conflict (chave) do update set quantidade = excluded.quantidade;
end
$$;
revoke all on function public.registrar_instagram_auto(text, date, integer) from public;
grant execute on function public.registrar_instagram_auto(text, date, integer) to anon, authenticated;


-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
