-- ============================================================
-- BANCO DE DADOS DO PORTFÓLIO + ADMIN · Cintia Marinho
--
-- ONDE COLAR:
--   supabase.com → abra o seu projeto → menu da esquerda
--   "SQL Editor" → botão "New query" → cole TUDO isto →
--   clique em "Run" (canto de baixo, à direita).
--
-- Pode rodar mais de uma vez sem medo: nada é duplicado
-- e nenhum dado seu é apagado.
-- ============================================================


-- ------------------------------------------------------------
-- 1. QUEM É A DONA
-- Uma pergunta que o banco faz a cada leitura ou escrita:
-- "a pessoa logada agora é a Cintia?". Todas as trancas
-- abaixo usam esta resposta. Mesmo que alguém consiga criar
-- uma conta no seu Supabase, não é o seu e-mail, então não
-- vê nada.
-- ------------------------------------------------------------
create or replace function public.eh_dona()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'email') = 'cimarinho.ugc@gmail.com', false)
$$;


-- ------------------------------------------------------------
-- 2. AS TABELAS
-- A coluna "exemplo" marca a linha de exemplo que vem pronta
-- em cada lista, só para você entender o formato. No painel ela
-- aparece com uma etiqueta "exemplo". Pode apagar à vontade.
-- ------------------------------------------------------------

-- VÍDEOS: o que aparece no seu portfólio.
-- "link" é o link do YouTube (Shorts ou vídeo normal).
-- "visivel" = aparece no site ou fica escondido.
create table if not exists public.videos (
  id        uuid primary key default gen_random_uuid(),
  titulo    text not null default '',
  link      text not null,
  nicho     text,
  formato   text,
  marca     text,
  destaque  text,                       -- ex: "2,4M views"
  ordem     integer not null default 0, -- posição no site
  visivel   boolean not null default true,
  exemplo   boolean not null default false,
  criado_em timestamptz not null default now()
);

-- MARCAS: a sua base de contatos de empresa.
-- O formulário do site também grava aqui, como "lead".
create table if not exists public.marcas (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null check (char_length(nome) <= 200),
  instagram      text check (char_length(instagram) <= 200),
  email          text check (char_length(email) <= 200),
  telefone       text check (char_length(telefone) <= 60),
  situacao       text not null default 'lead'
                 check (situacao in ('lead', 'conversando', 'cliente', 'parada')),
  obs            text check (char_length(obs) <= 5000),
  ultimo_contato date,
  exemplo        boolean not null default false,
  criado_em      timestamptz not null default now()
);

-- CALENDÁRIO: o que gravar, editar e postar, dia a dia.
create table if not exists public.calendario (
  id        uuid primary key default gen_random_uuid(),
  titulo    text not null,
  marca     text,
  tipo      text not null default 'gravar'
            check (tipo in ('gravar', 'editar', 'postar')),
  data      date not null,
  status    text not null default 'a fazer'
            check (status in ('a fazer', 'feito')),
  exemplo   boolean not null default false,
  criado_em timestamptz not null default now()
);

-- CAMPANHAS: os trabalhos fechados, do briefing até a entrega.
-- "status" segue o funil, nesta ordem:
-- Briefing, Roteiro, Aprovação Roteiro, Gravação, Edição, Aprovado, Entregue.
create table if not exists public.campanhas (
  id         uuid primary key default gen_random_uuid(),
  campanha   text not null,
  cliente    text,
  tipo       text not null default 'Conteúdo'
             check (tipo in ('Conteúdo', 'Publicidade')),
  status     text not null default 'Briefing'
             check (status in ('Briefing', 'Roteiro', 'Aprovação Roteiro',
                               'Gravação', 'Edição', 'Aprovado', 'Entregue')),
  qtd        integer not null default 1 check (qtd >= 0),
  valor      numeric(12, 2) not null default 0 check (valor >= 0),
  prazo      date,
  pagamento  text not null default 'pendente'
             check (pagamento in ('pendente', 'pago')),
  ativa      boolean not null default true,
  favorita   boolean not null default false,
  exemplo    boolean not null default false,
  criado_em  timestamptz not null default now()
);

-- MARCADOS: o que você já marcou no checklist.
-- Cada item tem uma chave de texto. Se a linha existe, está marcado.
create table if not exists public.marcados (
  chave      text primary key,
  marcado_em timestamptz not null default now()
);

-- VISITAS: uma linha por visita ao portfólio, sem nada pessoal.
-- Só o dia e hora, a página e de onde a pessoa veio.
create table if not exists public.visitas (
  id     uuid primary key default gen_random_uuid(),
  data   timestamptz not null default now(),
  pagina text check (char_length(pagina) <= 200),
  origem text check (char_length(origem) <= 100)
);

create index if not exists visitas_data_idx on public.visitas (data);


-- ------------------------------------------------------------
-- 3. A TRANCA (RLS, Row Level Security)
-- Ligada em TODAS as tabelas. Com ela ligada, o banco começa
-- negando tudo para todo mundo, e só libera o que as regras
-- abaixo disserem.
-- ------------------------------------------------------------
alter table public.videos     enable row level security;
alter table public.marcas     enable row level security;
alter table public.calendario enable row level security;
alter table public.campanhas  enable row level security;
alter table public.marcados   enable row level security;
alter table public.visitas    enable row level security;


-- 3a. Regra principal: você, logada, lê e escreve tudo.
drop policy if exists "dona faz tudo" on public.videos;
create policy "dona faz tudo" on public.videos
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

drop policy if exists "dona faz tudo" on public.marcas;
create policy "dona faz tudo" on public.marcas
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

drop policy if exists "dona faz tudo" on public.calendario;
create policy "dona faz tudo" on public.calendario
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

drop policy if exists "dona faz tudo" on public.campanhas;
create policy "dona faz tudo" on public.campanhas
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

drop policy if exists "dona faz tudo" on public.marcados;
create policy "dona faz tudo" on public.marcados
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

drop policy if exists "dona faz tudo" on public.visitas;
create policy "dona faz tudo" on public.visitas
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());


-- 3b. Exceção 1: o formulário do site pode CRIAR uma marca,
-- sempre como "lead". Não pode ler, mudar nem apagar nada.
drop policy if exists "formulario do site cria lead" on public.marcas;
create policy "formulario do site cria lead" on public.marcas
  for insert to anon, authenticated
  with check (situacao = 'lead' and exemplo = false);


-- 3c. Exceção 2: o site pode CRIAR uma visita, com a hora de agora.
-- Não pode ler as visitas de ninguém.
drop policy if exists "site registra visita" on public.visitas;
create policy "site registra visita" on public.visitas
  for insert to anon, authenticated
  with check (data between now() - interval '5 minutes' and now() + interval '5 minutes');


-- 3d. Exceção 3 (necessária para o site funcionar): quem visita
-- o portfólio pode LER os vídeos marcados como visíveis. Só esses.
-- Os escondidos e todas as outras tabelas continuam fechados.
drop policy if exists "site le videos visiveis" on public.videos;
create policy "site le videos visiveis" on public.videos
  for select to anon, authenticated
  using (visivel = true);


-- 3e. Permissões de base. Quem não está logado ("anon") só
-- consegue tocar no que foi liberado acima, e mais nada.
revoke all on public.videos, public.marcas, public.calendario,
              public.campanhas, public.marcados, public.visitas from anon;
grant select on public.videos  to anon;
grant insert on public.marcas  to anon;
grant insert on public.visitas to anon;
grant select, insert, update, delete on public.videos, public.marcas,
      public.calendario, public.campanhas, public.marcados, public.visitas
      to authenticated;


-- ------------------------------------------------------------
-- 4. PRIMEIROS DADOS
-- Cada bloco só grava se a tabela estiver vazia, então rodar
-- de novo não duplica nada.
-- ------------------------------------------------------------

-- Uma linha de exemplo em Marcas, Calendário e Campanhas.
insert into public.marcas (nome, instagram, email, telefone, situacao, obs, ultimo_contato, exemplo)
select 'Marca Exemplo', '@marcaexemplo', 'contato@marcaexemplo.com', '+1 416 000 0000',
       'lead', 'Linha de exemplo. Pode apagar.', current_date, true
where not exists (select 1 from public.marcas);

insert into public.calendario (titulo, marca, tipo, data, status, exemplo)
select 'Gravar vídeo exemplo', 'Marca Exemplo', 'gravar', current_date, 'a fazer', true
where not exists (select 1 from public.calendario);

insert into public.campanhas (campanha, cliente, tipo, status, qtd, valor, prazo, pagamento, ativa, favorita, exemplo)
select 'Campanha exemplo', 'Marca Exemplo', 'Conteúdo', 'Briefing', 1, 0,
       current_date + 7, 'pendente', true, false, true
where not exists (select 1 from public.campanhas);

-- Os seus vídeos que já estão no portfólio hoje, na mesma ordem.
-- (São os seus vídeos reais, para o site não ficar vazio.)
insert into public.videos (titulo, link, nicho, formato, marca, ordem)
select * from (values
  ('Haruharu Wonder · Aesthetic', 'https://youtube.com/shorts/GJiC4yul2_c', 'Skincare', 'Aesthetic', 'Haruharu Wonder', 1),
  ('Beauty of Joseon · Testimonial', 'https://youtube.com/shorts/tVAM3iAPCTw', 'Skincare', 'Testimonial', 'Beauty of Joseon', 2),
  ('Niche Beauty Lab · Problem → Solution', 'https://youtube.com/shorts/5WbmcAll4pk', 'Skincare', 'Problem → Solution', 'Niche Beauty Lab', 3),
  ('Niche Beauty Lab · Product Demo', 'https://youtube.com/shorts/8Z9WfmGYAv8', 'Skincare', 'Product Demo', 'Niche Beauty Lab', 4),
  ('Beauty of Joseon · Aesthetic', 'https://youtube.com/shorts/L7eljVsoaXI', 'Skincare', 'Aesthetic', 'Beauty of Joseon', 5),
  ('Beauty of Joseon · Aesthetic', 'https://youtube.com/shorts/GUXteXjRfdY', 'Skincare', 'Aesthetic', 'Beauty of Joseon', 6),
  ('L''Oréal · Problem → Solution', 'https://youtube.com/shorts/JwZRjpgf-Lc', 'Skincare', 'Problem → Solution', 'L''Oréal', 7),
  ('LANEIGE · Aesthetic', 'https://youtube.com/shorts/VV4CywPp198', 'Skincare', 'Aesthetic', 'LANEIGE', 8),
  ('Anua · Problem → Solution', 'https://youtube.com/shorts/aS4VfOxU2H4', 'Skincare', 'Problem → Solution', 'Anua', 9),
  ('Niche Beauty Lab · Aesthetic', 'https://youtube.com/shorts/8EH82dervHw', 'Skincare', 'Aesthetic', 'Niche Beauty Lab', 10),
  ('Abera · Problem → Solution', 'https://youtube.com/shorts/HMSVmEwpNfY', 'Skincare', 'Problem → Solution', 'Abera', 11),
  ('Niche Beauty Lab · Creative Edit', 'https://youtube.com/shorts/PHekKVYqJms', 'Skincare', 'Creative Edit', 'Niche Beauty Lab', 12),
  ('Beauty of Joseon · Aesthetic', 'https://youtube.com/shorts/eKzIKMS7DAc', 'Skincare', 'Aesthetic', 'Beauty of Joseon', 13),
  ('Niche Beauty Lab · Aesthetic', 'https://youtube.com/shorts/vBfIdQAgGYI', 'Skincare', 'Aesthetic', 'Niche Beauty Lab', 14),
  ('Royal Distribution · Before & After', 'https://youtube.com/shorts/9jFA6OZS3oM', 'Haircare', 'Before & After', 'Royal Distribution', 15),
  ('Vichy · Testimonial', 'https://youtube.com/shorts/oPY0MB_yshQ', 'Haircare', 'Testimonial', 'Vichy', 16),
  ('Shark · How to', 'https://youtube.com/shorts/tAb3IT9a9pc', 'Haircare', 'How to', 'Shark', 17),
  ('Royal Distribution · Unboxing', 'https://youtube.com/shorts/atGtKSM7Auk', 'Haircare', 'Unboxing', 'Royal Distribution', 18),
  ('Synergy Hair · Product Demo', 'https://youtube.com/shorts/IRTEzjBwhpI', 'Haircare', 'Product Demo', 'Synergy Hair', 19),
  ('CHI · Creative Edit', 'https://youtube.com/shorts/8sFzSTTHaIU', 'Haircare', 'Creative Edit', 'CHI', 20),
  ('Revlon · How to', 'https://youtube.com/shorts/ScerD6rI94s', 'Haircare', 'How to', 'Revlon', 21),
  ('Royal Distribution · Aesthetic', 'https://youtube.com/shorts/E9XTPUI6CbI', 'Haircare', 'Aesthetic', 'Royal Distribution', 22),
  ('Synergy Hair · Problem → Solution', 'https://youtube.com/shorts/3SnvwvI_p-Y', 'Haircare', 'Problem → Solution', 'Synergy Hair', 23),
  ('Revlon · Before & After', 'https://youtube.com/shorts/l91OA7zwvQo', 'Haircare', 'Before & After', 'Revlon', 24),
  ('Synergy Hair · Problem → Solution', 'https://youtube.com/shorts/1k2RFv46fIg', 'Haircare', 'Problem → Solution', 'Synergy Hair', 25),
  ('Royal Distribution · Problem → Solution', 'https://youtube.com/shorts/kXsS0omB5N8', 'Haircare', 'Problem → Solution', 'Royal Distribution', 26),
  ('Redken · Product Demo', 'https://youtube.com/shorts/jxIbJhGgZNg', 'Haircare', 'Product Demo', 'Redken', 27),
  ('Royal Distribution · Creative Edit', 'https://youtube.com/shorts/vDIpNaS0clk', 'Haircare', 'Creative Edit', 'Royal Distribution', 28),
  ('NovaMane · Problem → Solution', 'https://youtube.com/shorts/eH3mSSlB1Us', 'Haircare', 'Problem → Solution', 'NovaMane', 29),
  ('Eupholic · Product Demo', 'https://youtube.com/shorts/DSWAqbH8mYs', 'Haircare', 'Product Demo', 'Eupholic', 30),
  ('Truss · Aesthetic', 'https://youtube.com/shorts/uMHKJGooQps', 'Haircare', 'Aesthetic', 'Truss', 31),
  ('Yves Saint Laurent · Aesthetic', 'https://youtube.com/shorts/Gj1RT0h90Lo', 'Beauty', 'Aesthetic', 'Yves Saint Laurent', 32),
  ('Niche Beauty Lab · Unboxing', 'https://youtube.com/shorts/6dKfUVm6djM', 'Beauty', 'Unboxing', 'Niche Beauty Lab', 33),
  ('Abera · Aesthetic', 'https://youtube.com/shorts/i2l2DOfurew', 'Beauty', 'Aesthetic', 'Abera', 34),
  ('APLB · Problem → Solution', 'https://youtube.com/shorts/ipubj5pedj4', 'Beauty', 'Problem → Solution', 'APLB', 35),
  ('COSRX · Aesthetic', 'https://youtube.com/shorts/MJj2bax2dpU', 'Beauty', 'Aesthetic', 'COSRX', 36),
  ('CELLU · Storytelling', 'https://youtube.com/shorts/9GmnVgsgE8A', 'Beauty', 'Storytelling', 'CELLU', 37),
  ('Essence · Before & After', 'https://youtube.com/shorts/jLZ77r-MRUs', 'Beauty', 'Before & After', 'Essence', 38),
  ('Abera · Storytelling', 'https://youtube.com/shorts/3AmeeoXKejw', 'Beauty', 'Storytelling', 'Abera', 39),
  ('H&M · Product Showcase', 'https://youtube.com/shorts/SVXtneaeGZA', 'Fashion', 'Product Showcase', 'H&M', 40),
  ('C&A · Creative Edit', 'https://youtube.com/shorts/7hMVd3Ix2iw', 'Fashion', 'Creative Edit', 'C&A', 41),
  ('Milly · Problem → Solution', 'https://youtube.com/shorts/lZ9ZELOP03Q', 'Fashion', 'Problem → Solution', 'Milly', 42),
  ('JW PEI · Creative Edit', 'https://youtube.com/shorts/zFDs7-ao5xM', 'Fashion', 'Creative Edit', 'JW PEI', 43),
  ('Button Amsterdam · Aesthetic', 'https://youtube.com/shorts/i4IvGK2g3UU', 'Fashion', 'Aesthetic', 'Button Amsterdam', 44),
  ('Formi · Problem → Solution', 'https://youtube.com/shorts/nZx73ABGUOU', 'Fashion', 'Problem → Solution', 'Formi', 45),
  ('Urban Planet · Creative Edit', 'https://youtube.com/shorts/P057kttu9c8', 'Fashion', 'Creative Edit', 'Urban Planet', 46),
  ('Kate Spade · Creative Edit', 'https://youtube.com/shorts/Ln1Hm5NCfJI', 'Fashion', 'Creative Edit', 'Kate Spade', 47),
  ('SHEIN · Creative Edit', 'https://youtube.com/shorts/CxyTgX31oPg', 'Fashion', 'Creative Edit', 'SHEIN', 48),
  ('Button Amsterdam · Storytelling', 'https://youtube.com/shorts/B0dIhJltJzI', 'Fashion', 'Storytelling', 'Button Amsterdam', 49),
  ('Tommy Hilfiger · Creative Edit', 'https://youtube.com/shorts/MLxZzMpHUYg', 'Fashion', 'Creative Edit', 'Tommy Hilfiger', 50),
  ('Tineco · ASMR', 'https://youtube.com/shorts/xCFB9AnIGxo', 'Home & Decor', 'ASMR', 'Tineco', 51),
  ('IKEA · Before & After', 'https://youtube.com/shorts/VMktQ1--zCI', 'Home & Decor', 'Before & After', 'IKEA', 52),
  ('Beautural · Product Demo', 'https://youtube.com/shorts/CABNTUOolXE', 'Home & Decor', 'Product Demo', 'Beautural', 53),
  ('Lifewit · Product Demo', 'https://youtube.com/shorts/Fe2djm1hOZs', 'Home & Decor', 'Product Demo', 'Lifewit', 54),
  ('Tineco · Problem → Solution', 'https://youtube.com/shorts/0NTgK-lCiLs', 'Home & Decor', 'Problem → Solution', 'Tineco', 55),
  ('IKEA · Before & After', 'https://youtube.com/shorts/U8oTiqrzwCk', 'Home & Decor', 'Before & After', 'IKEA', 56),
  ('Best Buy · Unboxing', 'https://youtube.com/shorts/l4PC0vzp4-w', 'Food', 'Unboxing', 'Best Buy', 57),
  ('Catelli · Recipe', 'https://youtube.com/shorts/wpiz6WTMNK4', 'Food', 'Recipe', 'Catelli', 58),
  ('YOKI · Recipe', 'https://youtube.com/shorts/r47E-oMPZ1M', 'Food', 'Recipe', 'YOKI', 59),
  ('Magic Baking Powder · Recipe', 'https://youtube.com/shorts/whMBzmB3wxM', 'Food', 'Recipe', 'Magic Baking Powder', 60),
  ('Sensarte · Unboxing', 'https://youtube.com/shorts/_TF3PcjzZOY', 'Food', 'Unboxing', 'Sensarte', 61),
  ('DoggySpout · Problem → Solution', 'https://youtube.com/shorts/F9OceacQfrI', 'Pet', 'Problem → Solution', 'DoggySpout', 62),
  ('Purina · Product Demo', 'https://youtube.com/shorts/l6WtHV9c0rY', 'Pet', 'Product Demo', 'Purina', 63),
  ('Petstore · Product Demo', 'https://youtube.com/shorts/sVnPKUdWdFI', 'Pet', 'Product Demo', 'Petstore', 64),
  ('Turma da Mônica · Product Demo', 'https://youtube.com/shorts/jVcwJEwZ1r8', 'Pet', 'Product Demo', 'Turma da Mônica', 65),
  ('SHEIN · Product Demo', 'https://youtube.com/shorts/-Fn6f1-QDFE', 'Pet', 'Product Demo', 'SHEIN', 66),
  ('Tapo · Product Demo', 'https://youtube.com/shorts/1pbfM_y1js8', 'Tech', 'Product Demo', 'Tapo', 67),
  ('Linka.ai · Product Demo', 'https://youtube.com/shorts/SRdEFcZvbSc', 'Tech', 'Product Demo', 'Linka.ai', 68),
  ('Walmart · Problem → Solution', 'https://youtube.com/shorts/mdPBceviXeo', 'Tech', 'Problem → Solution', 'Walmart', 69),
  ('FitIndex · Product Demo', 'https://youtube.com/shorts/_VTUiGMeGvY', 'Tech', 'Product Demo', 'FitIndex', 70),
  ('Jkoailiwi · Testimonial', 'https://youtube.com/shorts/CR7ioNEOubQ', 'Tech', 'Testimonial', 'Jkoailiwi', 71),
  ('Yeedi · Product Demo', 'https://youtube.com/shorts/HeHVBtJz7uA', 'Tech', 'Product Demo', 'Yeedi', 72),
  ('e.l.f. · Aesthetic Makeup Routine', 'https://www.youtube.com/watch?v=N8hkDTIue-A', 'YouTube', 'Aesthetic Makeup Routine', 'e.l.f.', 73)
) as v (titulo, link, nicho, formato, marca, ordem)
where not exists (select 1 from public.videos);


-- ------------------------------------------------------------
-- 5. TRANSCRIÇÕES (vídeos que você gosta, com roteiro e observações)
-- ------------------------------------------------------------
create table if not exists public.transcricoes (
  id          uuid primary key default gen_random_uuid(),
  titulo      text,
  link        text not null,
  plataforma  text,                       -- YouTube, Instagram, TikTok ou Outro
  criador     text,                       -- quem fez o vídeo
  transcricao text,                       -- o roteiro
  obs         text,                       -- as suas observações
  criado_em   timestamptz not null default now()
);

alter table public.transcricoes enable row level security;

drop policy if exists "dona faz tudo" on public.transcricoes;
create policy "dona faz tudo" on public.transcricoes
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

revoke all on public.transcricoes from anon;
grant select, insert, update, delete on public.transcricoes to authenticated;


-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
