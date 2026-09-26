// ============================================================
// FUNÇÃO enviar-emails (roda dentro do Supabase, não no site)
//
// Quem chama: a aba Prospecção do painel, com você logada.
// O que faz: manda o e-mail pelo Resend, um por um, e grava
// cada envio na tabela email_envios.
//
// A chave do Resend NÃO está aqui. Ela fica guardada no painel
// do Supabase, em Edge Functions > Secrets, com o nome
// RESEND_API_KEY. As outras (SUPABASE_URL, SUPABASE_ANON_KEY e
// SUPABASE_SERVICE_ROLE_KEY) o próprio Supabase já entrega.
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const DONA = "cimarinho.ugc@gmail.com";
const REMETENTE = Deno.env.get("REMETENTE") || "Cintia Marinho <hello@cimarinho.com>";
const RESPONDER_PARA = "hello@cimarinho.com";
const MAXIMO = 250;          // no máximo 250 e-mails por chamada
const PAUSA_MS = 550;        // espera entre um e-mail e outro (o Resend aceita poucos por segundo)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Destino = { email: string; nome?: string; marca?: string; marca_id?: string };

// troca {{nome}} e {{marca}} pelo de cada marca
function preenche(texto: string, d: Destino, html: boolean) {
  const limpa = (t: string) => html ? t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)) : t;
  const marca = (d.marca || "").trim();
  const nome = (d.nome || "").trim().split(/\s+/)[0] || (marca ? marca + " team" : "there");
  return texto.replace(/\{\{\s*nome\s*\}\}/gi, limpa(nome)).replace(/\{\{\s*marca\s*\}\}/gi, limpa(marca || "your brand"));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return resposta({ erro: "Use POST." }, 405);

  // 1. Só você pode usar: confere quem está logada
  const url = Deno.env.get("SUPABASE_URL")!;
  const auth = req.headers.get("Authorization") || "";
  const comoVoce = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: quem } = await comoVoce.auth.getUser();
  if (!quem?.user || (quem.user.email || "").toLowerCase() !== DONA) return resposta({ erro: "Sem permissão." }, 401);

  const chave = Deno.env.get("RESEND_API_KEY");
  if (!chave) return resposta({ erro: "Falta o segredo RESEND_API_KEY no Supabase (Edge Functions > Secrets)." }, 500);

  // 2. O que chegou do painel
  let pedido: { assunto?: string; html?: string; texto?: string; destinatarios?: Destino[]; teste?: boolean };
  try { pedido = await req.json(); } catch { return resposta({ erro: "Pedido inválido." }, 400); }
  const assunto = String(pedido.assunto || "").trim();
  const html = String(pedido.html || "");
  const texto = String(pedido.texto || "");
  const teste = !!pedido.teste;
  let lista = Array.isArray(pedido.destinatarios) ? pedido.destinatarios : [];
  if (!assunto || !html) return resposta({ erro: "Faltou o assunto ou o texto." }, 400);
  if (!lista.length) return resposta({ erro: "Nenhum destinatário." }, 400);
  if (lista.length > MAXIMO) return resposta({ erro: "No máximo " + MAXIMO + " e-mails por vez." }, 400);

  // tira e-mails repetidos e inválidos
  const vistos = new Set<string>();
  lista = lista.filter((d) => {
    const e = String(d.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || vistos.has(e)) return false;
    vistos.add(e); d.email = e; return true;
  });

  // 3. Quem pediu para sair nunca recebe (com a chave interna, que ignora a tranca)
  const banco = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: saiu } = await banco.from("email_optout").select("email");
  const bloqueados = new Set((saiu || []).map((o: { email: string }) => String(o.email).toLowerCase()));
  const pulados = lista.filter((d) => bloqueados.has(d.email)).map((d) => d.email);
  lista = lista.filter((d) => !bloqueados.has(d.email));

  // 4. Manda um por um
  let enviados = 0, falhas = 0, parouNaCota = false;
  const faltaram: string[] = [];
  for (let i = 0; i < lista.length; i++) {
    const d = lista[i];
    if (parouNaCota) { faltaram.push(d.email); continue; }
    const corpo = {
      from: REMETENTE,
      to: [d.email],
      reply_to: RESPONDER_PARA,
      subject: preenche(assunto, d, false),
      html: preenche(html, d, true),
      text: texto ? preenche(texto, d, false) : undefined,
      headers: { "List-Unsubscribe": "<mailto:" + RESPONDER_PARA + "?subject=SAIR>" },
    };
    let r: Response | null = null, info: Record<string, unknown> = {};
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      try {
        r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + chave, "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        });
        info = await r.json().catch(() => ({}));
      } catch (e) { r = null; info = { message: String(e) }; }
      // rápido demais: espera um pouco e tenta de novo
      if (r && r.status === 429 && info.name !== "daily_quota_exceeded" && info.name !== "monthly_quota_exceeded") { await espera(1200); continue; }
      break;
    }
    const nomeErro = String(info.name || "");
    if (nomeErro === "daily_quota_exceeded" || nomeErro === "monthly_quota_exceeded") {
      parouNaCota = true; faltaram.push(d.email); continue;
    }
    const deuCerto = !!(r && r.ok && info.id);
    if (deuCerto) enviados++; else falhas++;
    await banco.from("email_envios").insert({
      email: d.email, marca: d.marca || null, marca_id: d.marca_id || null,
      assunto: corpo.subject, via: teste ? "teste" : "resend",
      status: deuCerto ? "ok" : "erro",
      erro: deuCerto ? null : String(info.message || nomeErro || ("erro " + (r ? r.status : "de conexão"))).slice(0, 500),
      resend_id: deuCerto ? String(info.id) : null,
    });
    if (i < lista.length - 1) await espera(PAUSA_MS);
  }

  return resposta({ enviados, falhas, pulados, parouNaCota, faltaram });
});
