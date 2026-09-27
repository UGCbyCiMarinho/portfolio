-- ============================================================
-- PAÍS e DISPOSITIVO nas visitas (para o painel)
--   pais        -> sigla de 2 letras do país (ex: CA, BR, US). Nada pessoal.
--   dispositivo -> 'computador' ou 'movel'
-- Alimenta "Visitas por país" e "Dispositivos" na aba Portfólio.
-- Cole TUDO no SQL Editor do Supabase e clique em Run.
-- ============================================================
alter table public.visitas add column if not exists pais        text check (char_length(pais) <= 2);
alter table public.visitas add column if not exists dispositivo text check (char_length(dispositivo) <= 20);
