-- ============================================================
-- INSPIRAÇÃO: nova opção "📌 Referência"
-- (vídeos para consultar sempre: transições, efeitos, técnicas)
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Não apaga nada. Pode rodar mais de uma vez sem medo.
-- ============================================================
alter table public.inspiracoes drop constraint if exists inspiracoes_usar_check;
alter table public.inspiracoes add constraint inspiracoes_usar_check
  check (usar in ('sim', 'nao', 'talvez', 'referencia'));   -- vazio = 🆕 para analisar

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
