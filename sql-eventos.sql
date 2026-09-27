-- ============================================================
-- EVENTOS DO PORTFÓLIO (para o painel)
-- Uma linha por AÇÃO no site, sem nada pessoal:
--   tipo = 'video'    -> alguém clicou para assistir um vídeo (detalhe = qual)
--   tipo = 'form'     -> alguém rolou até o formulário de contato
--   tipo = 'mensagem' -> alguém enviou o formulário (mandou mensagem)
-- Alimenta "Vídeos mais clicados" e "Do primeiro clique até a mensagem".
-- Cole TUDO no SQL Editor do Supabase e clique em Run.
-- ============================================================
create table if not exists public.eventos (
  id      uuid primary key default gen_random_uuid(),
  data    timestamptz not null default now(),
  tipo    text check (char_length(tipo) <= 40),
  detalhe text check (char_length(detalhe) <= 200),
  pagina  text check (char_length(pagina) <= 200)
);

create index if not exists eventos_data_idx on public.eventos (data);

alter table public.eventos enable row level security;

-- Você, logada, lê e escreve tudo.
drop policy if exists "dona faz tudo" on public.eventos;
create policy "dona faz tudo" on public.eventos
  for all to authenticated using (public.eh_dona()) with check (public.eh_dona());

-- O site pode CRIAR um evento com a hora de agora. Não pode ler nada de ninguém.
drop policy if exists "site registra evento" on public.eventos;
create policy "site registra evento" on public.eventos
  for insert to anon, authenticated
  with check (data between now() - interval '5 minutes' and now() + interval '5 minutes');

-- Permissões de base.
revoke all on public.eventos from anon;
grant insert on public.eventos to anon;
grant select, insert, update, delete on public.eventos to authenticated;
