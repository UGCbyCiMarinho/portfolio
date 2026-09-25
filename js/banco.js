/* ============================================================
   CONEXÃO COM O SUPABASE (o seu banco de dados)
   Este arquivo é usado pelo portfólio, pelo login e pelo admin.
   Aqui só existe a chave PÚBLICA, que pode ficar à mostra:
   quem protege os seus dados é a tranca (RLS) do banco.sql.
   Nunca coloque a chave secreta (service_role) aqui.
   ============================================================ */
window.SUPABASE_URL = "https://unptzpcyuktpwisylyig.supabase.co";
window.SUPABASE_CHAVE = "sb_publishable_AkLy5UarAglqHJdkyX5v8g_RdzdJ-rm";

/* window.banco é a conexão pronta. Se a biblioteca do Supabase não
   carregar (internet fora, por exemplo), fica null e cada página
   decide o que fazer, sem quebrar. */
window.banco = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_CHAVE)
  : null;
