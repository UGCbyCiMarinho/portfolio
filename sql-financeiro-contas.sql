-- ============================================================
-- FINANCEIRO: SALDO DAS CONTAS (PayPal, Wise...)
-- O saldo parte de um valor conferido por você e o admin vai somando
-- sozinho o que cai na conta e tirando o que sai dela.
-- Rode DEPOIS do sql-financeiro.sql.
-- Cole tudo no SQL Editor do Supabase e clique em Run.
-- Pode rodar mais de uma vez sem problema.
-- ============================================================

-- 1. As contas
create table if not exists public.fin_contas (
  id        uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome      text not null,                 -- igual ao "Por onde" dos recebimentos (PayPal, Wise...)
  moeda     text not null default 'CAD',
  ordem     integer not null default 0,
  ativa     boolean not null default true
);

-- 2. O que mexe no saldo e não é receita nem despesa:
--    saldo   = você conferiu o saldo real (o cálculo recomeça daqui)
--    saida   = transferência para o banco (ou outra conta)
--    entrada = dinheiro que entrou sem ser receita (ex.: transferência de outra conta)
create table if not exists public.fin_movimentos (
  id        uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  conta_id  uuid not null references public.fin_contas (id) on delete cascade,
  data      date not null default current_date,
  tipo      text not null check (tipo in ('saldo', 'saida', 'entrada')),
  valor     numeric(12, 2) not null default 0,
  destino   text,
  obs       text
);
create index if not exists fin_movimentos_conta_idx on public.fin_movimentos (conta_id, data);

-- 3. Despesa paga com qual conta (vazio = cartão ou outra)
alter table public.fin_despesas add column if not exists conta_id uuid references public.fin_contas (id) on delete set null;
-- 4. Quando o recebimento foi registrado (para o saldo saber se veio antes ou depois da conferência)
alter table public.fin_receber add column if not exists recebido_em timestamptz;

-- 5. A TRANCA
do $$
declare t text;
begin
  foreach t in array array['fin_contas', 'fin_movimentos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "dona faz tudo" on public.%I', t);
    execute format('create policy "dona faz tudo" on public.%I for all to authenticated using (public.eh_dona()) with check (public.eh_dona())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- 6. Suas duas contas, com o saldo de 14/10/2026
insert into public.fin_contas (id, nome, moeda, ordem) values
  ('0c0a0000-0000-4000-8000-000000000001', 'PayPal', 'CAD', 1),
  ('0c0a0000-0000-4000-8000-000000000002', 'Wise', 'USD', 2)
on conflict (id) do nothing;
insert into public.fin_movimentos (id, conta_id, data, tipo, valor, obs) values
  ('0c0b0000-0000-4000-8000-000000000001', '0c0a0000-0000-4000-8000-000000000001', '2026-10-14', 'saldo', 2144.81, 'Saldo inicial'),
  ('0c0b0000-0000-4000-8000-000000000002', '0c0a0000-0000-4000-8000-000000000002', '2026-10-14', 'saldo', 1168.57, 'Saldo inicial (uns CA$ 1.665,85)')
on conflict (id) do nothing;

-- Pronto! Se apareceu "Success", deu tudo certo.
