-- ============================================================
-- CONSERTA ACENTOS que chegaram trocados no banco
-- (ex.: "M√°quina de caf√©" volta a ser "Máquina de café")
-- Pode rodar mais de uma vez sem problema.
-- ============================================================
create or replace function public.conserta_acentos(t text) returns text language plpgsql as $$
declare r record;
begin
  if t is null or (position(chr(8730) in t) = 0 and position(chr(8218) in t) = 0 and position(chr(172) in t) = 0) then return t; end if;
  for r in select * from (values
    ('‚Äì', '–'),
    ('‚Äî', '—'),
    ('‚Äò', '‘'),
    ('‚Äô', '’'),
    ('‚Äú', '“'),
    ('‚Äù', '”'),
    ('‚Ä¢', '•'),
    ('‚Ä¶', '…'),
    ('√°', 'á'),
    ('√†', 'à'),
    ('√¢', 'â'),
    ('√£', 'ã'),
    ('√©', 'é'),
    ('√™', 'ê'),
    ('√≠', 'í'),
    ('√≥', 'ó'),
    ('√¥', 'ô'),
    ('√µ', 'õ'),
    ('√∫', 'ú'),
    ('√º', 'ü'),
    ('√ß', 'ç'),
    ('√Å', 'Á'),
    ('√Ä', 'À'),
    ('√Ç', 'Â'),
    ('√É', 'Ã'),
    ('√â', 'É'),
    ('√ä', 'Ê'),
    ('√ç', 'Í'),
    ('√ì', 'Ó'),
    ('√î', 'Ô'),
    ('√ï', 'Õ'),
    ('√ö', 'Ú'),
    ('√ú', 'Ü'),
    ('√á', 'Ç'),
    ('√±', 'ñ'),
    ('¬∑', '·')
  ) as v(errado, certo) loop
    t := replace(t, r.errado, r.certo);
  end loop;
  return t;
end $$;

update public.base_marcas set nome = public.conserta_acentos(nome), produto = public.conserta_acentos(produto), obs = public.conserta_acentos(obs), nicho = public.conserta_acentos(nicho)
where nome ~ '[√‚¬]' or produto ~ '[√‚¬]' or obs ~ '[√‚¬]' or nicho ~ '[√‚¬]';
update public.abordagens set detalhe = public.conserta_acentos(detalhe), obs = public.conserta_acentos(obs)
where detalhe ~ '[√‚¬]' or obs ~ '[√‚¬]';
update public.campanhas set campanha = public.conserta_acentos(campanha), cliente = public.conserta_acentos(cliente), nicho = public.conserta_acentos(nicho), canal_detalhe = public.conserta_acentos(canal_detalhe)
where campanha ~ '[√‚¬]' or cliente ~ '[√‚¬]' or nicho ~ '[√‚¬]' or canal_detalhe ~ '[√‚¬]';

drop function if exists public.conserta_acentos(text);

