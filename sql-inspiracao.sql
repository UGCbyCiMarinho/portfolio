-- ============================================================
-- INSPIRAÇÃO: os vídeos que você salva para se inspirar
-- (aba 💡 Inspiração do painel)
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Pode rodar mais de uma vez sem medo: nada é duplicado nem apagado.
-- ============================================================

create table if not exists public.inspiracoes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  numero      int,                        -- o # da sua planilha
  url         text not null,              -- link do post
  criadora    text,                       -- @ de quem criou
  nicho       text,
  formato     text,
  sobre       text,                       -- sobre o que é o vídeo
  pilar       text check (pilar in ('portfolio', 'bastidores', 'educativo', 'lifestyle', 'fe', 'trends')),
  usar        text check (usar in ('sim', 'nao')),   -- vazio = ainda não decidiu
  minha_ideia text,                       -- como você traria para a sua realidade
  postei      boolean not null default false,
  meu_link    text,                       -- o link do SEU vídeo, quando postar
  capa        text,                       -- a capinha do vídeo (vem da Supadata)
  metricas    jsonb                       -- visualizações e curtidas do post de inspiração
);
create unique index if not exists inspiracoes_url_idx on public.inspiracoes (url);

drop trigger if exists inspiracoes_updated_at on public.inspiracoes;
create trigger inspiracoes_updated_at before update on public.inspiracoes
  for each row execute function public.toca_updated_at();

-- A TRANCA: só você, logada, lê e escreve.
alter table public.inspiracoes enable row level security;
drop policy if exists "dona faz tudo" on public.inspiracoes;
create policy "dona faz tudo" on public.inspiracoes
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());
revoke all on public.inspiracoes from anon;
grant select, insert, update, delete on public.inspiracoes to authenticated;

-- Os 89 vídeos da sua planilha "Inspiração Notion".
-- O pilar é uma sugestão minha, pelo nicho e pelo formato: dá para trocar no painel.
insert into public.inspiracoes (numero, url, criadora, nicho, formato, sobre, pilar) values
  (1, 'https://www.instagram.com/tusyastrizh/reel/DdXANlIpD8g/', '@tusyastrizh', 'Haircare', 'Demo de produto', 'Apresenta loção de styling 6 em 1 (Kevin Murphy) mostrando os benefícios para uma rotina de cabelo mais simples', 'portfolio'),
  (2, 'https://www.instagram.com/an.rych.ugc/reel/DdxJqZ-xiMj/', '@an.rych.ugc', 'Educativo UGC', 'Bastidores (BTS)', 'Mostra do início ao fim como gravou UGC de um jogo de cama; explica por que filmou o primeiro take por último', 'bastidores'),
  (3, 'https://www.instagram.com/murtwins/reel/DZWDvCCIJxx/', '@murtwins', 'Beleza / Body care', 'Estética de produto', 'Vídeo estético de produto ''caramel'' para corpo e cabelo (NYX / Sephora)', 'portfolio'),
  (4, 'https://www.instagram.com/alexinugc/reel/DdBLyWqTv_t/', '@alexinugc', 'Educativo UGC', 'Tutorial de edição', 'Efeitos de vídeo fáceis de fazer em casa para usar no próximo UGC', 'educativo'),
  (5, 'https://www.instagram.com/brendasanntanaa/reel/DcJrQT2RWpm/', '@brendasanntanaa', 'Beleza / Make', 'GRWM / trend', 'GRWM de maquiagem no formato trend (legenda curta, ver vídeo)', 'portfolio'),
  (6, 'https://www.instagram.com/pollyandradde/reel/DdOiKrtRbjh/', '@pollyandradde', 'Educativo UGC', 'Bastidores (BTS)', 'Tudo o que acontece antes do vídeo pronto: estratégia, roteiro, cenário, enquadramento, luz e takes', 'bastidores'),
  (7, 'https://www.instagram.com/__anaritta/reel/DdPV0rJzk22/', '@__anaritta', 'Educativo UGC', 'Antes e depois', 'Ajustes de gravação no iPhone que transformam uma imagem comum em imagem profissional', 'educativo'),
  (8, 'https://www.instagram.com/brendasanntanaa/reel/DdKR7XYR7B8/', '@brendasanntanaa', 'Beleza / Make', 'Demo de produto', 'Conteúdo UGC no nicho de maquiagem (legenda curta, ver vídeo)', 'portfolio'),
  (9, 'https://www.instagram.com/julianaa.ugc/reel/DdX0pqaMV3A/', '@julianaa.ugc', 'Educativo UGC / Portfólio', 'Showcase', 'Tour pelo portfólio de UGC de beleza: como o portfólio deve fazer a marca querer continuar rolando', 'educativo'),
  (10, 'https://www.instagram.com/malika_ulasbek/reel/DbrGtCrIzVt/', '@malika_ulasbek', 'Skincare', 'Estética de produto', 'Vídeo de produto para a marca de skincare Lagom (legenda curta, ver vídeo)', 'portfolio'),
  (11, 'https://www.instagram.com/michellycorreal/reel/DdpJ0CTSIpo/', '@michellycorreal', 'Humor / Criador', 'Humor', 'Vídeo de humor sobre criadora vs editor de vídeo (''realmente, não precisa de mim'')', 'trends'),
  (12, 'https://www.instagram.com/katrina_pahomova/reel/DdVrXHCAntb/', '@katrina_pahomova', 'Tech / Apps / IA', 'Demo de app', 'Ferramenta de IA (ElevenLabs) para falar com a audiência em mais de 90 idiomas; CTA ''comente ELEVEN''', 'portfolio'),
  (13, 'https://www.instagram.com/videoway_school/reel/DdWU-fbsT69/', '@videoway_school', 'Tech / Apps / IA', 'Educativo', 'Por que marcas estão buscando criadores de conteúdo com IA em vez de produções caras', 'educativo'),
  (14, 'https://www.instagram.com/bymiatello/reel/DcuK1VBMbTk/', '@bymiatello', 'Educativo UGC', 'Dicas / lista', 'Plataformas de UGC tech que pagam em dólar', 'educativo'),
  (15, 'https://www.instagram.com/be_viky/reel/DdZ4i7BvWs3/', '@be_viky', 'Educativo UGC', 'Bastidores (BTS)', 'BTS de construir um cenário de banheiro dentro do escritório para gravar UGC', 'bastidores'),
  (16, 'https://www.instagram.com/dupontflugc/p/DcjS6LslZVp/', '@dupontflugc', 'Educativo UGC / Crescimento', 'Dicas / reflexão', 'Parou de fazer pitch para marcas e investiu no Instagram para as marcas a encontrarem', 'educativo'),
  (17, 'https://www.instagram.com/camilabertolin_/p/DdT0spKlc93/', '@camilabertolin_', 'Educativo UGC / Equipamento', 'Lista / carrossel', 'Todos os equipamentos usados para gravar UGC com estética profissional', 'educativo'),
  (18, 'https://www.instagram.com/itssashareynolds/reel/DdGj18_tkR8/', '@itssashareynolds', 'Educativo UGC', 'Bastidores (BTS)', 'Como fazer gravação em lote (batch filming) aproveitando o mesmo dia de filmagem', 'bastidores'),
  (19, 'https://www.instagram.com/withanaelle/reel/Dc_WjGjC8vm/', '@withanaelle', 'Educativo UGC', 'Bastidores (BTS)', 'Bastidores de um vídeo UGC (em francês)', 'bastidores'),
  (20, 'https://www.instagram.com/alissawcassol/reel/Dc4eLb1hMPH/', '@alissawcassol', 'Haircare', 'Demo de produto', 'Efeito ''antitesoura'' do Eudora Siàge Nutri Rosé, com gancho de humor', 'portfolio'),
  (21, 'https://www.instagram.com/eu.ilka/reel/DbvYcMmIPqR/', '@eu.ilka', 'Educativo UGC', 'Tutorial de gravação', 'Como gravar seu vídeo usando a câmera traseira do celular', 'educativo'),
  (22, 'https://www.instagram.com/mariana.magnoo/reel/DczNRcihO9Q/', '@mariana.magnoo', 'Educativo UGC / Fotografia', 'Tutorial', 'Exemplos de como entender cada estilo de foto que a marca pede', 'educativo'),
  (23, 'https://www.instagram.com/lucyisdewy/reel/Dcs_GtuJPIW/', '@lucyisdewy', 'Haircare', 'Rotina / tutorial', 'Rotina de óleo pré-lavagem (jojoba) e leave-in no dia de lavar o cabelo', 'portfolio'),
  (24, 'https://www.instagram.com/razzohaircareiraq/p/DcEXdLgiPPq/', '@razzohaircareiraq', 'Haircare', 'Estética de produto', 'Produtos Razzo favoritos: shampoo de argan, condicionador, protetor térmico e sérum (em árabe)', 'portfolio'),
  (25, 'https://www.instagram.com/camilabertolin_/p/DcjCz-ZDn9j/', '@camilabertolin_', 'Educativo UGC', 'Carrossel', 'Formatos de vídeos UGC criativos e validados para deixar o portfólio mais estratégico', 'educativo'),
  (26, 'https://www.instagram.com/brendasanntanaa/reel/DccO6eVxBhA/', '@brendasanntanaa', 'Beleza / Make', 'GRWM / trend', 'GRWM seguindo trend (legenda curta, ver vídeo)', 'portfolio'),
  (27, 'https://www.instagram.com/brun0gpt/p/DcB-cBGkQkQ/', '@brun0gpt', 'Tech / Apps / IA', 'Educativo', 'Como usar o Claude além de pedir ideias: dar um método estruturado para criar conteúdo', 'educativo'),
  (28, 'https://www.instagram.com/olyaselfcare/reel/Dbnn1s0pZM0/', '@olyaselfcare', 'Haircare', 'Rotina', 'Rotina de cuidados com o cabelo favorita', 'portfolio'),
  (29, 'https://www.instagram.com/vittoria.meow_/reel/DcL-lytOFnL/', '@vittoria.meow_', 'Tech / Apps / Produtividade', 'Demo de app', 'Organizando o fluxo de trabalho de criadora com um app de organização', 'portfolio'),
  (30, 'https://www.instagram.com/robehaircare/reel/DPdfC9IEelh/', '@robehaircare', 'Haircare (marca)', 'Institucional', 'Estudo da marca Robe: participantes relataram gostar mais da rotina capilar usando o produto', 'portfolio'),
  (31, 'https://www.instagram.com/robehaircare/reel/DSoPl3ZEfBC/', '@robehaircare', 'Haircare (marca)', 'Estética de produto', 'Vídeo estético e luxuoso do ritual de cabelo em casa com Robe', 'portfolio'),
  (32, 'https://www.instagram.com/robehaircare/p/DVnVHNnEdHK/', '@robehaircare', 'Haircare (marca)', 'Demo de produto', 'Tamanhos de viagem para manter o ritual de crescimento fora de casa', 'portfolio'),
  (33, 'https://www.instagram.com/robehaircare/reel/DYt1aXVxhus/', '@robehaircare', 'Haircare (marca)', 'Educativo', 'Tônico para couro cabeludo: cabelo saudável começa na raiz', 'portfolio'),
  (34, 'https://www.instagram.com/robehaircare/reel/DY1nyXfxIs6/', '@robehaircare', 'Haircare (marca)', 'Estética / ritual', 'Desacelerar e aproveitar o ritual de cuidar do cabelo', 'portfolio'),
  (35, 'https://www.instagram.com/robehaircare/p/DZE7z9nlR12/', '@robehaircare', 'Haircare (marca)', 'Dicas', 'Como proteger o cabelo nas férias (ar do avião, água diferente, sol, vento)', 'portfolio'),
  (36, 'https://www.instagram.com/life__withliz/reel/DZa7DD5zq65/', '@life__withliz', 'Haircare', 'Demo de produto', 'Óleo capilar sem silicone e leve para tirar o frizz', 'portfolio'),
  (37, 'https://www.instagram.com/robehaircare/p/DbVJy3JESTJ/', '@robehaircare', 'Haircare (marca)', 'Tutorial', 'Guia de cabeleireira: como lavar o cabelo do jeito certo', 'portfolio'),
  (38, 'https://www.instagram.com/camilabertolin_/reel/DcHaHHjx75k/', '@camilabertolin_', 'Educativo UGC / Marca pessoal', 'Apresentação', 'Vídeo de apresentação da criadora (quem sou, o que faço)', 'educativo'),
  (39, 'https://www.instagram.com/camilabertolin_/reel/Db9OS3Bxonf/', '@camilabertolin_', 'Educativo UGC', 'Dicas criativas', 'Ideias para deixar seus vídeos mais criativos', 'educativo'),
  (40, 'https://www.instagram.com/shes_lj_/reel/DZJ-cemBtWz/', '@shes_lj_', 'Haircare', 'Demo de produto', 'Óleo capilar com colágeno e mel para brilho', 'portfolio'),
  (41, 'https://www.instagram.com/suzansilvac/reel/DbDauj7xHaI/', '@suzansilvac', 'Educativo UGC', 'Bastidores (BTS)', 'O lado que ninguém vê da criação de conteúdo', 'bastidores'),
  (42, 'https://www.instagram.com/biancacamargo/reel/DbEkZE0JEZY/', '@biancacamargo', 'Moda', 'Lookbook', 'Look de rica para preguiçosas'', parte 2', 'lifestyle'),
  (43, 'https://www.instagram.com/jasminahodjikj/reel/DaLmKOVNa60/', '@jasminahodjikj', 'Educativo UGC / Equipamento', 'Bastidores (BTS)', 'Criando para marcas dos sonhos; destaque para lente macro (CTA ''comente Link'')', 'bastidores'),
  (44, 'https://www.instagram.com/alena.m.ugc/reel/DbEH7crP04N/', '@alena.m.ugc', 'Haircare', 'Bastidores (BTS)', 'BTS do processo de filmagem de UGC de haircare', 'bastidores'),
  (45, 'https://www.instagram.com/leticiavaz/reel/DYVbB1NvaR7/', '@leticiavaz', 'Vendas / Roteiro', 'Educativo', 'Roteiro de vendas que ''garante'' pelo menos uma venda', 'educativo'),
  (46, 'https://www.instagram.com/yegor.sky/reel/DZKS20Ui5v7/', '@yegor.sky', 'Educativo edição', 'Exemplo de hook', 'Exemplo de hook visual para salvar e usar depois', 'educativo'),
  (47, 'https://www.instagram.com/rafaelachagas/reel/DbRWTEoAlvH/', '@rafaelachagas', 'Educativo UGC / Estratégia', 'Reflexão', 'Pare de criar conteúdos ''egoístas'': foque no que a audiência precisa', 'educativo'),
  (48, 'https://www.instagram.com/byjulialauren/reel/DbCWSL1Af8V/', '@byjulialauren', 'Educativo UGC / Rotina', 'Vlog BTS', 'Vlog de bastidores filmando com o filho pequeno dormindo', 'bastidores'),
  (49, 'https://www.instagram.com/charlotte.arsenault/reel/DbDzLXTO1wP/', '@charlotte.arsenault', 'Estratégia de conteúdo', 'Educativo', 'Como criar uma série de conteúdo para fortalecer a marca pessoal', 'educativo'),
  (50, 'https://www.instagram.com/editingworld8755/reel/DZgzUHxSLBG/', '@editingworld8755', 'Educativo edição', 'Antes e depois', 'Mesmo vídeo antes e depois da edição: cortes, legendas e cenas animadas', 'educativo'),
  (51, 'https://www.instagram.com/fit_withdora/reel/DZz50Ssxze9/', '@fit_withdora', 'Moda', 'Try-on', 'Try-on de saia com CTA ''comente shop''', 'portfolio'),
  (52, 'https://www.instagram.com/fernanda_reads/reel/DaqD35osRR6/', '@fernanda_reads', 'Moda', 'Lookbook', 'Inspiração de looks estilo Pinterest (sem legenda)', 'lifestyle'),
  (53, 'https://www.instagram.com/alinebahz/reel/DZf5uNfhiGb/', '@alinebahz', 'Lifestyle / Casa', 'Rotina', 'Ritual de sexta-feira: reset e banheiro abastecido com produtos', 'lifestyle'),
  (54, 'https://www.instagram.com/meusbonsachados/p/Dak2XrVkTL9/', '@meusbonsachados', 'Moda', 'Lookbook', 'Looks recentes de uma CLT (trabalho)', 'lifestyle'),
  (55, 'https://www.instagram.com/descontoslaoficial_/p/DayzH7ClFT3/', '@descontoslaoficial_', 'Moda', 'Achadinhos', 'Achados de moda com CTA ''comente MODA'' para receber links', 'portfolio'),
  (56, 'https://www.instagram.com/meusbonsachados/p/Dap-N2IEc4c/', '@meusbonsachados', 'Moda', 'Lookbook', 'Looks CLT para o dia a dia', 'lifestyle'),
  (57, 'https://www.instagram.com/lomode.ofc/p/DaTADcZnE9q/', '@lomode.ofc', 'Moda', 'Achadinhos', 'Looks com CTA ''comenta looks'' para receber links (loja online)', 'portfolio'),
  (58, 'https://www.instagram.com/biancacamargo/reel/Dav7oZGJ7Ds/', '@biancacamargo', 'Moda', 'Lookbook', 'Look de rica para preguiçosas'', parte 1', 'lifestyle'),
  (59, 'https://www.instagram.com/camilabertolin_/p/DbBIaMFFVZA/', '@camilabertolin_', 'Educativo / Canva', 'Tutorial', 'Como encontrar templates no Canva e fazer carrosséis clean (parte 2)', 'educativo'),
  (60, 'https://www.instagram.com/ali.knutson/reel/DaEfB2aKhDD/', '@ali.knutson', 'Moda', 'Lookbook', 'Minivestidos de verão (look de date)', 'lifestyle'),
  (61, 'https://www.instagram.com/lisa_elmansouri/reel/Daa7zMaMEjg/', '@lisa_elmansouri', 'Lifestyle', 'Trend', 'Qual seu drink favorito?'' (legenda curta, ver vídeo)', 'trends'),
  (62, 'https://www.instagram.com/stellamedeirosa/reel/DaT4V0itCHd/', '@stellamedeirosa', 'Moda', 'Dica / achadinho', 'Calça branca transparente: como usar certo; achado do Mercado Livre', 'portfolio'),
  (63, 'https://www.instagram.com/alinebahz/reel/DaEDxLFvzq2/', '@alinebahz', 'Skincare', 'Rotina', 'Rotina de hidratação para pele seca no inverno (Neutrogena Hydro Boost)', 'portfolio'),
  (64, 'https://www.instagram.com/chois_studios/reel/DX85srcMZFV/', '@chois_studios', 'Moda / Casa (marca)', 'Lançamento', 'Anúncio de nova coleção da marca CHOIS (em russo)', 'portfolio'),
  (65, 'https://www.instagram.com/rebecaesousa/reel/Dana4uVM53f/', '@rebecaesousa', 'Fé / Motivacional', 'Frase', 'Ore e aja!'' mensagem motivacional', 'fe'),
  (66, 'https://www.instagram.com/mariesukke/reel/Dahyvo_ol7I/', '@mariesukke', 'Moda', 'OOTD', 'Look do dia (sem legenda)', 'lifestyle'),
  (67, 'https://www.instagram.com/mentaliizee_/p/DaYimfDlJtN/', '@mentaliizee_', 'Fé / Motivacional', 'Reflexão', 'Antes da vitória, Deus fortalece a sua fé', 'fe'),
  (68, 'https://www.instagram.com/yuloook/reel/DaNO2_7gmAC/', '@yuloook', 'Moda', 'Try-on', 'Avaliando looks com tops de uma marca (em russo)', 'portfolio'),
  (69, 'https://www.instagram.com/conagh_kat/reel/DZO_lX7SVFF/', '@conagh_kat', 'Fitness / Lifestyle', 'Relatable', 'Correr e depois tomar um café'': encontro dos sonhos', 'lifestyle'),
  (70, 'https://www.instagram.com/melaniewilking/reel/DZLUjm5yg_F/', '@melaniewilking', 'Lifestyle / Moda', 'Relatable', 'Nunca digo não a um encontro para tomar café (OOTD)', 'lifestyle'),
  (71, 'https://www.instagram.com/barhatnayaaa/reel/DaS5oAICP54/', '@barhatnayaaa', 'Lifestyle', 'Teaser', 'Prévia de tutorial divertido (em russo, legenda curta)', 'lifestyle'),
  (72, 'https://www.instagram.com/luizasobral/reel/DZtE54ERS-c/', '@luizasobral', 'Moda', 'Lookbook', 'Look arrumado com peças da marca Litt', 'lifestyle'),
  (73, 'https://www.instagram.com/maaluberti/reel/DaDascwuEzC/', '@maaluberti', 'Moda', 'OOTD', 'Look detalhado marcando cada marca (regata, cinto, jaqueta, jeans, bolsa)', 'lifestyle'),
  (74, 'https://www.instagram.com/lamialens/reel/Dar-j5rOwe-/', '@lamialens', 'Skincare', 'Rotina', 'Self-care sunday: ritual de skincare profissional em casa e suplemento de peptídeos', 'portfolio'),
  (75, 'https://www.instagram.com/leyla.films/reel/Dap8q_tNlzW/', '@leyla.films', 'Beleza / Make', 'GRWM criativo', 'Obsessão atual de batom; inspiração de reel GRWM criativo', 'portfolio'),
  (76, 'https://www.instagram.com/annarytalima/reel/DabxIRmuOtu/', '@annarytalima', 'Motivacional', 'Reflexão', 'Quantas oportunidades temos para fazer diferença', 'fe'),
  (77, 'https://www.instagram.com/vika_ugc/reel/DaizIS1v5B-/', '@vika_ugc', 'Educativo UGC / Rotina', 'POV', 'POV: criar conteúdo é seu trabalho em tempo integral', 'educativo'),
  (78, 'https://www.instagram.com/gabrielameendes_/p/DaLCl6LFnMR/', '@gabrielameendes_', 'Fé / Motivacional', 'Dicas', 'Dicas para se aproximar de Jesus', 'fe'),
  (79, 'https://www.instagram.com/theandraalmeidac/p/DaL7T7pESIk/', '@theandraalmeidac', 'Estratégia de conteúdo / Mindset', 'Reflexão', 'Parou de criar com ansiedade por likes e views', 'educativo'),
  (80, 'https://www.instagram.com/lennamarper/reel/DaAy1jdxCo7/', '@lennamarper', 'Humor / Relacionamento', 'Trend', 'Trend: homem só percebe troca de roupa se avisar', 'trends'),
  (81, 'https://www.instagram.com/nathaliapazyt/reel/DZaXqlxx9ZW/', '@nathaliapazyt', 'Humor / Relacionamento', 'Trend', 'Trend de casal ''por que eles são assim''', 'trends'),
  (82, 'https://www.instagram.com/vicgaibar/reel/DaGGMTdtawm/', '@vicgaibar', 'Educativo UGC / Lifestyle', 'Bastidores', 'Gravando sozinha com tripé e iPhone (na França)', 'bastidores'),
  (83, 'https://www.instagram.com/majugomeess/reel/DZ8l6dNJGbO/', '@majugomeess', 'Moda', 'Lookbook', 'Inspiração de look (''a melhor sensação'')', 'lifestyle'),
  (84, 'https://www.instagram.com/maestroprompts/p/DYzjbhzjlk-/', '@maestroprompts', 'Tech / Apps / IA', 'Isca (lead magnet)', 'CTA ''comente PROMPT'' para receber 50 comandos de IA', 'educativo'),
  (85, 'https://www.instagram.com/mari_hachmann/reel/DZdTiHfpPB1/', '@mari_hachmann', 'Crescimento no Instagram', 'Educativo', 'Estratégia de reels de teste que gerou 3 mil seguidores em 3 semanas', 'educativo'),
  (86, 'https://www.instagram.com/zorianaugc.us/reel/DYAeKN2zsf1/', '@zorianaugc.us', 'Skincare', 'Demo de produto', 'Creme com ácido hialurônico: hidratação de até 72 horas', 'portfolio'),
  (87, 'https://www.instagram.com/daschabae/reel/DZ19_OcooZ7/', '@daschabae', 'Educativo edição', 'Teaser', 'Prévia de vídeo editado; resultado no perfil (em russo)', 'educativo'),
  (88, 'https://www.instagram.com/veveyumi/reel/DZ51K3dpRac/', '@veveyumi', 'Lifestyle / Home office', 'Day in my life', 'Um dia de home office com glow up de ''diva corporativa'' e café', 'lifestyle'),
  (89, 'https://www.instagram.com/alina_perva/reel/DZ3Aenmyzmy/', '@alina_perva', 'Lifestyle', 'Trend', 'Trend viral ''Ready 100'' (legenda curta, ver vídeo)', 'trends')
on conflict (url) do nothing;

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
