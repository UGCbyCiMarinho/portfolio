-- ============================================================
-- FINANCEIRO: contas a receber e a pagar, receitas, despesas,
-- assinaturas e a lista "Quero investir".
-- E nas Campanhas: os vídeos de cada contrato.
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================

-- 1. CAMPANHAS: a lista de vídeos de cada contrato
--    [{"nome": "Unboxing", "tipo": "organico|ads|ambos", "status": "Briefing..."}]
alter table public.campanhas add column if not exists videos jsonb not null default '[]';

-- 2. CONTAS A RECEBER: cada parcela de um contrato.
--    Enquanto recebido = false, aparece em "Contas a receber".
--    Quando recebe, vira receita (valor_recebido = o que caiu na conta).
create table if not exists public.fin_receber (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz not null default now(),
  campanha_id    uuid references public.campanhas (id) on delete set null,
  cliente        text,
  descricao      text,
  nicho          text,
  canal          text,
  canal_detalhe  text,
  moeda          text not null default 'CAD',      -- moeda do contrato
  valor          numeric(12, 2) not null default 0, -- valor previsto da parcela
  quando         text,                              -- assinatura | entrega | data
  vencimento     date,
  via            text,                              -- PayPal | Wise | ...
  recebido       boolean not null default false,
  data_recebido  date,
  conta_moeda    text,                              -- moeda da conta onde caiu (PayPal = CAD, Wise = USD)
  valor_recebido numeric(12, 2),                    -- o que caiu na conta (líquido)
  taxa           numeric(12, 2) not null default 0, -- taxa do banco, só para consulta
  cotacao        numeric(14, 6),                    -- quantos CA$ vale 1 unidade da conta_moeda no dia
  valor_cad      numeric(12, 2),                    -- valor_recebido em CA$
  ordem          integer not null default 0,
  obs            text
);
create index if not exists fin_receber_campanha_idx on public.fin_receber (campanha_id);

-- 3. DESPESAS (pagas) e CONTAS A PAGAR (paga = false)
create table if not exists public.fin_despesas (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz not null default now(),
  data           date not null default current_date,  -- quando pagou (ou quando foi lançada, se ainda não pagou)
  descricao      text not null,
  categoria      text not null default 'outros',
  moeda          text not null default 'CAD',
  valor          numeric(12, 2) not null default 0,
  cotacao        numeric(14, 6),
  valor_cad      numeric(12, 2),
  dedutivel      text not null default 'sim' check (dedutivel in ('sim', 'talvez', 'nao')),
  paga           boolean not null default true,
  vencimento     date,
  origem         text not null default 'manual',      -- manual | dizimo | assinatura | investimento | importado
  recorrencia_id uuid,
  receber_id     uuid references public.fin_receber (id) on delete cascade,  -- o dízimo de qual recebimento
  investir_id    uuid,
  nota_url       text,
  obs            text
);
create index if not exists fin_despesas_data_idx on public.fin_despesas (data);

-- 4. ASSINATURAS (cobram sozinhas no cartão todo mês)
create table if not exists public.fin_recorrencias (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),
  descricao  text not null,
  categoria  text not null default 'assinaturas',
  moeda      text not null default 'CAD',
  valor      numeric(12, 2) not null default 0,
  dedutivel  text not null default 'sim' check (dedutivel in ('sim', 'talvez', 'nao')),
  inicio     date not null default current_date,  -- dia da 1ª cobrança (repete todo mês nesse dia)
  ate        date,                                -- última cobrança (vazio = sem fim)
  ativa      boolean not null default true,
  pulos      jsonb not null default '[]'          -- meses que não cobraram (["2026-03-01"])
);

-- 5. QUERO INVESTIR (lista de desejos)
create table if not exists public.fin_investir (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  nome        text not null,
  categoria   text not null default 'outro',
  prioridade  text not null default 'media' check (prioridade in ('alta', 'media', 'baixa')),
  moeda       text not null default 'CAD',
  valor       numeric(12, 2) not null default 0,
  link        text,
  nota        text,
  status      text not null default 'quero' check (status in ('quero', 'comprei')),
  data        date default current_date,
  data_compra date,
  despesa_id  uuid
);

-- 6. A TRANCA: só você, logada, lê e escreve.
do $$
declare t text;
begin
  foreach t in array array['fin_receber', 'fin_despesas', 'fin_recorrencias', 'fin_investir'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "dona faz tudo" on public.%I', t);
    execute format('create policy "dona faz tudo" on public.%I for all to authenticated using (public.eh_dona()) with check (public.eh_dona())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
