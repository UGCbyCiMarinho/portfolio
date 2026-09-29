-- ============================================================
-- INSPIRAÇÃO: coleções + as referências do Desafio de outubro
--
-- ONDE COLAR: supabase.com, abra o projeto, menu "SQL Editor",
-- "New query", cole tudo e clique em "Run".
-- Não apaga nada. Pode rodar mais de uma vez sem medo.
-- ============================================================

-- 1. O campo Coleção (vazio = "Minhas salvas")
alter table public.inspiracoes add column if not exists colecao text;

-- 2. Os 31 vídeos que mais performaram nos 5 perfis de referência
--    (Brenda, Kaytelynn, Camila, Taylor e Stef). Chegam como "Para analisar".
insert into public.inspiracoes (url, criadora, nicho, formato, sobre, pilar, metricas, colecao) values
  ('https://www.instagram.com/brendasanntanaa/reel/DctoI2aBz2k/', '@brendasanntanaa', 'Beleza / Body care', 'Estética de produto', 'Collab com a DaBelle: banho premium, cabelo e pele perfumados. O vídeo mais visto dela (70 mil)', 'portfolio', '{"views": 70300}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/DccO6eVxBhA/', '@brendasanntanaa', 'Beleza / Make', 'GRWM / trend', 'GRWM seguindo trend (legenda curta, ver vídeo)', 'portfolio', '{"views": 33100}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/Dclj5RSR_r2/', '@brendasanntanaa', 'Skincare', 'O cenário × o resultado', 'Nicho de skincare no formato dela: mostra o cenário montado e depois o vídeo pronto', 'bastidores', '{"views": 21400}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/DdezGpzxFoy/', '@brendasanntanaa', 'Educativo UGC / Equipamento', 'Bastidores (BTS)', 'Upgrade de equipamento (lente Tamron) e a diferença na qualidade dos vídeos', 'bastidores', '{"views": 13000}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/DdKR7XYR7B8/', '@brendasanntanaa', 'Beleza / Make', 'O cenário × o resultado', 'Nicho de make: ''O cenário'' com tripé e luzes, depois o vídeo final', 'bastidores', '{"views": 9557}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/Dcjar0aR6WV/', '@brendasanntanaa', 'Beleza', 'Product showcase', 'Product showcase gravado dentro do carro, começando pelo cenário', 'portfolio', '{"views": 8975}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/DcWjToyxjGo/', '@brendasanntanaa', 'Beleza', 'O cenário × o resultado', '''Minha percepção de olhar'': o cenário simples e o resultado com cara de estúdio', 'bastidores', '{"views": 8005}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/brendasanntanaa/reel/Ddw4HDZR-Fh/', '@brendasanntanaa', 'Suplementos / Fitness', 'GRWM treino', 'GRWM para o treino com suplemento (Denavita) segurando o produto na cozinha', 'portfolio', '{"views": 6813}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/Dc1L2dzO6B0/', '@ugcwithkaytelynn', 'Tech / Apps', 'Anúncio (ad)', 'Anúncio de app de currículo (Enhancv): ''The key to more interviews''. 234 mil visualizações', 'portfolio', '{"views": 234000}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DcHEV9ds453/', '@ugcwithkaytelynn', 'Educativo UGC', 'Lista / dicas', '15 shots que as marcas precisam usar nos anúncios', 'educativo', '{"views": 16100}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DdE4hd3sxe-/', '@ugcwithkaytelynn', 'Educativo UGC / Equipamento', 'Demo de produto', 'O acessório que substituiu 90% do equipamento de gravação dela (MOFT)', 'portfolio', '{"views": 9844}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DcTfItfuN6W/', '@ugcwithkaytelynn', 'Educativo UGC / Estratégia', 'Dicas rápidas', 'Estratégias rápidas que ela usa para criar anúncios que performam para os clientes', 'educativo', '{"views": 4805}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DdbgUyTOjgn/', '@ugcwithkaytelynn', 'Haircare', 'Demo de produto', 'Chapinha que alisa e modela ao mesmo tempo (TYMO FLIPRO), demo do antes e depois', 'portfolio', '{"views": 3861}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DcOrngruDe9/', '@ugcwithkaytelynn', 'Pet / Rotina de creator', 'Relatable', '''When you''re the niche'': a cachorra como co-estrela dos vídeos de UGC', 'lifestyle', '{"views": 3788}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DcfJnhWOpVQ/', '@ugcwithkaytelynn', 'Educativo UGC / Tech', 'Exemplos de hook', 'Hooks de tech que performaram para os clientes dela', 'educativo', '{"views": 3573}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DcJs48wsI5Z/', '@ugcwithkaytelynn', 'Educativo UGC / Estratégia', 'Educativo', 'Marcas testam 20 hooks; o que mais testar: dores, ângulos, objeções e formatos', 'educativo', '{"views": 3109}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DdZPI4HODKT/', '@ugcwithkaytelynn', 'Skincare', 'Demo de produto', '''Eye bags have left the chat'': demo de patch de olheiras (Biodance)', 'portfolio', '{"views": 3001}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwithkaytelynn/reel/DdCJFmOuPMA/', '@ugcwithkaytelynn', 'Skincare', 'Demo de produto', 'Protetor solar que não parece protetor (Fully): textura e acabamento', 'portfolio', '{"views": 2444}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/camilabertolin_/reel/DdEinx4Bcak/', '@camilabertolin_', 'Educativo edição', 'Tutorial', 'A IA do CapCut editando o vídeo praticamente sozinha. 184 mil visualizações', 'educativo', '{"views": 184000}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/camilabertolin_/reel/DdRYoezOpUZ/', '@camilabertolin_', 'Educativo edição', 'Tutorial', 'Modelo de texto com efeito sonoro para deixar o vídeo mais dinâmico no CapCut', 'educativo', '{"views": 83100}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/camilabertolin_/reel/Ddr2WtIBeeR/', '@camilabertolin_', 'Tech', 'Unboxing', 'Unboxing do iPhone novo, com parceria da loja', 'portfolio', '{"views": 59200}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwtaylor/reel/DbGjwqFPlA_/', '@ugcwtaylor', 'Educativo UGC / Prospecção', 'Demo de app', 'O melhor hack de pitch dela: um assistente virtual para prospectar (onBento)', 'educativo', '{"views": 53700}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwtaylor/reel/DIxEJHkT_NY/', '@ugcwtaylor', 'Educativo UGC / Estratégia', 'Educativo', 'Anúncio chato está fora, storytelling está dentro: o formato de anúncio do ano', 'educativo', '{"views": 28400}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwtaylor/reel/DbMskDfxvRB/', '@ugcwtaylor', 'Humor / Criador', 'Relatable', 'Humor de creator pedindo uma mudança para a Apple (a dor de gravar com o iPhone)', 'lifestyle', '{"views": 10400}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwtaylor/reel/DZrBn3tu8-v/', '@ugcwtaylor', 'Educativo UGC / Estratégia', 'Format breakdown', 'Tipos de anúncio que ela mais usa: diversificar formato para não desperdiçar verba', 'educativo', '{"views": 8289}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/ugcwtaylor/reel/DbeXTkvBEsB/', '@ugcwtaylor', 'Rotina de creator', 'Relatable', '''Just one perk of my job'': o lado bom de trabalhar como creator', 'lifestyle', '{"views": 7497}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/cre8tivestef/reel/DdRcIGxRjTm/', '@cre8tivestef', 'Tech / Apps', 'Demo de app', 'Demo de app de foto (Esti) com CTA ''comente app''', 'portfolio', '{"views": 38000}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/cre8tivestef/reel/DdKHNRnR70U/', '@cre8tivestef', 'Casa / Lifestyle', 'Vlog', 'Compras de outono (Winners, HomeSense) com a melhor amiga, trend ''waste money''', 'lifestyle', '{"views": 20800}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/cre8tivestef/reel/DYstTCkRx55/', '@cre8tivestef', 'Rotina de creator', 'Montagem', 'As marcas que já contrataram ela como UGC creator, em montagem', 'lifestyle', '{"views": 16800}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/cre8tivestef/reel/DdaBaIORS3k/', '@cre8tivestef', 'Educativo UGC', 'Exemplo de UGC', 'Exemplo de UGC que performou: o formato ''green screen grid'' virou anúncio pago', 'educativo', '{"views": 12000}'::jsonb, 'Desafio de outubro'),
  ('https://www.instagram.com/cre8tivestef/reel/DV9OZ2mkZ6b/', '@cre8tivestef', 'Rotina de creator', 'Apresentação', '''I''m Stef, 32, Canadian millennial mom'': apresentação de UGC creator sem nicho', 'lifestyle', '{"views": 9176}'::jsonb, 'Desafio de outubro')
on conflict (url) do nothing;

-- 3. Numera os novos depois dos seus (continua a contagem da planilha)
with novos as (
  select id, row_number() over (order by created_at, url) as n from public.inspiracoes where numero is null
)
update public.inspiracoes i set numero = (select coalesce(max(numero), 0) from public.inspiracoes) + novos.n
from novos where i.id = novos.id;

-- Pronto! Se apareceu "Success. No rows returned", deu tudo certo.
