-- ============================================================
-- CANAIS: separa E-mail e DM feitos pelo admin
-- (nas abordagens e no "Por onde fechei" dos contratos)
-- Não apaga nada. Pode rodar mais de uma vez sem medo.
-- ============================================================
alter table public.abordagens drop constraint if exists abordagens_canal_check;
alter table public.abordagens add constraint abordagens_canal_check
  check (canal in ('email', 'dm', 'manual', 'instagram_auto', 'onbento', 'plataforma', 'outro'));

alter table public.campanhas drop constraint if exists campanhas_canal_check;
alter table public.campanhas add constraint campanhas_canal_check
  check (canal is null or canal in ('inbound', 'plataforma', 'email', 'dm', 'manual', 'instagram_auto', 'onbento', 'indicacao', 'outro'));

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
