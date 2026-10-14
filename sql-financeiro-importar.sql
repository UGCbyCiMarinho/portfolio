-- ============================================================
-- IMPORTAÇÃO DO FINANCEIRO ANTIGO (backup de 14/10/2026)
-- 31 receitas (20 gifts) viram contratos em Campanhas,
-- os pagamentos viram receitas, 70 despesas, 4 assinaturas e 1 investimento.
-- Também passa os pagamentos dos contratos que já estavam no painel
-- para "Contas a receber" e "Receitas".
--
-- Rode DEPOIS do sql-financeiro.sql.
-- Cole tudo no SQL Editor do Supabase e clique em Run.
-- Pode rodar mais de uma vez: nada é duplicado.
-- ============================================================

-- 1. Contratos do backup (se já existir um igual no painel, usa o que existe)
drop table if exists imp_camp;
create temp table imp_camp (id uuid, cliente text, campanha text, orig text, nicho text, gift boolean, moeda text, valor numeric, data date, prazo date, canal text, canal_detalhe text, videos jsonb, real_id uuid);
insert into imp_camp (id, cliente, campanha, orig, nicho, gift, moeda, valor, data, prazo, canal, canal_detalhe, videos) values
  ('cf7592f7-b0a4-52e9-a46e-d6fd0fb65a8c', 'Patricia Streff', 'Edicao de video', 'Edicao de video', 'Edição de vídeo', false, 'USD', 240.0, '2026-02-19', null, 'inbound', null, '[{"nome": "Edicao de video", "tipo": "organico", "status": "Entregue"}]'),
  ('5afb56f4-5e18-5653-9365-a914e7786021', 'Patricia Streff', 'Edicao de video', 'Edicao de video', 'Edição de vídeo', false, 'USD', 230.0, '2026-02-24', null, 'inbound', null, '[{"nome": "Edicao de video", "tipo": "organico", "status": "Entregue"}]'),
  ('4fa8fd46-88b4-5c54-a7ee-bce4d455bf65', 'Therabreath', '1 video', '1 video', 'Beauty', false, 'CAD', 25.0, '2026-04-02', null, 'plataforma', 'weSponsored', '[{"nome": "1 video", "tipo": "organico", "status": "Entregue"}]'),
  ('b27be881-7c9b-5889-88a6-39bb7a57bc45', 'Synergy Hair', '1 video', '1 video', 'Haircare', false, 'USD', 1000.0, '2026-06-22', '2026-07-22', 'onbento', null, '[{"nome": "Vídeo 1", "tipo": "organico", "status": "Entregue"}]'),
  ('5ba477c3-5eda-5f92-9094-48291ec72d90', 'Bonsai Tree Kit - Jacaranda', '1 foto', '1 foto', 'Casa & Decor', false, 'CAD', 15.0, '2026-07-07', null, 'plataforma', 'Join Brands', '[{"nome": "1 foto", "tipo": "organico", "status": "Entregue"}]'),
  ('8b220c60-c026-5daa-8ccf-1200827d9abf', 'Royal Distribution', '4 videos', '4 videos', 'Haircare', false, 'USD', 1120.0, '2026-07-27', '2026-08-31', 'dm', 'Instagram', '[{"nome": "Unboxing", "tipo": "organico", "status": "Entregue"}, {"nome": "Shower Routine", "tipo": "organico", "status": "Entregue"}, {"nome": "Review", "tipo": "organico", "status": "Entregue"}, {"nome": "Hair Mask", "tipo": "organico", "status": "Entregue"}]'),
  ('5e576915-e79c-5fa5-bb47-a1f0aadd7152', 'Pupring', '1 video', '1 video', 'Pet', false, 'USD', 20.0, '2025-11-24', null, 'plataforma', 'InSense', '[{"nome": "1 video", "tipo": "organico", "status": "Entregue"}]'),
  ('6588b9ca-8357-505c-8cea-05d52780f684', 'TC Nutrition', '1 foto', '1 foto', 'Saúde & Fitness', false, 'CAD', 5.0, '2025-10-28', null, 'plataforma', 'Join Brands', '[{"nome": "1 foto", "tipo": "organico", "status": "Entregue"}]'),
  ('e64ee20c-946c-5990-be7b-bfa5e1af05c9', 'Patricia Streff', 'Feedback da mentoria', 'Feedback da mentoria', 'Depoimento', false, 'USD', 50.0, '2025-11-26', null, 'dm', 'Instagram', '[{"nome": "Feedback da mentoria", "tipo": "organico", "status": "Entregue"}]'),
  ('84244fbb-7022-5730-88c5-8619c86ba558', 'Alarmy', '30 vídeos de 20 segundos (encerrado com 16 entregues)', '30 videos de 20 segundos', 'Tech & Apps', false, 'CAD', 614.88, '2026-07-31', '2026-08-25', 'indicacao', 'BluePrint', '[{"nome": "Vídeo 1 - Aug 13, 2026", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 2 - 14/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 3 - 15/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 4 - 16/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 5 - 17/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 6 - 18/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 7 - 19/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 8 - 20/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 9 - 21/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 10 - 22/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 11 - 23/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 12 - 24/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 13 - 25/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 14 - 26/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 15 - 27/08", "tipo": "organico", "status": "Entregue"}, {"nome": "Vídeo 21 - 02/09", "tipo": "organico", "status": "Entregue"}]'),
  ('dfdf9ee7-4cea-5847-a271-67e510b14e95', 'Spew.Money', 'two faceless videos', 'two faceless videos', 'Tech & Apps', false, 'USD', 50.0, '2026-08-11', '2026-08-31', 'inbound', null, '[{"nome": "Vídeo 1", "tipo": "ambos", "status": "Entregue"}, {"nome": "Vídeo 2", "tipo": "ambos", "status": "Entregue"}]'),
  ('e6f6b20c-06ea-5c40-a430-6338b2bbe56f', 'CELLU', 'Creme corporal', 'Creme corporal', 'Beauty', true, 'CAD', 0.0, '2025-10-22', null, 'plataforma', 'InSense', '[{"nome": "Creme corporal", "tipo": "organico", "status": "Entregue"}]'),
  ('2047c23a-68be-5314-ac2d-3dd227a736ca', 'ABERA', 'Scar Removal Cream', 'Scar Removal Cream', 'Beauty', true, 'CAD', 0.0, '2025-10-26', null, 'dm', 'Instagram', '[{"nome": "Scar Removal Cream", "tipo": "organico", "status": "Entregue"}]'),
  ('5b918af5-4b65-533f-b55a-2355aae52584', 'ABERA', 'Melasma Cream', 'Melasma Cream', 'Skincare', true, 'CAD', 0.0, '2025-10-26', null, 'dm', 'Instagram', '[{"nome": "Melasma Cream", "tipo": "organico", "status": "Entregue"}]'),
  ('8cf13721-c104-509c-aec9-9f184c1f776e', 'Formi', 'Sherpa legging', 'Sherpa legging', 'Moda', true, 'CAD', 0.0, '2025-11-14', null, 'plataforma', 'InSense', '[{"nome": "Sherpa legging", "tipo": "organico", "status": "Entregue"}]'),
  ('14b00d5f-ee66-5f65-98da-e923beb27b89', 'Eupholic', 'Óleo de cabelo', 'Óleo de cabelo', 'Haircare', true, 'CAD', 0.0, '2025-11-18', null, 'plataforma', 'InSense', '[{"nome": "Óleo de cabelo", "tipo": "organico", "status": "Entregue"}]'),
  ('abd711cd-2296-5784-a624-48f322e0aa86', 'Prime Cosmetics', 'Lápis de olho', 'Lápis de olho', 'Maquiagem', true, 'CAD', 0.0, '2025-11-21', null, 'plataforma', 'InSense', '[{"nome": "Lápis de olho", "tipo": "organico", "status": "Entregue"}]'),
  ('0e9f1933-bbd0-586b-bc12-88718bbf8d24', 'Prime Cosmetics', 'Máscara', 'Máscara', 'Maquiagem', true, 'CAD', 0.0, '2025-11-21', null, 'plataforma', 'InSense', '[{"nome": "Máscara", "tipo": "organico", "status": "Entregue"}]'),
  ('93eb902d-6788-52cd-9bf3-c2e276a0598a', 'NovaMane', 'Hair Regrow', 'Hair Regrow', 'Haircare', true, 'CAD', 0.0, '2025-11-25', null, 'plataforma', 'InSense', '[{"nome": "Hair Regrow", "tipo": "organico", "status": "Entregue"}]'),
  ('a728efa5-a7ed-576c-9ac2-570b64cdf354', 'APLB', 'Creme corporal', 'Creme corporal', 'Beauty', true, 'CAD', 0.0, '2025-12-17', null, 'plataforma', 'YesStyle', '[{"nome": "Creme corporal", "tipo": "organico", "status": "Entregue"}]'),
  ('ad43b705-4b1e-5645-9698-f0c3f50fd9fd', 'Loreal', 'Revitalift Triple Power LZR Moisturizer 50ml', 'Revitalift Triple Power LZR Moisturizer 50ml', 'Skincare', true, 'CAD', 0.0, '2025-12-31', null, 'plataforma', 'Heylist', '[{"nome": "Revitalift Triple Power LZR Moisturizer 50ml", "tipo": "organico", "status": "Entregue"}]'),
  ('f83ecd85-5d7b-5b2b-a20e-6ec54088e246', 'COSRX', 'The Ceramide Skin Barrier Mist + Cream', 'The Ceramide Skin Barrier Mist + Cream', 'Beauty', true, 'CAD', 0.0, '2026-01-07', null, 'onbento', null, '[{"nome": "The Ceramide Skin Barrier Mist + Cream", "tipo": "organico", "status": "Entregue"}]'),
  ('9be9b270-73f2-5c19-a917-24170c102609', 'Niche Beauty Lab', 'Even In', 'Even In', 'Skincare', true, 'CAD', 0.0, '2026-02-10', null, 'onbento', null, '[{"nome": "Even In", "tipo": "organico", "status": "Entregue"}]'),
  ('561308ea-b119-595a-a25e-fc95d11ac386', 'Niche Beauty Lab', 'Rose calming cleanser, Even In, Bakuchiol, Invisible sunscreen', 'Rose calming cleanser, Even In, Bakuchiol, Invisible sunscreen', 'Skincare', true, 'CAD', 0.0, '2026-02-10', null, 'onbento', null, '[{"nome": "Rose calming cleanser, Even In, Bakuchiol, Invisible sunscre", "tipo": "organico", "status": "Entregue"}]'),
  ('5abb552f-2f5e-5459-b1d0-0ad70ef68f0f', 'Niche Beauty Lab', 'Invisible sunscreen (ASMR)', 'Invisible sunscreen (ASMR)', 'Skincare', true, 'CAD', 0.0, '2026-02-10', null, 'onbento', null, '[{"nome": "Invisible sunscreen (ASMR)", "tipo": "organico", "status": "Entregue"}]'),
  ('a150e3e2-5fda-5c04-a0a6-172fcf6d16c0', 'Button Amsterdam', 'Strass Oval (UGC + selfie)', 'Strass Oval (UGC + selfie)', 'Moda', true, 'CAD', 0.0, '2026-02-10', null, 'plataforma', 'InSense', '[{"nome": "Strass Oval (UGC + selfie)", "tipo": "organico", "status": "Entregue"}]'),
  ('f4a56451-e70f-50f9-b5e3-df31e78cb738', 'Linka.ai', 'AI Platform', 'AI Platform', 'Tech & Apps', true, 'CAD', 0.0, '2026-02-10', null, 'plataforma', 'InSense', '[{"nome": "AI Platform", "tipo": "organico", "status": "Entregue"}]'),
  ('dd9440fa-0489-5394-b855-d81cc0dd90d6', 'Doggyspout', 'Bebedouro de cachorro', 'Bebedouro de cachorro', 'Pet', true, 'CAD', 0.0, '2026-05-21', null, 'plataforma', 'InSense', '[{"nome": "Bebedouro de cachorro", "tipo": "organico", "status": "Entregue"}]'),
  ('d6b8bc10-058a-51ab-a9d7-e4c678b71aed', 'Biolage', '1 Video', '1 Video', 'Haircare', true, 'CAD', 0.0, '2026-08-15', null, 'plataforma', 'L''Oréal (plataforma)', '[{"nome": "1 Video", "tipo": "organico", "status": "Entregue"}]'),
  ('7507f36d-8545-5d95-abe0-2210baa103c9', 'Power Kitchen Toronto', '1 video + 2 story', '1 video + 2 story', null, true, 'CAD', 0.0, '2026-08-17', '2026-08-19', 'inbound', 'Instagram', '[{"nome": "Vídeo de experiência", "tipo": "organico", "status": "Entregue"}, {"nome": "2 stories", "tipo": "organico", "status": "Entregue"}]'),
  ('cb977ac3-b2df-5430-8877-0f18313a4f00', 'Jolie', '1 video', '1 video', 'Casa & Decor', true, 'CAD', 0.0, '2026-08-17', null, 'email', null, '[{"nome": "1 video", "tipo": "organico", "status": "Entregue"}]');

-- acha o contrato que já existe (mesma marca e mesma data; se tiver mais de um no dia, pela descrição)
update imp_camp i set real_id = coalesce(
  (select c.id from public.campanhas c where lower(c.cliente) = lower(i.cliente) and c.data_contrato = i.data
     and (lower(c.campanha) = lower(i.campanha) or lower(c.campanha) = lower(i.orig)) limit 1),
  (select min(c.id::text)::uuid from public.campanhas c where lower(c.cliente) = lower(i.cliente) and c.data_contrato = i.data
     having count(*) = 1 and (select count(*) from imp_camp j where lower(j.cliente) = lower(i.cliente) and j.data = i.data) = 1),
  i.id);

insert into public.campanhas (id, campanha, cliente, tipo, status, qtd, valor, moeda, gift, nicho, data_contrato, prazo, canal, canal_detalhe, videos, pagamento, ativa)
select i.id, i.campanha, i.cliente, 'Conteúdo', 'Entregue', jsonb_array_length(i.videos), i.valor, i.moeda, i.gift, i.nicho, i.data, i.prazo, i.canal, i.canal_detalhe, i.videos, 'pago', false
from imp_camp i where i.real_id = i.id and not exists (select 1 from public.campanhas c where c.id = i.id);

-- nos contratos que já existiam: completa vídeos, nicho e canal (sem apagar o que você já preencheu)
update public.campanhas c set
  videos = case when coalesce(jsonb_array_length(c.videos), 0) = 0 then i.videos else c.videos end,
  nicho = coalesce(c.nicho, i.nicho),
  canal = coalesce(c.canal, i.canal),
  canal_detalhe = coalesce(c.canal_detalhe, i.canal_detalhe)
from imp_camp i where c.id = i.real_id and i.real_id <> i.id;

-- 2. Os pagamentos do backup viram receitas (só nos contratos que ainda não têm nenhuma parcela no Financeiro)
drop table if exists imp_rec;
create temp table imp_rec (id uuid, camp uuid, cliente text, descricao text, nicho text, canal text, canal_detalhe text, moeda text, valor numeric, via text, data date, cotacao numeric, valor_cad numeric, ordem int);
insert into imp_rec values
  ('bfc9f6d1-7ea7-50bf-a4d4-6c010330c9c7', 'cf7592f7-b0a4-52e9-a46e-d6fd0fb65a8c', 'Patricia Streff', 'Edicao de video', 'Edição de vídeo', 'inbound', null, 'USD', 240.0, 'PayPal', '2026-02-19', 1.3696, 328.7, 1),
  ('bba48493-0041-5d51-8ff7-a5db9399a1de', '5afb56f4-5e18-5653-9365-a914e7786021', 'Patricia Streff', 'Edicao de video', 'Edição de vídeo', 'inbound', null, 'USD', 230.0, 'PayPal', '2026-02-24', 1.3708, 315.28, 1),
  ('3c48bed7-31e7-5750-be07-5837004a0f95', '4fa8fd46-88b4-5c54-a7ee-bce4d455bf65', 'Therabreath', '1 video', 'Beauty', 'plataforma', 'weSponsored', 'CAD', 25.0, 'PayPal', '2026-04-02', 1.0, 25.0, 1),
  ('8fa16359-32c1-5191-b3e0-bb80cba0a393', 'b27be881-7c9b-5889-88a6-39bb7a57bc45', 'Synergy Hair', '1 video', 'Haircare', 'onbento', null, 'USD', 500.0, 'PayPal', '2026-06-22', 1.4162, 708.1, 1),
  ('e5a2573b-cb43-5525-9f9a-312c436765d9', 'b27be881-7c9b-5889-88a6-39bb7a57bc45', 'Synergy Hair', '1 video', 'Haircare', 'onbento', null, 'USD', 500.0, 'PayPal', '2026-08-13', 1.3938, 696.9, 2),
  ('a13f8d96-4a28-5b39-8839-b93ec7e1920e', '5ba477c3-5eda-5f92-9094-48291ec72d90', 'Bonsai Tree Kit - Jacaranda', '1 foto', 'Casa & Decor', 'plataforma', 'Join Brands', 'CAD', 15.0, 'PayPal', '2026-07-07', 1.0, 15.0, 1),
  ('10edb336-550b-5c96-916e-0fc7b82c41ba', '8b220c60-c026-5daa-8ccf-1200827d9abf', 'Royal Distribution', '4 videos', 'Haircare', 'dm', 'Instagram', 'USD', 560.0, 'Wise', '2026-07-27', 1.4114, 790.38, 1),
  ('836967cc-bc80-5235-89c9-550fabc39c78', '8b220c60-c026-5daa-8ccf-1200827d9abf', 'Royal Distribution', '4 videos', 'Haircare', 'dm', 'Instagram', 'USD', 560.0, 'Wise', '2026-09-17', 1.3988, 783.33, 2),
  ('b969fee9-283e-5086-b7f9-06e627c2d2ea', '5e576915-e79c-5fa5-bb47-a1f0aadd7152', 'Pupring', '1 video', 'Pet', 'plataforma', 'InSense', 'USD', 20.0, 'PayPal', '2025-11-24', 1.4108, 28.22, 1),
  ('469e26cd-f526-5d1e-992b-0d53b62f9ea6', '6588b9ca-8357-505c-8cea-05d52780f684', 'TC Nutrition', '1 foto', 'Saúde & Fitness', 'plataforma', 'Join Brands', 'CAD', 5.0, 'PayPal', '2025-10-28', 1.0, 5.0, 1),
  ('67458833-cb74-5cfb-8880-886a0f3fca56', 'e64ee20c-946c-5990-be7b-bfa5e1af05c9', 'Patricia Streff', 'Feedback da mentoria', 'Depoimento', 'dm', 'Instagram', 'USD', 50.0, 'PayPal', '2025-11-26', 1.4059, 70.3, 1),
  ('3ba3e79a-7b4f-51d1-af39-f607694c7d5b', '84244fbb-7022-5730-88c5-8619c86ba558', 'Alarmy', '30 vídeos de 20 segundos (encerrado com 16 entregues)', 'Tech & Apps', 'indicacao', 'BluePrint', 'CAD', 614.88, 'PayPal', '2026-09-08', 1.0, 614.88, 1),
  ('9055f857-48da-5e22-84cb-75e1f5c61c2a', 'dfdf9ee7-4cea-5847-a271-67e510b14e95', 'Spew.Money', 'two faceless videos', 'Tech & Apps', 'inbound', null, 'USD', 50.0, 'Wise', '2026-08-11', 1.3927, 69.64, 1);

insert into public.fin_receber (id, campanha_id, cliente, descricao, nicho, canal, canal_detalhe, moeda, valor, quando, vencimento, via, recebido, data_recebido, conta_moeda, valor_recebido, taxa, cotacao, valor_cad, ordem)
select r.id, i.real_id, r.cliente, r.descricao, r.nicho, r.canal, r.canal_detalhe, r.moeda, r.valor, 'data', r.data, r.via, true, r.data, r.moeda, r.valor, 0, r.cotacao, r.valor_cad, r.ordem
from imp_rec r join imp_camp i on i.id = r.camp
where not exists (select 1 from public.fin_receber f where f.id = r.id)
  and not exists (select 1 from public.fin_receber f where f.campanha_id = i.real_id and f.id not in (select id from imp_rec));

-- 3. Contratos que já estavam no painel: os pagamentos antigos viram receitas,
--    e o que faltava receber vira uma parcela em "Contas a receber"
insert into public.fin_receber (campanha_id, cliente, descricao, nicho, canal, canal_detalhe, moeda, valor, quando, vencimento, via, recebido, data_recebido, conta_moeda, valor_recebido, taxa, ordem)
select c.id, c.cliente, c.campanha, c.nicho, c.canal, c.canal_detalhe, coalesce(c.moeda, 'CAD'), (p.v->>'valor')::numeric, 'data', nullif(p.v->>'data', '')::date, p.v->>'via', true,
       coalesce(nullif(p.v->>'data', '')::date, c.data_contrato, current_date), coalesce(c.moeda, 'CAD'), (p.v->>'valor')::numeric, 0, p.n::int
from public.campanhas c
cross join lateral jsonb_array_elements(coalesce(c.pagamentos, '[]'::jsonb)) with ordinality as p(v, n)
where not c.gift and (p.v->>'valor')::numeric > 0
  and not exists (select 1 from public.fin_receber f where f.campanha_id = c.id);

insert into public.fin_receber (campanha_id, cliente, descricao, nicho, canal, canal_detalhe, moeda, valor, quando, vencimento, via, recebido, ordem)
select c.id, c.cliente, c.campanha, c.nicho, c.canal, c.canal_detalhe, coalesce(c.moeda, 'CAD'),
       c.valor - coalesce((select sum((v->>'valor')::numeric) from jsonb_array_elements(coalesce(c.pagamentos, '[]'::jsonb)) v), 0),
       'data', coalesce(c.vencimento, c.prazo), coalesce((select v->>'via' from jsonb_array_elements(coalesce(c.pagamentos, '[]'::jsonb)) v limit 1), 'PayPal'), false, 99
from public.campanhas c
where not c.gift and c.valor > 0 and coalesce(c.pagamento, 'pendente') <> 'pago'
  and c.valor - coalesce((select sum((v->>'valor')::numeric) from jsonb_array_elements(coalesce(c.pagamentos, '[]'::jsonb)) v), 0) > 0.005
  and not exists (select 1 from public.fin_receber f where f.campanha_id = c.id and not f.recebido);

-- contratos antigos sem lista de vídeos: cria pela quantidade
update public.campanhas c set videos = (
  select coalesce(jsonb_agg(jsonb_build_object('nome', 'Vídeo ' || g, 'tipo', case when c.tipo = 'Publicidade' then 'ads' else 'organico' end, 'status', c.status)), '[]'::jsonb)
  from generate_series(1, greatest(coalesce(c.qtd, 1), 1)) g)
where coalesce(jsonb_array_length(c.videos), 0) = 0;

-- 4. Assinaturas
insert into public.fin_recorrencias (id, descricao, categoria, moeda, valor, dedutivel, inicio, ate, ativa) values
  ('bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', 'Canva', 'assinaturas', 'BRL', 24.15, 'sim', '2026-01-01', '2026-12-01', true),
  ('f4bbce22-f0a9-5059-b237-19fa44d89983', 'CapCut', 'assinaturas', 'BRL', 65.9, 'sim', '2026-01-01', '2026-12-01', true),
  ('8c0a14c7-1865-5916-b564-e192156b699c', 'ChatGPT', 'assinaturas', 'CAD', 31.78, 'sim', '2026-01-27', '2026-04-27', true),
  ('1a744413-771c-58e2-9b13-d703a89a7bc8', 'Claude', 'assinaturas', 'CAD', 158.2, 'sim', '2026-07-03', '2027-06-03', true)
on conflict (id) do nothing;

-- 5. Despesas (com a cotação do Banco do Canadá do dia de cada uma)
insert into public.fin_despesas (id, data, descricao, categoria, moeda, valor, cotacao, valor_cad, dedutivel, paga, origem, recorrencia_id, investir_id) values
  ('080e6349-51c8-5ba3-b75a-4a1dad0410e7', '2026-05-13', 'Mentoria com a Angie', 'cursos', 'CAD', 99.0, 1.0, 99.0, 'sim', true, 'importado', null, null),
  ('43fcbb82-dffa-5959-8aa9-3cf4b687898a', '2026-04-24', 'Dizimo', 'dizimo', 'CAD', 74.0, 1.0, 74.0, 'talvez', true, 'importado', null, null),
  ('855582e7-e006-5e0e-92f1-4dee675ff5be', '2026-04-24', 'Pagamento para VA', 'assinaturas', 'CAD', 357.87, 1.0, 357.87, 'sim', true, 'importado', null, null),
  ('c2d269ba-6d8a-5c83-bafd-d287271fca1d', '2026-03-24', 'Bank Fee - wise', 'bankfee', 'CAD', 8.74, 1.0, 8.74, 'sim', true, 'importado', null, null),
  ('40218157-642e-5593-9061-0e895cc3384b', '2025-01-01', 'Canva anual', 'assinaturas', 'BRL', 289.8, 0.2327, 67.44, 'sim', true, 'importado', null, null),
  ('7de57ac9-ab2b-5bbc-9895-1e7b3d97ea56', '2026-05-23', 'Claude', 'assinaturas', 'CAD', 31.64, 1.0, 31.64, 'sim', true, 'importado', null, null),
  ('7b7e7152-56bd-54fb-9e87-49b89ee61e42', '2026-06-03', 'Claude', 'assinaturas', 'CAD', 137.46, 1.0, 137.46, 'sim', true, 'importado', null, null),
  ('6049eea8-ccdd-5259-af20-8f0c84904c63', '2026-01-11', 'OnBento', 'assinaturas', 'USD', 26.89, 1.3896, 37.37, 'sim', true, 'importado', null, null),
  ('74e0299a-7766-5b6e-8294-5f9163a1bbf6', '2026-05-15', 'OnBento', 'assinaturas', 'USD', 65.25, 1.3752, 89.73, 'sim', true, 'importado', null, null),
  ('dba7d504-5651-5e40-a600-fc694f4e96ff', '2026-03-12', 'Higgsfield (app de AI)', 'assinaturas', 'CAD', 68.69, 1.0, 68.69, 'sim', true, 'importado', null, null),
  ('8aa72f22-6855-58fa-a27b-3256b71494a0', '2026-02-13', 'Pitchlo', 'assinaturas', 'CAD', 29.0, 1.0, 29.0, 'sim', true, 'importado', null, null),
  ('6ff24e37-444c-5512-b6a1-f138a18d2059', '2025-11-02', 'Curso Carrossel Criativo', 'cursos', 'BRL', 97.02, 0.2604, 25.26, 'sim', true, 'importado', null, null),
  ('d05d2d5d-a86b-52a4-a102-c429dda8d788', '2025-11-03', 'Combo de Black Friday - Rafaela Chagas', 'cursos', 'BRL', 297.0, 0.2624, 77.93, 'sim', true, 'importado', null, null),
  ('f3416c03-8f8a-5f19-8c0c-88e36ca89e62', '2025-11-20', 'Ana Novelini - mentoria', 'cursos', 'CAD', 200.0, 1.0, 200.0, 'sim', true, 'importado', null, null),
  ('8704866e-35cf-5e3d-aa0c-71b7b0fda4d7', '2025-12-20', 'Mentoria Destrava UGC: Mapa das 100 Campanhas', 'cursos', 'BRL', 297.0, 0.2496, 74.13, 'sim', true, 'importado', null, null),
  ('3b386a95-9c95-59c9-9bfa-b272f64a6630', '2026-01-02', 'FEC - Fórmula de Edição Criativa', 'cursos', 'BRL', 167.25, 0.253, 42.31, 'sim', true, 'importado', null, null),
  ('22d21ff2-bd06-5231-bf40-7b1a843b8203', '2026-02-17', 'Mentoria Destrava UGC: Mapa das 100 Campanhas', 'cursos', 'BRL', 297.0, 0.2615, 77.67, 'sim', true, 'importado', null, null),
  ('d6b5a58b-434b-5012-ae99-916e53ef006d', '2026-02-21', 'Angelene - Ebook', 'cursos', 'CAD', 28.0, 1.0, 28.0, 'sim', true, 'importado', null, null),
  ('bcbe0bce-aeec-55cf-8867-ed001e14a3c8', '2026-02-25', 'Workshop: Vídeos que Vendem', 'cursos', 'BRL', 104.0, 0.2664, 27.71, 'sim', true, 'importado', null, null),
  ('84144084-270e-598c-bd35-0979aff61807', '2026-03-14', 'UGC de conversão + 100 ganchos que convertem', 'cursos', 'BRL', 434.0, 0.2603, 112.97, 'sim', true, 'importado', null, null),
  ('78a85245-b150-53e1-bf62-77a84a8a3af0', '2026-04-30', 'Blueprint mentoria', 'cursos', 'USD', 3000.0, 1.3624, 4087.2, 'sim', true, 'importado', null, null),
  ('2ddeb8cb-7110-5f5a-bf6c-4cd750572400', '2026-06-05', 'Edição IAS', 'cursos', 'BRL', 297.0, 0.2715, 80.64, 'sim', true, 'importado', null, null),
  ('7ee79439-00c4-5629-a93f-c5b4b086bc2a', '2025-09-22', 'Mentoria UGC Mastery', 'cursos', 'USD', 846.45, 1.3816, 1169.46, 'sim', true, 'importado', null, null),
  ('218fef19-35ee-54e4-8c16-cb8bf487172b', '2025-03-30', 'Manual UGC Creator - Duda Mariano', 'cursos', 'BRL', 57.72, 0.2482, 14.33, 'sim', true, 'importado', null, null),
  ('9495d5c7-d6c9-5afd-acb8-aa56ba2cb984', '2025-04-14', 'Desafio UGC', 'cursos', 'BRL', 997.0, 0.2372, 236.49, 'sim', true, 'importado', null, null),
  ('85655553-3c3e-5057-b7a5-543b52dba4c5', '2025-09-13', 'Master UGC Guide', 'cursos', 'BRL', 94.92, 0.2582, 24.51, 'sim', true, 'importado', null, null),
  ('cdcac26a-5bd4-5d57-a8d4-e4f11118a307', '2025-11-29', 'Neceff Echo Air2 Wireless Lavalier Microphone (Amazon)', 'equipamentos', 'CAD', 29.37, 1.0, 29.37, 'sim', true, 'importado', null, null),
  ('d01a9dcc-17ed-5077-b3ef-c12e0bab83af', '2025-11-20', 'Robes for Women (Amazon)', 'equipamentos', 'CAD', 34.57, 1.0, 34.57, 'talvez', true, 'importado', null, null),
  ('1b4d5592-9be1-5542-a9fb-f6af5976bd72', '2025-11-20', 'NEEWER RGB Esthetician Light Kit (Amazon)', 'equipamentos', 'CAD', 180.79, 1.0, 180.79, 'sim', true, 'importado', null, null),
  ('e455a6af-5987-53e4-a56d-9fc2304cb503', '2025-05-10', 'Jkoailiwi 360° Adjustable Vacuum Magnetic Suction (Amazon)', 'equipamentos', 'CAD', 10.0, 1.0, 10.0, 'sim', true, 'importado', null, null),
  ('19570b10-c800-5f1e-b930-2c2778b8ff67', '2026-04-01', 'Hollyland Lark M2 Wireless Lavalier Microphone (Best Buy)', 'equipamentos', 'CAD', 79.94, 1.0, 79.94, 'sim', true, 'importado', null, null),
  ('be91d7d9-3e10-570b-a1bd-254ca221bcaa', '2026-04-02', 'Vacuum Magnetic Phone Holder (Amazon)', 'equipamentos', 'CAD', 14.68, 1.0, 14.68, 'sim', true, 'importado', null, null),
  ('1d4e59e1-b804-5793-814d-e1bbe57ae95c', '2026-04-28', 'Backstage subscription (próximo ano: CAD 84,99 + tax)', 'assinaturas', 'CAD', 29.99, 1.0, 29.99, 'sim', true, 'importado', null, null),
  ('fea95b5d-7288-533c-9f75-0b9024fb9b57', '2026-07-27', 'Wise fee', 'bankfee', 'CAD', 55.0, 1.0, 55.0, 'sim', true, 'importado', null, null),
  ('957233df-d9ac-5686-8a9e-00df250b6d88', '2026-08-07', 'Tripe (Amazon)', 'equipamentos', 'CAD', 27.63, 1.0, 27.63, 'sim', true, 'importado', null, null),
  ('26ac0130-98fc-5317-b98e-56ace45b9b56', '2026-08-05', 'K&F Concept 25wRGB Flashlight (Amazon)', 'equipamentos', 'CAD', 59.65, 1.0, 59.65, 'sim', true, 'importado', null, null),
  ('ffe9cec3-082c-5ff4-8ce6-4a95970902be', '2026-08-10', 'Onbento (anual)', 'assinaturas', 'USD', 271.2, 1.3942, 378.11, 'sim', true, 'importado', null, null),
  ('c9dad1f7-e1e4-5fbc-9f45-55e9cebd294d', '2026-07-13', 'Edição MII', 'cursos', 'BRL', 33.3, 0.2759, 9.19, 'sim', true, 'importado', null, null),
  ('490c2040-828a-5950-b5ac-eeb1acd047b2', '2026-01-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2502, 6.04, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('60229eeb-ed7b-5d4e-8917-01ed94b789c1', '2026-02-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2587, 6.25, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('bb387ff6-2f9f-5361-bd17-16ebadfa6eb4', '2026-03-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2654, 6.41, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('a6a4c74a-b2f5-5bd3-a86e-f445b3872f7b', '2026-04-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2692, 6.5, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('178a111f-6f2c-5f66-a45c-ab0c45d20248', '2026-05-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2739, 6.61, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('f02d3e58-10c4-541d-99b5-906e61747c56', '2026-06-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2752, 6.65, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('66b3a2c8-363a-573b-9fc8-c074ffe2f613', '2026-07-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2746, 6.63, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('1386926d-eacd-5a0c-8d28-ba6ab25bc7e1', '2026-08-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2765, 6.68, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('a00e1419-d21c-59b2-b4d7-f3a25bcd63ac', '2026-01-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2502, 16.49, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('69d17823-442e-5d8f-8aa4-0b30bea172da', '2026-02-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2587, 17.05, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('abe7af5d-8ec8-51c6-9d42-cb4d8e6ddbf8', '2026-03-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2654, 17.49, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('41c6b6f7-9dc3-562c-80a7-48918861a81b', '2026-04-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2692, 17.74, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('410e36b3-12c2-5417-80da-f407033a2d03', '2026-05-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2739, 18.05, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('ad7e40b3-9495-538e-9377-5a6289b41231', '2026-06-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2752, 18.14, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('205cd942-dacc-5fec-aa98-05ebe1fd8e42', '2026-07-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2746, 18.1, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('102014cb-d0da-5471-b73b-e87488c79b70', '2026-08-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2765, 18.22, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('7c0b8639-9d35-52e8-bdf3-aa2bca2e6bc8', '2026-01-27', 'ChatGPT', 'assinaturas', 'CAD', 31.78, 1.0, 31.78, 'sim', true, 'assinatura', '8c0a14c7-1865-5916-b564-e192156b699c', null),
  ('05f935a4-da86-5436-beb8-f850bd698de3', '2026-02-27', 'ChatGPT', 'assinaturas', 'CAD', 31.78, 1.0, 31.78, 'sim', true, 'assinatura', '8c0a14c7-1865-5916-b564-e192156b699c', null),
  ('3c7de22e-d83c-5a51-a76d-709ad70e1d0c', '2026-03-27', 'ChatGPT', 'assinaturas', 'CAD', 31.78, 1.0, 31.78, 'sim', true, 'assinatura', '8c0a14c7-1865-5916-b564-e192156b699c', null),
  ('1874826b-b8ce-512f-9bca-77ecb8b8781c', '2026-04-27', 'ChatGPT', 'assinaturas', 'CAD', 31.78, 1.0, 31.78, 'sim', true, 'assinatura', '8c0a14c7-1865-5916-b564-e192156b699c', null),
  ('e5733746-190f-5cc2-a13d-b74823c6c41c', '2026-07-03', 'Claude', 'assinaturas', 'CAD', 158.2, 1.0, 158.2, 'sim', true, 'assinatura', '1a744413-771c-58e2-9b13-d703a89a7bc8', null),
  ('c19bfd0d-7358-5175-bad7-1ce66ec2309a', '2026-08-03', 'Claude', 'assinaturas', 'CAD', 158.2, 1.0, 158.2, 'sim', true, 'assinatura', '1a744413-771c-58e2-9b13-d703a89a7bc8', null),
  ('d4f8be2b-1b89-53d0-98f2-903117d04422', '2026-08-22', 'App ApowerMirror', 'assinaturas', 'CAD', 56.49, 1.0, 56.49, 'sim', true, 'investimento', null, 'dd56a7f2-2ee0-582b-abfb-6a555c01b5a6'),
  ('50ae6ce5-95c2-50ba-a55b-17b88c5fce30', '2026-09-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2696, 6.51, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('132fe07d-7695-56b2-a56d-3484c0191fe6', '2026-09-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2696, 17.77, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('a9fe7420-afa9-5910-814c-d28b677dc8aa', '2026-09-03', 'Claude', 'assinaturas', 'CAD', 158.2, 1.0, 158.2, 'sim', true, 'assinatura', '1a744413-771c-58e2-9b13-d703a89a7bc8', null),
  ('4cb6217a-8c0c-50ee-ab2e-bf36c8b30918', '2026-09-24', 'claudfare - dominio do site', 'assinaturas', 'USD', 11.82, 1.4136, 16.71, 'sim', true, 'importado', null, null),
  ('195183ed-47fc-5288-8267-01145bd5a11a', '2026-10-01', 'Canva', 'assinaturas', 'BRL', 24.15, 0.2732, 6.6, 'sim', true, 'assinatura', 'bf33349e-b6ac-5bbe-a995-5529dc1dbb4e', null),
  ('b922433b-cb88-5bd6-b5a1-e4c4ad6e07db', '2026-10-01', 'CapCut', 'assinaturas', 'BRL', 65.9, 0.2732, 18.0, 'sim', true, 'assinatura', 'f4bbce22-f0a9-5059-b237-19fa44d89983', null),
  ('72a0af16-8915-57d1-a940-d167628bb197', '2026-10-03', 'Claude', 'assinaturas', 'CAD', 158.2, 1.0, 158.2, 'sim', true, 'assinatura', '1a744413-771c-58e2-9b13-d703a89a7bc8', null),
  ('c1293b3f-26fa-5db9-a0e3-c5e1c1538bc9', '2026-10-14', 'tripe para luz de apoio', 'equipamentos', 'CAD', 38.91, 1.0, 38.91, 'sim', true, 'importado', null, null),
  ('a3816985-ceb5-51bd-8205-136f55e5a8b9', '2026-10-14', 'Neewer RGB Light', 'equipamentos', 'CAD', 88.13, 1.0, 88.13, 'sim', true, 'importado', null, null)
on conflict (id) do nothing;

-- 6. Quero investir
insert into public.fin_investir (id, nome, categoria, prioridade, moeda, valor, link, nota, status, data, data_compra, despesa_id) values
  ('dd56a7f2-2ee0-582b-abfb-6a555c01b5a6', 'App ApowerMirror', 'software', 'media', 'CAD', 56.49, null, 'plano anual', 'comprei', '2026-08-14', '2026-08-22', 'd4f8be2b-1b89-53d0-98f2-903117d04422')
on conflict (id) do nothing;

-- Pronto! Se apareceu "Success", deu tudo certo. Abra o admin e confira o 💰 Financeiro.
