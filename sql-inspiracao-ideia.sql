-- ============================================================
-- INSPIRAÇÃO: nova opção "💡 Ideia de conteúdo"
-- Cole tudo no SQL Editor do Supabase e clique em Run.
-- Pode rodar mais de uma vez sem problema.
-- ============================================================
alter table public.inspiracoes drop constraint if exists inspiracoes_usar_check;
alter table public.inspiracoes add constraint inspiracoes_usar_check
  check (usar in ('sim', 'nao', 'talvez', 'referencia', 'ideia'));   -- vazio = 🆕 para analisar

-- Pronto! Se apareceu "Success", deu tudo certo.
