/* ============================================================
   PAINEL (admin) · Cintia Marinho
   Cada aba se monta sozinha. Se uma tabela faltar no banco,
   aparece um aviso em cima e o resto continua funcionando.
   ============================================================ */
(async function () {
"use strict";

/* ============================================================
   1. CONFERIR A SESSÃO (sempre a primeira coisa)
   A página fica invisível até aqui. Sem sessão, vai para o login.
   ============================================================ */
const LOGIN = "../login/";
if (!window.banco) {
  document.documentElement.classList.remove("travado");
  document.body.innerHTML = '<main class="login"><div class="login__cartao"><div class="faixa">Não consegui conectar ao banco. Confira a sua internet e recarregue a página.</div></div></main>';
  return;
}
let sessao = null;
try { sessao = (await banco.auth.getSession()).data.session; } catch (e) { sessao = null; }
if (!sessao) { location.replace(LOGIN); return; }
banco.auth.onAuthStateChange((evento, s) => { if (evento === "SIGNED_OUT" || (!s && evento !== "INITIAL_SESSION")) location.replace(LOGIN); });

/* ============================================================
   2. FERRAMENTAS PEQUENAS
   ============================================================ */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* a biblioteca usa só <b> e <em> para destacar: todo o resto é escapado */
const comDestaque = (t) => esc(t).replace(/&lt;(\/?)(b|em)&gt;/g, "<$1$2>");
const pad = (n) => String(n).padStart(2, "0");
const isoLocal = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const deISO = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return (y && m && d) ? new Date(y, m - 1, d) : null;
};
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const diasAte = (s) => { const d = deISO(s); return d ? Math.round((d - hoje()) / 864e5) : null; };
const dataBR = (s) => { const d = deISO(s); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() : ""; };
const numBR = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dinheiro = (v) => "$ " + numBR.format(Number(v) || 0);
const inteiro = (v) => new Intl.NumberFormat("pt-BR").format(Number(v) || 0);
const plural = (n, um, varios) => n + " " + (n === 1 ? um : varios);
const normaliza = (t) => String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const soma = (lista, f) => lista.reduce((t, x) => t + (Number(f(x)) || 0), 0);
const maisComum = (lista) => {
  const c = {};
  lista.forEach(v => { if (v) c[v] = (c[v] || 0) + 1; });
  const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return top ? { nome: top[0], n: top[1] } : null;
};
const pilExemplo = (x) => x && x.exemplo ? '<span class="pil pil--exemplo">exemplo</span>' : "";

const ICONES = {
  mais: '<path d="M12 5v14M5 12h14"/>',
  editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  lixo: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  olho: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  olhoFechado: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22"/>',
  alca: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  estrela: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  whats: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  esq: '<path d="M15 18l-6-6 6-6"/>',
  dir: '<path d="M9 18l6-6-6-6"/>',
  baixo: '<path d="M6 9l6 6 6-6"/>',
  fechar: '<path d="M18 6L6 18M6 6l12 12"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>'
};
const ic = (nome) => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[nome] || "") + "</svg>";

/* ----- avisos no topo (tabela ou campo faltando) ----- */
const avisados = {};
function aviso(chave, texto) {
  if (avisados[chave]) return;
  avisados[chave] = true;
  const el = document.createElement("div");
  el.className = "faixa faixa--aviso";
  el.textContent = texto;
  $("#avisos").appendChild(el);
}

/* ----- aviso rápido que some sozinho ----- */
let timerTorrada;
function torrada(texto, erro) {
  let el = $("#torrada");
  if (!el) { el = document.createElement("div"); el.id = "torrada"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.className = "torrada" + (erro ? " torrada--erro" : "");
  el.textContent = texto;
  el.hidden = false;
  clearTimeout(timerTorrada);
  timerTorrada = setTimeout(() => { el.hidden = true; }, erro ? 7000 : 2600);
}

/* ----- traduz os erros do banco para português ----- */
function traduzErro(e, tabela) {
  const cod = (e && e.code) || "";
  const msg = (e && e.message) || String(e || "");
  const m = msg.toLowerCase();
  if (cod === "PGRST205" || cod === "42P01" || m.includes("could not find the table") || (m.includes("relation") && m.includes("does not exist")))
    return 'A tabela "' + tabela + '" não existe no banco ainda. Rode o arquivo banco.sql no SQL Editor do Supabase. O resto do painel continua funcionando.';
  if (cod === "PGRST204" || cod === "42703" || (m.includes("column") && (m.includes("not") || m.includes("does"))))  {
    const achou = msg.match(/'([^']+)' column|column "?([\w.]+)"?/i);
    const campo = achou ? (achou[1] || achou[2] || "").split(".").pop() : "";
    return 'Falta o campo ' + (campo ? '"' + campo + '" ' : "") + 'na tabela "' + tabela + '". O que depende dele fica em branco, o resto funciona normalmente.';
  }
  if (cod === "42501" || m.includes("row-level security") || m.includes("permission denied"))
    return 'O banco não deixou mexer em "' + tabela + '". Confira se você entrou com cimarinho.ugc@gmail.com.';
  if (cod === "23514") return "Algum valor não está entre as opções aceitas pelo banco.";
  if (cod === "23502") return "Falta preencher um campo obrigatório.";
  if (m.includes("failed to fetch") || m.includes("network") || m.includes("load failed")) return "Sem conexão com o banco. Confira a sua internet.";
  if (m.includes("jwt")) return "A sua sessão expirou. Clique em Sair e entre de novo.";
  return 'Algo deu errado com "' + tabela + '": ' + msg;
}
const ehErroDeCampo = (e) => e && (e.code === "PGRST204" || e.code === "42703" || /column/i.test(e.message || ""));

/* ----- campos que o painel espera em cada tabela ----- */
const ESPERADO = {
  videos: ["titulo", "link", "nicho", "formato", "marca", "destaque", "ordem", "visivel"],
  marcas: ["nome", "instagram", "email", "telefone", "situacao", "obs", "ultimo_contato"],
  base_marcas: ["nome", "instagram", "email", "telefone", "site", "nicho", "origem", "situacao", "obs", "ultimo_contato", "nao_enviar", "favorita", "produto", "link_produto", "outros_contatos", "fonte"],
  calendario: ["titulo", "marca", "tipo", "data", "status"],
  campanhas: ["campanha", "cliente", "tipo", "status", "qtd", "valor", "prazo", "pagamento", "ativa", "favorita", "moeda", "pagamentos", "gift", "nicho", "data_contrato", "vencimento", "canal", "canal_detalhe"],
  abordagens: ["data", "canal", "quantidade"],
  marcados: ["chave"],
  roteiros: ["fonte", "url", "perfil", "de_quem", "titulo", "transcricao", "legenda", "postado_em", "tags", "obs", "status", "erro", "gancho", "corpo", "cta", "analise", "metricas", "capa"],
  configuracoes: ["chave", "valor"],
  visitas: ["data", "pagina", "origem"]
};
function confereCampos(tabela, linhas) {
  if (!linhas.length || !ESPERADO[tabela]) return;
  const faltam = ESPERADO[tabela].filter(c => !(c in linhas[0]));
  if (faltam.length) aviso("campo-" + tabela, 'Na tabela "' + tabela + '" faltam os campos: ' + faltam.join(", ") + ". O que depende deles fica em branco, o resto funciona normalmente.");
}

/* ----- ler uma tabela inteira, sem nunca travar o painel ----- */
const falhou = {};
async function ler(tabela, montar) {
  async function tudo(comFiltro) {
    let linhas = [], de = 0;
    for (;;) {
      let q = banco.from(tabela).select("*");
      if (comFiltro && montar) q = montar(q);
      const { data, error } = await q.range(de, de + 999);
      if (error) throw error;
      linhas = linhas.concat(data || []);
      if (!data || data.length < 1000) break;
      de += 1000;
    }
    return linhas;
  }
  try {
    const linhas = await tudo(true);
    confereCampos(tabela, linhas);
    return linhas;
  } catch (e) {
    /* se o problema foi um campo usado na ordenação, tenta de novo sem ordenar */
    if (montar && ehErroDeCampo(e)) {
      try { const linhas = await tudo(false); aviso("campo-" + tabela, traduzErro(e, tabela)); confereCampos(tabela, linhas); return linhas; } catch (e2) { e = e2; }
    }
    falhou[tabela] = true;
    aviso("ler-" + tabela, traduzErro(e, tabela));
    return [];
  }
}

async function salvarLinha(tabela, dados, id) {
  dados = Object.assign({}, dados);
  const faltando = [];
  try {
    for (let tentativa = 0; tentativa < 8; tentativa++) {
      const q = id ? banco.from(tabela).update(dados).eq("id", id) : banco.from(tabela).insert(dados);
      const { data, error } = await q.select().single();
      if (!error) {
        if (faltando.length) aviso("salvar-" + tabela + faltando.join(), 'Salvei, mas a tabela "' + tabela + '" não tem os campos: ' + faltando.join(", ") + ". Rode o SQL mais recente no Supabase para guardar tudo.");
        return data;
      }
      /* campo que não existe no banco: tira ele e tenta de novo, para não perder o resto */
      const achou = ehErroDeCampo(error) && String(error.message || "").match(/'([^']+)' column|column "?(?:\w+\.)?([\w]+)"?/i);
      const campo = achou && (achou[1] || achou[2]);
      if (!campo || !(campo in dados)) throw error;
      delete dados[campo];
      faltando.push(campo);
    }
    throw new Error("muitos campos faltando");
  } catch (e) { torrada(traduzErro(e, tabela), true); return null; }
}
async function apagarLinha(tabela, id) {
  try {
    const { error } = await banco.from(tabela).delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) { torrada(traduzErro(e, tabela), true); return false; }
}
function troca(lista, linha) {
  const i = lista.findIndex(x => x.id === linha.id);
  if (i >= 0) lista[i] = linha; else lista.push(linha);
}

/* ----- botão de apagar em dois cliques (sem janela de confirmação) ----- */
function duploClique(btn, acao, texto) {
  const original = btn.innerHTML;
  let timer;
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (btn.dataset.armado) {
      clearTimeout(timer);
      delete btn.dataset.armado;
      btn.classList.remove("armado");
      btn.innerHTML = original;
      await acao();
      return;
    }
    btn.dataset.armado = "1";
    btn.classList.add("armado");
    btn.textContent = texto || "Clique de novo para apagar";
    timer = setTimeout(() => { delete btn.dataset.armado; btn.classList.remove("armado"); btn.innerHTML = original; }, 3000);
  });
}

/* ============================================================
   3. JANELA (modal) E FORMULÁRIOS
   ============================================================ */
function abrirJanela({ titulo, corpo, rodape, larga }) {
  fecharJanela();
  const j = document.createElement("div");
  j.className = "janela";
  j.id = "janela";
  j.innerHTML =
    '<div class="janela__caixa' + (larga ? " janela__caixa--larga" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(titulo) + '">' +
      '<div class="janela__cab"><h2>' + esc(titulo) + '</h2><button class="btn--icone" type="button" data-fechar aria-label="Fechar">' + ic("fechar") + "</button></div>" +
      '<div class="janela__corpo">' + corpo + "</div>" +
      (rodape ? '<div class="janela__pe">' + rodape + "</div>" : "") +
    "</div>";
  j.addEventListener("mousedown", (e) => { if (e.target === j) fecharJanela(); });
  j.addEventListener("click", (e) => { if (e.target.closest("[data-fechar]")) fecharJanela(); });
  document.body.appendChild(j);
  return j;
}
function fecharJanela() { const j = $("#janela"); if (j) j.remove(); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharJanela(); });

function campoHTML(c, valor) {
  const id = "f-" + c.nome;
  const v = valor == null ? (c.padrao == null ? "" : c.padrao) : valor;
  const classe = "campo" + (c.inteiro ? " inteiro" : "");
  if (c.tipo === "check") {
    return '<label class="campo campo--check inteiro"><input type="checkbox" name="' + c.nome + '"' + (v ? " checked" : "") + "> " + esc(c.rot) + "</label>";
  }
  let controle;
  if (c.tipo === "select") {
    controle = '<select id="' + id + '" name="' + c.nome + '">' + c.opcoes.map(o => {
      const [ov, ot] = Array.isArray(o) ? o : [o, o];
      return '<option value="' + esc(ov) + '"' + (String(ov) === String(v) ? " selected" : "") + ">" + esc(ot) + "</option>";
    }).join("") + "</select>";
  } else if (c.tipo === "textarea") {
    controle = '<textarea id="' + id + '" name="' + c.nome + '" rows="' + (c.linhas || 3) + '" placeholder="' + esc(c.dica || "") + '">' + esc(v) + "</textarea>";
  } else {
    const lista = c.lista && c.lista.length;
    controle = '<input id="' + id + '" name="' + c.nome + '" type="' + (c.tipo || "text") + '" value="' + esc(v) + '"' +
      (lista ? ' list="' + id + '-l"' : "") + (c.passo ? ' step="' + c.passo + '"' : "") + (c.min != null ? ' min="' + c.min + '"' : "") +
      ' placeholder="' + esc(c.dica || "") + '" autocomplete="off">' +
      (lista ? '<datalist id="' + id + '-l">' + c.lista.map(o => '<option value="' + esc(o) + '">').join("") + "</datalist>" : "");
  }
  return '<div class="' + classe + '"><label for="' + id + '">' + esc(c.rot) + (c.obrigatorio ? " *" : "") + "</label>" + controle + "</div>";
}
function lerCampos(form, campos) {
  const o = {};
  campos.forEach(c => {
    const el = form.elements[c.nome];
    if (!el) return;
    if (c.tipo === "check") o[c.nome] = el.checked;
    else if (c.tipo === "number") o[c.nome] = el.value === "" ? 0 : Number(el.value);
    else if (c.tipo === "date") o[c.nome] = el.value || null;
    else o[c.nome] = el.value.trim() || null;
  });
  return o;
}
/* janela de editar/adicionar, igual para todas as abas */
function editor({ titulo, campos, valores, aoSalvar, aoApagar, larga, topo, extra }) {
  valores = valores || {};
  const j = abrirJanela({
    titulo, larga,
    corpo: (topo || "") + '<form class="grade-form" novalidate>' + campos.map(c => campoHTML(c, valores[c.nome])).join("") +
           '<div class="faixa inteiro escondido" data-erro></div></form>',
    rodape: (aoApagar ? '<button class="btn btn--perigo" type="button" data-apagar>' + ic("lixo") + " Apagar</button>" : "") +
            (extra ? '<button class="btn btn--linha" type="button" data-extra>' + esc(extra.rot) + "</button>" : "") +
            '<span class="espaco"></span><button class="btn btn--linha" type="button" data-fechar>Cancelar</button>' +
            '<button class="btn" type="button" data-salvar>Salvar</button>'
  });
  const form = $("form", j);
  const erro = (texto) => { const e = $("[data-erro]", j); e.textContent = texto; e.classList.remove("escondido"); };
  const botao = $("[data-salvar]", j);
  async function salvar() {
    const dados = lerCampos(form, campos);
    const falta = campos.find(c => c.obrigatorio && (dados[c.nome] == null || dados[c.nome] === ""));
    if (falta) { erro('Preencha o campo "' + falta.rot + '".'); return; }
    botao.disabled = true; botao.textContent = "Salvando...";
    const ok = await aoSalvar(dados, erro);
    if (ok) fecharJanela(); else { botao.disabled = false; botao.textContent = "Salvar"; }
  }
  botao.addEventListener("click", salvar);
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox") { e.preventDefault(); salvar(); }
  });
  if (aoApagar) duploClique($("[data-apagar]", j), async () => { if (await aoApagar()) fecharJanela(); });
  if (extra) duploClique($("[data-extra]", j), async () => { if (await extra.acao()) fecharJanela(); }, extra.confirma || "Clique de novo para confirmar");
  const primeiro = $("input, select, textarea", form);
  if (primeiro && window.matchMedia("(pointer: fine)").matches) primeiro.focus();
  return j;
}

/* ----- CSV que abre certinho no Excel, com acento ----- */
function baixarCSV(nome, cabecalho, linhas) {
  const virgulaDecimal = /^(pt|es|fr|de|it|nl)/i.test(navigator.language || "");
  const sep = virgulaDecimal ? ";" : ",";
  const cel = (v) => {
    if (typeof v === "number") v = virgulaDecimal ? String(v).replace(".", ",") : String(v);
    let s = String(v == null ? "" : v);
    if (/^[=+\-@]/.test(s)) s = " " + s; /* o Excel não confunde com fórmula */
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const texto = "﻿" + [cabecalho].concat(linhas).map(l => l.map(cel).join(sep)).join("\r\n");
  const url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome + "-" + isoLocal(new Date()) + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const numero = (rot, val, sub) =>
  '<div class="numero"><div class="numero__rot">' + esc(rot) + '</div><div class="numero__val" title="' + esc(val) + '">' + esc(val) + "</div>" +
  (sub ? '<div class="numero__sub">' + esc(sub) + "</div>" : "") + "</div>";

/* ============================================================
   4. CARREGAR OS DADOS
   ============================================================ */
const D = { videos: [], visitas: [], marcas: [], calendario: [], campanhas: [], roteiros: [], base: [], abordagens: [], config: {}, marcados: new Set() };
const inicio14 = hoje(); inicio14.setDate(inicio14.getDate() - 13);

const [videos, visitas, marcas, calendario, campanhas, marcados, roteiros, configuracoes, base, abordagens] = await Promise.all([
  ler("videos", q => q.order("ordem", { ascending: true }).order("criado_em", { ascending: true })),
  ler("visitas", q => q.gte("data", inicio14.toISOString()).order("data", { ascending: true })),
  ler("marcas", q => q.order("criado_em", { ascending: false })),
  ler("calendario", q => q.order("data", { ascending: true })),
  ler("campanhas", q => q.order("criado_em", { ascending: false })),
  ler("marcados"),
  ler("roteiros", q => q.order("created_at", { ascending: false })),
  ler("configuracoes"),
  ler("base_marcas", q => q.order("created_at", { ascending: false })),
  ler("abordagens", q => q.order("data", { ascending: true }))
]);
Object.assign(D, { videos, visitas, marcas, calendario, campanhas, roteiros, base, abordagens, marcados: new Set(marcados.map(m => m.chave)) });
configuracoes.forEach(c => { D.config[c.chave] = c.valor; });

const nomesDeMarcas = () => Array.from(new Set(D.marcas.map(m => m.nome).concat(D.base.map(m => m.nome), D.campanhas.map(c => c.cliente), D.videos.map(v => v.marca)).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt"));

/* ============================================================
   5. ABA PORTFÓLIO
   ============================================================ */
const NICHOS_SITE = ["Skincare", "Haircare", "Beauty", "Fashion", "Home & Decor", "Tech", "Pet", "Food", "YouTube"];

function idYoutube(link) {
  const m = String(link || "").match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/);
  return m ? m[1] : null;
}

function montarPortfolio() {
  $("#aba-portfolio").innerHTML =
    '<div class="numeros" id="pNumeros"></div>' +
    '<div class="duas">' +
      '<div class="bloco"><div class="bloco__cab"><h2>Visitas nos últimos 14 dias</h2></div><div id="pGrafico"></div></div>' +
      '<div class="bloco"><div class="bloco__cab"><h2>De onde as pessoas chegaram</h2></div><div id="pOrigens"></div></div>' +
    "</div>" +
    '<div class="bloco" style="margin-top:16px">' +
      '<div class="bloco__cab"><h2>Meus vídeos</h2><span class="mudo pequeno" id="pConta"></span>' +
      '<button class="btn" id="pNovo">' + ic("mais") + " Adicionar vídeo</button></div>" +
      '<p class="mudo pequeno" style="margin:-4px 0 10px">Arraste pela alcinha para mudar a ordem. O olhinho mostra ou esconde do site. Tudo muda no portfólio na hora.</p>' +
      '<div class="tabela-caixa"><table class="tabela"><thead><tr><th></th><th></th><th>Título</th><th>Nicho</th><th>Formato</th><th>Destaque</th><th></th></tr></thead><tbody id="pCorpo"></tbody></table></div>' +
    "</div>";

  $("#pNovo").addEventListener("click", () => editorVideo());
  const corpo = $("#pCorpo");
  corpo.addEventListener("click", async (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    const v = D.videos.find(x => x.id === tr.dataset.id);
    if (!v) return;
    if (e.target.closest("[data-olho]")) {
      const novo = v.visivel === false;
      const salvo = await salvarLinha("videos", { visivel: novo }, v.id);
      if (salvo) { troca(D.videos, salvo); desenharPortfolio(); torrada(novo ? "Vídeo de volta no site." : "Vídeo escondido do site."); }
      return;
    }
    if (e.target.closest("[data-apagar], .alca")) return;
    editorVideo(v);
  });
  ligaArrastar(corpo);
}

function desenharPortfolio() {
  const visiveis = D.videos.filter(v => v.visivel !== false);

  /* visitas por dia (últimos 14) e por origem */
  const dias = [];
  for (let i = 13; i >= 0; i--) { const d = hoje(); d.setDate(d.getDate() - i); dias.push(isoLocal(d)); }
  const porDia = {};
  dias.forEach(d => { porDia[d] = 0; });
  const origens = {};
  D.visitas.forEach(v => {
    const quando = new Date(v.data);
    if (isNaN(quando)) return;
    const d = isoLocal(quando);
    if (!(d in porDia)) return;
    porDia[d]++;
    const o = v.origem || "Direto";
    origens[o] = (origens[o] || 0) + 1;
  });
  const total = soma(dias, d => porDia[d]);
  const hojeN = porDia[isoLocal(hoje())] || 0;
  const nicho = maisComum(visiveis.map(v => v.nicho));
  const topOrigem = Object.entries(origens).sort((a, b) => b[1] - a[1])[0];
  const semVisitas = falhou.visitas;

  $("#pNumeros").innerHTML =
    numero("Visitas em 14 dias", semVisitas ? "indisponível" : inteiro(total)) +
    numero("Visitas hoje", semVisitas ? "indisponível" : inteiro(hojeN)) +
    numero("Vídeos no ar", inteiro(visiveis.length), D.videos.length !== visiveis.length ? "de " + D.videos.length + " no total" : "") +
    numero("Nicho mais forte", nicho ? nicho.nome : "ainda não", nicho ? plural(nicho.n, "vídeo no ar", "vídeos no ar") : "") +
    numero("De onde mais vêm", topOrigem ? topOrigem[0] : "ainda não", topOrigem && total > 0 ? Math.round(topOrigem[1] / total * 100) + "% das visitas" : "");

  /* gráfico */
  if (semVisitas) {
    $("#pGrafico").innerHTML = '<p class="vazio">As visitas não puderam ser carregadas agora. Veja o aviso lá em cima.</p>';
  } else if (total === 0) {
    $("#pGrafico").innerHTML = '<p class="vazio">Ainda não chegou nenhuma visita.<br>Quando as pessoas começarem a abrir o seu portfólio, aqui aparece uma barra por dia mostrando quantas visitas chegaram em cada um dos últimos 14 dias.</p>';
  } else {
    const maior = Math.max(...dias.map(d => porDia[d]));
    const hojeISO = isoLocal(hoje());
    $("#pGrafico").innerHTML = '<div class="grafico">' + dias.map(d => {
      const n = porDia[d];
      const dt = deISO(d);
      const altura = maior > 0 ? Math.max(2, Math.round(n / maior * 100)) : 2;
      return '<div class="grafico__col' + (d === hojeISO ? " hoje" : "") + '" title="' + dataBR(d) + ": " + plural(n, "visita", "visitas") + '">' +
        '<div class="grafico__barra' + (n ? "" : " zero") + '" style="height:' + altura + '%"' + (n ? ' data-v="' + n + '"' : "") + "></div>" +
        '<span class="grafico__dia">' + pad(dt.getDate()) + "/" + pad(dt.getMonth() + 1) + "</span></div>";
    }).join("") + "</div>";
  }

  /* origens */
  const lista = Object.entries(origens).sort((a, b) => b[1] - a[1]);
  $("#pOrigens").innerHTML = (semVisitas || !lista.length)
    ? '<p class="vazio">Aqui vai aparecer por onde as pessoas chegaram até você: Instagram, Google, link direto e outros.</p>'
    : '<div class="origens">' + lista.map(([o, n]) =>
        '<div><div class="origem__linha"><span>' + esc(o) + '</span><span class="mudo">' + inteiro(n) + " · " + Math.round(n / total * 100) + "%</span></div>" +
        '<div class="origem__trilho"><span style="width:' + Math.round(n / total * 100) + '%"></span></div></div>').join("") + "</div>";

  /* tabela de vídeos */
  $("#pConta").textContent = plural(D.videos.length, "vídeo", "vídeos");
  const corpo = $("#pCorpo");
  if (!D.videos.length) {
    corpo.innerHTML = '<tr><td colspan="7"><p class="vazio">' + (falhou.videos ? "Os vídeos não puderam ser carregados. Veja o aviso lá em cima." : "Nenhum vídeo ainda. Clique em Adicionar vídeo.") + "</p></td></tr>";
    return;
  }
  corpo.innerHTML = D.videos.map(v => {
    const id = idYoutube(v.link);
    const escondido = v.visivel === false;
    return '<tr class="clica' + (escondido ? " apagado" : "") + '" data-id="' + esc(v.id) + '">' +
      '<td class="curta"><span class="alca" title="Arraste para mudar a ordem" aria-label="Arrastar">' + ic("alca") + "</span></td>" +
      '<td class="curta">' + (id ? '<img class="mini" src="https://i.ytimg.com/vi/' + id + '/default.jpg" alt="" loading="lazy">' : '<span class="mini"></span>') + "</td>" +
      '<td><div class="corta"><b>' + esc(v.titulo || "(sem título)") + "</b>" + pilExemplo(v) + '</div><div class="mudo pequeno">' + esc(v.marca || "") + "</div></td>" +
      "<td>" + esc(v.nicho || "") + "</td>" +
      "<td>" + esc(v.formato || "") + "</td>" +
      "<td>" + (v.destaque ? '<span class="pil c-destaque">' + esc(v.destaque) + "</span>" : "") + "</td>" +
      '<td class="curta"><span class="acoes">' +
        '<button class="btn--icone" data-olho title="' + (escondido ? "Mostrar no site" : "Esconder do site") + '" aria-label="' + (escondido ? "Mostrar no site" : "Esconder do site") + '">' + ic(escondido ? "olhoFechado" : "olho") + "</button>" +
        '<button class="btn--icone" data-editar title="Editar" aria-label="Editar">' + ic("editar") + "</button>" +
        '<button class="btn--icone" data-apagar title="Apagar" aria-label="Apagar">' + ic("lixo") + "</button>" +
      "</span></td></tr>";
  }).join("");
  $$("[data-apagar]", corpo).forEach(b => {
    const id = b.closest("tr").dataset.id;
    duploClique(b, async () => {
      if (await apagarLinha("videos", id)) { D.videos = D.videos.filter(x => x.id !== id); desenharPortfolio(); torrada("Vídeo apagado."); }
    }, "Apagar?");
  });
}

/* arrastar pela alcinha: funciona com mouse e com o dedo */
function ligaArrastar(corpo) {
  let linha = null, alvo = null, depois = false;
  const limpa = () => $$(".alvo-cima, .alvo-baixo", corpo).forEach(t => t.classList.remove("alvo-cima", "alvo-baixo"));
  corpo.addEventListener("pointerdown", (e) => {
    const alca = e.target.closest(".alca");
    if (!alca) return;
    e.preventDefault();
    linha = alca.closest("tr");
    linha.classList.add("arrastando");
    try { alca.setPointerCapture(e.pointerId); } catch (x) {}
  });
  corpo.addEventListener("pointermove", (e) => {
    if (!linha) return;
    if (e.clientY < 70) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
    const sob = document.elementFromPoint(e.clientX, e.clientY);
    const tr = sob && sob.closest("tr[data-id]");
    limpa();
    if (!tr || tr === linha || tr.parentNode !== corpo) { alvo = null; return; }
    const r = tr.getBoundingClientRect();
    depois = e.clientY > r.top + r.height / 2;
    alvo = tr;
    tr.classList.add(depois ? "alvo-baixo" : "alvo-cima");
  });
  async function soltar() {
    if (!linha) return;
    const l = linha; linha = null;
    l.classList.remove("arrastando");
    limpa();
    if (!alvo) return;
    const a = alvo; alvo = null;
    const de = D.videos.findIndex(v => v.id === l.dataset.id);
    if (de < 0) return;
    const [movido] = D.videos.splice(de, 1);
    let para = D.videos.findIndex(v => v.id === a.dataset.id);
    if (para < 0) { D.videos.splice(de, 0, movido); return; }
    if (depois) para++;
    D.videos.splice(para, 0, movido);
    await salvarOrdem();
  }
  corpo.addEventListener("pointerup", soltar);
  corpo.addEventListener("pointercancel", soltar);
}

async function salvarOrdem() {
  const mudou = [];
  D.videos.forEach((v, i) => { if (v.ordem !== i + 1) { v.ordem = i + 1; mudou.push(v); } });
  desenharPortfolio();
  if (!mudou.length) return;
  const respostas = await Promise.all(mudou.map(v => banco.from("videos").update({ ordem: v.ordem }).eq("id", v.id)));
  const ruim = respostas.find(r => r.error);
  if (ruim) torrada(traduzErro(ruim.error, "videos"), true);
  else torrada("Nova ordem salva. O site já mostra assim.");
}

function editorVideo(v) {
  const existentes = (campo) => Array.from(new Set(D.videos.map(x => x[campo]).filter(Boolean))).sort();
  editor({
    titulo: v ? "Editar vídeo" : "Adicionar vídeo",
    valores: v || { visivel: true },
    campos: [
      { nome: "link", rot: "Link do YouTube", obrigatorio: true, inteiro: true, dica: "https://youtube.com/shorts/..." },
      { nome: "titulo", rot: "Título", inteiro: true, dica: "Se deixar vazio, uso marca e formato" },
      { nome: "marca", rot: "Marca", lista: nomesDeMarcas() },
      { nome: "nicho", rot: "Nicho", lista: Array.from(new Set(NICHOS_SITE.concat(existentes("nicho")))) },
      { nome: "formato", rot: "Formato", lista: existentes("formato"), dica: "Ex: Product Demo" },
      { nome: "destaque", rot: "Destaque", dica: "Ex: 2,4M views" },
      { nome: "visivel", rot: "Aparece no site", tipo: "check" }
    ],
    aoSalvar: async (dados, erro) => {
      if (!idYoutube(dados.link)) { erro("Esse link não parece do YouTube. O site só consegue mostrar vídeos do YouTube (Shorts ou normal)."); return false; }
      if (!dados.titulo) dados.titulo = [dados.marca, dados.formato].filter(Boolean).join(" · ") || "Vídeo";
      if (!v) dados.ordem = D.videos.reduce((m, x) => Math.max(m, Number(x.ordem) || 0), 0) + 1;
      const salvo = await salvarLinha("videos", dados, v && v.id);
      if (!salvo) return false;
      troca(D.videos, salvo);
      desenharPortfolio();
      torrada(salvo.visivel === false ? "Vídeo salvo (escondido do site)." : "Vídeo salvo. Já está no site.");
      return true;
    },
    aoApagar: v ? async () => {
      if (!(await apagarLinha("videos", v.id))) return false;
      D.videos = D.videos.filter(x => x.id !== v.id); desenharPortfolio(); torrada("Vídeo apagado."); return true;
    } : null
  });
}

/* ============================================================
   6. ABA MARCAS
   ============================================================ */
const SITUACOES = [["lead", "Lead", "c-azul"], ["conversando", "Conversando", "c-mostarda"], ["cliente", "Cliente", "c-verde"], ["parada", "Parada", "c-cinza"]];
const situacao = (s) => SITUACOES.find(x => x[0] === s) || [s, s || "", "c-cinza"];
const arroba = (ig) => String(ig || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").replace(/^@/, "");
const whatsapp = (tel) => { const n = String(tel || "").replace(/\D/g, ""); return n.length >= 8 ? "https://wa.me/" + n : null; };

function montarMarcas() {
  $("#aba-marcas").innerHTML =
    '<div class="ferramentas">' +
      '<input class="entrada" id="mBusca" type="search" placeholder="Buscar por nome, @ ou e-mail">' +
      '<select class="entrada entrada--sel" id="mFiltro"><option value="">Todas as situações</option>' +
        SITUACOES.map(s => '<option value="' + s[0] + '">' + s[1] + "</option>").join("") + "</select>" +
      '<span class="mudo pequeno" id="mConta"></span><span class="espaco"></span>' +
      '<button class="btn btn--linha" id="mCsv">' + ic("baixar") + " Baixar CSV</button>" +
      '<button class="btn" id="mNova">' + ic("mais") + " Adicionar marca</button>" +
    "</div>" +
    '<div class="tabela-caixa"><table class="tabela"><thead><tr>' +
      "<th>Marca</th><th>Instagram</th><th>E-mail</th><th>Telefone</th><th>Situação</th><th>Observação</th><th>Último contato</th>" +
    '</tr></thead><tbody id="mCorpo"></tbody></table></div>';

  $("#mBusca").addEventListener("input", desenharMarcas);
  $("#mFiltro").addEventListener("change", desenharMarcas);
  $("#mNova").addEventListener("click", () => editorMarca());
  $("#mCsv").addEventListener("click", () => {
    if (!D.marcas.length) { torrada("Ainda não tem nenhuma marca para baixar."); return; }
    baixarCSV("marcas", ["Marca", "Instagram", "E-mail", "Telefone", "Situação", "Observação", "Último contato"],
      D.marcas.map(m => [m.nome, m.instagram ? "@" + arroba(m.instagram) : "", m.email, m.telefone, situacao(m.situacao)[1], m.obs, dataBR(m.ultimo_contato)]));
  });
  $("#mCorpo").addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const tr = e.target.closest("tr[data-id]");
    if (tr) editorMarca(D.marcas.find(m => m.id === tr.dataset.id));
  });
}

function desenharMarcas() {
  const busca = normaliza($("#mBusca").value.trim());
  const filtro = $("#mFiltro").value;
  const lista = D.marcas.filter(m =>
    (!filtro || m.situacao === filtro) &&
    (!busca || normaliza([m.nome, m.instagram, m.email].join(" ")).includes(busca)));
  $("#mConta").textContent = lista.length === D.marcas.length ? plural(D.marcas.length, "marca", "marcas") : lista.length + " de " + D.marcas.length;
  const corpo = $("#mCorpo");
  if (!lista.length) {
    corpo.innerHTML = '<tr><td colspan="7"><p class="vazio">' +
      (falhou.marcas ? "As marcas não puderam ser carregadas. Veja o aviso lá em cima." : D.marcas.length ? "Nenhuma marca encontrada com essa busca." : "📥 Nenhuma marca chegou pelo formulário do site ainda.<br>Quando uma marca preencher o contato do seu portfólio, ela aparece aqui.") + "</p></td></tr>";
    return;
  }
  corpo.innerHTML = lista.map(m => {
    const s = situacao(m.situacao);
    const ig = arroba(m.instagram);
    const wa = whatsapp(m.telefone);
    return '<tr class="clica" data-id="' + esc(m.id) + '">' +
      "<td><b>" + esc(m.nome) + "</b>" + pilExemplo(m) + "</td>" +
      "<td>" + (ig ? '<a class="link" href="https://instagram.com/' + encodeURIComponent(ig) + '" target="_blank" rel="noopener">@' + esc(ig) + "</a>" : "") + "</td>" +
      '<td class="corta">' + (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>" : "") + "</td>" +
      '<td style="white-space:nowrap">' + (m.telefone ? '<span class="contato-links">' + esc(m.telefone) +
        (wa ? '<a href="' + wa + '" target="_blank" rel="noopener" title="Abrir no WhatsApp" aria-label="Abrir no WhatsApp">' + ic("whats") + "</a>" : "") + "</span>" : "") + "</td>" +
      '<td><span class="pil ' + s[2] + '">' + esc(s[1]) + "</span></td>" +
      '<td class="corta mudo" title="' + esc(m.obs || "") + '">' + esc(m.obs || "") + "</td>" +
      '<td style="white-space:nowrap">' + dataBR(m.ultimo_contato) + "</td></tr>";
  }).join("");
}

function editorMarca(m) {
  editor({
    titulo: m ? "Editar marca" : "Adicionar marca",
    valores: m || { situacao: "lead", ultimo_contato: isoLocal(new Date()) },
    campos: [
      { nome: "nome", rot: "Marca", obrigatorio: true, inteiro: true },
      { nome: "instagram", rot: "Instagram", dica: "@marca" },
      { nome: "email", rot: "E-mail", tipo: "email" },
      { nome: "telefone", rot: "Telefone", dica: "+1 416 555 0000" },
      { nome: "situacao", rot: "Situação", tipo: "select", opcoes: SITUACOES.map(s => [s[0], s[1]]) },
      { nome: "ultimo_contato", rot: "Último contato", tipo: "date" },
      { nome: "obs", rot: "Observação", tipo: "textarea", inteiro: true }
    ],
    aoSalvar: async (dados) => {
      if (dados.instagram) dados.instagram = "@" + arroba(dados.instagram);
      const salvo = await salvarLinha("marcas", dados, m && m.id);
      if (!salvo) return false;
      if (m) troca(D.marcas, salvo); else D.marcas.unshift(salvo);
      desenharMarcas();
      torrada("Marca salva.");
      return true;
    },
    aoApagar: m ? async () => {
      if (!(await apagarLinha("marcas", m.id))) return false;
      D.marcas = D.marcas.filter(x => x.id !== m.id); desenharMarcas(); torrada("Marca apagada."); return true;
    } : null,
    extra: m && !m.exemplo ? { rot: "➡️ Mover para Marcas", confirma: "Clique de novo para mover", acao: () => moverParaBase(m) } : null
  });
}

/* ============================================================
   6b. ABA MARCAS (base de prospecção e campanhas)
   Tabela base_marcas. Três visões: prospecção da semana,
   base completa e montar campanha. Importa planilha CSV.
   ============================================================ */
const B_SITUACOES = [
  ["quero_prospectar", "🎯 Quero prospectar", "c-azul"],
  ["prospectada", "📨 Prospectada, sem retorno", "c-mostarda"],
  ["em_conversa", "💬 Em conversa", "c-roxo"],
  ["ja_trabalhei", "✅ Já trabalhei", "c-verde"],
  ["sem_interesse", "⏸️ Sem interesse", "c-cinza"]
];
const B_ORIGENS = [
  ["instagram", "Instagram"], ["x", "X"], ["linkedin", "LinkedIn"], ["tiktok", "TikTok"], ["email", "E-mail"],
  ["google", "Pesquisa no Google"], ["indicacao", "Indicação"], ["portfolio", "Portfólio"], ["outro", "Outro"]
];
const B_NICHOS = ["Skincare", "Haircare", "Beauty", "Fashion", "Home & Decor", "Tech", "Pet", "Food", "Fitness", "Teens", "Outro"];
const bSituacao = (v) => B_SITUACOES.find(s => s[0] === v) || B_SITUACOES[0];
const bOrigem = (v) => B_ORIGENS.find(o => o[0] === v) || B_ORIGENS[B_ORIGENS.length - 1];
let bVisao = "semana";
const bFiltro = { situacao: "", origem: "", nicho: "", favoritas: false, email: "" };
const bSelecao = new Set();   /* marcas marcadas na caixinha */
let bVisiveis = [];
const bCampanha = { nichos: new Set(), situacoes: new Set(["prospectada", "em_conversa", "ja_trabalhei"]) };

const nichosDaBase = () => Array.from(new Set(B_NICHOS.concat(D.base.map(m => m.nicho).filter(Boolean)))).sort((a, b) => a.localeCompare(b, "pt"));
const chaveNome = (t) => normaliza(t).replace(/[^a-z0-9]/g, "");

function montarBase() {
  const el = $("#aba-base");
  el.innerHTML =
    '<div class="pilulas" id="bVisoes" style="margin-bottom:14px">' +
      '<button type="button" data-v="semana">🎯 Prospecção da semana</button>' +
      '<button type="button" data-v="base">📚 Base completa</button>' +
      '<button type="button" data-v="campanha">📣 Montar campanha</button>' +
    "</div>" +
    '<div class="ferramentas" id="bFiltros">' +
      '<input class="entrada" id="bBusca" type="search" placeholder="Buscar por marca, @, e-mail ou observação">' +
      '<select class="entrada entrada--sel" id="bFSit"><option value="">Todas as situações</option>' + B_SITUACOES.map(s => '<option value="' + s[0] + '">' + s[1] + "</option>").join("") + "</select>" +
      '<select class="entrada entrada--sel" id="bFOri"><option value="">Todas as origens</option>' + B_ORIGENS.map(o => '<option value="' + o[0] + '">' + o[1] + "</option>").join("") + "</select>" +
      '<select class="entrada entrada--sel" id="bFNic"></select>' +
      '<select class="entrada entrada--sel" id="bFEmail"><option value="">Com e sem e-mail</option><option value="com">Só com e-mail</option><option value="sem">Só sem e-mail</option></select>' +
      '<button type="button" class="btn btn--linha" id="bFFav" aria-pressed="false">⭐ Só favoritas</button>' +
      '<span class="mudo pequeno" id="bConta"></span><span class="espaco"></span>' +
    "</div>" +
    '<div class="ferramentas">' +
      '<button class="btn" id="bNova">' + ic("mais") + " Adicionar marca</button>" +
      '<button class="btn btn--linha" id="bImportar">📥 Importar planilha</button>' +
      '<button class="btn btn--linha" id="bModelo">📄 Baixar modelo</button>' +
      '<button class="btn btn--linha" id="bCsv">' + ic("baixar") + " Baixar base</button>" +
      '<input type="file" id="bArquivo" accept=".csv,.txt,text/csv" hidden>' +
    "</div>" +
    '<div id="bCampanha"></div>' +
    '<div class="massa escondido" id="bMassa"><b id="bMassaConta"></b><span class="espaco"></span>' +
      '<button type="button" class="btn" id="bMassaEditar">✏️ Editar em massa</button>' +
      '<button type="button" class="btn btn--perigo" id="bMassaApagar">🗑️ Apagar selecionadas</button>' +
      '<button type="button" class="btn btn--linha" id="bMassaLimpar">Limpar seleção</button></div>' +
    '<div class="tabela-caixa"><table class="tabela"><thead><tr>' +
      "<th class=\"curta\"><input type=\"checkbox\" id=\"bTodas\" class=\"caixa\" title=\"Selecionar todas as que estão aparecendo\"></th><th></th><th>Marca</th><th>Produto</th><th>Nicho</th><th>Origem</th><th>Situação</th><th>Instagram</th><th>E-mail</th><th>Telefone</th><th>Último contato</th><th></th>" +
    '</tr></thead><tbody id="bCorpo"></tbody></table></div>';

  $("#bVisoes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    bVisao = b.dataset.v;
    desenharBase();
  });
  $("#bBusca").addEventListener("input", desenharBase);
  $("#bFSit").addEventListener("change", () => { bFiltro.situacao = $("#bFSit").value; desenharBase(); });
  $("#bFOri").addEventListener("change", () => { bFiltro.origem = $("#bFOri").value; desenharBase(); });
  $("#bFNic").addEventListener("change", () => { bFiltro.nicho = $("#bFNic").value; desenharBase(); });
  $("#bFFav").addEventListener("click", () => { bFiltro.favoritas = !bFiltro.favoritas; desenharBase(); });
  $("#bFEmail").addEventListener("change", () => { bFiltro.email = $("#bFEmail").value; desenharBase(); });
  $("#bTodas").addEventListener("change", (e) => {
    bVisiveis.forEach(id => { if (e.target.checked) bSelecao.add(id); else bSelecao.delete(id); });
    desenharBase();
  });
  $("#bMassaLimpar").addEventListener("click", () => { bSelecao.clear(); desenharBase(); });
  $("#bMassaEditar").addEventListener("click", editarEmMassa);
  duploClique($("#bMassaApagar"), async () => {
    const ids = [...bSelecao];
    if (!ids.length) return;
    const { error } = await banco.from("base_marcas").delete().in("id", ids);
    if (error) { torrada(traduzErro(error, "base_marcas"), true); return; }
    D.base = D.base.filter(m => !bSelecao.has(m.id));
    bSelecao.clear();
    desenharBase();
    torrada("🗑️ " + plural(ids.length, "marca apagada", "marcas apagadas") + ".");
  }, "Clique de novo para apagar");
  $("#bNova").addEventListener("click", () => editorBase(null));
  $("#bModelo").addEventListener("click", baixarModelo);
  $("#bImportar").addEventListener("click", () => { if (falhou.base_marcas) { torrada("A tabela base_marcas ainda não existe. Rode o sql-marcas.sql no Supabase.", true); return; } $("#bArquivo").value = ""; $("#bArquivo").click(); });
  $("#bArquivo").addEventListener("change", () => { const f = $("#bArquivo").files[0]; if (f) lerPlanilha(f); });
  $("#bCsv").addEventListener("click", () => {
    if (!D.base.length) { torrada("A base ainda está vazia."); return; }
    baixarCSV("marcas-base", COLUNAS_MODELO.map(c => c[0]), D.base.map(linhaParaCSV));
  });
  $("#bCorpo").addEventListener("click", async (e) => {
    if (e.target.closest("a")) return;
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    const m = D.base.find(x => x.id === tr.dataset.id);
    if (!m) return;
    const caixa = e.target.closest("[data-sel]");
    if (caixa || e.target.closest(".td-sel")) {
      if (!caixa) { const c = $("[data-sel]", tr); c.checked = !c.checked; }
      const marcada = $("[data-sel]", tr).checked;
      if (marcada) bSelecao.add(m.id); else bSelecao.delete(m.id);
      tr.classList.toggle("selecionada", marcada);
      atualizaMassa();
      return;
    }
    if (e.target.closest("[data-abordar]")) { abordarMarca(m); return; }
    if (e.target.closest("[data-fav]")) {
      const salvo = await salvarLinha("base_marcas", { favorita: !m.favorita }, m.id);
      if (salvo) { troca(D.base, salvo); desenharBase(); }
      return;
    }
    if (e.target.closest("[data-prospectei]")) {
      const antes = m.situacao;
      const salvo = await salvarLinha("base_marcas", { situacao: "prospectada", ultimo_contato: isoLocal(new Date()) }, m.id);
      if (salvo) { troca(D.base, salvo); desenharBase(); torrada("📨 Marcada como prospectada hoje."); if (antes === "quero_prospectar") registrarProspeccao([salvo]); }
      return;
    }
    editorBase(m);
  });
  $("#bCampanha").addEventListener("click", async (e) => {
    const chip = e.target.closest("[data-cn], [data-cs]");
    if (chip) {
      const conj = chip.dataset.cn != null ? bCampanha.nichos : bCampanha.situacoes;
      const valor = chip.dataset.cn != null ? chip.dataset.cn : chip.dataset.cs;
      if (conj.has(valor)) conj.delete(valor); else conj.add(valor);
      desenharBase();
      return;
    }
    const lista = listaCampanha();
    if (e.target.closest("#bCopiarEmails")) {
      if (!lista.length) { torrada("Nenhuma marca com e-mail nesse filtro."); return; }
      try { await navigator.clipboard.writeText(lista.map(m => m.email).join(", ")); torrada("📋 " + plural(lista.length, "e-mail copiado", "e-mails copiados") + " ✓"); }
      catch (x) { abrirJanela({ titulo: "E-mails da campanha", corpo: '<textarea class="entrada" style="height:240px;padding:10px" readonly>' + esc(lista.map(m => m.email).join(", ")) + "</textarea>" }); }
    }
    if (e.target.closest("#bBaixarLista")) {
      if (!lista.length) { torrada("Nenhuma marca com e-mail nesse filtro."); return; }
      baixarCSV("campanha", ["Marca", "E-mail", "Instagram", "Nicho", "Situação"], lista.map(m => [m.nome, m.email, m.instagram, m.nicho, bSituacao(m.situacao)[1].replace(/^\S+\s/, "")]));
    }
  });
}

function listaCampanha() {
  return D.base.filter(m => m.email && !m.nao_enviar && !m.exemplo &&
    (!bCampanha.nichos.size || bCampanha.nichos.has(m.nicho || "")) &&
    (!bCampanha.situacoes.size || bCampanha.situacoes.has(m.situacao)));
}

function desenharBase() {
  $$("#bVisoes button").forEach(b => b.classList.toggle("ativo", b.dataset.v === bVisao));
  const nichos = nichosDaBase();
  $("#bFNic").innerHTML = '<option value="">Todos os nichos</option>' + nichos.map(n => '<option value="' + esc(n) + '"' + (n === bFiltro.nicho ? " selected" : "") + ">" + esc(n) + "</option>").join("");
  const naSemana = bVisao === "semana";
  $("#bFiltros").classList.toggle("escondido", bVisao === "campanha");
  $("#bFSit").disabled = naSemana;
  $("#bFSit").value = naSemana ? "" : bFiltro.situacao;

  let lista;
  if (bVisao === "campanha") {
    const usados = Array.from(new Set(D.base.map(m => m.nicho).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt"));
    const semEmail = D.base.filter(m => !m.email).length, bloqueadas = D.base.filter(m => m.nao_enviar).length;
    lista = listaCampanha();
    $("#bCampanha").innerHTML = '<div class="bloco">' +
      '<div class="bloco__cab"><h2>📣 Quem recebe a campanha</h2></div>' +
      '<p class="rotulo" style="margin-bottom:6px">Nicho (nenhum marcado = todos)</p><div class="rot__chips">' +
        (usados.length ? usados.map(n => '<button type="button" class="rot__chip' + (bCampanha.nichos.has(n) ? " ativo" : "") + '" data-cn="' + esc(n) + '">' + esc(n) + "</button>").join("") : '<span class="mudo pequeno">Nenhuma marca com nicho ainda.</span>') + "</div>" +
      '<p class="rotulo" style="margin-bottom:6px">Situação</p><div class="rot__chips">' +
        B_SITUACOES.map(s => '<button type="button" class="rot__chip' + (bCampanha.situacoes.has(s[0]) ? " ativo" : "") + '" data-cs="' + s[0] + '">' + s[1] + "</button>").join("") + "</div>" +
      '<div class="ferramentas" style="margin:0"><b>' + plural(lista.length, "marca vai receber", "marcas vão receber") + "</b>" +
        '<span class="mudo pequeno">Ficam de fora automaticamente: ' + plural(semEmail, "marca sem e-mail", "marcas sem e-mail") + " e " + plural(bloqueadas, "marcada", "marcadas") + ' com 🚫 Não enviar.</span><span class="espaco"></span>' +
        '<button class="btn btn--linha" id="bCopiarEmails">📋 Copiar e-mails</button><button class="btn" id="bBaixarLista">' + ic("baixar") + " Baixar lista</button></div>" +
      "</div>";
  } else {
    $("#bCampanha").innerHTML = naSemana
      ? '<p class="mudo pequeno" style="margin-bottom:10px">🎯 Aqui ficam só as marcas com situação <b>Quero prospectar</b>. Depois de mandar o e-mail ou a DM, clique em 📨 na linha: ela vira <b>Prospectada, sem retorno</b> com a data de hoje.</p>'
      : "";
    const busca = normaliza($("#bBusca").value.trim());
    lista = D.base.filter(m =>
      (naSemana ? m.situacao === "quero_prospectar" : (!bFiltro.situacao || m.situacao === bFiltro.situacao)) &&
      (!bFiltro.origem || m.origem === bFiltro.origem) &&
      (!bFiltro.nicho || m.nicho === bFiltro.nicho) &&
      (!bFiltro.favoritas || m.favorita) &&
      (!bFiltro.email || (bFiltro.email === "com" ? !!m.email : !m.email)) &&
      (!busca || normaliza([m.nome, m.instagram, m.email, m.obs, m.site, m.produto, m.outros_contatos].join(" ")).includes(busca)));
    /* as favoritas sempre primeiro */
    lista = lista.slice().sort((a, b) => (b.favorita ? 1 : 0) - (a.favorita ? 1 : 0));
  }
  $("#bFFav").classList.toggle("ativo-fav", bFiltro.favoritas);
  $("#bFFav").setAttribute("aria-pressed", String(bFiltro.favoritas));
  /* a seleção vale só para o que está aparecendo: nunca apaga uma marca escondida pelo filtro */
  bVisiveis = lista.map(m => m.id);
  [...bSelecao].forEach(id => { if (!bVisiveis.includes(id)) bSelecao.delete(id); });
  atualizaMassa();
  $("#bConta").textContent = lista.length === D.base.length ? plural(D.base.length, "marca", "marcas") : lista.length + " de " + D.base.length;

  const corpo = $("#bCorpo");
  if (!lista.length) {
    corpo.innerHTML = '<tr><td colspan="12"><p class="vazio">' + (falhou.base_marcas
      ? "A base ainda não existe no banco. Rode o sql-marcas.sql no Supabase."
      : !D.base.length ? "A base está vazia. Clique em 📥 Importar planilha ou em Adicionar marca."
      : naSemana ? "Nenhuma marca para prospectar agora. 🎉<br>Coloque marcas com situação Quero prospectar para elas aparecerem aqui."
      : "Nenhuma marca com esses filtros.") + "</p></td></tr>";
    return;
  }
  corpo.innerHTML = lista.map(m => {
    const s = bSituacao(m.situacao), o = bOrigem(m.origem);
    const ig = arroba(m.instagram), wa = whatsapp(m.telefone);
    return '<tr class="clica' + (m.favorita ? " favorita" : "") + (bSelecao.has(m.id) ? " selecionada" : "") + '" data-id="' + esc(m.id) + '">' +
      '<td class="curta td-sel"><input type="checkbox" class="caixa" data-sel' + (bSelecao.has(m.id) ? " checked" : "") + ' aria-label="Selecionar ' + esc(m.nome) + '"></td>' +
      '<td class="curta"><button type="button" class="btn--icone estrela' + (m.favorita ? " ligada" : "") + '" data-fav aria-label="' + (m.favorita ? "Tirar dos favoritos" : "Favoritar") + '">' + ic("estrela") + "</button></td>" +
      "<td><b>" + esc(m.nome) + "</b>" + (m.nao_enviar ? ' <span title="Não enviar campanha">🚫</span>' : "") + pilExemplo(m) +
        (m.site ? '<div class="pequeno"><a class="link" href="' + esc(/^https?:/i.test(m.site) ? m.site : "https://" + m.site) + '" target="_blank" rel="noopener">' + esc(String(m.site).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")) + "</a></div>" : "") + "</td>" +
      '<td class="corta" title="' + esc(m.produto || "") + '">' + (m.link_produto
        ? '<a class="link" href="' + esc(m.link_produto) + '" target="_blank" rel="noopener">' + esc(m.produto || "ver produto") + " ↗</a>"
        : esc(m.produto || "")) + "</td>" +
      '<td style="white-space:nowrap">' + esc(m.nicho || "") + "</td>" +
      '<td><span class="pil c-cinza">' + esc(o[1]) + "</span></td>" +
      '<td><span class="pil ' + s[2] + '">' + esc(s[1]) + "</span></td>" +
      "<td>" + (ig ? '<a class="link" href="https://instagram.com/' + encodeURIComponent(ig) + '" target="_blank" rel="noopener">@' + esc(ig) + "</a>" : "") + "</td>" +
      '<td class="corta">' + (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>" : "") + "</td>" +
      '<td style="white-space:nowrap">' + (m.telefone ? '<span class="contato-links">' + esc(m.telefone) + (wa ? '<a href="' + wa + '" target="_blank" rel="noopener" title="Abrir no WhatsApp">' + ic("whats") + "</a>" : "") + "</span>" : "") + "</td>" +
      '<td style="white-space:nowrap">' + dataBR(m.ultimo_contato) + "</td>" +
      '<td class="curta"><span class="acoes"><button type="button" class="btn btn--linha" data-abordar title="Escrever a abordagem para esta marca">✍️ Abordar</button>' +
        (m.situacao === "quero_prospectar" ? '<button type="button" class="btn btn--linha" data-prospectei title="Marcar como prospectada hoje">📨 Prospectei</button>' : "") + "</span></td></tr>";
  }).join("");
}

function atualizaMassa() {
  const n = bSelecao.size;
  $("#bMassa").classList.toggle("escondido", !n);
  $("#bMassaConta").textContent = plural(n, "marca selecionada", "marcas selecionadas");
  const todas = $("#bTodas");
  if (todas) {
    todas.checked = n > 0 && bVisiveis.length > 0 && bVisiveis.every(id => bSelecao.has(id));
    todas.indeterminate = n > 0 && !todas.checked;
  }
}

function editarEmMassa() {
  const ids = [...bSelecao];
  if (!ids.length) return;
  const NAO = [["", "não mudar"]];
  editor({
    titulo: "✏️ Editar " + plural(ids.length, "marca", "marcas") + " de uma vez",
    topo: '<p class="mudo pequeno" style="margin-bottom:12px">Só muda o que você preencher. O que ficar em branco ou em "não mudar" continua como está em cada marca.</p>',
    valores: {},
    campos: [
      { nome: "situacao", rot: "Situação", tipo: "select", opcoes: NAO.concat(B_SITUACOES.map(s => [s[0], s[1]])) },
      { nome: "origem", rot: "De onde veio o contato", tipo: "select", opcoes: NAO.concat(B_ORIGENS) },
      { nome: "nicho", rot: "Nicho", lista: nichosDaBase(), dica: "em branco = não mudar" },
      { nome: "produto", rot: "Produto", lista: Array.from(new Set(D.base.map(m => m.produto).filter(Boolean))), dica: "em branco = não mudar" },
      { nome: "favorita", rot: "⭐ Favorita", tipo: "select", opcoes: NAO.concat([["sim", "Sim, favoritar"], ["nao", "Não, tirar dos favoritos"]]) },
      { nome: "nao_enviar", rot: "🚫 Não enviar campanha", tipo: "select", opcoes: NAO.concat([["sim", "Sim, não enviar"], ["nao", "Não, pode enviar"]]) }
    ],
    aoSalvar: async (d, erro) => {
      const patch = {};
      ["situacao", "origem", "nicho", "produto"].forEach(k => { if (d[k]) patch[k] = d[k]; });
      if (d.favorita) patch.favorita = d.favorita === "sim";
      if (d.nao_enviar) patch.nao_enviar = d.nao_enviar === "sim";
      if (!Object.keys(patch).length) { erro("Escolha pelo menos uma coisa para mudar."); return false; }
      const eramParaProspectar = D.base.filter(m => bSelecao.has(m.id) && m.situacao === "quero_prospectar").map(m => m.id);
      const { data, error } = await banco.from("base_marcas").update(patch).in("id", ids).select();
      if (error) { erro(traduzErro(error, "base_marcas")); return false; }
      if (patch.situacao === "prospectada") registrarProspeccao((data || []).filter(m => eramParaProspectar.includes(m.id)));
      (data || []).forEach(m => troca(D.base, m));
      bSelecao.clear();
      desenharBase();
      torrada("✅ " + plural((data || []).length, "marca atualizada", "marcas atualizadas") + ".");
      return true;
    }
  });
}

function editorBase(m, padrao) {
  editor({
    titulo: m ? "✏️ Editar marca" : "🏷️ Adicionar marca",
    valores: m || Object.assign({ situacao: "quero_prospectar", origem: "instagram" }, padrao || {}),
    campos: [
      { nome: "nome", rot: "Marca", obrigatorio: true, inteiro: true },
      { nome: "nicho", rot: "Nicho", lista: nichosDaBase(), dica: "Skincare, Teens..." },
      { nome: "origem", rot: "De onde veio o contato", tipo: "select", opcoes: B_ORIGENS },
      { nome: "situacao", rot: "Situação", tipo: "select", opcoes: B_SITUACOES.map(s => [s[0], s[1]]) },
      { nome: "ultimo_contato", rot: "Último contato", tipo: "date" },
      { nome: "instagram", rot: "Instagram", dica: "@marca" },
      { nome: "email", rot: "E-mail", tipo: "email" },
      { nome: "telefone", rot: "Telefone", dica: "+1 416 555 0000" },
      { nome: "site", rot: "Site", dica: "marca.com" },
      { nome: "produto", rot: "Produto", dica: "ex.: Aspirador de pó" },
      { nome: "link_produto", rot: "Link do produto", dica: "https://..." },
      { nome: "obs", rot: "Observação", tipo: "textarea", inteiro: true },
      { nome: "outros_contatos", rot: "Outros contatos", tipo: "textarea", inteiro: true, dica: "Outros e-mails, telefone, formulário, programa de afiliados" },
      { nome: "fonte", rot: "Fonte (de onde saiu o contato)", inteiro: true, dica: "https://..." },
      { nome: "favorita", rot: "⭐ Favorita (prioridade na hora de abordar)", tipo: "check" },
      { nome: "nao_enviar", rot: "🚫 Não enviar campanha (pediu para não receber e-mails)", tipo: "check" }
    ],
    aoSalvar: async (dados) => {
      if (dados.instagram) dados.instagram = "@" + arroba(dados.instagram);
      if (dados.email) dados.email = dados.email.toLowerCase();
      const salvo = await salvarLinha("base_marcas", dados, m && m.id);
      if (!salvo) return false;
      if (m && m.situacao === "quero_prospectar" && salvo.situacao === "prospectada") registrarProspeccao([salvo]);
      if (m) troca(D.base, salvo); else D.base.unshift(salvo);
      desenharBase();
      torrada("Marca salva ✓");
      return true;
    },
    aoApagar: m ? async () => {
      if (!(await apagarLinha("base_marcas", m.id))) return false;
      D.base = D.base.filter(x => x.id !== m.id); desenharBase(); torrada("Marca apagada."); return true;
    } : null
  });
}

/* ----- inbound: mover para Marcas ----- */
const INBOUND_PARA_BASE = { lead: "em_conversa", conversando: "em_conversa", cliente: "ja_trabalhei", parada: "sem_interesse" };
async function moverParaBase(m) {
  if (falhou.base_marcas) { torrada("A tabela base_marcas ainda não existe. Rode o sql-marcas.sql no Supabase.", true); return false; }
  const nova = await salvarLinha("base_marcas", {
    nome: m.nome, instagram: m.instagram || null, email: m.email ? String(m.email).toLowerCase() : null, telefone: m.telefone || null,
    obs: m.obs || null, ultimo_contato: m.ultimo_contato || null, origem: "portfolio", situacao: INBOUND_PARA_BASE[m.situacao] || "em_conversa"
  });
  if (!nova) return false;
  D.base.unshift(nova);
  if (await apagarLinha("marcas", m.id)) D.marcas = D.marcas.filter(x => x.id !== m.id);
  desenharMarcas(); desenharBase();
  torrada("➡️ " + m.nome + " foi para Marcas.");
  return true;
}

/* ----- planilha: modelo, leitura, prévia e importação ----- */
const COLUNAS_MODELO = [
  ["Marca", "nome"], ["Instagram", "instagram"], ["E-mail", "email"], ["Telefone", "telefone"], ["Site", "site"],
  ["Produto", "produto"], ["Link do produto", "link_produto"],
  ["Nicho", "nicho"], ["Origem", "origem"], ["Situação", "situacao"], ["Observação", "obs"], ["Outros contatos", "outros_contatos"],
  ["Fonte", "fonte"], ["Último contato", "ultimo_contato"], ["Favorita", "favorita"], ["Não enviar campanha", "nao_enviar"]
];
function linhaParaCSV(m) {
  return [m.nome, m.instagram, m.email, m.telefone, m.site, m.produto, m.link_produto, m.nicho, bOrigem(m.origem)[1], bSituacao(m.situacao)[1].replace(/^\S+\s/, ""),
    m.obs, m.outros_contatos, m.fonte, dataBR(m.ultimo_contato), m.favorita ? "sim" : "", m.nao_enviar ? "sim" : ""];
}
function baixarModelo() {
  baixarCSV("modelo-marcas", COLUNAS_MODELO.map(c => c[0]), [
    ["Marca Exemplo (apague esta linha)", "@marcaexemplo", "contato@marcaexemplo.com", "+1 416 000 0000", "marcaexemplo.com", "Sérum facial", "https://marcaexemplo.com/serum", "Skincare", "Instagram", "Quero prospectar", "Achei pela hashtag #ugc", "affiliate@marcaexemplo.com", "https://marcaexemplo.com/contact", "25/09/2026", "sim", ""]
  ]);
  abrirJanela({
    titulo: "📄 Como preencher o modelo",
    corpo: '<div class="ficha"><p>O modelo foi baixado. Abra no Excel ou no Google Planilhas, apague a linha de exemplo e preencha uma marca por linha. Só a coluna <b>Marca</b> é obrigatória.</p>' +
      "<h3>Origem (escreva uma destas)</h3><p>" + B_ORIGENS.map(o => o[1]).join(" · ") + "</p>" +
      "<h3>Situação (escreva uma destas)</h3><p>" + B_SITUACOES.map(s => s[1].replace(/^\S+\s/, "")).join(" · ") + "</p>" +
      "<h3>Nicho</h3><p>" + B_NICHOS.join(" · ") + ". Pode escrever outro, se precisar.</p>" +
      "<h3>Último contato</h3><p>No formato dia/mês/ano, por exemplo 25/09/2026.</p>" +
      "<h3>Favorita e Não enviar campanha</h3><p>Escreva <b>sim</b> para marcar. Se não, deixe vazio.</p>" +
      "<h3>Produto, Link do produto, Outros contatos e Fonte</h3><p>São opcionais. Preencha quando a pesquisa for de um produto específico.</p>" +
      "<h3>Na hora de salvar</h3><p>Salve como <b>CSV</b>. No Excel: Arquivo, Salvar como, CSV UTF-8. No Google Planilhas: Arquivo, Fazer download, CSV.</p></div>",
    rodape: '<span class="espaco"></span><button class="btn" type="button" data-fechar>Entendi</button>'
  });
}

/* lê CSV com vírgula, ponto e vírgula ou tab, com aspas e acentos */
function lerCSV(texto) {
  texto = texto.replace(/^﻿/, "");
  const primeira = texto.split(/\r?\n/)[0] || "";
  const conta = (c) => primeira.split(c).length;
  const sep = [";", ",", "\t"].sort((a, b) => conta(b) - conta(a))[0];
  const linhas = [];
  let linha = [], cel = "", aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { cel += '"'; i++; }
      else if (c === '"') aspas = false;
      else cel += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(cel); cel = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(cel); linhas.push(linha); linha = []; cel = "";
    } else cel += c;
  }
  if (cel !== "" || linha.length) { linha.push(cel); linhas.push(linha); }
  return linhas.filter(l => l.some(c => String(c).trim() !== ""));
}

/* reconhece o nome da coluna mesmo escrito diferente */
function campoDaColuna(nome) {
  const n = normaliza(nome).replace(/[^a-z0-9]/g, "");
  if (!n) return null;
  const regras = [                          /* a ordem importa: a primeira que servir ganha */
    [null, /seguidor|followers/],
    ["nao_enviar", /naoenviar|optout|descadastr|bloque/],
    ["favorita", /favorit|prioridade|destaque/],
    ["outros_contatos", /outroscontatos|outrocontato|othercontact|maiscontatos/],
    ["link_produto", /(link|url).*produto|produto.*(link|url)|productlink|producturl/],
    ["instagram", /instagram|^insta|^ig$|arroba/],
    ["produto", /produto|product/],
    ["email", /mail|correio/],
    ["obs", /^observ|^obs|^nota|notes|comentario/],
    ["fonte", /^fonte|^source|referencia/],
    ["telefone", /telefone|^fone|phone|whatsapp|celular|^tel/],
    ["site", /^site|website|^url|^web/],
    ["nicho", /nicho|categoria|niche|category|segmento/],
    ["origem", /origem|ondeencontrei|deondeveio|canal/],
    ["situacao", /situacao|status|etapa|estagio/],
    ["ultimo_contato", /ultimocontato|^data|lastcontact/],
    ["nome", /marca|nome|empresa|brand|company|cliente/]
  ];
  const r = regras.find(([, re]) => re.test(n));
  return r ? r[0] : null;
}
/* separa e-mails de um texto: o primeiro vira o e-mail principal, o resto vai para outros contatos */
function emailsDoTexto(t) {
  const texto = String(t || "");
  const lista = Array.from(new Set((texto.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) || []).map(e => e.toLowerCase())));
  const naoTem = /^\s*n[aã]o encontrad/i.test(texto);   /* "não encontrado (só atendimento: ...)" */
  if (naoTem) return { principal: null, resto: texto.trim() };
  const linhas = texto.split(/\n/);
  /* o comentário ao lado do e-mail principal não se perde: "(colaboração com influenciadores)" */
  const comentario = (linhas[0] || "").replace(lista[0] ? new RegExp(lista[0].replace(/[.+]/g, "\\$&"), "i") : /$^/, "").replace(/^[\s:(-]+|[\s)]+$/g, "").trim();
  return { principal: lista[0] || null, resto: [comentario && "Sobre o e-mail principal: " + comentario].concat(linhas.slice(1)).filter(Boolean).join("\n").trim() };
}
function instagramDoTexto(t) {
  const linhas = String(t || "").split(/\n/).map(x => x.trim()).filter(Boolean);
  const pega = (l) => { const m = l.match(/instagram\.com\/([\w.]+)/i) || l.match(/@([\w.]+)/); return m ? m[1] : (/^[\w.]+$/.test(l) ? l : null); };
  const principal = linhas.length ? pega(linhas[0]) : null;
  return { principal: principal ? "@" + principal.replace(/^@/, "") : null, resto: linhas.slice(1).join("\n") };
}
const semNaoEncontrado = (t) => String(t || "").split(/\n/).filter(l => !/:\s*n[aã]o encontrad/i.test(l) && !/^\s*n[aã]o encontrad[oa]\.?\s*$/i.test(l)).join("\n").trim();
function origemDoTexto(t) {
  const n = normaliza(t);
  if (!n) return "outro";
  if (/insta|^ig$/.test(n)) return "instagram";
  if (/linkedin/.test(n)) return "linkedin";
  if (/tiktok/.test(n)) return "tiktok";
  if (/twitter|^x$|^x\b|x\.com/.test(n)) return "x";
  if (/mail/.test(n)) return "email";
  if (/google|chrome|pesquisa|busca|site/.test(n)) return "google";
  if (/indica/.test(n)) return "indicacao";
  if (/portf|formul|inbound/.test(n)) return "portfolio";
  return "outro";
}
function situacaoDoTexto(t) {
  const n = normaliza(t);
  if (!n) return "quero_prospectar";
  if (/sem interesse|parad|recus|nao quer/.test(n)) return "sem_interesse";
  if (/trabalhei|cliente|fechad|parceir/.test(n)) return "ja_trabalhei";
  if (/conversa|negocia|respond/.test(n)) return "em_conversa";
  if (/sem retorno|prospectad|enviad|contatad/.test(n)) return "prospectada";
  return "quero_prospectar";
}
function dataDoTexto(t) {
  const s = String(t || "").trim();
  let m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) { const ano = m[3].length === 2 ? "20" + m[3] : m[3]; const d = new Date(+ano, +m[2] - 1, +m[1]); return isNaN(d) ? null : isoLocal(d); }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]);
  return null;
}
function nichoDoTexto(t) {
  const s = String(t || "").trim();
  if (!s) return null;
  const achou = nichosDaBase().find(n => normaliza(n) === normaliza(s));
  return achou || s;
}

/* acha a marca já existente: pelo e-mail, pelo @ ou pelo nome */
function marcaExistente(d, indices) {
  if (d.email && indices.email.has(d.email)) return indices.email.get(d.email);
  const ig = d.instagram ? arroba(d.instagram).toLowerCase() : "";
  if (ig && indices.ig.has(ig)) return indices.ig.get(ig);
  const nome = chaveNome(d.nome);
  if (nome && indices.nome.has(nome)) return indices.nome.get(nome);
  return null;
}
function indicesDaBase(lista) {
  const ix = { email: new Map(), ig: new Map(), nome: new Map() };
  lista.forEach(m => {
    if (m.email) ix.email.set(String(m.email).toLowerCase(), m);
    if (m.instagram) ix.ig.set(arroba(m.instagram).toLowerCase(), m);
    if (m.nome) ix.nome.set(chaveNome(m.nome), m);
  });
  return ix;
}

async function lerPlanilha(arquivo) {
  if (/\.(xlsx|xls|numbers)$/i.test(arquivo.name)) {
    torrada("Esse arquivo é do Excel ou do Numbers. Salve como CSV primeiro (o modelo explica como) e importe de novo.", true);
    return;
  }
  const buf = await arquivo.arrayBuffer();
  let texto = new TextDecoder("utf-8").decode(buf);
  if (texto.includes("�")) texto = new TextDecoder("windows-1252").decode(buf);   /* CSV antigo do Excel */
  const linhas = lerCSV(texto);
  if (linhas.length < 2) { torrada("Não achei nenhuma marca nesse arquivo. Confira se é o CSV certo.", true); return; }
  const cabecalho = linhas[0].map(c => String(c).trim());
  /* ligação automática: cada campo do painel pega a primeira coluna que parece com ele */
  const mapa = {};
  cabecalho.forEach((nome, i) => { const campo = campoDaColuna(nome); if (campo && mapa[campo] == null) mapa[campo] = i; });
  previaImportacao({ nome: arquivo.name, cabecalho, linhas: linhas.slice(1), mapa });
}

/* monta o plano: o que cada linha da planilha vira */
function planoDaPlanilha(pl) {
  const ix = indicesDaBase(D.base);
  const daPlanilha = indicesDaBase([]);
  const valor = (l, campo) => {
    const m = pl.mapa[campo];
    if (m == null) return "";
    if (typeof m === "string" && m.startsWith("fixo:")) return m.slice(5);     /* o mesmo valor para todas as linhas */
    return String(l[m] == null ? "" : l[m]).trim();
  };
  return pl.linhas.map((l, i) => {
    const d = {};
    COLUNAS_MODELO.forEach(([, campo]) => { d[campo] = valor(l, campo); });
    const item = { linha: i + 2 };
    if (!d.nome) return Object.assign(item, { tipo: "ignorada", motivo: "sem nome da marca", dados: { nome: "" } });
    if (/apague esta linha/i.test(d.nome)) return Object.assign(item, { tipo: "ignorada", motivo: "linha de exemplo", dados: { nome: d.nome } });
    if (d.nome.length > 80 || /^(notas?|observac|obs\b|total|fonte)/i.test(normaliza(d.nome)))
      return Object.assign(item, { tipo: "ignorada", motivo: "parece uma anotação, não uma marca", dados: { nome: d.nome.slice(0, 60) + (d.nome.length > 60 ? "…" : "") } });
    const ig = instagramDoTexto(d.instagram), em = emailsDoTexto(d.email);
    const outros = [semNaoEncontrado(em.resto), semNaoEncontrado(ig.resto) && "Instagram: " + ig.resto.replace(/\n/g, " · "), semNaoEncontrado(d.outros_contatos)].filter(Boolean).join("\n");
    const limpo = {
      nome: d.nome.slice(0, 200),
      instagram: ig.principal,
      email: em.principal ? em.principal.slice(0, 200) : null,
      telefone: d.telefone || null,
      site: d.site || null,
      produto: d.produto || null,
      link_produto: d.link_produto || null,
      outros_contatos: outros || null,
      fonte: d.fonte || null,
      favorita: /^(sim|s|yes|y|x|1|true|alta)$/i.test(d.favorita || "") || /prioridade alta/i.test(d.obs || ""),
      nicho: nichoDoTexto(d.nicho),
      origem: origemDoTexto(d.origem),
      situacao: situacaoDoTexto(d.situacao),
      obs: d.obs || null,
      ultimo_contato: dataDoTexto(d.ultimo_contato),
      nao_enviar: /^(sim|s|yes|y|x|1|true)$/i.test(d.nao_enviar || "")
    };
    if (limpo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo.email)) { limpo.obs = [limpo.obs, "E-mail na planilha: " + limpo.email].filter(Boolean).join("\n"); limpo.email = null; item.alerta = "e-mail com erro, foi para a observação"; }
    if (d.ultimo_contato && !limpo.ultimo_contato) item.alerta = "data não reconhecida: " + d.ultimo_contato;
    item.dados = limpo;
    if (marcaExistente(limpo, daPlanilha)) return Object.assign(item, { tipo: "ignorada", motivo: "repetida na planilha" });
    [["email", limpo.email], ["ig", limpo.instagram && arroba(limpo.instagram).toLowerCase()], ["nome", chaveNome(limpo.nome)]].forEach(([k, v]) => { if (v) daPlanilha[k].set(v, limpo); });
    const existe = marcaExistente(limpo, ix);
    if (!existe) return Object.assign(item, { tipo: "nova" });
    /* já existe: a planilha só preenche e atualiza o que veio escrito, nunca apaga */
    const mudar = {};
    ["instagram", "email", "telefone", "site", "produto", "link_produto", "outros_contatos", "fonte", "nicho", "obs", "ultimo_contato"].forEach(k => { if (limpo[k] && limpo[k] !== existe[k]) mudar[k] = limpo[k]; });
    if (limpo.favorita && !existe.favorita) mudar.favorita = true;
    if (d.origem && limpo.origem !== existe.origem) mudar.origem = limpo.origem;
    if (d.situacao && limpo.situacao !== existe.situacao) mudar.situacao = limpo.situacao;
    if (d.nao_enviar && limpo.nao_enviar !== !!existe.nao_enviar) mudar.nao_enviar = limpo.nao_enviar;
    return Object.assign(item, Object.keys(mudar).length ? { tipo: "atualiza", existe, mudar } : { tipo: "igual", existe });
  });
}

function previaImportacao(pl) {
  let plano = [];
  let marcadas = new Set();
  const j = abrirJanela({
    titulo: "📥 Prévia da importação", larga: true,
    corpo: '<p class="mudo pequeno" style="margin-bottom:12px">Arquivo: <b>' + esc(pl.nome) + "</b>. Nada foi gravado ainda.</p>" +
      '<div class="imp__bloco"><div class="imp__titulo">De qual coluna da planilha vem cada campo</div><div class="imp__mapa" id="impMapa"></div>' +
      '<p class="mudo pequeno" style="margin-top:8px">Já liguei sozinha pelo nome das colunas. Se alguma estiver errada, troque aqui e a planilha embaixo se atualiza. Se a planilha não tem uma coluna, como Origem, escolha um valor em "O mesmo para todas as linhas".</p></div>' +
      '<div class="imp__bloco"><div class="imp__cab"><div class="imp__titulo">Confira linha por linha antes de importar</div><span class="espaco"></span>' +
        '<button type="button" class="btn btn--linha" id="impTodos">marcar todos</button><button type="button" class="btn btn--linha" id="impNenhum">desmarcar todos</button></div>' +
        '<div class="imp__planilha" id="impTabela"></div><p class="mudo pequeno" id="impResumo" style="margin-top:8px"></p></div>' +
      '<div class="faixa faixa--aviso" id="impAviso"></div>',
    rodape: '<span class="espaco"></span><button class="btn btn--linha" type="button" data-fechar>Voltar</button><button class="btn" type="button" id="impOk"></button>'
  });
  $(".janela__caixa", j).classList.add("janela__caixa--planilha");

  /* seletores das colunas */
  const FIXOS = {
    origem: B_ORIGENS.map(o => o[1]),
    situacao: B_SITUACOES.map(s => s[1].replace(/^\S+\s/, "")),
    nicho: B_NICHOS,
    produto: Array.from(new Set(D.base.map(m => m.produto).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt"))
  };
  const opcoes = (campo, atual) => '<option value="">não importar</option>' +
    '<optgroup label="Coluna da planilha">' + pl.cabecalho.map((c, i) => '<option value="' + i + '"' + (atual === i ? " selected" : "") + ">" + esc(c || "(coluna " + (i + 1) + ")") + "</option>").join("") + "</optgroup>" +
    (FIXOS[campo] ? '<optgroup label="O mesmo para todas as linhas">' + Array.from(new Set(FIXOS[campo].concat(typeof atual === "string" && atual.startsWith("fixo:") ? [atual.slice(5)] : []))).map(v => '<option value="fixo:' + esc(v) + '"' + (atual === "fixo:" + v ? " selected" : "") + ">" + esc(v) + " (todas)</option>").join("") +
      (campo === "produto" || campo === "nicho" ? '<option value="escrever">✏️ Escrever um para todas…</option>' : "") + "</optgroup>" : "");
  $("#impMapa", j).innerHTML = COLUNAS_MODELO.map(([rot, campo]) =>
    '<label class="imp__linha"><span>' + esc(rot) + (campo === "nome" ? " *" : "") + '</span><select class="entrada" data-campo="' + campo + '">' + opcoes(campo, pl.mapa[campo]) + "</select></label>").join("");
  $("#impMapa", j).addEventListener("change", (e) => {
    const s = e.target.closest("[data-campo]");
    if (!s) return;
    if (s.value === "escrever") {
      const caixa = abrirJanela({ titulo: "✏️ " + (s.dataset.campo === "produto" ? "Produto" : "Nicho") + " para todas as linhas",
        corpo: '<div class="campo"><label for="impEscrito">Escreva e clique em Usar</label><input id="impEscrito" class="entrada" placeholder="ex.: Aspirador de pó"></div>',
        rodape: '<span class="espaco"></span><button class="btn" type="button" id="impUsar">Usar</button>' });
      /* a janela da prévia continua guardada: volta para ela depois */
      const campo = s.dataset.campo;
      $("#impUsar", caixa).addEventListener("click", () => {
        const v = $("#impEscrito", caixa).value.trim();
        if (v) pl.mapa[campo] = "fixo:" + v;
        previaImportacao(pl);
      });
      return;
    }
    if (s.value === "") delete pl.mapa[s.dataset.campo];
    else pl.mapa[s.dataset.campo] = s.value.startsWith("fixo:") ? s.value : Number(s.value);
    recalcula();
  });

  const ROT = { nova: ["🟢 nova", "c-verde"], atualiza: ["🔵 completa", "c-azul"], igual: ["⚪ já está igual", "c-cinza"], ignorada: ["ignorada", "c-vermelho"] };
  function recalcula() {
    plano = planoDaPlanilha(pl);
    marcadas = new Set(plano.map((p, i) => (p.tipo === "nova" || p.tipo === "atualiza") ? i : -1).filter(i => i >= 0));
    desenha();
  }
  function desenha() {
    const semNome = pl.mapa.nome == null;
    const cel = (t, classe) => "<td" + (classe ? ' class="' + classe + '"' : "") + ' title="' + esc(t || "") + '">' + esc(t || "·") + "</td>";
    $("#impTabela", j).innerHTML = semNome
      ? '<p class="vazio">Escolha lá em cima de qual coluna vem o nome da <b>Marca</b>. Sem ele não dá para importar.</p>'
      : '<table class="tabela"><thead><tr><th></th><th>#</th><th></th><th>⭐</th><th>Marca</th><th>Produto</th><th>Link do produto</th><th>Instagram</th><th>E-mail</th><th>Outros contatos</th><th>Telefone</th><th>Site</th><th>Nicho</th><th>Origem</th><th>Situação</th><th>Observação</th><th>Fonte</th><th>Último contato</th><th>🚫</th></tr></thead><tbody>' +
        plano.map((p, i) => {
          const d = p.dados, pode = p.tipo === "nova" || p.tipo === "atualiza";
          return '<tr class="' + (marcadas.has(i) ? "" : "apagado") + '">' +
            '<td class="curta"><input type="checkbox" data-i="' + i + '"' + (marcadas.has(i) ? " checked" : "") + (pode ? "" : " disabled") + "></td>" +
            '<td class="curta mudo">' + p.linha + "</td>" +
            '<td class="curta"><span class="pil ' + ROT[p.tipo][1] + '" title="' + esc(p.motivo || "") + '">' + ROT[p.tipo][0] + (p.motivo ? ": " + esc(p.motivo) : "") + "</span>" +
              (p.alerta ? '<div class="pequeno" style="color:var(--c-vermelho)">⚠️ ' + esc(p.alerta) + "</div>" : "") + "</td>" +
            cel(d.favorita ? "⭐" : "") +
            "<td><b>" + esc(d.nome || "·") + "</b></td>" +
            cel(d.produto) + cel(d.link_produto) + cel(d.instagram) + cel(d.email) + cel(d.outros_contatos, "corta") + cel(d.telefone) + cel(d.site) + cel(d.nicho) +
            (d.origem ? cel(bOrigem(d.origem)[1]) : cel("")) +
            (d.situacao ? '<td><span class="pil ' + bSituacao(d.situacao)[2] + '">' + esc(bSituacao(d.situacao)[1]) + "</span></td>" : cel("")) +
            cel(d.obs, "corta") + cel(d.fonte, "corta") + cel(dataBR(d.ultimo_contato)) + cel(d.nao_enviar ? "sim" : "") + "</tr>";
        }).join("") + "</tbody></table>";
    const conta = (t) => plano.filter(p => p.tipo === t).length;
    const escolhidas = [...marcadas].filter(i => plano[i]);
    const novas = escolhidas.filter(i => plano[i].tipo === "nova").length, completa = escolhidas.length - novas;
    $("#impResumo", j).textContent = plural(plano.length, "linha lida", "linhas lidas") + " · " + plural(conta("nova"), "nova", "novas") + " · " +
      conta("atualiza") + " já na base, com dados para completar · " + conta("igual") + " já na base, iguais · " + plural(conta("ignorada"), "ignorada", "ignoradas") +
      ". Desmarque qualquer linha que você não quiser importar.";
    const repetidas = conta("atualiza") + conta("igual");
    $("#impAviso", j).innerHTML = repetidas
      ? "As " + repetidas + " linhas marcadas como 🔵 ou ⚪ foram encontradas na sua base pelo e-mail, pelo @ ou pelo nome. Elas <b>não entram de novo</b>, para não duplicar. As 🔵 só completam o que estava vazio ou mudou."
      : "Nenhuma dessas marcas está na sua base ainda. Tudo o que estiver marcado entra como marca nova.";
    const ok = $("#impOk", j);
    ok.disabled = semNome || !escolhidas.length;
    ok.textContent = "📥 Importar " + plural(escolhidas.length, "marca", "marcas") + (completa && novas ? " (" + plural(novas, "nova", "novas") + ", " + plural(completa, "completada", "completadas") + ")" : "");
  }
  $("#impTabela", j).addEventListener("change", (e) => {
    const c = e.target.closest("[data-i]");
    if (!c) return;
    const i = Number(c.dataset.i);
    if (c.checked) marcadas.add(i); else marcadas.delete(i);
    c.closest("tr").classList.toggle("apagado", !c.checked);
    const tabela = $("#impTabela", j), topo = tabela.scrollTop, lado = tabela.scrollLeft;
    desenha();
    tabela.scrollTop = topo; tabela.scrollLeft = lado;
  });
  $("#impTodos", j).addEventListener("click", () => { plano.forEach((p, i) => { if (p.tipo === "nova" || p.tipo === "atualiza") marcadas.add(i); }); desenha(); });
  $("#impNenhum", j).addEventListener("click", () => { marcadas.clear(); desenha(); });
  $("#impOk", j).addEventListener("click", () => {
    const escolhidas = [...marcadas].map(i => plano[i]).filter(Boolean);
    importar(escolhidas.filter(p => p.tipo === "nova"), escolhidas.filter(p => p.tipo === "atualiza"), $("#impOk", j));
  });
  recalcula();
}

async function importar(novas, atualiza, botao) {
  botao.disabled = true;
  let ok = 0, erros = 0;
  const passo = (t) => { botao.textContent = "⏳ " + t; };
  for (let i = 0; i < novas.length; i += 100) {
    passo("Gravando " + Math.min(i + 100, novas.length) + " de " + novas.length + "…");
    const { data, error } = await banco.from("base_marcas").insert(novas.slice(i, i + 100).map(p => p.dados)).select();
    if (error) { erros += novas.slice(i, i + 100).length; torrada(traduzErro(error, "base_marcas"), true); continue; }
    (data || []).forEach(m => D.base.unshift(m));
    ok += (data || []).length;
  }
  let atualizadas = 0;
  for (let i = 0; i < atualiza.length; i += 10) {
    passo("Atualizando " + Math.min(i + 10, atualiza.length) + " de " + atualiza.length + "…");
    const lote = await Promise.all(atualiza.slice(i, i + 10).map(p => banco.from("base_marcas").update(p.mudar).eq("id", p.existe.id).select().single()));
    lote.forEach(r => { if (r.error) erros++; else { troca(D.base, r.data); atualizadas++; } });
  }
  fecharJanela();
  desenharBase();
  torrada(erros ? "Importei " + ok + " e atualizei " + atualizadas + ", mas " + erros + " deram erro." : "✅ " + plural(ok, "marca nova", "marcas novas") + " e " + plural(atualizadas, "atualizada", "atualizadas") + ".", !!erros);
  bVisao = "base";
  desenharBase();
}

/* ============================================================
   7. ABA CALENDÁRIO
   ============================================================ */
const TIPOS_CAL = { gravar: ["Gravar", "c-coral"], editar: ["Editar", "c-mostarda"], postar: ["Postar", "c-azul"], prazo: ["Prazo", "c-destaque"] };
let mesVisto = new Date(); mesVisto.setDate(1); mesVisto.setHours(0, 0, 0, 0);
let filtroCal = "todos";

function itensCalendario() {
  const doCal = D.calendario.filter(c => c.data).map(c => ({
    chave: "cal:" + c.id, titulo: c.titulo || "(sem título)", marca: c.marca, tipo: TIPOS_CAL[c.tipo] ? c.tipo : "gravar",
    data: String(c.data).slice(0, 10), feito: c.status === "feito", exemplo: c.exemplo
  }));
  /* os prazos das campanhas entram sozinhos */
  const prazos = D.campanhas.filter(c => c.prazo).map(c => ({
    chave: "camp:" + c.id, titulo: "Prazo: " + (c.campanha || "campanha"), marca: c.cliente, tipo: "prazo",
    data: String(c.prazo).slice(0, 10), feito: c.status === "Entregue" || c.ativa === false, exemplo: c.exemplo
  }));
  const ordemTipo = { prazo: 0, gravar: 1, editar: 2, postar: 3 };
  return doCal.concat(prazos)
    .filter(i => filtroCal === "todos" || i.tipo === filtroCal)
    .sort((a, b) => (a.feito - b.feito) || (ordemTipo[a.tipo] - ordemTipo[b.tipo]) || String(a.titulo).localeCompare(b.titulo, "pt"));
}
const itemCalHTML = (i) =>
  '<button type="button" class="cal__item ' + TIPOS_CAL[i.tipo][1] + (i.feito ? " feito" : "") + '" data-item="' + esc(i.chave) + '" title="' +
  esc(i.titulo + (i.marca ? " · " + i.marca : "")) + '">' + esc(i.titulo) + "</button>";

function montarCalendario() {
  $("#aba-calendario").innerHTML =
    '<div class="ferramentas">' +
      '<div class="cal__nav"><button class="btn--icone" id="cAnt" aria-label="Mês anterior">' + ic("esq") + '</button>' +
      '<span class="cal__mes" id="cMes"></span><button class="btn--icone" id="cProx" aria-label="Próximo mês">' + ic("dir") + "</button></div>" +
      '<button class="btn btn--linha" id="cHoje">Este mês</button>' +
      '<div class="pilulas" id="cFiltro">' +
        [["todos", "Tudo"], ["gravar", "Gravar"], ["editar", "Editar"], ["postar", "Postar"], ["prazo", "Prazos"]]
          .map(f => '<button type="button" data-f="' + f[0] + '"' + (f[0] === filtroCal ? ' class="ativo"' : "") + ">" + f[1] + "</button>").join("") +
      "</div>" +
      '<span class="espaco"></span><button class="btn" id="cNovo">' + ic("mais") + " Adicionar</button>" +
    "</div>" +
    '<div class="cal"><div class="cal__sem">' + ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => "<div>" + d + "</div>").join("") + "</div>" +
    '<div class="cal__grade" id="cGrade"></div></div>' +
    '<div class="bloco" style="margin-top:16px"><div class="bloco__cab"><h2>Ficou pra trás</h2><span class="mudo pequeno" id="cAtrasConta"></span></div>' +
    '<div class="atrasados" id="cAtras"></div></div>';

  $("#cAnt").addEventListener("click", () => { mesVisto.setMonth(mesVisto.getMonth() - 1); desenharCalendario(); });
  $("#cProx").addEventListener("click", () => { mesVisto.setMonth(mesVisto.getMonth() + 1); desenharCalendario(); });
  $("#cHoje").addEventListener("click", () => { mesVisto = new Date(); mesVisto.setDate(1); mesVisto.setHours(0, 0, 0, 0); desenharCalendario(); });
  $("#cNovo").addEventListener("click", () => editorCal(null, isoLocal(new Date())));
  $("#cFiltro").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    filtroCal = b.dataset.f;
    $$("#cFiltro button").forEach(x => x.classList.toggle("ativo", x === b));
    desenharCalendario();
  });
  $("#cGrade").addEventListener("click", (e) => {
    const item = e.target.closest("[data-item]");
    if (item) { abrirItem(item.dataset.item); return; }
    const mais = e.target.closest("[data-vermais]");
    if (mais) { abrirDia(mais.dataset.vermais); return; }
    const dia = e.target.closest("[data-dia]");
    if (dia) editorCal(null, dia.dataset.dia);
  });
  $("#cAtras").addEventListener("click", async (e) => {
    const feito = e.target.closest("[data-feito]");
    if (feito) {
      const id = feito.dataset.feito;
      const salvo = await salvarLinha("calendario", { status: "feito" }, id);
      if (salvo) { troca(D.calendario, salvo); desenharCalendario(); torrada("Marcado como feito."); }
      return;
    }
    const abrir = e.target.closest("[data-item]");
    if (abrir) abrirItem(abrir.dataset.item);
  });
}

function desenharCalendario() {
  const nomeMes = mesVisto.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  $("#cMes").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  const itens = itensCalendario();
  const porDia = {};
  itens.forEach(i => { (porDia[i.data] = porDia[i.data] || []).push(i); });

  const primeiro = new Date(mesVisto.getFullYear(), mesVisto.getMonth(), 1);
  const ultimo = new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 0);
  const antes = (primeiro.getDay() + 6) % 7;          /* segunda = 0 */
  const depois = 6 - ((ultimo.getDay() + 6) % 7);
  const hojeISO = isoLocal(hoje());
  let html = "";
  for (let n = -antes; n < ultimo.getDate() + depois; n++) {
    const d = new Date(mesVisto.getFullYear(), mesVisto.getMonth(), n + 1);
    const iso = isoLocal(d);
    const doDia = porDia[iso] || [];
    const fora = d.getMonth() !== mesVisto.getMonth();
    html += '<div class="cal__dia' + (fora ? " fora" : "") + (iso === hojeISO ? " hoje" : "") + '" data-dia="' + iso + '">' +
      '<span class="cal__num">' + d.getDate() + "</span>" +
      '<button type="button" class="cal__mais-add" data-dia="' + iso + '" aria-label="Adicionar neste dia">' + ic("mais") + "</button>" +
      doDia.slice(0, 3).map(itemCalHTML).join("") +
      (doDia.length > 3 ? '<button type="button" class="cal__ver-mais" data-vermais="' + iso + '">+' + (doDia.length - 3) + " mais</button>" : "") +
      "</div>";
  }
  $("#cGrade").innerHTML = html;

  /* ficou pra trás */
  const atrasados = itens.filter(i => !i.feito && diasAte(i.data) < 0).sort((a, b) => a.data.localeCompare(b.data));
  $("#cAtrasConta").textContent = atrasados.length ? plural(atrasados.length, "item", "itens") : "";
  $("#cAtras").innerHTML = atrasados.length
    ? atrasados.map(i => {
        const dias = -diasAte(i.data);
        return '<div class="atrasado"><span class="pil ' + TIPOS_CAL[i.tipo][1] + '">' + TIPOS_CAL[i.tipo][0] + "</span>" +
          '<span class="atrasado__tit"><b>' + esc(i.titulo) + "</b>" + (i.marca ? ' <span class="mudo">· ' + esc(i.marca) + "</span>" : "") + pilExemplo(i) + "</span>" +
          '<span class="etiqueta c-vermelho">há ' + plural(dias, "dia", "dias") + "</span>" +
          (i.tipo === "prazo"
            ? '<button class="btn btn--linha" data-item="' + esc(i.chave) + '">Abrir</button>'
            : '<button class="btn btn--linha" data-feito="' + esc(i.chave.slice(4)) + '">' + ic("check") + " Feito</button>") +
          "</div>";
      }).join("")
    : '<p class="vazio">Nada ficou pra trás. Tudo em dia.</p>';
}

function abrirItem(chave) {
  const [origem, id] = [chave.slice(0, chave.indexOf(":")), chave.slice(chave.indexOf(":") + 1)];
  if (origem === "camp") { const c = D.campanhas.find(x => x.id === id); if (c) editorCampanha(c); return; }
  const c = D.calendario.find(x => x.id === id);
  if (c) editorCal(c);
}

function abrirDia(iso) {
  const d = deISO(iso);
  const nome = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const doDia = itensCalendario().filter(i => i.data === iso);
  const j = abrirJanela({
    titulo: nome.charAt(0).toUpperCase() + nome.slice(1),
    corpo: '<div class="dia-lista">' + doDia.map(itemCalHTML).join("") + "</div>",
    rodape: '<span class="espaco"></span><button class="btn" type="button" data-novo>' + ic("mais") + " Adicionar neste dia</button>"
  });
  $(".dia-lista", j).addEventListener("click", (e) => { const b = e.target.closest("[data-item]"); if (b) abrirItem(b.dataset.item); });
  $("[data-novo]", j).addEventListener("click", () => editorCal(null, iso));
}

function editorCal(c, dataPadrao) {
  editor({
    titulo: c ? "Editar no calendário" : "Adicionar no calendário",
    valores: c || { data: dataPadrao, tipo: filtroCal !== "todos" && filtroCal !== "prazo" ? filtroCal : "gravar", status: "a fazer" },
    campos: [
      { nome: "titulo", rot: "O que fazer", obrigatorio: true, inteiro: true },
      { nome: "marca", rot: "Marca", lista: nomesDeMarcas() },
      { nome: "tipo", rot: "Tipo", tipo: "select", opcoes: [["gravar", "Gravar"], ["editar", "Editar"], ["postar", "Postar"]] },
      { nome: "data", rot: "Data", tipo: "date", obrigatorio: true },
      { nome: "status", rot: "Status", tipo: "select", opcoes: [["a fazer", "A fazer"], ["feito", "Feito"]] }
    ],
    aoSalvar: async (dados) => {
      const salvo = await salvarLinha("calendario", dados, c && c.id);
      if (!salvo) return false;
      troca(D.calendario, salvo);
      desenharCalendario();
      torrada("Salvo no calendário.");
      return true;
    },
    aoApagar: c ? async () => {
      if (!(await apagarLinha("calendario", c.id))) return false;
      D.calendario = D.calendario.filter(x => x.id !== c.id); desenharCalendario(); torrada("Apagado do calendário."); return true;
    } : null
  });
}

/* ============================================================
   8. ABA CAMPANHAS (os contratos fechados)
   ============================================================ */
const FUNIL = ["Briefing", "Roteiro", "Aprovação Roteiro", "Gravação", "Edição", "Aprovado", "Entregue"];
const COR_STATUS = { "Briefing": "c-cinza", "Roteiro": "c-azul", "Aprovação Roteiro": "c-roxo", "Gravação": "c-coral", "Edição": "c-mostarda", "Aprovado": "c-verde", "Entregue": "c-destaque" };
const COR_TIPO = { "Conteúdo": "c-azul", "Publicidade": "c-coral" };
const MOEDAS = { CAD: "CA$", USD: "US$", EUR: "€" };
const VIAS = ["PayPal", "Wise", "Transferência", "Outro"];
const CANAIS = [
  ["inbound", "📥 Inbound (portfólio)", "c-verde"],
  ["plataforma", "🧩 Plataforma", "c-roxo"],
  ["manual", "🔎 Prospecção manual", "c-azul"],
  ["instagram_auto", "📸 Instagram automático", "c-coral"],
  ["onbento", "✉️ onBento", "c-mostarda"],
  ["indicacao", "🤝 Indicação", "c-destaque"],
  ["outro", "Outro", "c-cinza"]
];
const canalDe = (v) => CANAIS.find(c => c[0] === v) || null;
const COLUNAS = [
  { k: "favorita", rot: "", titulo: "Favorita", tipo: "fav" },
  { k: "campanha", rot: "Trabalho", tipo: "texto" },
  { k: "cliente", rot: "Cliente", tipo: "texto" },
  { k: "tipo", rot: "Tipo", tipo: "texto" },
  { k: "status", rot: "Status", tipo: "funil" },
  { k: "qtd", rot: "Qtd", tipo: "num", num: true },
  { k: "valor", rot: "Valor", tipo: "cad", num: true },
  { k: "prazo", rot: "Prazo", tipo: "data" },
  { k: "pagamento", rot: "Pagamento", tipo: "pag" },
  { k: "canal", rot: "Por onde fechei", tipo: "texto" }
];
let ordemCamp = { k: "prazo", dir: 1 };
let filtroCamp = "todas";

/* ----- câmbio: tudo vira CA$ pela cotação do dia (Banco Central Europeu) ----- */
let cambio = { CAD: 1 };      /* quantos CA$ vale 1 unidade de cada moeda */
let cambioData = null;
async function carregaCambio() {
  try {
    const guardado = JSON.parse(localStorage.getItem("admin-cambio") || "null");
    if (guardado && guardado.dia === isoLocal(new Date())) { cambio = guardado.taxas; cambioData = guardado.data; return; }
  } catch (e) {}
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=CAD&symbols=USD,EUR");
    const j = await r.json();
    if (!j.rates || !j.rates.USD) throw new Error("sem cotação");
    cambio = { CAD: 1, USD: 1 / j.rates.USD, EUR: 1 / j.rates.EUR };
    cambioData = j.date;
    try { localStorage.setItem("admin-cambio", JSON.stringify({ dia: isoLocal(new Date()), taxas: cambio, data: cambioData })); } catch (e) {}
  } catch (e) {
    cambio = { CAD: 1 };      /* sem internet: mostra só por moeda */
  }
}
const moedaDe = (c) => MOEDAS[c.moeda] ? c.moeda : "CAD";
const emCAD = (valor, moeda) => cambio[moeda] ? (Number(valor) || 0) * cambio[moeda] : null;
const dinheiroEm = (v, moeda) => (MOEDAS[moeda] || "$") + " " + numBR.format(Number(v) || 0);
function recebidoDe(c) {
  const r = soma(Array.isArray(c.pagamentos) ? c.pagamentos : [], p => p.valor);
  return r === 0 && c.pagamento === "pago" && !c.gift ? Number(c.valor) || 0 : r;   /* campanhas antigas marcadas como pagas */
}
function situacaoPagamento(c) {
  if (c.gift) return ["🎁 Gift", "c-roxo"];
  const total = Number(c.valor) || 0, rec = recebidoDe(c);
  if (total > 0 && rec >= total - 0.005) return ["Pago", "c-verde"];
  if (rec > 0) return ["Parcial", "c-azul"];
  return ["Pendente", "c-amarelo"];
}
/* soma por moeda + total em CA$ */
function somaMoedas(lista, valorDe) {
  const por = {};
  lista.forEach(c => { const m = moedaDe(c); por[m] = (por[m] || 0) + (Number(valorDe(c)) || 0); });
  let total = 0, completo = true;
  Object.entries(por).forEach(([m, v]) => { const cad = emCAD(v, m); if (cad == null) completo = false; else total += cad; });
  const partes = Object.entries(por).filter(([, v]) => v).map(([m, v]) => dinheiroEm(v, m));
  return { total, completo, partes, soCAD: Object.entries(por).filter(([, v]) => v).every(([m]) => m === "CAD") };
}

function valorOrdem(c, col) {
  const v = c[col.k];
  if (col.tipo === "fav") return v ? 0 : 1;
  if (col.tipo === "funil") { const i = FUNIL.indexOf(v); return i < 0 ? null : i; }
  if (col.tipo === "cad") return emCAD(c.valor, moedaDe(c));
  if (col.tipo === "pag") return situacaoPagamento(c)[0];
  if (col.tipo === "num") return v == null || v === "" ? null : Number(v);
  if (col.k === "canal") return canalDe(v) ? canalDe(v)[1].replace(/^\S+\s/, "") : null;
  if (v == null || v === "") return null;
  return String(v);
}
function comparaCamp(a, b) {
  const col = COLUNAS.find(c => c.k === ordemCamp.k) || COLUNAS[7];
  const va = valorOrdem(a, col), vb = valorOrdem(b, col);
  let r;
  if (va === null && vb === null) r = 0;
  else if (va === null) return 1;          /* vazio fica sempre no fim */
  else if (vb === null) return -1;
  else if (typeof va === "number") r = va - vb;
  else r = va.localeCompare(vb, "pt", { sensitivity: "base", numeric: true });
  return r * ordemCamp.dir || String(a.campanha || "").localeCompare(String(b.campanha || ""), "pt");
}

function avisoPrazo(c) {
  if (!c.prazo || c.status === "Entregue") return "";
  const n = diasAte(c.prazo);
  if (n === null) return "";
  if (n < 0) return '<span class="etiqueta c-vermelho">atrasado ' + plural(-n, "dia", "dias") + "</span>";
  if (n === 0) return '<span class="etiqueta c-amarelo">vence hoje</span>';
  if (n === 1) return '<span class="etiqueta c-amarelo">vence amanhã</span>';
  if (n <= 3) return '<span class="etiqueta c-amarelo">vence em ' + n + " dias</span>";
  return "";
}

function montarCampanhas() {
  $("#aba-campanhas").innerHTML =
    '<div class="numeros" id="kNumeros"></div>' +
    '<div class="ferramentas">' +
      '<div class="pilulas" id="kFiltro">' + [["todas", "Todas"], ["ativas", "Ativas"], ["finalizadas", "Finalizadas"]]
        .map(f => '<button type="button" data-f="' + f[0] + '"' + (f[0] === filtroCamp ? ' class="ativo"' : "") + ">" + f[1] + "</button>").join("") + "</div>" +
      '<input class="entrada" id="kBusca" type="search" placeholder="Buscar trabalho ou cliente">' +
      '<span class="mudo pequeno" id="kConta"></span><span class="espaco"></span>' +
      '<button class="btn btn--linha" id="kCsv">' + ic("baixar") + " Baixar CSV</button>" +
      '<button class="btn" id="kNova">' + ic("mais") + " Novo contrato</button>" +
    "</div>" +
    '<div class="tabela-caixa"><table class="tabela"><thead><tr id="kCab"></tr></thead><tbody id="kCorpo"></tbody></table></div>' +
    '<p class="mudo pequeno" id="kCambio" style="margin-top:8px"></p>';

  $("#kFiltro").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    filtroCamp = b.dataset.f;
    $$("#kFiltro button").forEach(x => x.classList.toggle("ativo", x === b));
    desenharCampanhas();
  });
  $("#kBusca").addEventListener("input", desenharCampanhas);
  $("#kNova").addEventListener("click", () => editorCampanha());
  $("#kCab").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-k]");
    if (!th) return;
    ordemCamp = ordemCamp.k === th.dataset.k ? { k: th.dataset.k, dir: -ordemCamp.dir } : { k: th.dataset.k, dir: 1 };
    desenharCampanhas();
  });
  $("#kCorpo").addEventListener("click", async (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    const c = D.campanhas.find(x => x.id === tr.dataset.id);
    if (!c) return;
    if (e.target.closest("[data-estrela]")) {
      const salvo = await salvarLinha("campanhas", { favorita: !c.favorita }, c.id);
      if (salvo) { troca(D.campanhas, salvo); desenharCampanhas(); }
      return;
    }
    editorCampanha(c);
  });
  $("#kCsv").addEventListener("click", () => {
    if (!D.campanhas.length) { torrada("Ainda não tem nenhum contrato para baixar."); return; }
    baixarCSV("contratos", ["Favorita", "Trabalho", "Cliente", "Tipo", "Gift", "Nicho", "Status", "Qtd", "Moeda", "Valor", "Recebido", "A receber", "Valor em CA$",
        "Data do contrato", "Prazo de entrega", "Vencimento", "Pagamento", "Recebido por", "Por onde fechei", "Detalhe", "Situação"],
      D.campanhas.slice().sort(comparaCamp).map(c => {
        const m = moedaDe(c), rec = recebidoDe(c), cad = emCAD(c.valor, m);
        return [c.favorita ? "sim" : "", c.campanha, c.cliente, c.tipo, c.gift ? "sim" : "", c.nicho, c.status, Number(c.qtd) || 0, m, Number(c.valor) || 0, rec,
          Math.max(0, (Number(c.valor) || 0) - rec), cad == null ? "" : Math.round(cad * 100) / 100,
          dataBR(c.data_contrato), dataBR(c.prazo), dataBR(c.vencimento), situacaoPagamento(c)[0],
          Array.from(new Set((c.pagamentos || []).map(p => p.via).filter(Boolean))).join(", "),
          canalDe(c.canal) ? canalDe(c.canal)[1].replace(/^\S+\s/, "") : "", c.canal_detalhe, c.ativa === false ? "Finalizada" : "Ativa"];
      }));
  });
  carregaCambio().then(() => { desenharCampanhas(); if (typeof desenharFunil === "function") desenharFunil(); });
}

function desenharCampanhas() {
  const todas = D.campanhas;
  const ativas = todas.filter(c => c.ativa !== false);
  const pagas = todas.filter(c => !c.gift);
  const total = somaMoedas(pagas, c => c.valor);
  const receber = somaMoedas(pagas, c => Math.max(0, (Number(c.valor) || 0) - recebidoDe(c)));
  const recebido = somaMoedas(pagas, c => recebidoDe(c));
  const videos = soma(pagas, c => c.qtd);
  const fmt = (s) => s.soCAD || !s.completo ? (s.partes.join(" · ") || dinheiroEm(0, "CAD")) : dinheiroEm(s.total, "CAD");
  const sub = (s, extra) => [(!s.soCAD && s.completo && s.partes.length) ? s.partes.join(" · ") : "", extra].filter(Boolean).join(" · ");
  const gifts = todas.length - pagas.length;
  $("#kNumeros").innerHTML =
    numero("Contratos", inteiro(todas.length), gifts ? plural(gifts, "gift", "gifts") : "") +
    numero("Ativos", inteiro(ativas.length)) +
    numero("Valor total", fmt(total), sub(total, videos > 0 && total.completo ? "ticket por vídeo: " + dinheiroEm(total.total / videos, "CAD") : "")) +
    numero("A receber", fmt(receber), sub(receber, "já recebido: " + fmt(recebido)));
  $("#kCambio").textContent = cambioData && Object.keys(cambio).length > 1
    ? "Totais convertidos para CA$ pela cotação de " + dataBR(cambioData) + ": US$ 1 = CA$ " + numBR.format(cambio.USD) + " · € 1 = CA$ " + numBR.format(cambio.EUR) + "."
    : (todas.some(c => moedaDe(c) !== "CAD") ? "Sem cotação agora: os totais aparecem separados por moeda." : "");

  $("#kCab").innerHTML = COLUNAS.map(col => {
    const ativa = ordemCamp.k === col.k;
    const seta = ativa ? (ordemCamp.dir === 1 ? "▲" : "▼") : "↕";
    return '<th class="ordena' + (ativa ? " th-ativa" : "") + (col.num ? " num" : "") + '" data-k="' + col.k + '" title="Ordenar por ' + esc(col.titulo || col.rot) + '">' +
      (col.tipo === "fav" ? ic("estrela") : esc(col.rot)) + '<span class="seta">' + seta + "</span></th>";
  }).join("");

  const busca = normaliza($("#kBusca").value.trim());
  const lista = todas.filter(c =>
    (filtroCamp === "todas" || (filtroCamp === "ativas" ? c.ativa !== false : c.ativa === false)) &&
    (!busca || normaliza((c.campanha || "") + " " + (c.cliente || "")).includes(busca))).sort(comparaCamp);
  $("#kConta").textContent = lista.length === todas.length ? plural(todas.length, "contrato", "contratos") : lista.length + " de " + todas.length;

  const corpo = $("#kCorpo");
  if (!lista.length) {
    corpo.innerHTML = '<tr><td colspan="10"><p class="vazio">' +
      (falhou.campanhas ? "Os contratos não puderam ser carregados. Veja o aviso lá em cima." : todas.length ? "Nenhum contrato com esse filtro." : "Nenhum contrato ainda. Clique em Novo contrato.") + "</p></td></tr>";
    return;
  }
  corpo.innerHTML = lista.map(c => {
    const m = moedaDe(c), pag = situacaoPagamento(c), canal = canalDe(c.canal), rec = recebidoDe(c);
    return '<tr class="clica' + (c.favorita ? " favorita" : "") + '" data-id="' + esc(c.id) + '">' +
      '<td class="curta"><button type="button" class="btn--icone estrela' + (c.favorita ? " ligada" : "") + '" data-estrela aria-label="' + (c.favorita ? "Tirar destaque" : "Destacar") + '">' + ic("estrela") + "</button></td>" +
      "<td><b>" + esc(c.campanha || "") + "</b>" + pilExemplo(c) + (c.nicho ? '<div class="mudo pequeno">' + esc(c.nicho) + "</div>" : "") + "</td>" +
      "<td>" + esc(c.cliente || "") + "</td>" +
      "<td>" + (c.tipo ? '<span class="pil ' + (COR_TIPO[c.tipo] || "c-cinza") + '">' + esc(c.tipo) + "</span>" : "") + "</td>" +
      "<td>" + (c.status ? '<span class="pil ' + (COR_STATUS[c.status] || "c-cinza") + '">' + esc(c.status) + "</span>" : "") + "</td>" +
      '<td class="num">' + inteiro(c.qtd) + "</td>" +
      '<td class="num">' + (c.gift ? '<span class="mudo">gift</span>' : dinheiroEm(c.valor, m) +
        (rec > 0 && rec < (Number(c.valor) || 0) ? '<div class="mudo pequeno">recebido ' + dinheiroEm(rec, m) + "</div>" : "")) + "</td>" +
      '<td style="white-space:nowrap">' + dataBR(c.prazo) + avisoPrazo(c) + "</td>" +
      '<td><span class="pil ' + pag[1] + '">' + pag[0] + "</span>" +
        (pag[0] !== "Pago" && !c.gift && c.vencimento ? '<div class="mudo pequeno">previsto ' + dataBR(c.vencimento) + "</div>" : "") + "</td>" +
      "<td>" + (canal ? '<span class="pil ' + canal[2] + '">' + esc(canal[1]) + "</span>" + (c.canal_detalhe ? '<div class="mudo pequeno">' + esc(c.canal_detalhe) + "</div>" : "") : "") + "</td></tr>";
  }).join("");
}

/* ----- o contrato: janela própria, por causa dos pagamentos em partes ----- */
function editorCampanha(c) {
  const v = c ? Object.assign({}, c) : { tipo: "Conteúdo", status: "Briefing", qtd: 1, valor: 0, moeda: "CAD", pagamentos: [], ativa: true, favorita: false, gift: false, data_contrato: isoLocal(new Date()) };
  let pagamentos = (Array.isArray(v.pagamentos) ? v.pagamentos : []).map(p => Object.assign({}, p));
  const opc = (lista, atual) => lista.map(o => { const [val, rot] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(val) + '"' + (String(val) === String(atual) ? " selected" : "") + ">" + esc(rot) + "</option>"; }).join("");
  const j = abrirJanela({
    titulo: c ? "✏️ Editar contrato" : "📝 Novo contrato", larga: true,
    corpo: '<form class="grade-form contrato" novalidate>' +
      '<div class="campo inteiro"><label for="cCliente">Marca / cliente *</label><input id="cCliente" name="cliente" list="cClientes" value="' + esc(v.cliente || "") + '" placeholder="Ex.: Roborock" autocomplete="off">' +
        '<datalist id="cClientes">' + nomesDeMarcas().map(n => '<option value="' + esc(n) + '">').join("") + "</datalist></div>" +
      '<div class="campo inteiro"><label for="cTrabalho">Descrição do trabalho *</label><input id="cTrabalho" name="campanha" value="' + esc(v.campanha || "") + '" placeholder="Ex.: 3 Reels + 5 stories" autocomplete="off"></div>' +
      '<label class="campo campo--check inteiro"><input type="checkbox" name="gift"' + (v.gift ? " checked" : "") + "> 🎁 Colaboração gift (produto, sem pagamento): só conta como trabalho feito</label>" +
      '<div class="campo"><label>Tipo</label><select name="tipo">' + opc(["Conteúdo", "Publicidade"], v.tipo) + "</select></div>" +
      '<div class="campo"><label>Status</label><select name="status">' + opc(FUNIL, v.status) + "</select></div>" +
      '<div class="campo"><label>Quantidade de vídeos</label><input type="number" name="qtd" min="0" step="1" value="' + esc(v.qtd == null ? 1 : v.qtd) + '"></div>' +
      '<div class="campo"><label>Nicho</label><input name="nicho" list="cNichos" value="' + esc(v.nicho || "") + '" placeholder="Skincare, Haircare..." autocomplete="off"><datalist id="cNichos">' + B_NICHOS.map(n => '<option value="' + esc(n) + '">').join("") + "</datalist></div>" +
      '<div class="contrato__dinheiro inteiro">' +
        '<div class="grade-form">' +
          '<div class="campo"><label>Moeda</label><select name="moeda">' + opc(Object.entries(MOEDAS).map(([k, s]) => [k, k + " · " + s]), moedaDe(v)) + "</select></div>" +
          '<div class="campo"><label>Valor total do contrato *</label><input type="number" name="valor" min="0" step="0.01" value="' + esc(v.valor == null ? 0 : v.valor) + '"></div>' +
        "</div>" +
        '<div class="rotulo" style="margin-top:12px">Pagamentos recebidos</div>' +
        '<p class="mudo pequeno">Ex.: 50% na assinatura + 50% na entrega. Cada linha guarda a data em que você recebeu e por onde.</p>' +
        '<div id="cPags"></div>' +
        '<button type="button" class="btn btn--linha btn--full" id="cMaisPag" style="margin-top:8px">' + ic("mais") + " Adicionar pagamento</button>" +
        '<div class="contrato__saldo" id="cSaldo"></div>' +
      "</div>" +
      '<div class="campo"><label>Data do contrato</label><input type="date" name="data_contrato" value="' + esc(v.data_contrato || "") + '"></div>' +
      '<div class="campo"><label>Prazo de entrega</label><input type="date" name="prazo" value="' + esc(v.prazo || "") + '"></div>' +
      '<div class="campo"><label>Vencimento (previsão do restante)</label><input type="date" name="vencimento" value="' + esc(v.vencimento || "") + '"></div>' +
      '<div class="campo"><label>Por onde fechei</label><select name="canal"><option value="">escolha</option>' + opc(CANAIS.map(x => [x[0], x[1]]), v.canal) + "</select></div>" +
      '<div class="campo inteiro" id="cDetalheCampo"><label id="cDetalheRot">Detalhe</label><input name="canal_detalhe" value="' + esc(v.canal_detalhe || "") + '" placeholder="Ex.: InSense, Billo, agência..." list="cPlataformas" autocomplete="off">' +
        '<datalist id="cPlataformas">' + ["InSense", "Billo", "JoinBrands", "Collabstr", "Trend.io", "Upfluence"].map(n => '<option value="' + n + '">').join("") + "</datalist></div>" +
      '<label class="campo campo--check inteiro"><input type="checkbox" name="ativa"' + (v.ativa !== false ? " checked" : "") + "> Contrato ativo (desmarque quando finalizar)</label>" +
      '<label class="campo campo--check inteiro"><input type="checkbox" name="favorita"' + (v.favorita ? " checked" : "") + "> ⭐ Destacar com estrela</label>" +
      '<div class="faixa inteiro escondido" data-erro></div>' +
    "</form>",
    rodape: (c ? '<button class="btn btn--perigo" type="button" data-apagar>' + ic("lixo") + " Apagar</button>" : "") +
      '<span class="espaco"></span><button class="btn btn--linha" type="button" data-fechar>Cancelar</button>' +
      '<button class="btn" type="button" data-salvar>' + (c ? "Salvar" : "Adicionar") + "</button>"
  });
  const form = $("form", j);
  const erro = (t) => { const e = $("[data-erro]", j); e.textContent = t; e.classList.remove("escondido"); };

  function lerPags() {
    $$("[data-pag]", j).forEach((l, i) => {
      pagamentos[i] = { valor: Number($("[data-pv]", l).value) || 0, data: $("[data-pd]", l).value || null, via: $("[data-pvia]", l).value };
    });
  }
  function desenhaPags() {
    const m = form.elements.moeda.value;
    $("#cPags", j).innerHTML = pagamentos.length
      ? pagamentos.map((p, i) => '<div class="contrato__pag" data-pag>' +
          '<input type="number" min="0" step="0.01" data-pv value="' + esc(p.valor || "") + '" placeholder="Valor (' + MOEDAS[m] + ')" aria-label="Valor recebido">' +
          '<input type="date" data-pd value="' + esc(p.data || "") + '" aria-label="Data em que recebeu">' +
          '<select data-pvia aria-label="Recebido por">' + opc(VIAS, p.via || "PayPal") + "</select>" +
          '<button type="button" class="btn--icone" data-tirar="' + i + '" aria-label="Tirar este pagamento">' + ic("fechar") + "</button></div>").join("")
      : '<p class="mudo pequeno" style="padding:6px 0">Nenhum pagamento ainda. Clique em "Adicionar pagamento" quando receber.</p>';
    saldo();
  }
  function saldo() {
    lerPags();
    const m = form.elements.moeda.value, total = Number(form.elements.valor.value) || 0, rec = soma(pagamentos, p => p.valor);
    $("#cSaldo", j).innerHTML = form.elements.gift.checked
      ? "🎁 Gift: sem valores a receber."
      : '<span class="c-verde" style="color:var(--c)">recebido <b>' + dinheiroEm(rec, m) + '</b></span><span class="c-mostarda" style="color:var(--c)">a receber <b>' + dinheiroEm(Math.max(0, total - rec), m) + "</b></span>";
  }
  function detalhe() {
    const canal = form.elements.canal.value;
    $("#cDetalheRot", j).textContent = canal === "plataforma" ? "Qual plataforma?" : canal === "indicacao" ? "Quem indicou?" : "Detalhe (opcional)";
  }
  desenhaPags(); detalhe();
  $("#cMaisPag", j).addEventListener("click", () => {
    lerPags();
    const total = Number(form.elements.valor.value) || 0, rec = soma(pagamentos, p => p.valor);
    pagamentos.push({ valor: total > rec ? Math.round((total - rec) * 100) / 100 : "", data: isoLocal(new Date()), via: (pagamentos[pagamentos.length - 1] || {}).via || "PayPal" });
    desenhaPags();
  });
  $("#cPags", j).addEventListener("click", (e) => { const b = e.target.closest("[data-tirar]"); if (b) { lerPags(); pagamentos.splice(Number(b.dataset.tirar), 1); desenhaPags(); } });
  $("#cPags", j).addEventListener("input", saldo);
  form.addEventListener("input", (e) => { if (e.target.name === "valor" || e.target.name === "gift") saldo(); });
  form.elements.moeda.addEventListener("change", desenhaPags);
  form.elements.canal.addEventListener("change", detalhe);

  $("[data-salvar]", j).addEventListener("click", async () => {
    lerPags();
    const f = form.elements;
    const dados = {
      cliente: f.cliente.value.trim() || null,
      campanha: f.campanha.value.trim(),
      gift: f.gift.checked,
      tipo: f.tipo.value, status: f.status.value,
      qtd: Math.max(0, Math.round(Number(f.qtd.value) || 0)),
      nicho: f.nicho.value.trim() || null,
      moeda: f.moeda.value,
      valor: f.gift.checked ? 0 : Math.max(0, Number(f.valor.value) || 0),
      pagamentos: f.gift.checked ? [] : pagamentos.filter(p => Number(p.valor) > 0).map(p => ({ valor: Math.round(Number(p.valor) * 100) / 100, data: p.data, via: p.via })),
      data_contrato: f.data_contrato.value || null, prazo: f.prazo.value || null, vencimento: f.vencimento.value || null,
      canal: f.canal.value || null, canal_detalhe: f.canal_detalhe.value.trim() || null,
      ativa: f.ativa.checked, favorita: f.favorita.checked
    };
    if (!dados.cliente) { erro('Preencha "Marca / cliente".'); return; }
    if (!dados.campanha) { erro('Preencha "Descrição do trabalho".'); return; }
    if (!dados.gift && !(dados.valor > 0)) { erro("Preencha o valor total do contrato, ou marque 🎁 gift."); return; }
    const rec = soma(dados.pagamentos, p => p.valor);
    if (rec > dados.valor + 0.005 && !dados.gift) { erro("Os pagamentos somam mais que o valor total. Confira os valores."); return; }
    dados.pagamento = dados.gift || (dados.valor > 0 && rec >= dados.valor - 0.005) ? "pago" : "pendente";
    const b = $("[data-salvar]", j); b.disabled = true; b.textContent = "Salvando...";
    const salvo = await salvarLinha("campanhas", dados, c && c.id);
    if (!salvo) { b.disabled = false; b.textContent = c ? "Salvar" : "Adicionar"; return; }
    if (c) troca(D.campanhas, salvo); else D.campanhas.unshift(salvo);
    fecharJanela();
    desenharCampanhas(); desenharCalendario(); if (typeof desenharFunil === "function") desenharFunil();
    torrada(c ? "Contrato salvo ✓" : "🎉 Contrato adicionado!");
  });
  if (c) duploClique($("[data-apagar]", j), async () => {
    if (!(await apagarLinha("campanhas", c.id))) return;
    D.campanhas = D.campanhas.filter(x => x.id !== c.id);
    fecharJanela();
    desenharCampanhas(); desenharCalendario(); if (typeof desenharFunil === "function") desenharFunil();
    torrada("Contrato apagado.");
  });
}

/* ============================================================
   9. ABA CHECKLIST PORTFÓLIO (conteúdo da js/biblioteca.js)
   ============================================================ */
const B = window.Biblioteca;
let subaba = "checklist";

function sanfona({ emoji, titulo, sub, direita, corpo, aberta, attrs }) {
  return '<details class="sanfona"' + (aberta ? " open" : "") + (attrs || "") + "><summary>" +
    (emoji ? '<span class="emoji">' + esc(emoji) + "</span>" : "") +
    '<div class="sanfona__txt"><div class="sanfona__tit">' + esc(titulo) + "</div>" + (sub ? '<div class="sanfona__sub">' + esc(sub) + "</div>" : "") + "</div>" +
    (direita || "") + '<span class="chevron">' + ic("baixo") + "</span></summary>" +
    '<div class="sanfona__corpo">' + corpo + "</div></details>";
}
const blocosDeTempo = (lista) => '<div class="blocos">' + (lista || []).map(b =>
  '<div class="blocos__linha"><span class="blocos__t">' + esc(b.t) + "</span><span>" + comDestaque(b.o) + "</span></div>").join("") + "</div>";

/* capa vertical do YouTube; se não carregar, fica o fundo colorido com o emoji */
function capaRef(r) {
  const id = idYoutube(r.youtube);
  if (!id) return "";
  const base = "https://i.ytimg.com/vi/" + id + "/";
  return '<img class="ref__img" src="' + base + 'oardefault.jpg" alt="" loading="lazy" decoding="async"' +
    ' onload="if(this.naturalWidth<400&&!this.dataset.passo){this.dataset.passo=1;this.src=\'' + base + 'maxresdefault.jpg\'}else{this.parentNode.classList.add(\'com-capa\')}"' +
    ' onerror="if(!this.dataset.passo){this.dataset.passo=1;this.src=\'' + base + 'hqdefault.jpg\'}else{this.remove()}">';
}

function montarChecklist() {
  const el = $("#aba-checklist");
  if (!B) {
    el.innerHTML = '<p class="vazio">Não encontrei o arquivo js/biblioteca.js, então o conteúdo do checklist não pode aparecer. O resto do painel funciona normalmente.</p>';
    aviso("biblioteca", "O arquivo js/biblioteca.js não carregou. A aba Checklist fica vazia até ele voltar.");
    return;
  }
  const SUBS = [["checklist", "Checklist do portfólio"], ["referencias", "Referências de vídeo"], ["roteiros", "Roteiros"], ["nichos", "Ideias por nicho"], ["revisar", "Revisar meu roteiro"]];
  const checklist = B.CHECKLIST || [], refs = B.REFERENCIAS || [], tipos = B.TIPOS || [], nichos = B.NICHOS || [], revisao = B.REVISAO || [];

  el.innerHTML =
    '<div class="subabas" id="sAbas">' + SUBS.map(s => '<button type="button" data-s="' + s[0] + '">' + s[1] + "</button>").join("") + "</div>" +

    /* 1. checklist */
    '<div data-painel="checklist">' +
      (falhou.marcados ? '<p class="faixa faixa--aviso" style="margin-bottom:12px">As marcações não estão sendo salvas no banco agora (veja o aviso lá em cima). Você pode marcar, mas some ao recarregar.</p>' : "") +
      '<div class="geral"><span id="sGeralTxt"></span><div class="progresso"><span id="sGeralBar"></span></div></div>' +
      checklist.map(s => sanfona({
        emoji: s.emoji, titulo: s.nome, sub: s.resumo, attrs: ' data-secao="' + esc(s.id) + '"',
        direita: '<div class="sanfona__prog"><div class="progresso"><span></span></div><span class="txt"></span></div>',
        corpo: '<div class="porque">' + esc(s.porque) + "</div>" + (s.itens || []).map((it, i) =>
          '<label class="item-check"><input type="checkbox" data-chave="' + esc("check:" + s.id + ":" + i) + '">' +
          '<div><div class="item-check__t">' + esc(it.t) + '</div><div class="item-check__d">' + esc(it.d) + "</div></div></label>").join("")
      })).join("") +
    "</div>" +

    /* 2. referências */
    '<div data-painel="referencias"><div class="cartoes">' + refs.map((r, i) =>
      '<button type="button" class="ref cor-' + esc(r.cor) + '" data-ref="' + i + '">' +
        '<div class="ref__capa">' + capaRef(r) + '<span class="ref__emoji">' + esc(r.emoji) + '</span><span class="ref__dur">' + esc(r.duracao) + "</span></div>" +
        '<div class="ref__info"><span class="ref__tit">' + esc(r.titulo) + '</span><span class="ref__meta">' + esc(r.estilo) + " · " + esc(r.marca) + "</span></div>" +
      "</button>").join("") + "</div></div>" +

    /* 3. roteiros */
    '<div data-painel="roteiros">' + tipos.map(t => sanfona({
      emoji: t.emoji, titulo: t.nome, sub: t.duracao,
      corpo: '<div class="ficha"><h3 style="margin-top:0">Quando usar</h3><p>' + esc(t.porque) + "</p>" +
             "<h3>Blocos de tempo</h3>" + blocosDeTempo(t.beats) +
             (t.erros && t.erros.length ? '<h3>Erros comuns</h3><ul class="lista-simples">' + t.erros.map(e => "<li>" + esc(e) + "</li>").join("") + "</ul>" : "") + "</div>"
    })).join("") + "</div>" +

    /* 4. ideias por nicho */
    '<div data-painel="nichos">' +
      (B.COMO_USAR && B.COMO_USAR.length ? '<div class="bloco ficha"><h3 style="margin-top:0">Como usar os ganchos</h3><ul class="lista-simples">' + B.COMO_USAR.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul></div>" : "") +
      nichos.map(n => sanfona({
        emoji: n.emoji, titulo: n.nome, sub: plural((n.ideias || []).length, "ideia", "ideias"),
        corpo: (n.ideias || []).map(x => '<div class="ideia"><div class="ideia__t">' + esc(x.t) + '</div><div class="ideia__g">' + esc(x.gancho) + "</div></div>").join("")
      })).join("") +
    "</div>" +

    /* 5. revisar */
    '<div data-painel="revisar"><div class="revisao">' +
      '<div><div class="bloco__cab"><h2>Cole o seu roteiro aqui</h2><button type="button" class="btn btn--linha" id="sLimpar">Começar outro roteiro</button></div>' +
      '<textarea id="sRoteiro" placeholder="Cole o roteiro e confira item por item ao lado."></textarea>' +
      '<p class="mudo pequeno" style="margin-top:6px">O texto e as marcações ficam guardados só neste navegador.</p></div>' +
      '<div><div class="geral"><span id="sRevTxt"></span><div class="progresso"><span id="sRevBar"></span></div></div>' +
      revisao.map((b, bi) => '<div class="bloco"><div class="bloco__cab"><h2><span class="emoji">' + esc(b.emoji) + "</span> " + esc(b.bloco) + "</h2></div>" +
        (b.itens || []).map((it, i) => '<label class="item-check"><input type="checkbox" data-rev="' + bi + ":" + i + '">' +
          '<div><div class="item-check__t">' + esc(it.t) + '</div><div class="item-check__d">' + esc(it.d) + "</div></div></label>").join("") + "</div>").join("") +
      "</div></div></div>";

  /* troca de sub-aba */
  const mostra = (s) => {
    subaba = s;
    $$("#sAbas button").forEach(b => b.classList.toggle("ativo", b.dataset.s === s));
    $$("[data-painel]", el).forEach(p => p.classList.toggle("escondido", p.dataset.painel !== s));
    try { localStorage.setItem("admin-subaba", s); } catch (e) {}
  };
  $("#sAbas").addEventListener("click", (e) => { const b = e.target.closest("button[data-s]"); if (b) mostra(b.dataset.s); });
  let salva = null;
  try { salva = localStorage.getItem("admin-subaba"); } catch (e) {}
  mostra(SUBS.some(s => s[0] === salva) ? salva : "checklist");

  /* marcar item do checklist: salva na tabela marcados */
  $$("[data-chave]", el).forEach(cx => { cx.checked = D.marcados.has(cx.dataset.chave); });
  $("[data-painel='checklist']", el).addEventListener("change", async (e) => {
    const cx = e.target.closest("[data-chave]");
    if (!cx) return;
    const chave = cx.dataset.chave;
    const marcar = cx.checked;
    if (marcar) D.marcados.add(chave); else D.marcados.delete(chave);
    progressoChecklist();
    if (falhou.marcados) return;
    try {
      const { error } = marcar
        ? await banco.from("marcados").upsert({ chave })
        : await banco.from("marcados").delete().eq("chave", chave);
      if (error) throw error;
    } catch (erro) {
      cx.checked = !marcar;
      if (marcar) D.marcados.delete(chave); else D.marcados.add(chave);
      progressoChecklist();
      torrada(traduzErro(erro, "marcados"), true);
    }
  });
  progressoChecklist();

  /* ficha da referência */
  $("[data-painel='referencias']", el).addEventListener("click", (e) => {
    const b = e.target.closest("[data-ref]");
    if (!b) return;
    const r = refs[Number(b.dataset.ref)];
    abrirJanela({
      titulo: r.emoji + " " + r.titulo, larga: true,
      corpo: '<div class="ficha">' +
        '<p class="mudo pequeno">' + esc([r.estilo, r.audiencia, r.duracao, r.marca].filter(Boolean).join(" · ")) + "</p>" +
        '<h3>Gancho</h3><p class="ficha__gancho">' + esc(r.gancho) + "</p>" +
        "<h3>Por que funciona</h3><p>" + esc(r.porque) + "</p>" +
        "<h3>O diferencial</h3><p>" + esc(r.diferencial) + "</p>" +
        "<h3>Erro comum</h3><p>" + esc(r.erro) + "</p>" +
        "<h3>Roteiro em blocos de tempo</h3>" + blocosDeTempo(r.roteiro) + "</div>",
      rodape: '<span class="espaco"></span>' + (r.youtube ? '<a class="btn" href="' + esc(r.youtube) + '" target="_blank" rel="noopener">' + ic("play") + " Assistir</a>" : "")
    });
  });

  /* revisar roteiro: fica só neste navegador */
  const area = $("#sRoteiro");
  try { area.value = localStorage.getItem("admin-roteiro") || ""; } catch (e) {}
  let marcadosRev = [];
  try { marcadosRev = JSON.parse(localStorage.getItem("admin-revisao") || "[]"); } catch (e) {}
  $$("[data-rev]", el).forEach(cx => { cx.checked = marcadosRev.includes(cx.dataset.rev); });
  const progressoRev = () => {
    const todos = $$("[data-rev]", el);
    const feitos = todos.filter(x => x.checked);
    todos.forEach(x => x.closest(".item-check").classList.toggle("feito", x.checked));
    const pct = todos.length ? Math.round(feitos.length / todos.length * 100) : 0;
    $("#sRevTxt").textContent = feitos.length + " de " + todos.length + " conferidos";
    $("#sRevBar").style.width = pct + "%";
    try { localStorage.setItem("admin-revisao", JSON.stringify(feitos.map(x => x.dataset.rev))); } catch (e) {}
  };
  area.addEventListener("input", () => { try { localStorage.setItem("admin-roteiro", area.value); } catch (e) {} });
  $("[data-painel='revisar']", el).addEventListener("change", (e) => { if (e.target.closest("[data-rev]")) progressoRev(); });
  duploClique($("#sLimpar"), async () => {
    area.value = "";
    $$("[data-rev]", el).forEach(x => { x.checked = false; });
    try { localStorage.removeItem("admin-roteiro"); } catch (e) {}
    progressoRev();
  }, "Clique de novo para limpar");
  progressoRev();
}

function progressoChecklist() {
  const el = $("#aba-checklist");
  let feitosTotal = 0, total = 0;
  $$("[data-secao]", el).forEach(sec => {
    const caixas = $$("[data-chave]", sec);
    const feitos = caixas.filter(c => c.checked).length;
    caixas.forEach(c => c.closest(".item-check").classList.toggle("feito", c.checked));
    feitosTotal += feitos; total += caixas.length;
    $(".sanfona__prog .progresso span", sec).style.width = (caixas.length ? Math.round(feitos / caixas.length * 100) : 0) + "%";
    $(".sanfona__prog .txt", sec).textContent = feitos + "/" + caixas.length;
  });
  const pct = total ? Math.round(feitosTotal / total * 100) : 0;
  $("#sGeralTxt").textContent = feitosTotal + " de " + total + " prontos · " + pct + "%";
  $("#sGeralBar").style.width = pct + "%";
}

/* ============================================================
   9b. ABA ROTEIROS
   Transcreve reels do Instagram, TikTok e YouTube pela Supadata
   e guarda numa biblioteca. A chave fica na tabela configuracoes,
   nunca no código.
   ============================================================ */
const SUPADATA = "https://api.supadata.ai/v1";
const CHAVE_SUPADATA = "supadata_api_key";
const FONTES = {
  instagram: { nome: "Instagram", emoji: "📸", cor: "c-roxo" },
  tiktok: { nome: "TikTok", emoji: "🎵", cor: "c-azul" },
  youtube: { nome: "YouTube", emoji: "▶️", cor: "c-vermelho" },
  manual: { nome: "Escrito na mão", emoji: "✍️", cor: "c-cinza" }
};
const QUEM = { minha: { nome: "Meu", cor: "c-destaque" }, outra: { nome: "De outra", cor: "c-verde" } };
const emAndamento = new Set();   /* linhas sendo transcritas nesta aba aberta */
let filtroQuem = "todos", filtroTag = null;
let saldo = null;                /* { plan, maxCredits, usedCredits } ou { erro } */

const espera = (ms) => new Promise(r => setTimeout(r, ms));

/* ----- o link: limpar, descobrir a fonte, o perfil e o vídeo ----- */
function fonteDe(url) {
  const u = String(url || "").toLowerCase();
  if (/(^|\.)instagram\.com\//.test(u)) return "instagram";
  if (/(^|\.)tiktok\.com\//.test(u)) return "tiktok";
  if (/youtube\.com\/|youtu\.be\//.test(u)) return "youtube";
  return null;
}
function limpaLink(bruto) {
  let t = String(bruto || "").trim();
  if (!/^https?:\/\//i.test(t)) return null;
  let u;
  try { u = new URL(t); } catch (e) { return null; }
  u.hash = "";
  const fonte = fonteDe(u.href);
  if (fonte === "instagram") {
    u.pathname = u.pathname.replace(/\/reels\//i, "/reel/");
    u.search = "";                              /* tira ?igsh=... e o resto */
  } else if (fonte === "tiktok") {
    u.search = "";
  } else if (fonte === "youtube") {
    const v = u.searchParams.get("v");
    u.search = v ? "?v=" + v : "";              /* fica só o que identifica o vídeo */
  } else {
    [...u.searchParams.keys()].forEach(k => { if (/^utm_/i.test(k) || k === "igsh") u.searchParams.delete(k); });
  }
  return u.href;
}
function perfilDe(url) {
  const ig = String(url || "").match(/instagram\.com\/([\w.]+)\/(?:reel|reels|p|tv)\//i);
  if (ig && !/^(reel|reels|p|tv|stories|explore)$/i.test(ig[1])) return ig[1];
  const tt = String(url || "").match(/tiktok\.com\/@([\w.]+)/i);
  return tt ? tt[1] : null;
}
function embedRoteiro(url) {
  const u = String(url || "");
  const ig = u.match(/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/i);
  if (ig) return { src: "https://www.instagram.com/" + (ig[1].toLowerCase() === "p" ? "p" : "reel") + "/" + ig[2] + "/embed" };
  const yt = idYoutube(u);
  if (yt) return { src: "https://www.youtube.com/embed/" + yt, deitado: /watch\?|youtu\.be\//.test(u) };
  const tt = u.match(/tiktok\.com\/.*\/video\/(\d+)/i);
  if (tt) return { src: "https://www.tiktok.com/embed/v2/" + tt[1] };
  return null;
}
const comArroba = (p) => p ? "@" + String(p).replace(/^@/, "") : "";

/* ----- conversa com a Supadata ----- */
async function supadata(caminho, enviar) {
  const chave = D.config[CHAVE_SUPADATA];
  const op = enviar
    ? { method: "POST", headers: { "x-api-key": chave, "Content-Type": "application/json" }, body: JSON.stringify(enviar) }
    : { headers: { "x-api-key": chave } };
  let r;
  try { r = await fetch(SUPADATA + caminho, op); }
  catch (e) { return { rede: true, status: 0, corpo: {} }; }
  let corpo = {};
  try { corpo = await r.json(); } catch (e) {}
  return { status: r.status, corpo: corpo || {} };
}
/* traduz a resposta de erro para uma frase simples */
function erroSupadata(res) {
  if (res.rede) return "Não consegui falar com o serviço de transcrição. Confira a sua internet e tente de novo.";
  const c = res.corpo || {};
  const cod = String(c.error || "").toLowerCase();
  const det = String(c.details || c.message || "").toLowerCase();
  if (res.status === 401 || res.status === 403 || cod === "unauthorized" || cod === "forbidden")
    return "A chave da Supadata não foi aceita. Confira se você copiou ela inteira, no campo Chave da Supadata aqui em cima.";
  if (res.status === 429 || cod === "limit-exceeded") {
    if (det.includes("plan")) return "Acabaram os créditos deste mês na Supadata. Eles voltam sozinhos no próximo ciclo, ou dá para aumentar o plano no site deles.";
    if (det.includes("rate")) return "Foram muitos pedidos seguidos. Espere 1 minuto e tente de novo.";
    return "A Supadata pediu uma pausa. Espere 1 minuto e tente de novo.";
  }
  if (res.status === 402 || cod === "upgrade-required") return "Esse vídeo só pode ser transcrito num plano pago da Supadata.";
  if (res.status === 404 || res.status === 400 || cod === "not-found" || cod === "invalid-request")
    return "Não consegui abrir esse vídeo. Confira se o link está certo e se o perfil é público.";
  if (res.status >= 500) return "O serviço de transcrição teve um problema do lado deles. Tente de novo daqui a alguns minutos.";
  return "A transcrição não deu certo. Tente de novo daqui a pouco.";
}
const SEM_FALA = "Não achei fala nesse vídeo. Costuma ser reel só com música ou só com texto na tela.";
/* tira o texto da resposta, venha como texto ou como lista de trechos */
function textoDe(corpo) {
  const c = corpo && corpo.content;
  if (typeof c === "string") return { texto: c.trim(), segmentos: null };
  if (Array.isArray(c)) return { texto: c.map(x => x && x.text ? x.text : "").join(" ").replace(/\s+/g, " ").trim(), segmentos: c };
  return { texto: "", segmentos: null };
}

async function atualizaSaldo() {
  if (!D.config[CHAVE_SUPADATA]) { saldo = null; desenharChave(); return; }
  const r = await supadata("/me");
  saldo = r.status === 200 ? r.corpo : { erro: erroSupadata(r) };
  desenharChave();
}

/* ----- a tela ----- */
function montarRoteiros() {
  const el = $("#aba-roteiros");
  el.innerHTML =
    '<p class="rot__frase">Cole o link de um reel e eu transcrevo. Serve pros seus e pros das outras, com etiqueta pra você separar.</p>' +
    '<details class="sanfona rot__chave" id="rChave"><summary><span class="emoji">🔑</span><div class="sanfona__txt"><div class="sanfona__tit">Chave da Supadata</div>' +
      '<div class="sanfona__sub" id="rChaveResumo"></div></div><span class="chevron">' + ic("baixo") + "</span></summary>" +
      '<div class="sanfona__corpo" id="rChaveCorpo"></div></details>' +
    '<div class="rot__barra">' +
      '<input class="entrada" id="rLink" type="url" placeholder="Cole aqui: instagram.com/reel/... · tiktok.com/... · youtube.com/..." autocomplete="off">' +
      '<select class="entrada entrada--sel" id="rQuem"><option value="outra">De outra pessoa</option><option value="minha">Meu</option></select>' +
      '<button class="btn" id="rTranscrever">🎧 Transcrever</button>' +
      '<button class="btn btn--linha" id="rMao">+ Escrever na mão</button>' +
    "</div>" +
    '<div id="rAviso" class="rot__aviso escondido" role="status" aria-live="polite"></div>' +
    '<div class="bloco__cab rot__bibcab"><h2>📚 Biblioteca</h2><span class="mudo pequeno" id="rConta"></span>' +
      '<button class="btn btn--linha" id="rEstudar">🧠 Estudar com o Claude</button></div>' +
    '<div class="ferramentas"><input class="entrada" id="rBusca" type="search" placeholder="Buscar na transcrição, perfil, título ou notas"></div>' +
    '<div class="rot__chips" id="rChips"></div>' +
    '<div class="rot__cartoes" id="rCartoes"></div>';

  $("#rTranscrever").addEventListener("click", clicouTranscrever);
  $("#rLink").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clicouTranscrever(); } });
  $("#rMao").addEventListener("click", () => {
    const limpo = limpaLink($("#rLink").value);
    editorRoteiro(null, { url: limpo || null, de_quem: $("#rQuem").value, perfil: perfilDe(limpo) });
  });
  $("#rBusca").addEventListener("input", desenharRoteiros);
  $("#rChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-chip]");
    if (!b) return;
    const [tipo, valor] = [b.dataset.chip, b.dataset.valor];
    if (tipo === "quem") filtroQuem = valor;
    else filtroTag = filtroTag === valor ? null : valor;
    desenharRoteiros();
  });
  $("#rEstudar").addEventListener("click", estudarComClaude);
  $("#rCartoes").addEventListener("click", cliqueNoCartao);

  if (falhou.configuracoes) aviso("rot-config", "Sem a tabela configuracoes, a chave da Supadata não pode ser guardada. Rode o sql-roteiros.sql no Supabase.");
  desenharChave();
  desenharRoteiros();
  atualizaSaldo();
}

function mostraAviso(tipo, html) {
  const a = $("#rAviso");
  if (!html) { a.classList.add("escondido"); a.innerHTML = ""; return; }
  a.className = "rot__aviso rot__aviso--" + tipo;
  a.innerHTML = html;
}

/* ----- bloco da chave ----- */
function desenharChave() {
  const chave = D.config[CHAVE_SUPADATA];
  const fim = chave ? String(chave).slice(-4) : "";
  let resumo;
  if (!chave) resumo = "Nenhuma chave salva ainda. Sem ela eu não consigo transcrever.";
  else if (!saldo) resumo = "Chave salva, terminando em " + fim + ". Conferindo o saldo...";
  else if (saldo.erro) resumo = "Chave terminando em " + fim + ". " + saldo.erro;
  else {
    const usados = Number(saldo.usedCredits) || 0, max = Number(saldo.maxCredits) || 0;
    resumo = "Chave terminando em " + fim + " · " + inteiro(usados) + " de " + inteiro(max) + " créditos usados este mês" + (saldo.plan ? " · plano " + saldo.plan : "");
  }
  $("#rChaveResumo").textContent = resumo;
  $("#rChaveCorpo").innerHTML =
    '<div class="rot__chavelinha"><input class="entrada" id="rChaveCampo" type="password" autocomplete="off" placeholder="' +
      (chave ? "Salva: ••••" + esc(fim) + ". Cole outra para trocar." : "Cole aqui a sua API key da Supadata") + '">' +
    '<button class="btn" id="rChaveSalvar">Salvar chave</button></div>' +
    '<p class="mudo pequeno" style="margin-top:8px">Não tem chave? Crie uma conta grátis em <a class="link" href="https://supadata.ai" target="_blank" rel="noopener">supadata.ai</a> ' +
    "(100 créditos por mês, sem cartão), copie a API key no painel deles e cole aqui. Ela fica guardada no seu banco, só você vê, e funciona em qualquer computador em que você entrar.</p>";
  if (!chave) $("#rChave").open = true;
  $("#rChaveSalvar").addEventListener("click", salvarChave);
  $("#rChaveCampo").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); salvarChave(); } });
}

async function salvarChave() {
  const nova = $("#rChaveCampo").value.trim();
  if (!nova) { torrada("Cole a chave no campo antes de salvar."); return; }
  const b = $("#rChaveSalvar");
  b.disabled = true; b.textContent = "Conferindo...";
  const antiga = D.config[CHAVE_SUPADATA];
  D.config[CHAVE_SUPADATA] = nova;
  const teste = await supadata("/me");
  if (teste.status === 401 || teste.status === 403) {
    D.config[CHAVE_SUPADATA] = antiga;
    b.disabled = false; b.textContent = "Salvar chave";
    torrada("A Supadata não aceitou essa chave. Confira se copiou ela inteira.", true);
    return;
  }
  try {
    const { error } = await banco.from("configuracoes").upsert({ chave: CHAVE_SUPADATA, valor: nova });
    if (error) throw error;
  } catch (e) {
    D.config[CHAVE_SUPADATA] = antiga;
    b.disabled = false; b.textContent = "Salvar chave";
    torrada(traduzErro(e, "configuracoes"), true);
    return;
  }
  saldo = teste.status === 200 ? teste.corpo : null;
  $("#rChave").open = false;
  desenharChave();
  if (!saldo) atualizaSaldo();
  torrada("Chave salva ✓");
  mostraAviso(null);
}

/* ----- biblioteca ----- */
function desenharRoteiros() {
  const todas = D.roteiros;
  const tags = Array.from(new Set(todas.flatMap(r => Array.isArray(r.tags) ? r.tags : []))).sort((a, b) => a.localeCompare(b, "pt"));
  if (filtroTag && !tags.includes(filtroTag)) filtroTag = null;
  const chip = (tipo, valor, rotulo, ativo) => '<button type="button" class="rot__chip' + (ativo ? " ativo" : "") + '" data-chip="' + tipo + '" data-valor="' + esc(valor) + '">' + rotulo + "</button>";
  $("#rChips").innerHTML =
    chip("quem", "todos", "Todos", filtroQuem === "todos") +
    chip("quem", "minha", "🙋‍♀️ Meus", filtroQuem === "minha") +
    chip("quem", "outra", "👀 De outras", filtroQuem === "outra") +
    tags.map(t => chip("tag", t, "#" + esc(t), filtroTag === t)).join("");

  const busca = normaliza($("#rBusca").value.trim());
  const lista = todas.filter(r =>
    (filtroQuem === "todos" || r.de_quem === filtroQuem) &&
    (!filtroTag || (r.tags || []).includes(filtroTag)) &&
    (!busca || normaliza([r.transcricao, r.perfil, r.titulo, r.obs, r.legenda, (r.tags || []).join(" ")].join(" ")).includes(busca)));
  $("#rConta").textContent = lista.length === todas.length ? plural(todas.length, "roteiro", "roteiros") : lista.length + " de " + todas.length;

  const alvo = $("#rCartoes");
  if (falhou.roteiros) { alvo.innerHTML = '<p class="vazio">A biblioteca não pôde ser carregada. Veja o aviso lá em cima.</p>'; return; }
  if (!lista.length) {
    alvo.innerHTML = '<p class="vazio">' + (todas.length ? "Nada encontrado com esse filtro." : "📭 A biblioteca está vazia.<br>Cole o link de um reel lá em cima e clique em Transcrever.") + "</p>";
    return;
  }
  alvo.innerHTML = lista.map(cartaoRoteiro).join("");
}

function cartaoRoteiro(r) {
  const fonte = FONTES[r.fonte] || FONTES.manual;
  const quem = QUEM[r.de_quem] || QUEM.outra;
  const yt = idYoutube(r.url);
  const emb = embedRoteiro(r.url);
  const imagem = r.capa || (yt ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg" : "");
  const capa = '<div class="rot__capa">' + '<span class="rot__capa-emoji">' + fonte.emoji + "</span>" +
    (imagem ? '<img class="rot__capa-img" src="' + esc(imagem) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "") +
    (emb ? '<button type="button" class="rot__ver" data-ver>▶ ver vídeo</button>' : "") + "</div>";
  const quando = r.postado_em ? "postado " + dataBR(r.postado_em) : "salvo " + dataBR(String(r.created_at || "").slice(0, 10));

  let meio;
  if (r.status === "processando") {
    meio = '<div class="rot__estado"><span class="rot__relogio" aria-hidden="true">⏳</span> ' +
      (emAndamento.has(r.id)
        ? "Transcrevendo... pode continuar usando o painel."
        : 'Ficou pela metade, a página foi fechada antes de terminar. <button type="button" class="btn btn--linha" data-denovo>🔄 Tentar de novo</button>') + "</div>";
  } else if (r.status === "falhou") {
    meio = '<div class="rot__estado rot__estado--falhou">⚠️ ' + esc(r.erro || "A transcrição não deu certo.") +
      '<div class="rot__estado-botoes"><button type="button" class="btn btn--linha" data-abrir>📝 Abrir mesmo assim</button>' +
      (r.url ? '<button type="button" class="btn btn--linha" data-denovo>🔄 Tentar de novo</button>' : "") + "</div></div>";
  } else {
    meio = (r.gancho ? '<p class="rot__gancho">🪝 ' + esc(r.gancho) + "</p>" : "") +
      (r.transcricao ? '<p class="rot__texto">' + esc(r.transcricao) + "</p>" : '<p class="rot__texto mudo">Sem transcrição ainda.</p>');
  }

  return '<article class="rot__cartao" data-id="' + esc(r.id) + '">' + capa +
    '<div class="rot__info">' +
      '<h3 class="rot__titulo">' + esc(r.titulo || "Sem título") + "</h3>" +
      '<div class="rot__meta">' +
        (r.perfil ? '<span class="rot__perfil">' + esc(comArroba(r.perfil)) + "</span>" : "") +
        '<span class="pil ' + quem.cor + '">' + quem.nome + "</span>" +
        '<span class="pil ' + fonte.cor + '">' + fonte.emoji + " " + fonte.nome + "</span>" +
        (r.tags || []).map(t => '<span class="rot__tag">#' + esc(t) + "</span>").join("") +
        '<span class="mudo pequeno">' + quando + "</span>" +
      "</div>" + linhaMetricas(r) + meio +
      '<div class="rot__acoes">' +
        (r.status === "pronto" && r.transcricao ? '<button type="button" class="btn btn--linha" data-copiar>📋 Copiar transcrição</button>' : "") +
        (r.status === "pronto" && (r.transcricao || r.url)
          ? (emAnalise.has(r.id) ? '<button type="button" class="btn btn--linha" disabled><span class="rot__relogio">⏳</span> Analisando…</button>'
            : (temAnalise(r) ? '<button type="button" class="btn" data-ficha>📑 Ver análise</button>' : '<button type="button" class="btn" data-analisar>🔍 Analisar</button>'))
          : "") +
        (r.url && r.status !== "processando" && (!r.capa || !r.metricas) && D.config[CHAVE_SUPADATA] ? '<button type="button" class="btn btn--linha" data-dados>🖼️ Buscar capa e números</button>' : "") +
        '<button type="button" class="btn btn--linha" data-editar>✏️ Editar</button>' +
        '<button type="button" class="btn btn--perigo" data-apagar>🗑️ Apagar</button>' +
        (r.url ? '<a class="link pequeno" href="' + esc(r.url) + '" target="_blank" rel="noopener">abrir no ' + esc((FONTES[fonteDe(r.url)] || fonte).nome) + "</a>" : "") +
      "</div>" +
    "</div></article>";
}

async function cliqueNoCartao(e) {
  const cartao = e.target.closest("[data-id]");
  if (!cartao) return;
  const r = D.roteiros.find(x => x.id === cartao.dataset.id);
  if (!r) return;
  if (e.target.closest("[data-ver]")) {
    const emb = embedRoteiro(r.url);
    if (!emb) return;
    const capa = $(".rot__capa", cartao);
    capa.className = "rot__capa rot__capa--video" + (emb.deitado ? " deitado" : "");
    capa.removeAttribute("style");
    capa.innerHTML = '<iframe src="' + esc(emb.src) + '" allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowfullscreen></iframe>';
    cartao.classList.add("com-video");
    return;
  }
  if (e.target.closest("[data-copiar]")) {
    const b = e.target.closest("[data-copiar]");
    try { await navigator.clipboard.writeText(r.transcricao || ""); b.textContent = "copiado ✓"; }
    catch (x) { b.textContent = "não deu para copiar"; }
    setTimeout(() => { b.textContent = "📋 Copiar transcrição"; }, 2000);
    return;
  }
  if (e.target.closest("[data-editar], [data-abrir]")) { editorRoteiro(r); return; }
  if (e.target.closest("[data-denovo]")) { tentarDeNovo(r); return; }
  if (e.target.closest("[data-analisar]")) { analisar(r); return; }
  if (e.target.closest("[data-ficha]")) { abrirFicha(r); return; }
  if (e.target.closest("[data-dados]")) {
    const b = e.target.closest("[data-dados]");
    b.disabled = true; b.textContent = "⏳ Buscando…";
    const novo = await preencherDadosDoPost(r);
    atualizaSaldo();
    const veio = ultimaResposta[r.id];
    if (!veio) { b.disabled = false; b.textContent = "🖼️ Buscar capa e números"; torrada("A Supadata não respondeu agora. Tente de novo daqui a pouco.", true); return; }
    if (!novo.capa || !novo.metricas) mostraOQueVeio(novo, veio);
    else torrada("Capa e números atualizados ✓");
    return;
  }
  const apagar = e.target.closest("[data-apagar]");
  if (apagar) {
    if (!apagar.dataset.armado) {
      apagar.dataset.armado = "1";
      apagar.classList.add("armado");
      apagar.textContent = "Clique de novo para apagar";
      setTimeout(() => { if (apagar.isConnected) { delete apagar.dataset.armado; apagar.classList.remove("armado"); apagar.textContent = "🗑️ Apagar"; } }, 3000);
      return;
    }
    if (await apagarLinha("roteiros", r.id)) {
      D.roteiros = D.roteiros.filter(x => x.id !== r.id);
      desenharRoteiros();
      torrada("Roteiro apagado.");
    }
  }
}

/* ----- editar / escrever na mão ----- */
function editorRoteiro(r, padrao, topo) {
  const v = r ? Object.assign({}, r, { tags: (r.tags || []).join(", "), perfil: r.perfil ? comArroba(r.perfil) : "" }) : Object.assign({ de_quem: "outra" }, padrao || {});
  if (!r && v.perfil) v.perfil = comArroba(v.perfil);
  editor({
    titulo: r ? "✏️ Editar roteiro" : "✍️ Escrever na mão",
    larga: true,
    topo: topo ? '<div class="faixa faixa--ok" style="margin-bottom:12px">' + topo + "</div>" : "",
    valores: v,
    campos: [
      { nome: "titulo", rot: "Título", dica: "Um nome pra achar depois" },
      { nome: "de_quem", rot: "De quem", tipo: "select", opcoes: [["outra", "De outra pessoa"], ["minha", "Meu"]] },
      { nome: "perfil", rot: "Perfil", dica: "@quempostou" },
      { nome: "postado_em", rot: "Data de postagem", tipo: "date" },
      { nome: "url", rot: "Link", inteiro: true, dica: "https://..." },
      { nome: "tags", rot: "Tags (separadas por vírgula)", inteiro: true, dica: "skincare, gancho forte, react" },
      { nome: "legenda", rot: "Legenda do post", tipo: "textarea", inteiro: true },
      { nome: "transcricao", rot: "Transcrição", tipo: "textarea", inteiro: true, linhas: 12 },
      { nome: "gancho", rot: "🪝 Gancho", tipo: "textarea", inteiro: true, linhas: 2 },
      { nome: "corpo", rot: "📖 Corpo", tipo: "textarea", inteiro: true, linhas: 4 },
      { nome: "cta", rot: "📣 CTA (chamada final)", tipo: "textarea", inteiro: true, linhas: 2 },
      { nome: "obs", rot: "Minhas notas", tipo: "textarea", inteiro: true, dica: "O que funciona aqui? O que eu quero usar?" }
    ],
    aoSalvar: async (dados, erro) => {
      if (dados.url) {
        const limpo = limpaLink(dados.url);
        if (!limpo) { erro("O link precisa começar com https://. Copie o link completo do vídeo."); return false; }
        dados.url = limpo;
      }
      dados.tags = Array.from(new Set(String(dados.tags || "").split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean)));
      dados.perfil = dados.perfil ? String(dados.perfil).trim().replace(/^@/, "") : null;
      dados.status = "pronto";
      dados.erro = null;
      if (!r) dados.fonte = "manual";
      else if (dados.url !== r.url && r.fonte !== "manual") dados.fonte = fonteDe(dados.url) || "manual";
      if (r && emAndamento.has(r.id)) { erro("Esse vídeo ainda está sendo transcrito. Espere terminar para salvar."); return false; }
      const salvo = await salvarLinha("roteiros", dados, r && r.id);
      if (!salvo) return false;
      if (r) troca(D.roteiros, salvo); else D.roteiros.unshift(salvo);
      desenharRoteiros();
      torrada("Roteiro salvo ✓");
      return true;
    }
  });
}

/* ----- transcrever ----- */
async function clicouTranscrever() {
  mostraAviso(null);
  const bruto = $("#rLink").value.trim();
  if (!bruto) { mostraAviso("erro", "Cole o link do vídeo no campo antes de clicar em Transcrever."); $("#rLink").focus(); return; }
  const url = limpaLink(bruto);
  if (!url) { mostraAviso("erro", "Esse link não parece certo. Copie o link completo do vídeo, começando com https://"); return; }
  if (!fonteDe(url)) { mostraAviso("erro", "Por enquanto eu transcrevo só vídeos do Instagram, do TikTok e do YouTube."); return; }
  if (!D.config[CHAVE_SUPADATA]) {
    mostraAviso("erro", "🔑 Falta a chave da Supadata, o serviço que ouve o vídeo. É grátis: crie uma conta em " +
      '<a class="link" href="https://supadata.ai" target="_blank" rel="noopener">supadata.ai</a> (100 créditos por mês, sem cartão), ' +
      "copie a API key e cole no campo <b>Chave da Supadata</b> aqui em cima.");
    $("#rChave").open = true;
    return;
  }
  const repetido = D.roteiros.find(r => r.url === url);
  if (repetido) {
    const j = abrirJanela({
      titulo: "Esse vídeo já está na biblioteca",
      corpo: "<p>Você já tem <b>" + esc(repetido.titulo || "esse vídeo") + "</b> guardado. Transcrever de novo gasta créditos da Supadata e cria um cartão novo.</p>",
      rodape: '<span class="espaco"></span><button class="btn btn--linha" type="button" data-ver>Ver o que já tenho</button><button class="btn" type="button" data-denovo>Transcrever de novo</button>'
    });
    $("[data-ver]", j).addEventListener("click", () => { fecharJanela(); mostraCartao(repetido.id); });
    $("[data-denovo]", j).addEventListener("click", () => { fecharJanela(); comecarTranscricao(url); });
    return;
  }
  comecarTranscricao(url);
}

function mostraCartao(id) {
  filtroQuem = "todos"; filtroTag = null; $("#rBusca").value = "";
  desenharRoteiros();
  const c = $('#rCartoes [data-id="' + id + '"]');
  if (c) { c.scrollIntoView({ behavior: "smooth", block: "center" }); c.classList.add("piscando"); setTimeout(() => c.classList.remove("piscando"), 1600); }
}

async function comecarTranscricao(url) {
  const nova = await salvarLinha("roteiros", {
    fonte: fonteDe(url), url, perfil: perfilDe(url), de_quem: $("#rQuem").value, status: "processando"
  });
  if (!nova) { mostraAviso("erro", "Não consegui criar o cartão na biblioteca. Veja o aviso vermelho que apareceu."); return; }
  D.roteiros.unshift(nova);
  $("#rLink").value = "";
  transcrever(nova);
}

async function tentarDeNovo(r) {
  if (!D.config[CHAVE_SUPADATA]) { clicouTranscrever(); return; }
  if (emAndamento.has(r.id)) return;
  const salvo = await salvarLinha("roteiros", { status: "processando", erro: null }, r.id);
  if (!salvo) return;
  troca(D.roteiros, salvo);
  transcrever(salvo);
}

async function transcrever(r) {
  emAndamento.add(r.id);
  desenharRoteiros();
  $("#rTranscrever").disabled = true;
  const inicio = Date.now();
  const segundos = () => Math.round((Date.now() - inicio) / 1000);
  const tempo = () => { const s = segundos(); return s < 60 ? s + "s" : Math.floor(s / 60) + "min " + pad(s % 60) + "s"; };
  const andamento = () => mostraAviso("info", '<span class="rot__relogio" aria-hidden="true">⏳</span> 🎧 Ouvindo o vídeo… ' + tempo() +
    ". Costuma levar de 3 a 4 minutos, pode deixar a aba aberta.");
  andamento();
  const relogio = setInterval(andamento, 1000);

  let resultado;   /* { texto, segmentos } ou { falha, semFala } */
  try {
    const params = new URLSearchParams({ url: r.url, mode: "auto", text: "true", lang: "pt" });
    let res = await supadata("/transcript?" + params.toString());
    if (res.status === 202 && res.corpo.jobId) {
      const job = res.corpo.jobId;
      res = null;
      while (!res) {
        if (Date.now() - inicio > 6 * 60 * 1000) { resultado = { falha: "Passou de 6 minutos e eu desisti. O serviço deve estar cheio. Tente de novo mais tarde." }; break; }
        await espera(5000);
        const r2 = await supadata("/transcript/" + encodeURIComponent(job));
        if (r2.rede) continue;                                  /* internet piscou: tenta de novo */
        const st = String(r2.corpo.status || "").toLowerCase();
        if (r2.status >= 400 && r2.status !== 206) { resultado = { falha: erroSupadata(r2) }; break; }
        if (st === "failed") {
          const e = r2.corpo.error;
          const cod = String((e && (e.error || e.code)) || e || "").toLowerCase();
          resultado = cod.includes("transcript-unavailable") ? { falha: SEM_FALA, semFala: true } : { falha: "A transcrição não deu certo do lado da Supadata. Tente de novo daqui a pouco." };
          break;
        }
        if (st === "completed" || (!st && r2.corpo.content !== undefined)) res = r2;
      }
    }
    if (!resultado) {
      if (res.status === 200) {
        const t = textoDe(res.corpo);
        resultado = (!t.texto || String(res.corpo.lang || "").toLowerCase() === "none") ? { falha: SEM_FALA, semFala: true } : t;
      } else if (res.status === 206 || String(res.corpo.error || "") === "transcript-unavailable") {
        resultado = { falha: SEM_FALA, semFala: true };
      } else {
        resultado = { falha: erroSupadata(res) };
      }
    }
  } catch (e) {
    resultado = { falha: "A transcrição não deu certo. Tente de novo daqui a pouco." };
  } finally {
    clearInterval(relogio);
    emAndamento.delete(r.id);
    $("#rTranscrever").disabled = emAndamento.size > 0;
  }

  const dados = resultado.falha
    ? { status: "falhou", erro: resultado.falha }
    : { status: "pronto", erro: null, transcricao: resultado.texto, segmentos: resultado.segmentos };
  const salvo = await salvarLinha("roteiros", dados, r.id);
  let atual = salvo || Object.assign({}, r, dados);
  troca(D.roteiros, atual);
  desenharRoteiros();

  if (!resultado.falha || resultado.semFala) {
    mostraAviso("info", '<span class="rot__relogio" aria-hidden="true">⏳</span> 📋 Buscando os dados do post (perfil, legenda, data e números)…');
    atual = await preencherDadosDoPost(atual);
  }
  atualizaSaldo();

  if (!resultado.falha) {
    mostraAviso("ok", "✅ Pronto em " + tempo() + ". Revisa e salva. Depois, clique em 🔍 Analisar no cartão para ver gancho, corpo, CTA e por que o vídeo funcionou.");
    editorRoteiro(atual, null, "✅ Pronto. Já preenchi o que o post mostra. Revisa e salva.");
  } else if (resultado.semFala) {
    mostraAviso("erro", "🔇 " + SEM_FALA + ' <button type="button" class="btn btn--linha" id="rGuardar">📝 Guardar assim mesmo</button>');
    $("#rGuardar").addEventListener("click", () => editorRoteiro(atual));
  } else {
    mostraAviso("erro", "⚠️ " + esc(resultado.falha));
  }
}

/* ============================================================
   DADOS DO POST, CAPA E ANÁLISE (ficha igual à das Referências)
   ============================================================ */
const emAnalise = new Set();
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const semTravessao = (t) => String(t == null ? "" : t).replace(/\s*—\s*/g, ", ").trim();
const textoDoCampo = (v) => semTravessao(Array.isArray(v) ? v.filter(Boolean).join(", ") : v);
const primeiro = (...v) => v.find(x => x !== undefined && x !== null && x !== "");
const temAnalise = (r) => !!(r.analise && typeof r.analise === "object" && Object.keys(r.analise).length);

/* duração estimada sem gastar crédito: o fim do último bloco da análise ou do último trecho da transcrição */
function duracaoEstimada(r) {
  const blocos = r.analise && Array.isArray(r.analise.blocos) ? r.analise.blocos : [];
  const nums = blocos.flatMap(b => (String(b.t || "").match(/\d+(?:[.,]\d+)?/g) || []).map(x => Number(x.replace(",", "."))));
  if (nums.length) return Math.max(...nums);
  const seg = Array.isArray(r.segmentos) ? r.segmentos[r.segmentos.length - 1] : null;
  if (seg && seg.offset != null) return Math.round((Number(seg.offset) + Number(seg.duration || 0)) / 1000);
  return null;
}

function linhaMetricas(r) {
  const m = Object.assign({}, r.metricas && typeof r.metricas === "object" ? r.metricas : {});
  let aproximada = false;
  if (m.duracao == null) { const d = duracaoEstimada(r); if (d) { m.duracao = d; aproximada = true; } }
  if (!Object.keys(m).length) return "";
  const partes = [];
  if (m.views != null) partes.push("👁 " + compacto.format(m.views));
  if (m.likes != null) partes.push("❤️ " + compacto.format(m.likes));
  if (m.comments != null) partes.push("💬 " + compacto.format(m.comments));
  if (m.shares != null) partes.push("↗️ " + compacto.format(m.shares));
  if (m.duracao != null) partes.push("⏱ " + (aproximada ? "uns " : "") + Math.round(m.duracao) + "s");
  return partes.length ? '<div class="rot__metricas">' + partes.join('<span class="mudo"> · </span>') + "</div>" : "";
}

function tituloAutomatico(meta, r) {
  const corta = (t) => { t = String(t || "").replace(/#[\w\u00C0-\u017F]+/g, "").replace(/@[\w.]+/g, "").replace(/\s+/g, " ").trim(); return t.length > 60 ? t.slice(0, 57).replace(/\s+\S*$/, "") + "…" : t; };
  if (meta.title && meta.title !== meta.description && meta.title.length <= 80 && corta(meta.title).length >= 8) return corta(meta.title);
  const linha = String(meta.description || "").split("\n").map(x => x.trim()).find(x => corta(x).length >= 8);
  if (linha) return corta(linha);
  const frase = String(r.transcricao || "").split(/(?<=[.!?])\s/)[0];
  return frase ? corta(frase) : null;
}

/* guarda uma cópia pequena da capa no banco: o link do Instagram expira em poucos dias */
async function copiaDaCapa(url) {
  try {
    const resp = await fetch(url, { referrerPolicy: "no-referrer" });
    if (!resp.ok) throw new Error(resp.status);
    const img = await createImageBitmap(await resp.blob());
    const largura = 240, altura = Math.round(largura * img.height / img.width);
    const tela = document.createElement("canvas");
    tela.width = largura; tela.height = altura;
    tela.getContext("2d").drawImage(img, 0, 0, largura, altura);
    return tela.toDataURL("image/jpeg", 0.72);
  } catch (e) {
    return null;
  }
}

const ultimaResposta = {};   /* o que a Supadata mandou por último, para mostrar se faltar algo */
/* pede os dados do post à Supadata (1 crédito) e preenche o que estiver vazio */
async function preencherDadosDoPost(r) {
  if (!r.url || !D.config[CHAVE_SUPADATA]) return r;
  const res = await supadata("/metadata?url=" + encodeURIComponent(r.url));
  if (res.status !== 200) return r;          /* sem dados extras: segue normal, sem incomodar */
  const m = res.corpo || {};
  const autor = m.author || m.owner || {};
  const st = m.stats || m.statistics || {};
  const md = m.media || {};
  const patch = {};
  const usuario = primeiro(autor.username, autor.handle, autor.uniqueId);
  if (!r.perfil && usuario) patch.perfil = String(usuario).replace(/^@/, "");
  const legenda = primeiro(m.description, m.caption, m.text);
  if (!r.legenda && legenda) patch.legenda = String(legenda).slice(0, 5000);
  const quando = primeiro(m.createdAt, m.created_at, m.publishedAt, m.uploadDate, m.date, m.timestamp, md.createdAt);
  if (!r.postado_em && quando) {
    const d = typeof quando === "number" ? new Date(quando < 1e12 ? quando * 1000 : quando) : new Date(quando);
    if (!isNaN(d)) patch.postado_em = isoLocal(d);
  }
  if (!r.titulo) { const t = tituloAutomatico({ title: m.title, description: legenda }, r); if (t) patch.titulo = t; }
  /* post com vários itens (carrossel): a capa e a duração ficam no primeiro item */
  const itens = Array.isArray(md.items) ? md.items : [];
  const video = itens.find(x => x && (x.duration || x.thumbnailUrl)) || itens[0] || {};
  const extra = m.additionalData || {};
  const metricas = Object.assign({}, r.metricas || {}, {
    views: primeiro(st.views, st.viewCount, st.playCount, st.plays, extra.views, extra.playCount),
    likes: primeiro(st.likes, st.likeCount, st.diggCount, extra.likes),
    comments: primeiro(st.comments, st.commentCount, extra.comments),
    shares: primeiro(st.shares, st.shareCount),
    duracao: primeiro(md.duration, video.duration, m.duration, extra.duration)
  });
  Object.keys(metricas).forEach(k => { if (metricas[k] == null) delete metricas[k]; });
  if (Object.keys(metricas).length && JSON.stringify(metricas) !== JSON.stringify(r.metricas || {})) patch.metricas = metricas;
  const capaUrl = primeiro(md.thumbnailUrl, md.thumbnail, video.thumbnailUrl, video.url, md.type === "image" ? md.url : null, m.thumbnailUrl, m.thumbnail);
  ultimaResposta[r.id] = { tipo: m.type, capa: !!capaUrl, data: !!quando, views: metricas.views, likes: metricas.likes, comments: metricas.comments, duracao: metricas.duracao };
  if (!r.capa && capaUrl && !idYoutube(r.url)) {
    const copia = await copiaDaCapa(capaUrl);
    patch.capa = copia || capaUrl;           /* sem cópia, guarda o link (pode expirar) */
  }
  if (!Object.keys(patch).length) return r;
  const salvo = await salvarLinha("roteiros", patch, r.id);
  if (!salvo) return r;
  troca(D.roteiros, salvo);
  desenharRoteiros();
  return salvo;
}

/* janelinha simples com o que a Supadata mandou, para a Cintia mandar print */
function mostraOQueVeio(r, v) {
  const linha = (rot, ok, valor) => "<li>" + (ok ? "✅ " : "❌ ") + rot + (valor != null ? ": " + esc(valor) : "") + "</li>";
  const TIPOS = { video: "vídeo", image: "foto", carousel: "carrossel", post: "post" };
  abrirJanela({
    titulo: "📋 O que a Supadata mandou",
    corpo: "<p style=\"margin-bottom:10px\">Para esse post, veio isto:</p><ul class=\"lista-simples\" style=\"list-style:none;padding:0\">" +
      linha("Tipo de post", !!v.tipo, TIPOS[v.tipo] || v.tipo || "não informado") +
      linha("Capa", v.capa || !!r.capa, null) +
      linha("Data de postagem", v.data, null) +
      linha("Visualizações", v.views != null, v.views != null ? compacto.format(v.views) : null) +
      linha("Curtidas", v.likes != null, v.likes != null ? compacto.format(v.likes) : null) +
      linha("Comentários", v.comments != null, v.comments != null ? compacto.format(v.comments) : null) +
      linha("Duração", v.duracao != null, v.duracao != null ? Math.round(v.duracao) + "s" : null) +
      "</ul><p class=\"mudo pequeno\" style=\"margin-top:10px\">O que está com ❌ a Supadata não mandou para esse post. Tire um print desta janela e mande para o Claude, que ele vê o que dá para fazer.</p>",
    rodape: '<span class="espaco"></span><button class="btn" type="button" data-fechar>Entendi</button>'
  });
}

/* ----- a análise ----- */
const ANALISE_PROMPT = "Você é especialista em vídeos curtos de UGC. Assista ao vídeo inteiro, prestando atenção na fala, no que aparece na tela, nos cortes e no ritmo. " +
  "Separe a fala em gancho, corpo e CTA, copiando os trechos exatamente como foram falados, no idioma original. " +
  "Todo o resto responda em português do Brasil, de um jeito simples e direto, como uma creator experiente explicando para outra. Nunca use travessão.";
const ANALISE_SCHEMA = {
  type: "object",
  properties: {
    titulo: { type: "string", description: "Título curto em português do Brasil, até 60 caracteres, dizendo do que é o vídeo" },
    duracao_segundos: { type: "number", description: "Duração total do vídeo em segundos" },
    estilo: { type: "string", description: "Formato do vídeo em até 3 palavras, em português: por exemplo Demonstração, Problema e solução, React, Rotina, Encenação, Unboxing" },
    gancho: { type: "string", description: "Trecho exato da fala que abre o vídeo e prende a atenção, no idioma original" },
    corpo: { type: "string", description: "Trecho exato da fala entre o gancho e a chamada final, no idioma original" },
    cta: { type: "string", description: "Trecho exato da chamada para ação no fim, no idioma original. Vazio se não houver" },
    por_que_funciona: { type: "string", description: "De 3 a 5 frases: por que o vídeo prende e convence, olhando fala, imagem, ritmo e formato" },
    diferencial: { type: "string", description: "De 2 a 3 frases: o que esse vídeo faz que a maioria não faz" },
    erro_comum: { type: "string", description: "1 ou 2 frases: o erro que faria esse formato não funcionar se alguém fosse reproduzir" },
    roteiro_em_blocos: {
      type: "array",
      description: "O vídeo dividido em 4 a 6 blocos de tempo, do começo ao fim",
      items: {
        type: "object",
        properties: {
          tempo: { type: "string", description: "Intervalo em segundos, por exemplo 0 a 3s, 3 a 10s, ou final" },
          o_que_acontece: { type: "string", description: "Começa com o nome do bloco e um ponto. Depois diz o que é falado e o que aparece na tela nesse trecho" }
        },
        required: ["tempo", "o_que_acontece"]
      }
    }
  },
  required: ["titulo", "estilo", "gancho", "corpo", "cta", "por_que_funciona", "diferencial", "erro_comum", "roteiro_em_blocos"]
};

/* transforma a resposta (da Supadata ou do Claude) no que vai para o banco */
function patchDaAnalise(d, r) {
  const cta = textoDoCampo(d.cta);
  const blocos = (Array.isArray(d.roteiro_em_blocos) ? d.roteiro_em_blocos : [])
    .map(b => ({ t: textoDoCampo(b.tempo || b.t), o: textoDoCampo(b.o_que_acontece || b.o) }))
    .filter(b => b.o);
  const analise = {
    estilo: textoDoCampo(d.estilo),
    por_que_funciona: textoDoCampo(d.por_que_funciona || d.por_que_funcionou),
    diferencial: textoDoCampo(d.diferencial),
    erro_comum: textoDoCampo(d.erro_comum),
    blocos
  };
  Object.keys(analise).forEach(k => { if (!analise[k] || (Array.isArray(analise[k]) && !analise[k].length)) delete analise[k]; });
  analise.feita_em = new Date().toISOString();
  const patch = {
    gancho: textoDoCampo(d.gancho) || null,
    corpo: textoDoCampo(d.corpo) || null,
    cta: cta && !/^sem cta\.?$/i.test(cta) ? cta : null,
    analise
  };
  if (!r.titulo && textoDoCampo(d.titulo)) patch.titulo = textoDoCampo(d.titulo).slice(0, 80);
  const dur = Number(d.duracao_segundos);
  if (dur > 0 && !(r.metricas && r.metricas.duracao)) patch.metricas = Object.assign({}, r.metricas || {}, { duracao: dur });
  return patch;
}

async function guardarAnalise(r, patch) {
  const salvo = await salvarLinha("roteiros", patch, r.id);
  if (!salvo) {
    mostraAviso("erro", "⚠️ A análise ficou pronta, mas não consegui guardar. " +
      '<button type="button" class="btn btn--linha" id="rGuardarDeNovo">💾 Tentar guardar de novo</button>');
    $("#rGuardarDeNovo").addEventListener("click", () => guardarAnalise(D.roteiros.find(x => x.id === r.id) || r, patch));
    return false;
  }
  troca(D.roteiros, salvo);
  mostraCartao(salvo.id);
  mostraAviso("ok", "✅ Análise pronta.");
  abrirFicha(salvo);
  return true;
}

/* a ficha: igual à das Referências de vídeo */
function abrirFicha(r) {
  const a = r.analise || {};
  const fonte = FONTES[fonteDe(r.url)] || FONTES[r.fonte] || FONTES.manual;
  const secao = (rot, t, classe) => t ? "<h3>" + rot + "</h3><p" + (classe ? ' class="' + classe + '"' : "") + ">" + esc(t) + "</p>" : "";
  /* link do perfil: Instagram, TikTok ou YouTube */
  const perfilLink = r.perfil
    ? (fonteDe(r.url) === "tiktok" ? "https://www.tiktok.com/@" + encodeURIComponent(r.perfil)
      : fonteDe(r.url) === "youtube" ? "https://www.youtube.com/@" + encodeURIComponent(r.perfil)
      : "https://www.instagram.com/" + encodeURIComponent(r.perfil) + "/")
    : null;
  const emb = embedRoteiro(r.url);
  const yt = idYoutube(r.url);
  const imagem = r.capa || (yt ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg" : "");

  /* coluna da esquerda: o vídeo, quem postou e os números */
  const esquerda = '<div class="ficha2__lado">' +
    (emb
      ? '<div class="ficha2__video' + (emb.deitado ? " deitado" : "") + '"><iframe src="' + esc(emb.src) + '" allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowfullscreen></iframe></div>'
      : '<div class="ficha2__video ficha2__video--capa">' + (imagem ? '<img src="' + esc(imagem) + '" alt="">' : '<span class="rot__capa-emoji">' + fonte.emoji + "</span>") + "</div>") +
    (r.perfil ? '<a class="ficha2__perfil" href="' + esc(perfilLink) + '" target="_blank" rel="noopener">' + fonte.emoji + " " + esc(comArroba(r.perfil)) + "</a>" : "") +
    linhaMetricas(r) +
    '<div class="ficha2__etiquetas">' + (a.estilo ? '<span class="pil c-destaque">' + esc(a.estilo) + "</span>" : "") +
      '<span class="pil ' + (QUEM[r.de_quem] || QUEM.outra).cor + '">' + (QUEM[r.de_quem] || QUEM.outra).nome + "</span>" +
      (r.postado_em ? '<span class="mudo pequeno">postado ' + dataBR(r.postado_em) + "</span>" : "") + "</div>" +
    (r.url && (!r.capa || !r.metricas) && D.config[CHAVE_SUPADATA] ? '<button type="button" class="btn btn--linha" data-f-dados>🖼️ Buscar números</button>' : "") +
    (r.url ? '<a class="link pequeno" href="' + esc(r.url) + '" target="_blank" rel="noopener">abrir no ' + esc(fonte.nome) + "</a>" : "") +
    "</div>";

  /* coluna da direita: a análise, e depois o roteiro completo */
  const direita = '<div class="ficha ficha2__texto">' +
    secao("Gancho", r.gancho, "ficha__gancho") +
    secao("Corpo", r.corpo) +
    secao("CTA", r.cta) +
    secao("Por que funciona", a.por_que_funciona) +
    secao("O diferencial", a.diferencial) +
    secao("Erro comum", a.erro_comum) +
    (a.blocos && a.blocos.length ? "<h3>Roteiro em blocos de tempo</h3>" +
      '<div class="blocos">' + a.blocos.map(b => '<div class="blocos__linha"><span class="blocos__t">' + esc(b.t) + "</span><span>" + destacaNome(b.o) + "</span></div>").join("") + "</div>" : "") +
    (!temAnalise(r) && !r.gancho ? '<p class="vazio">Esse vídeo ainda não foi analisado. Clique em 🔍 Analisar aqui embaixo.</p>' : "") +
    (r.transcricao ? '<h3>Roteiro completo (transcrição) <button type="button" class="link" data-f-copiar>copiar</button></h3><p class="ficha2__roteiro">' + esc(r.transcricao) + "</p>" : "") +
    (r.legenda ? '<h3>Legenda do post</h3><p class="ficha2__roteiro mudo">' + esc(r.legenda) + "</p>" : "") +
    (r.obs ? "<h3>Minhas notas</h3><p class=\"ficha2__roteiro\">" + esc(r.obs) + "</p>" : "") +
    "</div>";

  const j = abrirJanela({
    titulo: "🎬 " + (r.titulo || "Análise do vídeo"), larga: true,
    corpo: '<div class="ficha2">' + esquerda + direita + "</div>",
    rodape: '<span class="espaco"></span><button class="btn btn--linha" type="button" data-f-editar>✏️ Editar</button>' +
      '<button class="btn btn--linha" type="button" data-f-denovo>🔍 ' + (temAnalise(r) ? "Analisar de novo" : "Analisar") + "</button>"
  });
  $(".janela__caixa", j).classList.add("janela__caixa--ficha");
  $("[data-f-editar]", j).addEventListener("click", () => editorRoteiro(D.roteiros.find(x => x.id === r.id) || r));
  $("[data-f-denovo]", j).addEventListener("click", () => { fecharJanela(); analisar(D.roteiros.find(x => x.id === r.id) || r); });
  const dados = $("[data-f-dados]", j);
  if (dados) dados.addEventListener("click", async () => {
    dados.disabled = true; dados.textContent = "⏳ Buscando…";
    const novo = await preencherDadosDoPost(D.roteiros.find(x => x.id === r.id) || r);
    atualizaSaldo();
    const veio = ultimaResposta[r.id];
    if (!veio) { dados.disabled = false; dados.textContent = "🖼️ Buscar números"; torrada("A Supadata não respondeu agora. Tente de novo daqui a pouco.", true); return; }
    if (!novo.capa || !novo.metricas) mostraOQueVeio(novo, veio);
    else { abrirFicha(novo); torrada("Números atualizados ✓"); }
  });
  const copiar = $("[data-f-copiar]", j);
  if (copiar) copiar.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(r.transcricao || ""); copiar.textContent = "copiado ✓"; } catch (e) { copiar.textContent = "não deu para copiar"; }
  });
}
/* "Nome do bloco. resto" vira nome em negrito, como nas Referências */
function destacaNome(t) {
  const m = String(t || "").match(/^([^.!?]{3,60}[.!?])\s+([\s\S]*)$/);
  return m ? "<b>" + esc(m[1]) + "</b> " + esc(m[2]) : esc(t);
}

async function analisar(r) {
  if (emAnalise.has(r.id)) return;
  if (!r.url || !D.config[CHAVE_SUPADATA]) { analisarComClaude(r); return; }
  emAnalise.add(r.id);
  desenharRoteiros();
  const inicio = Date.now();
  const tick = () => mostraAviso("info", '<span class="rot__relogio" aria-hidden="true">⏳</span> 🔍 Assistindo e analisando o vídeo… ' +
    Math.round((Date.now() - inicio) / 1000) + "s. Costuma levar de 1 a 3 minutos, pode deixar a aba aberta.");
  tick();
  const relogio = setInterval(tick, 1000);
  let dados = null, falha = null, planoB = false;
  const precisaPlano = (res) => res.status === 402 || res.status === 403 || /upgrade/i.test(String(res.corpo && res.corpo.error || ""));
  try {
    const res = await supadata("/extract", { url: r.url, prompt: ANALISE_PROMPT, schema: ANALISE_SCHEMA });
    if (precisaPlano(res)) planoB = true;
    else if (res.corpo && res.corpo.data) dados = res.corpo.data;
    else if (res.corpo && res.corpo.jobId) {
      while (!dados && !falha) {
        if (Date.now() - inicio > 6 * 60 * 1000) { falha = "Passou de 6 minutos e eu desisti. Tente de novo mais tarde."; break; }
        await espera(5000);
        const r2 = await supadata("/extract/" + encodeURIComponent(res.corpo.jobId));
        if (r2.rede) continue;
        if (precisaPlano(r2)) { planoB = true; break; }
        if (r2.status >= 400) { falha = erroSupadata(r2); break; }
        const st = String(r2.corpo.status || "").toLowerCase();
        if (st === "failed") {
          const e = r2.corpo.error || {};
          if (/upgrade/i.test(String(e.error || e.code || e))) { planoB = true; break; }
          falha = "A análise não deu certo do lado da Supadata. Tente de novo daqui a pouco.";
        } else if (st === "completed") dados = r2.corpo.data || {};
      }
    } else falha = erroSupadata(res);
  } catch (e) {
    falha = "A análise não deu certo. Tente de novo daqui a pouco.";
  } finally {
    clearInterval(relogio);
    emAnalise.delete(r.id);
  }
  desenharRoteiros();
  atualizaSaldo();
  if (planoB) { mostraAviso(null); analisarComClaude(r, "A análise automática não está liberada no seu plano da Supadata. Sem problema: dá para fazer com o Claude, de graça."); return; }
  if (falha) {
    mostraAviso("erro", "⚠️ " + esc(falha) + ' <button type="button" class="btn btn--linha" id="rComClaude">🧠 Fazer com o Claude</button>');
    $("#rComClaude").addEventListener("click", () => analisarComClaude(r));
    return;
  }
  const atual = D.roteiros.find(x => x.id === r.id) || r;
  await guardarAnalise(atual, patchDaAnalise(dados || {}, atual));
}

/* plano B, grátis: um pedido pronto para colar no Claude, e a resposta volta para cá */
const ROTULOS_CLAUDE = [["TÍTULO", "titulo"], ["TITULO", "titulo"], ["ESTILO", "estilo"], ["GANCHO", "gancho"], ["CORPO", "corpo"], ["CTA", "cta"],
  ["POR QUE FUNCIONA", "por_que_funciona"], ["O DIFERENCIAL", "diferencial"], ["DIFERENCIAL", "diferencial"], ["ERRO COMUM", "erro_comum"],
  ["ROTEIRO EM BLOCOS", "roteiro_em_blocos"]];
function lerRespostaClaude(texto) {
  const limpo = String(texto || "").replace(/\*\*/g, "").replace(/^\s*#+\s*/gm, "");
  const re = new RegExp("^\\s*(" + ROTULOS_CLAUDE.map(x => x[0]).join("|") + ")\\s*:\\s*", "gim");
  const achados = [];
  let m;
  while ((m = re.exec(limpo))) achados.push({ rot: m[1].toUpperCase(), ini: m.index, fim: re.lastIndex });
  if (!achados.length) return null;
  const d = {};
  achados.forEach((a, i) => {
    const campo = (ROTULOS_CLAUDE.find(x => x[0] === a.rot) || [])[1];
    if (campo) d[campo] = limpo.slice(a.fim, i + 1 < achados.length ? achados[i + 1].ini : undefined).trim();
  });
  /* blocos: uma linha por bloco, "0 a 3s | o que acontece" */
  if (typeof d.roteiro_em_blocos === "string") {
    d.roteiro_em_blocos = d.roteiro_em_blocos.split("\n").map(l => l.replace(/^\s*[-•*\d.)]+\s*/, "").trim()).filter(Boolean)
      .map(l => { const p = l.split(/\s*\|\s*/); return p.length > 1 ? { tempo: p[0], o_que_acontece: p.slice(1).join(" ") } : { tempo: "", o_que_acontece: l }; });
  }
  return d;
}
function pedidoParaClaude(r) {
  const m = r.metricas || {};
  const numeros = [m.views != null && m.views + " visualizações", m.likes != null && m.likes + " curtidas", m.comments != null && m.comments + " comentários", m.duracao != null && Math.round(m.duracao) + " segundos"].filter(Boolean).join(", ");
  return "Você é especialista em vídeos curtos de UGC. Analise o vídeo abaixo pela transcrição" + (r.legenda ? " e pela legenda" : "") + ".\n\n" +
    "Separe a fala em gancho, corpo e CTA, copiando os trechos exatamente como foram falados, no idioma original. Todo o resto em português do Brasil, simples e direto.\n\n" +
    "Responda EXATAMENTE neste formato, com estes títulos em maiúsculas, sem nada antes:\n" +
    "TÍTULO: um título curto em português, até 60 caracteres\n" +
    "ESTILO: o formato em até 3 palavras (Demonstração, Problema e solução, React, Rotina...)\n" +
    "GANCHO: o trecho exato da abertura\n" +
    "CORPO: o trecho exato do meio\n" +
    "CTA: o trecho exato da chamada final, ou \"sem CTA\"\n" +
    "POR QUE FUNCIONA: de 3 a 5 frases\n" +
    "O DIFERENCIAL: de 2 a 3 frases, o que esse vídeo faz que a maioria não faz\n" +
    "ERRO COMUM: o erro que faria esse formato não funcionar se alguém reproduzisse\n" +
    "ROTEIRO EM BLOCOS:\n0 a 3s | Nome do bloco. O que é falado e o que aparece\n3 a 10s | Nome do bloco. ...\n(de 4 a 6 linhas, até o final)\n\n" +
    "Escreva como gente fala, sem ficar robotizado, e nunca use travessão.\n\n" +
    "=== O VÍDEO ===\n" +
    (r.perfil ? "Perfil: " + comArroba(r.perfil) + "\n" : "") + (r.url ? "Link: " + r.url + "\n" : "") + (numeros ? "Números: " + numeros + "\n" : "") +
    (r.legenda ? "\nLegenda:\n" + r.legenda + "\n" : "") + "\nTranscrição:\n" + (r.transcricao || "(sem fala)");
}
async function analisarComClaude(r, motivo) {
  const pedido = pedidoParaClaude(r);
  let copiou = true;
  try { await navigator.clipboard.writeText(pedido); } catch (e) { copiou = false; }
  const j = abrirJanela({
    titulo: "🧠 Analisar com o Claude", larga: true,
    corpo: (motivo ? '<div class="faixa faixa--aviso" style="margin-bottom:12px">' + esc(motivo) + "</div>" : "") +
      '<ol class="lista-simples" style="margin-bottom:12px">' +
        "<li>" + (copiou ? "Já copiei o pedido pronto. ✓" : "Copie o pedido pronto que está no fim desta janela.") + "</li>" +
        '<li>Abra o <a class="link" href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>, cole com Cmd + V e envie.</li>' +
        "<li>Copie a resposta inteira do Claude, cole aqui embaixo e clique em Guardar análise.</li></ol>" +
      '<textarea class="entrada" id="rResposta" style="height:220px;padding:10px" placeholder="Cole aqui a resposta do Claude"></textarea>' +
      '<div class="faixa escondido" id="rRespostaErro" style="margin-top:8px"></div>' +
      (copiou ? "" : '<details style="margin-top:10px"><summary class="link">Ver o pedido para copiar</summary><textarea class="entrada" style="height:200px;padding:10px;margin-top:6px" readonly>' + esc(pedido) + "</textarea></details>"),
    rodape: '<button class="btn btn--linha" type="button" id="rCopiarDeNovo">📋 Copiar o pedido de novo</button><span class="espaco"></span>' +
      '<button class="btn btn--linha" type="button" data-fechar>Cancelar</button><button class="btn" type="button" id="rGuardarAnalise">Guardar análise</button>'
  });
  $("#rCopiarDeNovo", j).addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(pedido); e.target.textContent = "copiado ✓"; } catch (x) { e.target.textContent = "não deu para copiar"; }
  });
  $("#rGuardarAnalise", j).addEventListener("click", async () => {
    const texto = $("#rResposta", j).value.trim();
    const erro = $("#rRespostaErro", j);
    if (!texto) { erro.textContent = "Cole a resposta do Claude no campo acima."; erro.classList.remove("escondido"); return; }
    const d = lerRespostaClaude(texto);
    if (!d) { erro.textContent = "Não achei os títulos GANCHO, CORPO e CTA nessa resposta. Copie a resposta inteira do Claude, do começo ao fim."; erro.classList.remove("escondido"); return; }
    fecharJanela();
    const atual = D.roteiros.find(x => x.id === r.id) || r;
    await guardarAnalise(atual, patchDaAnalise(d, atual));
  });
}

/* ----- estudar com o Claude: monta o prompt e copia ----- */
async function estudarComClaude() {
  const base = D.roteiros.filter(r => r.de_quem === "outra" && r.transcricao && r.status !== "processando").slice(0, 10);
  if (!base.length) { mostraAviso("erro", "🧠 Para estudar, preciso de pelo menos um roteiro marcado como De outra e com transcrição."); return; }
  const videos = base.map((r, i) =>
    "VÍDEO " + (i + 1) + (r.perfil ? " · " + comArroba(r.perfil) : "") + (r.titulo ? " · " + r.titulo : "") + "\n" +
    String(r.transcricao).slice(0, 4000)).join("\n\n");
  const prompt =
"Você é minha parceira de criação de conteúdo UGC. Abaixo estão as transcrições de " + plural(base.length, "vídeo", "vídeos") + " de outras creators que eu guardei porque chamaram a minha atenção.\n\n" +
"Meu assunto: [escreva aqui o seu nicho ou o produto que você vai divulgar]\n\n" +
"Analise os vídeos e me entregue:\n\n" +
"1. Assuntos em alta: quais temas aparecem e por que estão prendendo a atenção.\n" +
"2. Expressões que estão prendendo: frases e jeitos de falar que se repetem ou que chamam atenção. Cite o trecho e diga de qual vídeo é.\n" +
"3. Padrões de gancho: os tipos de abertura usados, com um exemplo real de cada um, tirado das transcrições.\n" +
"4. Cinco roteiros novos no MEU assunto, reaproveitando a estrutura desses vídeos, não o conteúdo. Para cada um: gancho, desenvolvimento e chamada final, com o tempo aproximado de cada parte.\n\n" +
"Escreva do jeito que uma pessoa fala de verdade, sem ficar robotizado e sem frase pronta de propaganda. Nada de travessão.\n\n" +
"=== OS VÍDEOS ===\n\n" + videos;
  try {
    await navigator.clipboard.writeText(prompt);
    mostraAviso("ok", "🧠 Prompt copiado ✓ com " + plural(base.length, "roteiro", "roteiros") + ". Abra o Claude, cole com Cmd + V e troque o trecho \"Meu assunto\" pelo seu nicho.");
  } catch (e) {
    abrirJanela({ titulo: "🧠 Prompt pronto", larga: true, corpo: '<p class="mudo pequeno" style="margin-bottom:8px">Não consegui copiar sozinha. Selecione o texto abaixo e use Cmd + C.</p><textarea class="entrada" style="height:360px;padding:10px" readonly>' + esc(prompt) + "</textarea>" });
  }
}

/* ============================================================
   9c. ABA PROSPECTADO × FECHADO
   Abordagens (tabela abordagens) × contratos (tabela campanhas), por canal.
   ============================================================ */
const CANAIS_ABORDAGEM = [
  ["manual", "🔎 Prospecção manual", "var(--c-azul)"],
  ["instagram_auto", "📸 Instagram automático", "var(--c-coral)"],
  ["onbento", "✉️ onBento", "var(--c-mostarda)"],
  ["plataforma", "🧩 Plataformas", "var(--c-roxo)"],
  ["outro", "Outro", "var(--c-cinza)"]
];
let mesFunil = new Date(); mesFunil.setDate(1); mesFunil.setHours(0, 0, 0, 0);
let escalaFunil = "dia";

/* conta as abordagens de "📨 Prospectei": uma linha por marca, com a origem dela */
async function registrarProspeccao(marcas) {
  const linhas = marcas.map(m => ({ data: isoLocal(new Date()), canal: "manual", quantidade: 1, detalhe: bOrigem(m.origem)[1], marca_id: m.id }));
  if (!linhas.length || falhou.abordagens) return;
  const { data, error } = await banco.from("abordagens").insert(linhas).select();
  if (error) { aviso("abordagens-gravar", "As abordagens não estão sendo contadas: " + traduzErro(error, "abordagens")); return; }
  (data || []).forEach(a => D.abordagens.push(a));
  if (typeof desenharFunil === "function") desenharFunil();
}

function diasDoMes(mes) {
  const fim = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  return Array.from({ length: fim }, (_, i) => isoLocal(new Date(mes.getFullYear(), mes.getMonth(), i + 1)));
}
/* espalha um registro de período (ex.: a semana toda) pelos dias */
function porDiaDoRegistro(a) {
  const ini = deISO(a.data), fim = deISO(a.ate) || ini;
  if (!ini) return [];
  const dias = [];
  for (let d = new Date(ini); d <= fim && dias.length < 400; d.setDate(d.getDate() + 1)) dias.push(isoLocal(d));
  const q = (Number(a.quantidade) || 0) / (dias.length || 1);
  return dias.map(d => [d, q]);
}
const noMes = (iso, mes) => { const d = deISO(iso); return !!d && d.getFullYear() === mes.getFullYear() && d.getMonth() === mes.getMonth(); };
const dataDoContrato = (c) => c.data_contrato || String(c.criado_em || c.created_at || "").slice(0, 10);

function montarFunil() {
  $("#aba-funil").innerHTML =
    '<div class="ferramentas">' +
      '<div class="cal__nav"><button class="btn--icone" id="fAnt" aria-label="Mês anterior">' + ic("esq") + '</button>' +
      '<span class="cal__mes" id="fMes"></span><button class="btn--icone" id="fProx" aria-label="Próximo mês">' + ic("dir") + "</button></div>" +
      '<button class="btn btn--linha" id="fHoje">Este mês</button><span class="espaco"></span>' +
      '<button class="btn" id="fRegistrar">' + ic("mais") + " Registrar abordagens</button>" +
    "</div>" +
    '<div class="numeros" id="fNumeros"></div>' +
    '<div class="bloco"><div class="bloco__cab"><h2>Marcas abordadas</h2><span class="espaco"></span>' +
      '<div class="pilulas" id="fEscala"><button type="button" data-e="dia">Por dia</button><button type="button" data-e="semana">Por semana</button></div></div>' +
      '<div id="fGrafico"></div><div class="funil__legenda" id="fLegenda"></div></div>' +
    '<div class="bloco"><div class="bloco__cab"><h2>Por canal</h2></div>' +
      '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>Canal</th><th class="num">Abordadas</th><th class="num">Contratos</th><th>Conversão</th><th class="num">Valor fechado</th></tr></thead><tbody id="fCanais"></tbody></table></div>' +
      '<div id="fGap" style="margin-top:12px"></div></div>' +
    '<div class="bloco"><div class="bloco__cab"><h2>Registros deste mês</h2><span class="mudo pequeno" id="fSync"></span></div><div id="fRegistros"></div></div>' +
    '<details class="sanfona" id="fConectar"><summary><span class="emoji">⚙️</span><div class="sanfona__txt"><div class="sanfona__tit">Conectar o Instagram automático</div>' +
      '<div class="sanfona__sub">Para o SocialSellPro mandar sozinho o número de DMs de cada dia</div></div><span class="chevron">' + ic("baixo") + "</span></summary>" +
      '<div class="sanfona__corpo" id="fConectarCorpo"></div></details>';

  $("#fAnt").addEventListener("click", () => { mesFunil.setMonth(mesFunil.getMonth() - 1); desenharFunil(); });
  $("#fProx").addEventListener("click", () => { mesFunil.setMonth(mesFunil.getMonth() + 1); desenharFunil(); });
  $("#fHoje").addEventListener("click", () => { mesFunil = new Date(); mesFunil.setDate(1); mesFunil.setHours(0, 0, 0, 0); desenharFunil(); });
  $("#fEscala").addEventListener("click", (e) => { const b = e.target.closest("[data-e]"); if (b) { escalaFunil = b.dataset.e; desenharFunil(); } });
  $("#fRegistrar").addEventListener("click", registrarAbordagens);
  const senha = D.config.senha_sincronizador;
  $("#fConectarCorpo").innerHTML = senha
    ? '<p class="pequeno" style="margin-bottom:8px">Copie a senha abaixo e mande para o Claude. Ele configura o seu Mac. Ela só serve para registrar DMs do Instagram: não lê nem muda mais nada.</p>' +
      '<div class="rot__chavelinha"><input class="entrada" readonly value="' + esc(senha) + '" id="fSenha"><button type="button" class="btn" id="fCopiarSenha">📋 Copiar senha</button></div>'
    : '<p class="mudo pequeno">Rode o sql-resultados.sql no Supabase para criar a senha do sincronizador.</p>';
  if (senha) $("#fCopiarSenha").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(senha); e.target.textContent = "copiada ✓"; } catch (x) { $("#fSenha").select(); e.target.textContent = "use Cmd + C"; }
  });
  $("#fRegistros").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-apagar-reg]");
    if (!b) return;
    if (!b.dataset.armado) { b.dataset.armado = "1"; b.classList.add("armado"); b.textContent = "Apagar?"; setTimeout(() => { if (b.isConnected) { delete b.dataset.armado; b.classList.remove("armado"); b.innerHTML = ic("lixo"); } }, 3000); return; }
    const id = b.dataset.apagarReg;
    if (await apagarLinha("abordagens", id)) { D.abordagens = D.abordagens.filter(a => a.id !== id); desenharFunil(); torrada("Registro apagado."); }
  });
}

function desenharFunil() {
  if (!$("#fMes")) return;
  const nomeMes = mesFunil.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  $("#fMes").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  $$("#fEscala button").forEach(b => b.classList.toggle("ativo", b.dataset.e === escalaFunil));

  /* abordagens por dia e por canal */
  const dias = diasDoMes(mesFunil);
  const porDia = {};
  dias.forEach(d => { porDia[d] = {}; });
  const totalCanal = {};
  D.abordagens.forEach(a => porDiaDoRegistro(a).forEach(([d, q]) => {
    if (!(d in porDia)) return;
    const k = CANAIS_ABORDAGEM.some(c => c[0] === a.canal) ? a.canal : "outro";
    porDia[d][k] = (porDia[d][k] || 0) + q;
    totalCanal[k] = (totalCanal[k] || 0) + q;
  }));
  const abordadas = Math.round(soma(Object.values(totalCanal), x => x));

  /* contratos do mês, por canal */
  const contratos = D.campanhas.filter(c => noMes(dataDoContrato(c), mesFunil));
  const porCanal = {};
  contratos.forEach(c => { const k = c.canal || "sem"; (porCanal[k] = porCanal[k] || []).push(c); });
  const valorCAD = (lista) => somaMoedas(lista.filter(c => !c.gift), c => c.valor);
  const valorMes = valorCAD(contratos);
  const deProspeccao = contratos.filter(c => ["manual", "instagram_auto", "onbento", "plataforma"].includes(c.canal)).length;
  const inbound = D.marcas.filter(m => noMes(String(m.criado_em || "").slice(0, 10), mesFunil)).length +
    D.base.filter(m => m.origem === "portfolio" && noMes(String(m.created_at || "").slice(0, 10), mesFunil)).length;

  $("#fNumeros").innerHTML =
    numero("Marcas abordadas", inteiro(abordadas)) +
    numero("Contratos fechados", inteiro(contratos.length), contratos.filter(c => c.gift).length ? plural(contratos.filter(c => c.gift).length, "gift", "gifts") : "") +
    numero("Conversão da prospecção", deProspeccao && abordadas ? "1 a cada " + inteiro(Math.round(abordadas / deProspeccao)) : "ainda não", deProspeccao && abordadas ? (Math.round(deProspeccao / abordadas * 1000) / 10).toString().replace(".", ",") + "% viraram contrato" : "") +
    numero("Valor fechado", valorMes.completo && !valorMes.soCAD ? dinheiroEm(valorMes.total, "CAD") : (valorMes.partes.join(" · ") || dinheiroEm(0, "CAD")), !valorMes.soCAD && valorMes.completo ? valorMes.partes.join(" · ") : "") +
    numero("Inbound recebidos", inteiro(inbound), "marcas que chegaram pelo site");

  /* gráfico empilhado */
  let barras;
  if (escalaFunil === "semana") {
    const semanas = [];
    dias.forEach(d => {
      const dt = deISO(d), seg = new Date(dt); seg.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
      const chave = isoLocal(seg);
      let s = semanas.find(x => x.chave === chave);
      if (!s) { s = { chave, rot: pad(Math.max(1, seg.getMonth() === mesFunil.getMonth() ? seg.getDate() : 1)) + "/" + pad(mesFunil.getMonth() + 1), v: {} }; semanas.push(s); }
      Object.entries(porDia[d]).forEach(([k, q]) => { s.v[k] = (s.v[k] || 0) + q; });
    });
    barras = semanas.map(s => ({ rot: "sem. " + s.rot, v: s.v, hoje: false }));
  } else {
    const hojeISO = isoLocal(hoje());
    barras = dias.map(d => ({ rot: String(deISO(d).getDate()), v: porDia[d], hoje: d === hojeISO }));
  }
  const maior = Math.max(0, ...barras.map(b => soma(Object.values(b.v), x => x)));
  $("#fGrafico").innerHTML = !abordadas
    ? '<p class="vazio">Nenhuma abordagem registrada neste mês ainda.<br>Os cliques em 📨 Prospectei, na aba Marcas, e o Instagram automático entram aqui sozinhos. onBento e plataformas você registra no botão ➕ Registrar abordagens.</p>'
    : '<div class="grafico funil__grafico' + (escalaFunil === "dia" ? " funil__grafico--dia" : "") + '">' + barras.map(b => {
        const tot = soma(Object.values(b.v), x => x);
        const titulo = b.rot + ": " + inteiro(Math.round(tot)) + " · " + CANAIS_ABORDAGEM.filter(c => b.v[c[0]]).map(c => c[1].replace(/^\S+\s/, "") + " " + Math.round(b.v[c[0]])).join(", ");
        return '<div class="grafico__col' + (b.hoje ? " hoje" : "") + '" title="' + esc(titulo) + '">' +
          '<div class="funil__pilha" style="height:' + (maior ? Math.max(tot ? 2 : 0, tot / maior * 100) : 0) + '%"' + (tot >= 1 ? ' data-v="' + Math.round(tot) + '"' : "") + ">" +
            CANAIS_ABORDAGEM.filter(c => b.v[c[0]]).map(c => '<span style="flex:' + b.v[c[0]] + ";background:" + c[2] + '"></span>').join("") +
          "</div>" + '<span class="grafico__dia">' + esc(b.rot) + "</span></div>";
      }).join("") + "</div>";
  $("#fLegenda").innerHTML = abordadas ? CANAIS_ABORDAGEM.filter(c => totalCanal[c[0]]).map(c => '<span><i style="background:' + c[2] + '"></i>' + esc(c[1]) + " · " + inteiro(Math.round(totalCanal[c[0]])) + "</span>").join("") : "";

  /* tabela por canal */
  const linhasCanal = CANAIS.map(([k, rot]) => {
    const ab = Math.round(totalCanal[k] || 0), ct = (porCanal[k] || []).length;
    return { k, rot, ab, ct, valor: valorCAD(porCanal[k] || []) };
  }).concat(porCanal.sem ? [{ k: "sem", rot: "Sem canal informado", ab: 0, ct: porCanal.sem.length, valor: valorCAD(porCanal.sem) }] : [])
    .filter(l => l.ab || l.ct);
  $("#fCanais").innerHTML = linhasCanal.length ? linhasCanal.map(l => {
    const temAbordagem = CANAIS_ABORDAGEM.some(c => c[0] === l.k);
    const conv = !temAbordagem ? '<span class="mudo pequeno">' + (l.k === "inbound" ? "chegaram sozinhas" : "sem abordagem contada") + "</span>"
      : l.ct && l.ab ? "1 a cada " + inteiro(Math.round(l.ab / l.ct)) : l.ab ? '<span class="mudo">nenhum contrato ainda</span>' : "";
    return "<tr><td>" + esc(l.rot) + '</td><td class="num">' + (temAbordagem ? inteiro(l.ab) : "·") + '</td><td class="num">' + inteiro(l.ct) + "</td><td>" + conv + '</td><td class="num">' +
      (l.valor.partes.length ? (l.valor.completo && !l.valor.soCAD ? dinheiroEm(l.valor.total, "CAD") : l.valor.partes.join(" · ")) : "·") + "</td></tr>";
  }).join("") : '<tr><td colspan="5"><p class="vazio">Nada neste mês ainda.</p></td></tr>';

  /* onde está o gap: leitura simples */
  const dicas = [];
  CANAIS_ABORDAGEM.forEach(([k, rot]) => {
    const ab = Math.round(totalCanal[k] || 0), ct = (porCanal[k] || []).length;
    if (ab >= 50 && !ct) dicas.push("🔍 <b>" + esc(rot) + "</b>: " + inteiro(ab) + " abordagens e nenhum contrato no mês. Vale revisar a mensagem ou a lista de marcas desse canal.");
  });
  const melhores = linhasCanal.filter(l => CANAIS_ABORDAGEM.some(c => c[0] === l.k) && l.ct && l.ab).sort((a, b) => a.ab / a.ct - b.ab / b.ct);
  if (melhores.length > 1) dicas.push("⭐ O canal que mais converte este mês é <b>" + esc(melhores[0].rot) + "</b> (1 contrato a cada " + inteiro(Math.round(melhores[0].ab / melhores[0].ct)) + ").");
  if (porCanal.sem) dicas.push("✏️ " + plural(porCanal.sem.length, "contrato está", "contratos estão") + " sem \"Por onde fechei\". Preencha na aba Campanhas para a conta ficar certa.");
  $("#fGap").innerHTML = dicas.map(d => '<p class="faixa faixa--aviso" style="margin-bottom:6px">' + d + "</p>").join("");

  /* registros do mês (os que não vieram de um clique em Prospectei) */
  const regs = D.abordagens.filter(a => !a.marca_id && (noMes(a.data, mesFunil) || (a.ate && noMes(a.ate, mesFunil))))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));
  $("#fRegistros").innerHTML = regs.length
    ? '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>Período</th><th>Canal</th><th>Detalhe</th><th class="num">Quantidade</th><th></th></tr></thead><tbody>' +
      regs.map(a => "<tr><td>" + dataBR(a.data) + (a.ate && a.ate !== a.data ? " a " + dataBR(a.ate) : "") + "</td><td>" + esc((CANAIS_ABORDAGEM.find(c => c[0] === a.canal) || [0, a.canal])[1]) + "</td><td>" +
        esc(a.detalhe || "") + (a.obs ? ' <span class="mudo">· ' + esc(a.obs) + "</span>" : "") + '</td><td class="num">' + inteiro(a.quantidade) +
        '</td><td class="curta"><button type="button" class="btn--icone" data-apagar-reg="' + esc(a.id) + '" aria-label="Apagar registro">' + ic("lixo") + "</button></td></tr>").join("") +
      "</tbody></table></div>"
    : '<p class="mudo pequeno">Nenhum registro de onBento, plataformas ou Instagram automático neste mês.</p>';
  const ultimoIG = D.abordagens.filter(a => a.canal === "instagram_auto" && a.chave).map(a => a.data).sort().pop();
  $("#fSync").textContent = ultimoIG ? "📸 Instagram automático sincronizado até " + dataBR(ultimoIG) : "📸 Instagram automático ainda não conectado";
}

function registrarAbordagens() {
  const hojeD = hoje(), seg = new Date(hojeD); seg.setDate(hojeD.getDate() - ((hojeD.getDay() + 6) % 7));
  editor({
    titulo: "➕ Registrar abordagens",
    topo: '<p class="mudo pequeno" style="margin-bottom:12px">Para o que o admin não conta sozinho: onBento e plataformas. Pode ser um dia só ou o total da semana. Ex.: onBento, de 22/09 a 28/09, 45 marcas.</p>',
    valores: { canal: "onbento", data: isoLocal(seg), ate: isoLocal(hojeD) },
    campos: [
      { nome: "canal", rot: "Canal", tipo: "select", opcoes: CANAIS_ABORDAGEM.map(c => [c[0], c[1]]) },
      { nome: "quantidade", rot: "Quantas marcas foram abordadas", tipo: "number", min: 0, passo: 1, obrigatorio: true },
      { nome: "data", rot: "De", tipo: "date", obrigatorio: true },
      { nome: "ate", rot: "Até (deixe igual para um dia só)", tipo: "date" },
      { nome: "detalhe", rot: "Detalhe", inteiro: true, dica: "Ex.: Billo, InSense...", lista: ["InSense", "Billo", "JoinBrands", "Collabstr", "Trend.io"] },
      { nome: "obs", rot: "Observação", tipo: "textarea", inteiro: true }
    ],
    aoSalvar: async (d, erro) => {
      if (!(d.quantidade > 0)) { erro("Coloque quantas marcas foram abordadas."); return false; }
      if (d.ate && d.ate < d.data) { erro("A data final é antes da inicial. Confira as datas."); return false; }
      if (d.ate === d.data) d.ate = null;
      d.quantidade = Math.round(d.quantidade);
      const salvo = await salvarLinha("abordagens", d);
      if (!salvo) return false;
      D.abordagens.push(salvo);
      const dt = deISO(salvo.data); mesFunil = new Date(dt.getFullYear(), dt.getMonth(), 1);
      desenharFunil();
      torrada("✅ " + plural(salvo.quantidade, "abordagem registrada", "abordagens registradas") + ".");
      return true;
    }
  });
}

/* ============================================================
   9d. ABA ABORDAGENS (gerador de e-mail, DM, plataforma e follow-up)
   A IA é o Claude pelo OpenRouter. A chave, os seus dados e o seu guia
   de estilo ficam na tabela configuracoes (só você lê), nunca no código.
   ============================================================ */
const OPENROUTER = "https://openrouter.ai/api/v1";
const MODELOS_IA = [["anthropic/claude-sonnet-5", "Claude Sonnet 5 (rápido, uns US$ 0,01 por mensagem)"], ["anthropic/claude-opus-5.5", "Claude Opus 5.5 (caprichado, uns US$ 0,02)"]];
const TIPOS_ABORDAGEM = [
  ["email", "✉️ E-mail", "Um e-mail frio de primeiro contato no método A.C.R. ASSUNTO funcional citando o produto. Saudação \"Hi [nome],\" se o nome for conhecido, senão \"Hello [Marca] team,\". 1) Atenção: a primeira frase fala do CLIENTE da marca (uma dor, um desejo, um momento) ou de algo específico do produto ou de um post, nunca da Cintia. 2) Resultado: a ideia de vídeo com NOME entre aspas, o GANCHO literal entre aspas (o que aparece e o que ela fala nos primeiros segundos) e a sequência curta de takes com o produto como herói. 3) Conexão: um fato REAL da vida dela que prova que ela é a cliente. 4) Uma frase sobre quem ela é e 3 marcas relevantes. 5) CTA: uma pergunta de sim ou não, seguida de uma linha curta convidando para ver os trabalhos dela, com o link do portfólio (ex.: \"In the meantime, you can see my recent work here: [portfólio]\"). No máximo 160 palavras. Assinatura \"Warmly,\" + nome."],
  ["dm", "💬 DM", "Uma DM fria de Instagram, no máximo 4 linhas: um elogio ESPECÍFICO a algo real da marca (post, Reel ou produto), dizer que teve uma ideia de vídeo pensada só para aquele produto e perguntar se pode mandar (ou qual o melhor e-mail). Sem apresentar a ideia inteira, sem assunto, sem links."],
  ["plataforma", "🧩 Plataforma", "Uma candidatura para uma vaga de UGC numa plataforma (InSense, Billo, JoinBrands...). A marca já quer contratar, então venda a IDEIA, não o processo. 1) Atenção: a primeira frase fala do CLIENTE da marca (a dor ou a objeção que o produto resolve), usando as palavras da brief. Nunca comece com \"I read the brief\", \"I love\", \"I noticed\" ou falando dela. 2) Resultado: uma ideia menos óbvia que a da brief, com NOME entre aspas, o GANCHO literal entre aspas e 2 ou 3 takes com o produto como herói, respeitando TUDO que a brief proíbe ou exige. 3) Conexão: um fato REAL dela que prova que ela é a cliente. 4) Uma frase de quem ela é com 3 marcas relevantes. 5) CTA: uma pergunta de sim ou não (ex.: roteiro com tempo de cada take para aprovação), seguida de uma linha curta convidando para ver os trabalhos dela, com o link do portfólio. NÃO liste formatos, proporções (9:16, 1:1), prazos nem entregáveis: isso é óbvio e a plataforma já sabe. De 90 a 150 palavras, sem assunto, sem assinatura longa."],
  ["followup", "🔁 Follow-up", "Um follow-up de 2 ou 3 linhas para um e-mail sem resposta há 48 a 72 horas, na mesma conversa: retoma a ideia ou traz um ângulo novo, urgência suave de agenda, e um CTA de sim ou não. Nunca cobrar, nunca repetir o primeiro e-mail. Sem assunto."]
];
let abTipo = "email";
let abResultado = null;     /* { assunto, mensagem } */
let abMarcaId = null;
let abBriefPDF = "";        /* texto tirado do PDF */

const cfgPerfil = () => { try { return JSON.parse(D.config.abordagem_perfil || "{}") || {}; } catch (e) { return {}; } };
async function salvaConfig(chave, valor) {
  const { error } = await banco.from("configuracoes").upsert({ chave, valor });
  if (error) { torrada(traduzErro(error, "configuracoes"), true); return false; }
  D.config[chave] = valor;
  return true;
}

function montarAbordar() {
  const p = cfgPerfil();
  const campo = (id, rot, dica, valor, area) => '<div class="campo"><label for="' + id + '">' + rot + "</label>" +
    (area ? '<textarea id="' + id + '" rows="3" placeholder="' + esc(dica) + '">' + esc(valor || "") + "</textarea>" : '<input id="' + id + '" value="' + esc(valor || "") + '" placeholder="' + esc(dica) + '" autocomplete="off">') + "</div>";
  $("#aba-abordar").innerHTML =
    '<p class="rot__frase">Escolha o tipo, a marca e cole a brief. A IA escreve no seu estilo, com os seus dados. Você revisa, ajusta e copia.</p>' +
    '<div class="abordar">' +
      /* esquerda: a abordagem */
      '<div class="abordar__principal">' +
        '<div class="pilulas" id="abTipos">' + TIPOS_ABORDAGEM.map(t => '<button type="button" data-t="' + t[0] + '">' + t[1] + "</button>").join("") + "</div>" +
        '<div class="bloco" style="margin-top:12px">' +
          '<div class="grade-form">' +
            '<div class="campo inteiro"><label for="abMarca">Marca</label><input id="abMarca" list="abMarcas" placeholder="Escolha da sua lista de Marcas ou digite" autocomplete="off">' +
              '<datalist id="abMarcas"></datalist><p class="mudo pequeno" id="abMarcaInfo" style="margin-top:4px"></p></div>' +
            '<div class="campo"><label for="abProduto">Produto</label><input id="abProduto" placeholder="Ex.: aspirador sem fio S9" autocomplete="off"></div>' +
            '<div class="campo"><label for="abLink">Link do produto</label><input id="abLink" placeholder="https://..." autocomplete="off"></div>' +
            '<div class="campo inteiro"><label for="abBrief">Brief, ou o que você viu da marca</label>' +
              '<textarea id="abBrief" rows="6" placeholder="Cole aqui o texto da brief, ou escreva o que chamou a sua atenção no site ou no Instagram da marca."></textarea>' +
              '<div class="abordar__pdf" id="abPdfZona"><input type="file" id="abPdf" accept=".pdf,.txt,.md" hidden>' +
                '<button type="button" class="btn btn--linha" id="abPdfBtn">📄 Anexar brief em PDF</button><span class="mudo pequeno" id="abPdfInfo">ou arraste o arquivo para cá</span></div></div>' +
            '<div class="campo inteiro"><label for="abPost">Link de um post ou Reel da marca (opcional)</label>' +
              '<div class="rot__chavelinha"><input id="abPost" class="entrada" placeholder="instagram.com/p/... · instagram.com/reel/... · tiktok.com/..." autocomplete="off">' +
              '<button type="button" class="btn btn--linha" id="abPuxar">📥 Puxar o post</button></div>' +
              '<p class="mudo pequeno" style="margin-top:4px">A IA fala sobre esse post na abordagem, como na sua DM da Royal. Custa 1 crédito da Supadata.</p><div id="abPostInfo"></div></div>' +
            '<div class="campo"><label for="abIdioma">Idioma</label><select id="abIdioma"><option value="inglês">Inglês</option><option value="português do Brasil">Português</option></select></div>' +
            '<div class="campo"><label for="abUso">Para que é o vídeo</label><select id="abUso"><option value="">Não sei (a IA deduz pela brief)</option><option value="ads">Anúncio pago (ads)</option><option value="organico">Orgânico (perfil da marca)</option></select></div>' +
            '<div class="campo inteiro"><label for="abExtra">Pedido especial (opcional)</label><input id="abExtra" placeholder="Um recado só para esta mensagem. Ex.: o herói é o sabor limão" autocomplete="off"></div>' +
          "</div>" +
          '<div class="abordar__botoes"><button type="button" class="btn btn--linha" id="abPesquisar" title="A IA pesquisa a marca na internet e traz fatos com fonte">🔎 Pesquisar a marca</button>' +
          '<button type="button" class="btn" id="abGerar">✨ Gerar abordagem</button></div>' +
          '<div id="abPesquisa"></div>' +
        "</div>" +
        '<div id="abSaida"></div>' +
      "</div>" +
      /* direita: meus dados, estilo e chave */
      '<aside class="abordar__lado">' +
        '<details class="sanfona" id="abDados"' + (p.nome ? "" : " open") + '><summary><span class="emoji">🙋‍♀️</span><div class="sanfona__txt"><div class="sanfona__tit">Meus dados</div><div class="sanfona__sub">' + esc(p.nome ? p.nome + (p.instagram ? " · " + p.instagram : "") : "Preencha uma vez") + "</div></div><span class=\"chevron\">" + ic("baixo") + "</span></summary>" +
          '<div class="sanfona__corpo"><div class="abordar__campos">' +
            campo("pNome", "Nome e assinatura *", "Escreva aqui. Ex.: Ci Marinho ✨", p.nome) +
            campo("pInsta", "@ do Instagram", "Escreva aqui. Ex.: @seuperfil", p.instagram) +
            campo("pPortfolio", "Portfólio", "Escreva aqui. Ex.: https://seusite.com", p.portfolio) +
            campo("pCidade", "Cidade", "Escreva aqui. Ex.: Toronto, Canada", p.cidade) +
            campo("pDif", "Diferenciais", "Escreva aqui o que só você é", p.diferenciais, true) +
            campo("pMarcas", "Marcas com quem já trabalhei", "Escreva aqui as marcas", p.marcas, true) +
            campo("pSobre", "Mais sobre mim (opcional)", "Escreva aqui, se quiser", p.sobre, true) +
          '</div><button type="button" class="btn btn--full" id="pSalvar" style="margin-top:10px">Salvar meus dados</button></div></details>' +
        '<details class="sanfona" id="abEstilo"' + (D.config.abordagem_estilo ? "" : " open") + '><summary><span class="emoji">🎨</span><div class="sanfona__txt"><div class="sanfona__tit">Meu estilo de abordagem</div><div class="sanfona__sub">' +
          (D.config.abordagem_estilo ? plural(String(D.config.abordagem_estilo).split(/\s+/).length, "palavra", "palavras") + " de regras e exemplos" : "Cole aqui o seu guia") + "</div></div><span class=\"chevron\">" + ic("baixo") + "</span></summary>" +
          '<div class="sanfona__corpo"><textarea id="abEstiloTxt" rows="12" class="entrada" style="height:auto;padding:10px;line-height:1.5" placeholder="Cole aqui os seus documentos de abordagem: regras de voz, o que nunca dizer, exemplos de mensagens que funcionaram...">' + esc(D.config.abordagem_estilo || "") + "</textarea>" +
          '<button type="button" class="btn btn--full" id="abEstiloSalvar" style="margin-top:8px">Salvar meu estilo</button></div></details>' +
        '<details class="sanfona" id="abIA"' + (D.config.openrouter_api_key ? "" : " open") + '><summary><span class="emoji">🔑</span><div class="sanfona__txt"><div class="sanfona__tit">IA (OpenRouter)</div><div class="sanfona__sub" id="abIAResumo"></div></div><span class="chevron">' + ic("baixo") + "</span></summary>" +
          '<div class="sanfona__corpo"><div class="campo"><label for="abChave">Chave do OpenRouter</label><input id="abChave" type="password" autocomplete="off" placeholder="' +
            (D.config.openrouter_api_key ? "Salva: ••••" + esc(String(D.config.openrouter_api_key).slice(-4)) + ". Cole outra para trocar." : "sk-or-...") + '"></div>' +
            '<div class="campo" style="margin-top:8px"><label for="abModelo">Modelo</label><select id="abModelo">' + MODELOS_IA.map(m => '<option value="' + m[0] + '"' + ((D.config.abordagem_modelo || MODELOS_IA[0][0]) === m[0] ? " selected" : "") + ">" + m[1] + "</option>").join("") + "</select></div>" +
            '<button type="button" class="btn btn--full" id="abChaveSalvar" style="margin-top:8px">Salvar</button>' +
            '<p class="mudo pequeno" style="margin-top:8px">Pegue a chave em <a class="link" href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a> (Create Key). Ela fica guardada no seu banco, só você vê.</p></div></details>' +
      "</aside>" +
    "</div>";

  $("#abTipos").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) { abTipo = b.dataset.t; desenharAbordar(); } });
  $("#abMarca").addEventListener("change", escolheMarca);
  $("#abMarca").addEventListener("input", () => { if (!$("#abMarca").value) { abMarcaId = null; $("#abMarcaInfo").textContent = ""; } });
  $("#abGerar").addEventListener("click", () => gerarAbordagem());
  $("#abPesquisar").addEventListener("click", pesquisarMarca);
  $("#abPuxar").addEventListener("click", puxarPost);
  $("#abPost").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); puxarPost(); } });
  $("#abPdfBtn").addEventListener("click", () => $("#abPdf").click());
  $("#abPdf").addEventListener("change", () => { const f = $("#abPdf").files[0]; if (f) lerBrief(f); });
  const zona = $("#abPdfZona");
  ["dragover", "dragenter"].forEach(ev => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("arrastando"); }));
  ["dragleave", "drop"].forEach(ev => zona.addEventListener(ev, () => zona.classList.remove("arrastando")));
  zona.addEventListener("drop", (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) lerBrief(f); });
  $("#pSalvar").addEventListener("click", async () => {
    const perfil = { nome: $("#pNome").value.trim(), instagram: $("#pInsta").value.trim(), portfolio: $("#pPortfolio").value.trim(), cidade: $("#pCidade").value.trim(),
      diferenciais: $("#pDif").value.trim(), marcas: $("#pMarcas").value.trim(), sobre: $("#pSobre").value.trim() };
    if (!perfil.nome) { torrada("Falta o seu nome no campo \"Nome e assinatura\". Digite e salve de novo.", true); $("#pNome").focus(); return; }
    if (await salvaConfig("abordagem_perfil", JSON.stringify(perfil))) { $("#abDados").open = false; $("#abDados .sanfona__sub").textContent = perfil.nome + (perfil.instagram ? " · " + perfil.instagram : ""); torrada("Meus dados salvos ✓"); }
  });
  $("#abEstiloSalvar").addEventListener("click", async () => {
    const t = $("#abEstiloTxt").value.trim();
    if (await salvaConfig("abordagem_estilo", t)) { $("#abEstilo").open = false; $("#abEstilo .sanfona__sub").textContent = plural(t.split(/\s+/).filter(Boolean).length, "palavra", "palavras") + " de regras e exemplos"; torrada("Meu estilo salvo ✓"); }
  });
  $("#abChaveSalvar").addEventListener("click", async () => {
    const nova = $("#abChave").value.trim(), modelo = $("#abModelo").value;
    if (nova) {
      const antiga = D.config.openrouter_api_key; D.config.openrouter_api_key = nova;
      const saldo = await saldoOpenRouter();
      if (saldo && saldo.erro === "chave") { D.config.openrouter_api_key = antiga; torrada("O OpenRouter não aceitou essa chave. Confira se copiou inteira.", true); return; }
      if (!(await salvaConfig("openrouter_api_key", nova))) { D.config.openrouter_api_key = antiga; return; }
    }
    if (modelo !== D.config.abordagem_modelo) await salvaConfig("abordagem_modelo", modelo);
    $("#abChave").value = ""; $("#abIA").open = false;
    atualizaResumoIA(); torrada("IA salva ✓");
  });
  desenharAbordar();
  atualizaResumoIA();
}

async function saldoOpenRouter() {
  if (!D.config.openrouter_api_key) return null;
  try {
    const r = await fetch(OPENROUTER + "/credits", { headers: { Authorization: "Bearer " + D.config.openrouter_api_key } });
    if (r.status === 401 || r.status === 403) return { erro: "chave" };
    const j = await r.json();
    return j.data || null;
  } catch (e) { return null; }
}
async function atualizaResumoIA() {
  const el = $("#abIAResumo");
  if (!el) return;
  if (!D.config.openrouter_api_key) { el.textContent = "Nenhuma chave salva ainda"; return; }
  el.textContent = "Chave terminando em " + String(D.config.openrouter_api_key).slice(-4) + " · conferindo o saldo...";
  const s = await saldoOpenRouter();
  el.textContent = "Chave terminando em " + String(D.config.openrouter_api_key).slice(-4) +
    (s && s.total_credits != null ? " · saldo US$ " + numBR.format(Math.max(0, s.total_credits - s.total_usage)) : s && s.erro ? " · chave não aceita" : "");
}

function desenharAbordar() {
  $$("#abTipos button").forEach(b => b.classList.toggle("ativo", b.dataset.t === abTipo));
  $("#abMarcas").innerHTML = D.base.filter(m => !m.exemplo).map(m => '<option value="' + esc(m.nome) + '">').join("");
  $("#abGerar").textContent = "✨ Gerar " + ({ email: "e-mail", dm: "DM", plataforma: "candidatura", followup: "follow-up" }[abTipo]);
  desenhaSaida();
}

function escolheMarca() {
  const nome = $("#abMarca").value.trim();
  const m = D.base.find(x => chaveNome(x.nome) === chaveNome(nome));
  abMarcaId = m ? m.id : null;
  if (!m) { $("#abMarcaInfo").textContent = nome ? "Marca fora da sua lista: tudo bem, a IA usa só o que você escrever aqui." : ""; return; }
  if (m.produto && !$("#abProduto").value) $("#abProduto").value = m.produto;
  if (m.link_produto && !$("#abLink").value) $("#abLink").value = m.link_produto;
  $("#abMarcaInfo").textContent = "Da sua lista: " + [m.nicho, m.email, m.instagram, m.obs ? "com observação" : ""].filter(Boolean).join(" · ") + ".";
}
/* abre a aba já com uma marca escolhida (botão ✍️ Abordar, na aba Marcas) */
function abordarMarca(m) {
  irPara("abordar");
  $("#abMarca").value = m.nome;
  $("#abProduto").value = m.produto || ""; $("#abLink").value = m.link_produto || "";
  escolheMarca();
  if (m.situacao === "em_conversa" || m.situacao === "prospectada") { abTipo = m.situacao === "prospectada" ? "followup" : "email"; desenharAbordar(); }
}

async function lerBrief(arquivo) {
  const info = $("#abPdfInfo");
  info.textContent = "Lendo " + arquivo.name + "...";
  try {
    let texto = "";
    if (/\.pdf$/i.test(arquivo.name) || arquivo.type === "application/pdf") {
      const pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: await arquivo.arrayBuffer() }).promise;
      for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
        const pag = await (await doc.getPage(i)).getTextContent();
        texto += pag.items.map(x => x.str + (x.hasEOL ? "\n" : " ")).join("") + "\n\n";
      }
    } else if (/\.(txt|md)$/i.test(arquivo.name)) {
      texto = await arquivo.text();
    } else {
      info.textContent = "Esse tipo de arquivo eu não leio. Salve como PDF ou cole o texto.";
      return;
    }
    texto = texto.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!texto) { info.textContent = "Esse PDF parece ser só imagem, sem texto para ler. Cole o texto da brief no campo acima."; return; }
    abBriefPDF = texto;
    info.innerHTML = "✅ <b>" + esc(arquivo.name) + "</b> lido (" + plural(texto.split(/\s+/).length, "palavra", "palavras") + '). <button type="button" class="link" id="abPdfTirar">tirar</button>';
    $("#abPdfTirar").addEventListener("click", () => { abBriefPDF = ""; $("#abPdf").value = ""; info.textContent = "ou arraste o arquivo para cá"; });
  } catch (e) {
    info.textContent = "Não consegui ler esse PDF. Cole o texto da brief no campo acima.";
  }
}

/* pesquisa na internet (OpenRouter + busca Exa): fatos com fonte, para ela conferir antes de usar */
async function pesquisarMarca() {
  if (!D.config.openrouter_api_key) { $("#abIA").open = true; torrada("Falta a chave do OpenRouter, no quadro 🔑 IA aqui do lado.", true); return; }
  const marca = $("#abMarca").value.trim();
  if (!marca) { torrada("Escolha ou escreva o nome da marca primeiro.", true); $("#abMarca").focus(); return; }
  const m = abMarcaId ? D.base.find(x => x.id === abMarcaId) : null;
  const alvo = $("#abPesquisa"), botao = $("#abPesquisar");
  botao.disabled = true; botao.textContent = "🔎 Pesquisando...";
  alvo.innerHTML = '<div class="abordar__pesquisa"><p class="mudo"><span class="rot__relogio">⏳</span> Pesquisando ' + esc(marca) + " na internet... leva uns 20 a 40 segundos.</p></div>";
  const pedido = "Pesquise a marca \"" + marca + "\"" +
    [$("#abProduto").value.trim() && "e o produto \"" + $("#abProduto").value.trim() + "\"", $("#abLink").value.trim() && "(link: " + $("#abLink").value.trim() + ")",
     m && m.site && "(site: " + m.site + ")", m && m.instagram && "(Instagram: " + m.instagram + ")"].filter(Boolean).join(" ") + ".\n\n" +
    "Traga de 4 a 7 fatos ATUAIS e verificáveis que ajudem uma creator de UGC a escrever uma abordagem personalizada para essa marca: posicionamento e diferenciais, lançamentos recentes, campanhas ou posts que chamaram atenção, para quem ela vende, tendências ou números públicos sobre a marca ou a categoria (hashtags, crescimento, avaliações).\n" +
    "Regras: só fatos que aparecem nas fontes; número só com fonte; nada de opinião. Cada fato numa linha começando com \"- \", em português do Brasil, e no fim da linha a fonte entre colchetes com a URL, assim: [https://...]. Nunca use travessão. Se não achar nada confiável, diga isso.";
  let texto = null, links = [], erro = null;
  try {
    const r = await fetch(OPENROUTER + "/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + D.config.openrouter_api_key, "Content-Type": "application/json", "HTTP-Referer": "https://cimarinho.com", "X-Title": "Admin Ci Marinho" },
      body: JSON.stringify({ model: D.config.abordagem_modelo || MODELOS_IA[0][0], plugins: [{ id: "web", engine: "exa", max_results: 8 }],
        messages: [{ role: "user", content: pedido }], temperature: 0.2, max_tokens: 5000, reasoning: { effort: "low" } })
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 || r.status === 403) erro = "O OpenRouter não aceitou a chave. Confira no quadro 🔑 IA.";
    else if (r.status === 402) erro = "Os créditos do OpenRouter acabaram. Coloque mais em openrouter.ai/credits.";
    else if (!r.ok) erro = "A pesquisa não deu certo agora (" + ((j.error && j.error.message) || r.status) + "). Tente de novo.";
    else {
      const msg = j.choices && j.choices[0] && j.choices[0].message || {};
      texto = msg.content;
      links = (msg.annotations || []).filter(a => a.type === "url_citation" && a.url_citation).map(a => a.url_citation);
    }
  } catch (e) { erro = "Sem conexão com a IA. Confira a sua internet."; }
  botao.disabled = false; botao.textContent = "🔎 Pesquisar a marca";
  atualizaResumoIA();
  if (erro || !texto) { alvo.innerHTML = '<div class="faixa" style="margin-top:10px">⚠️ ' + esc(erro || "A pesquisa voltou vazia. Tente de novo.") + "</div>"; return; }
  const fatos = semTravessao(texto).replace(/\*\*/g, "").split("\n").map(l => l.trim()).filter(l => /^[-•*]\s/.test(l)).map(l => l.replace(/^[-•*]\s+/, ""));
  const linkar = (t) => esc(t).replace(/\[(https?:\/\/[^\]\s]+)\]/g, (x, u) => ' <a class="link pequeno" href="' + u + '" target="_blank" rel="noopener">fonte ↗</a>');
  const fontesExtras = Array.from(new Map(links.map(l => [l.url, l])).values()).slice(0, 8);
  alvo.innerHTML = '<div class="abordar__pesquisa">' +
    '<div class="bloco__cab"><h2>🔎 O que eu achei sobre ' + esc(marca) + '</h2><span class="espaco"></span><span class="mudo pequeno">confira as fontes antes de usar</span></div>' +
    (fatos.length
      ? '<div class="abordar__fatos">' + fatos.map((f, i) => '<label class="item-check"><input type="checkbox" data-fato="' + i + '" checked><div class="item-check__t">' + linkar(f) + "</div></label>").join("") + "</div>"
      : '<p class="pequeno" style="white-space:pre-line">' + linkar(semTravessao(texto)) + "</p>") +
    (fontesExtras.length ? '<p class="mudo pequeno" style="margin-top:8px">Fontes consultadas: ' + fontesExtras.map(l => '<a class="link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc((l.title || l.url).slice(0, 50)) + "</a>").join(" · ") + "</p>" : "") +
    (fatos.length ? '<div class="ferramentas" style="margin:10px 0 0"><button type="button" class="btn" id="abUsarFatos">➕ Usar os marcados na abordagem</button><span class="mudo pequeno">Desmarque o que não quiser usar.</span></div>' : "") +
    "</div>";
  if (fatos.length) $("#abUsarFatos").addEventListener("click", () => {
    const usados = $$("[data-fato]", alvo).filter(c => c.checked).map(c => "- " + fatos[Number(c.dataset.fato)]);
    if (!usados.length) { torrada("Marque pelo menos um fato."); return; }
    const campo = $("#abBrief");
    campo.value = (campo.value.trim() ? campo.value.trim() + "\n\n" : "") + "Pesquisa sobre a marca (fatos com fonte):\n" + usados.join("\n");
    torrada("➕ " + plural(usados.length, "fato foi", "fatos foram") + " para a brief. Agora é só gerar.");
    alvo.innerHTML = "";
  });
}

/* puxa a legenda (e, se ela quiser, a fala) de um post da marca pela Supadata */
async function puxarPost() {
  const info = $("#abPostInfo"), botao = $("#abPuxar");
  const url = limpaLink($("#abPost").value);
  if (!url || !fonteDe(url)) { info.innerHTML = '<p class="faixa" style="margin-top:6px">Cole o link completo de um post ou Reel do Instagram, TikTok ou YouTube, começando com https://</p>'; return; }
  if (!D.config[CHAVE_SUPADATA]) { info.innerHTML = '<p class="faixa" style="margin-top:6px">Falta a chave da Supadata. Ela fica na aba Análise de vídeo, no quadro 🔑 Chave da Supadata.</p>'; return; }
  botao.disabled = true; botao.textContent = "⏳ Puxando...";
  const res = await supadata("/metadata?url=" + encodeURIComponent(url));
  botao.disabled = false; botao.textContent = "📥 Puxar o post";
  if (res.status !== 200) { info.innerHTML = '<p class="faixa" style="margin-top:6px">⚠️ ' + esc(erroSupadata(res)) + "</p>"; return; }
  const m = res.corpo || {}, st = m.stats || {}, autor = m.author || {};
  const legenda = String(m.description || m.caption || m.title || "").trim();
  const quando = m.createdAt ? dataBR(isoLocal(new Date(m.createdAt))) : "";
  const numeros = [st.likes != null && compacto.format(st.likes) + " curtidas", st.comments != null && compacto.format(st.comments) + " comentários", st.views != null && compacto.format(st.views) + " visualizações"].filter(Boolean).join(" · ");
  const post = { url, legenda, quando, numeros, autor: autor.username ? "@" + String(autor.username).replace(/^@/, "") : "", tipo: m.type, fala: "" };
  const desenha = () => {
    info.innerHTML = '<div class="abordar__pesquisa" style="margin-top:8px">' +
      '<p class="pequeno"><b>' + esc(post.autor || "Post da marca") + "</b>" + (post.quando ? ' <span class="mudo">· ' + post.quando + "</span>" : "") + (post.numeros ? ' <span class="mudo">· ' + esc(post.numeros) + "</span>" : "") + "</p>" +
      (post.legenda ? '<p class="pequeno" style="white-space:pre-line;margin-top:6px;max-height:140px;overflow:auto">' + esc(post.legenda) + "</p>" : '<p class="mudo pequeno" style="margin-top:6px">Esse post não tem legenda.</p>') +
      (post.fala ? '<p class="pequeno" style="margin-top:6px"><b>🎧 O que é falado:</b> ' + esc(post.fala.slice(0, 600)) + (post.fala.length > 600 ? "…" : "") + "</p>" : "") +
      '<div class="ferramentas" style="margin:10px 0 0"><button type="button" class="btn" id="abUsarPost">➕ Usar esse post na abordagem</button>' +
      (!post.fala && post.tipo !== "image" ? '<button type="button" class="btn btn--linha" id="abFala">🎧 Puxar também o que é falado</button>' : "") + "</div></div>";
    $("#abUsarPost").addEventListener("click", () => {
      const campo = $("#abBrief");
      const bloco = "Post da marca que eu vi" + (post.quando ? " (" + post.quando + ")" : "") + ": " + post.url + "\n" +
        (post.legenda ? "Legenda: " + post.legenda.slice(0, 2000) + "\n" : "") + (post.fala ? "O que é falado no vídeo: " + post.fala.slice(0, 3000) + "\n" : "") +
        "Use esse post como a Atenção da abordagem: cite algo específico dele.";
      campo.value = (campo.value.trim() ? campo.value.trim() + "\n\n" : "") + bloco;
      info.innerHTML = '<p class="mudo pequeno" style="margin-top:6px">✅ O post foi para a brief. Agora é só gerar.</p>';
    });
    const fala = $("#abFala");
    if (fala) fala.addEventListener("click", async () => {
      fala.disabled = true; fala.textContent = "🎧 Ouvindo... (pode levar 1 a 3 minutos)";
      const t = await falaDoVideo(url);
      if (t.erro) { fala.disabled = false; fala.textContent = "🎧 Puxar também o que é falado"; torrada(t.erro, true); return; }
      post.fala = t.texto || "(o vídeo não tem fala, só música ou texto na tela)";
      desenha(); atualizaSaldo();
    });
  };
  desenha();
  atualizaSaldo();
}
/* transcrição simples, esperando o trabalho da Supadata quando o vídeo é longo */
async function falaDoVideo(url) {
  const inicio = Date.now();
  let res = await supadata("/transcript?" + new URLSearchParams({ url, mode: "auto", text: "true", lang: "pt" }).toString());
  if (res.status === 202 && res.corpo.jobId) {
    const job = res.corpo.jobId; res = null;
    while (!res) {
      if (Date.now() - inicio > 4 * 60 * 1000) return { erro: "Demorou demais para ouvir o vídeo. Use só a legenda." };
      await espera(5000);
      const r2 = await supadata("/transcript/" + encodeURIComponent(job));
      if (r2.rede) continue;
      const st = String(r2.corpo.status || "").toLowerCase();
      if (st === "failed") return { texto: "" };
      if (st === "completed") res = r2;
      else if (r2.status >= 400) return { erro: erroSupadata(r2) };
    }
  }
  if (res.status === 206) return { texto: "" };
  if (res.status !== 200) return { erro: erroSupadata(res) };
  return { texto: textoDe(res.corpo).texto };
}

/* ----- o que a IA sabe: ela, o guia e a marca ----- */
function contextoDela() {
  const p = cfgPerfil();
  return "=== QUEM ELA É ===\n" +
    [["Nome e assinatura", p.nome], ["Instagram", p.instagram], ["Portfólio", p.portfolio], ["Cidade", p.cidade], ["Diferenciais", p.diferenciais], ["Marcas com quem já trabalhou", p.marcas], ["Mais sobre ela", p.sobre]]
      .filter(x => x[1]).map(x => x[0] + ": " + x[1]).join("\n") + "\n\n" +
    (D.config.abordagem_estilo ? "=== O GUIA DE ESTILO DELA ===\n" + D.config.abordagem_estilo + "\n\n" : "") +
    "=== REGRAS QUE VALEM SEMPRE ===\n" +
    "- Ela é creator de UGC, não influencer: vende conteúdo para a marca usar nos canais e anúncios da marca. Nunca fale de audiência, seguidores ou alcance dela.\n" +
    "- Nunca invente nome de produto, coleção, campanha, número ou fato que não esteja nos dados. Fatos sobre ela: só os da lista acima.\n" +
    "- Nunca use travessão. Use vírgula ou ponto.\n";
}
function dadosDaMarca() {
  const m = abMarcaId ? D.base.find(x => x.id === abMarcaId) : null;
  const brief = [$("#abBrief").value.trim(), abBriefPDF].filter(Boolean).join("\n\n").slice(0, 15000);
  return "=== A MARCA ===\n" +
    "Marca: " + ($("#abMarca").value.trim() || "(não informada)") + "\n" +
    ($("#abProduto").value.trim() ? "Produto: " + $("#abProduto").value.trim() + "\n" : "") +
    ($("#abLink").value.trim() ? "Link do produto: " + $("#abLink").value.trim() + "\n" : "") +
    (m && m.nicho ? "Nicho: " + m.nicho + "\n" : "") +
    (m && m.instagram ? "Instagram da marca: " + m.instagram + "\n" : "") +
    (m && m.site ? "Site: " + m.site + "\n" : "") +
    (m && m.obs ? "Observações dela sobre a marca: " + m.obs + "\n" : "") +
    (brief ? "\n=== BRIEF / O QUE ELA VIU DA MARCA ===\n" + brief + "\n" : "") +
    ($("#abExtra").value.trim() ? "\nPedido especial dela: " + $("#abExtra").value.trim() + "\n" : "") +
    "\nPara que é o vídeo: " + ({ ads: "anúncio pago (ads), para quem ainda não conhece a marca", organico: "orgânico, para o perfil da marca, que fala com quem já segue" }[$("#abUso").value] || "ela não sabe: deduza pela brief; na dúvida, trate como ads, que é o uso mais comum de UGC") + "\n";
}

/* ----- chamada à IA ----- */
async function chamarIA(mensagens, esforco, limite) {
  try {
    const r = await fetch(OPENROUTER + "/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + D.config.openrouter_api_key, "Content-Type": "application/json", "HTTP-Referer": "https://cimarinho.com", "X-Title": "Admin Ci Marinho" },
      body: JSON.stringify({ model: D.config.abordagem_modelo || MODELOS_IA[0][0], messages: mensagens, temperature: 0.8, max_tokens: limite || 6000, reasoning: { effort: esforco || "low" } })
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 || r.status === 403) return { erro: "O OpenRouter não aceitou a chave. Confira no quadro 🔑 IA." };
    if (r.status === 402) return { erro: "Os créditos do OpenRouter acabaram. Coloque mais em openrouter.ai/credits." };
    if (r.status === 429) return { erro: "Muitos pedidos seguidos. Espere um minutinho e tente de novo." };
    if (!r.ok) return { erro: "A IA não respondeu agora (" + ((j.error && j.error.message) || r.status) + "). Tente de novo." };
    const escolha = (j.choices && j.choices[0]) || {};
    const c = escolha.message && escolha.message.content;
    const texto = Array.isArray(c) ? c.map(x => x && (x.text || "")).join("") : c;
    if (texto) return { texto };
    if (escolha.finish_reason === "length") return { erro: "A IA pensou demais e não sobrou espaço para escrever. Tente de novo." };
    return { erro: "A IA voltou sem texto. Detalhe para o Claude: " + JSON.stringify({ modelo: j.model, fim: escolha.finish_reason, erro: (escolha.error && escolha.error.message) || (j.error && j.error.message), provedor: j.provider }) };
  } catch (e) { return { erro: "Sem conexão com a IA. Confira a sua internet." }; }
}
function checaAntes() {
  if (!D.config.openrouter_api_key) { $("#abIA").open = true; torrada("Falta a chave do OpenRouter, no quadro 🔑 IA aqui do lado.", true); return false; }
  if (!$("#abMarca").value.trim()) { torrada("Escolha ou escreva o nome da marca.", true); $("#abMarca").focus(); return false; }
  if (!cfgPerfil().nome) { $("#abDados").open = true; $("#pNome").focus(); torrada("Falta o seu nome no quadro 🙋‍♀️ Meus dados (campo \"Nome e assinatura\"). Digite e clique em Salvar meus dados.", true); return false; }
  return true;
}
const precisaIdeia = () => abTipo === "email" || abTipo === "plataforma";

/* ----- botão Gerar: e-mail e plataforma passam pela estrategista; DM e follow-up vão direto ----- */
async function gerarAbordagem(ajuste) {
  if (!checaAntes()) return;
  if (ajuste || !precisaIdeia()) return escreverAbordagem(ajuste);
  return pensarIdeias();
}

/* PASSO 1: a estrategista pensa antes de escrever e traz 3 ideias */
let abIdeias = null, abIdeia = null, abEstrategia = null;
async function pensarIdeias() {
  const botao = $("#abGerar");
  botao.disabled = true; botao.textContent = "🧠 Pensando nas ideias...";
  abResultado = null; abIdeia = null;
  $("#abSaida").innerHTML = '<div class="bloco abordar__saida"><p class="mudo"><span class="rot__relogio">⏳</span> Estudando a brief e o produto, e pensando em 3 ideias de vídeo... leva uns 30 a 60 segundos.</p></div>';
  const sistema = "Você é uma estrategista criativa de UGC que ajuda uma creator a ganhar trabalhos. Antes de qualquer texto, você pensa como a MARCA: o que faria um gerente de marketing parar tudo e querer ver esse vídeo.\n\n" + contextoDela();
  const pedido = dadosDaMarca() + "\n\n" +
    "Tarefa (" + (abTipo === "plataforma" ? "candidatura para uma vaga de UGC numa plataforma" : "e-mail frio para a marca") + "):\n" +
    "1. Descubra o HERÓI do produto: o diferencial mais vendável que aparece no nome, no link ou na brief (sabor, textura, formato, resultado, praticidade...).\n" +
    "2. Descubra a OBJEÇÃO ou o DESEJO principal do cliente que esse herói resolve.\n" +
    "3. Decida o USO do vídeo (ads ou orgânico), pelo que ela informou ou pela brief.\n" +
    "4. Crie 3 ideias de vídeo BEM diferentes entre si, fugindo do óbvio da brief, que respeitem tudo o que a brief exige ou proíbe, e que só ela poderia fazer por causa de fatos REAIS da vida dela. Cada ideia precisa fazer a marca ENXERGAR o vídeo.\n" +
    "5. O GANCHO é o que mais vende a ideia. Ele tem 3 camadas que acontecem juntas nos primeiros 3 segundos: VISUAL (o que aparece: o produto ou o problema já no primeiro segundo), FALADO (a frase exata) e TEXTO NA TELA (para quem assiste sem som). Regra: em 3 segundos quem assiste precisa saber DO QUE é o vídeo (a categoria do produto ou a dor) e sentir tensão ou curiosidade. Proibido gancho genérico de rotina (\"here's my morning routine\", \"a day in my life\") que não diz o assunto. Para ads: problema ou produto já no primeiro segundo, direto na dor ou no desejo. Para orgânico: pode ser mais lifestyle, mas o assunto continua claro. O gancho falado fala com quem assiste ou usa um fato REAL dela; nunca invente uma experiência que ela não contou (ex.: \"eu já desisti três vezes\").\n" +
    "6. Se o uso for ads, crie também um SEGUNDO gancho (falado e texto na tela) com outro ângulo, para a marca testar A/B.\n\n" +
    "Responda SOMENTE com um JSON válido, sem nada antes ou depois, neste formato (textos em português do Brasil, menos o gancho, que vai no idioma da mensagem: " + $("#abIdioma").value + "):\n" +
    '{"heroi":"...","objecao_ou_desejo":"...","uso":"ads ou organico","ideias":[{"nome":"nome curto e marcante","gancho_visual":"o que aparece no primeiro segundo","gancho":"a frase falada exata dos primeiros 3 segundos","gancho_texto":"o texto na tela","gancho_b":"segundo gancho falado para teste A/B (só se for ads, senão vazio)","gancho_b_texto":"texto na tela do segundo gancho (ou vazio)","cena":"2 ou 3 frases descrevendo o resto do vídeo, com o momento em que o produto brilha","fato_dela":"o fato real dela que torna a ideia crível","por_que_vende":"1 frase, pensando como a marca"}]}';
  const r = await chamarIA([{ role: "system", content: sistema }, { role: "user", content: pedido }], "medium", 9000);
  botao.disabled = false;
  desenharAbordar();
  if (r.erro) { $("#abSaida").innerHTML = '<div class="faixa" style="margin-top:12px">⚠️ ' + esc(r.erro) + "</div>"; return; }
  let dados = null;
  try { dados = JSON.parse(String(r.texto).replace(/^[\s\S]*?(\{)/, "$1").replace(/\}[^}]*$/, "}")); } catch (e) {}
  if (!dados || !Array.isArray(dados.ideias) || !dados.ideias.length) { $("#abSaida").innerHTML = '<div class="faixa" style="margin-top:12px">⚠️ A IA não trouxe as ideias no formato certo. Clique em Gerar de novo.</div>'; return; }
  abEstrategia = { heroi: semTravessao(dados.heroi || ""), objecao: semTravessao(dados.objecao_ou_desejo || ""), uso: /org/i.test(dados.uso || "") ? "organico" : "ads" };
  abIdeias = dados.ideias.slice(0, 3).map(i => Object.fromEntries(Object.entries(i).map(([k, v]) => [k, semTravessao(v)])));
  desenhaIdeias();
  atualizaResumoIA();
}
function desenhaIdeias() {
  $("#abSaida").innerHTML = '<div class="bloco abordar__saida">' +
    '<div class="bloco__cab"><h2>🧠 Escolha a ideia</h2><span class="espaco"></span><button type="button" class="btn btn--linha" id="abOutrasIdeias">🔄 Outras 3 ideias</button></div>' +
    '<p class="pequeno"><b>Herói do produto:</b> ' + esc(abEstrategia.heroi) + "<br><b>O que o cliente sente:</b> " + esc(abEstrategia.objecao) +
      "<br><b>Uso do vídeo:</b> " + (abEstrategia.uso === "organico" ? "orgânico (perfil da marca)" : "anúncio pago (ads)") + "</p>" +
    '<div class="abordar__ideias">' + abIdeias.map((i, n) =>
      '<div class="abordar__ideia"><div class="abordar__ideia-nome">' + esc(i.nome) + "</div>" +
      '<div class="abordar__gancho"><div><b>👀 Visual:</b> ' + esc(i.gancho_visual || "") + "</div>" +
        '<div><b>🗣️ Fala:</b> "' + esc(String(i.gancho || "").replace(/^"|"$/g, "")) + '"</div>' +
        '<div><b>🔤 Texto na tela:</b> ' + esc(i.gancho_texto || "") + "</div>" +
        (i.gancho_b ? '<div class="mudo"><b>🅱️ Gancho B:</b> "' + esc(String(i.gancho_b).replace(/^"|"$/g, "")) + '"' + (i.gancho_b_texto ? " · " + esc(i.gancho_b_texto) : "") + "</div>" : "") + "</div>" +
      '<p class="pequeno">' + esc(i.cena) + "</p>" +
      '<p class="mudo pequeno" style="margin-top:6px">✨ ' + esc(i.fato_dela) + "</p>" +
      '<p class="mudo pequeno">💰 ' + esc(i.por_que_vende) + "</p>" +
      '<button type="button" class="btn btn--full" data-ideia="' + n + '" style="margin-top:10px">✍️ Escrever com esta ideia</button></div>').join("") + "</div>" +
    '<p class="mudo pequeno" style="margin-top:8px">Dica: se quiser ajustar uma ideia, escreva no "Pedido especial" (ex.: "use a ideia 2, mas no café da manhã") e clique em Escrever.</p></div>';
  $("#abOutrasIdeias").addEventListener("click", pensarIdeias);
  $$("[data-ideia]").forEach(b => b.addEventListener("click", () => { abIdeia = abIdeias[Number(b.dataset.ideia)]; escreverAbordagem(); }));
}

/* PASSO 2: a redatora escreve uma história contínua a partir da ideia escolhida */
/* dois modelos para a redatora imitar (creator inventada, para nenhum dado real ficar no código) */
const MODELOS_PITCH = `MODELO 1 (candidatura em plataforma, produto: pó de eletrólitos sabor frutas vermelhas):
Most people don't skip hydration because they don't care. They skip it because plain water feels like a chore after a 12-hour shift.

That's where my video starts. It opens on my locker at 7am, scrubs still on, as I say "This is the only thing I drink after a night shift," with "night shift recovery in 10 seconds" on screen. Then I tear the berry stick into my bottle, shake it and take the first sip on camera, before showing it waiting in my bag for the drive home. It closes on the empty bottle and one line: "the one habit that made my shifts easier."

As a nurse who works nights, I live the exact tiredness this product is made for. I've created content for brands like Vital Proteins and Clinique.

Want me to send the timed script, plus a second hook you can A/B test? You can see my work here: [portfólio]

MODELO 2 (e-mail frio, produto: creme para pele sensível):
ASSUNTO: A 30-second redness test for your barrier cream
MENSAGEM:
Hello [Marca] team,

Anyone with reactive skin knows the moment: you try a new cream and spend the next hour waiting to see if your face turns red.

That's the tension my video plays with. It opens on a close-up of my cheek as I say "I don't trust new creams, so I test them like this," with "sensitive skin test: day 1" on screen. Then I apply the cream to one side only and we check in after a few minutes, an hour and the next morning, side by side. It closes on my face in natural light and one line: "the first one I didn't have to worry about."

I have rosacea, so this test isn't a script for me, it's how I choose every product. I've created content for brands like La Roche-Posay and Cetaphil.

Want me to send the timed script for the redness test? You can see my work here: [portfólio]

Warmly,
[nome]`;

function instrucaoRedatora() {
  const portfolio = cfgPerfil().portfolio || "";
  if (abTipo === "dm") return (TIPOS_ABORDAGEM.find(t => t[0] === "dm") || [])[2];
  if (abTipo === "followup") return (TIPOS_ABORDAGEM.find(t => t[0] === "followup") || [])[2];
  return (abTipo === "plataforma" ? "Uma candidatura para a vaga, sem assunto e sem assinatura longa." : "Um e-mail frio, com ASSUNTO curto que cite a ideia ou o produto, saudação \"Hi [nome],\" se o nome for conhecido, senão \"Hello [Marca] team,\", e assinatura \"Warmly,\" + o nome dela.") + "\n\n" +
    "ESTRUTURA (a mesma dos modelos abaixo, em 4 partes, e cada parte puxa a próxima):\n" +
    "1. A VERDADE DO CLIENTE (1 ou 2 frases): por que as pessoas desistem ou sofrem, ligada ao herói do produto. Nada sobre ela.\n" +
    "2. O VÍDEO NA ORDEM EM QUE ACONTECE, ligado à frase anterior (ex.: \"That's where my video starts.\"): como ABRE (o que aparece, a fala exata entre aspas e o texto na tela), o MEIO (o produto sendo usado, o momento em que ele brilha) e como FECHA (a imagem final e uma frase final). Se houver gancho B e o vídeo for para ads, ofereça o teste A/B só no fecho da mensagem.\n" +
    "3. POR QUE ELA (1 ou 2 frases): UM fato real dela com ligação DIRETA com a verdade do cliente da parte 1 (o fato mostra que ela vive esse problema). Depois, numa frase separada e neutra: \"I've created content for brands like...\" com 2 ou 3 marcas, de preferência do mesmo nicho. NUNCA ligue o fato às marcas com \"which is why\", \"that's why\", \"so brands\".\n" +
    "4. FECHO: uma pergunta de sim ou não ligada à ideia e, na mesma linha ou na seguinte, o convite para ver o trabalho dela: " + portfolio + "\n\n" +
    "Tamanho: parecido com os modelos, no máximo " + (abTipo === "plataforma" ? "150" : "170") + " palavras.\n" +
    "Do guia de estilo, use a VOZ, os FATOS dela e a lista do que nunca dizer. A ESTRUTURA é a dos modelos. Imite o ritmo e a lógica dos modelos, nunca as frases nem os produtos deles.\n\n" +
    "=== MODELOS (de outra creator; só para você ver o nível e a estrutura) ===\n" + MODELOS_PITCH;
}
async function escreverAbordagem(ajuste) {
  if (!checaAntes()) return;
  const botao = $("#abGerar");
  botao.disabled = true; botao.textContent = "✍️ Escrevendo...";
  const guardaIdeias = abIdeias && !ajuste ? $("#abSaida").innerHTML : "";
  $("#abSaida").innerHTML = '<div class="bloco abordar__saida"><p class="mudo"><span class="rot__relogio">⏳</span> Escrevendo no seu estilo... leva uns 15 a 30 segundos.</p></div>';
  const sistema = "Você é a redatora de uma creator de UGC e escreve abordagens em nome dela, no estilo dela. Você escreve como gente, com ritmo, e cada frase dá vontade de ler a próxima. Pense como a marca que vai ler.\n\n" + contextoDela() +
    "- Escreva em " + $("#abIdioma").value + ".\n\n" +
    "=== ANTES DE RESPONDER, RELEIA COMO A MARCA E REESCREVA SE PRECISAR ===\n" +
    "1. A primeira frase me faz querer ler a segunda?\n2. Eu consigo assistir ao vídeo na ordem: abertura, meio, fecho?\n3. Cada parágrafo continua o anterior, sem frase solta?\n" +
    "4. O fato dela tem ligação lógica com o problema do cliente? Alguma frase liga coisas que não têm relação (ex.: um hábito dela como motivo de marcas terem trabalhado com ela)? Se sim, corte.\n5. O fecho continua a ideia?\n6. Tem detalhe que se contradiz, palavra em português, travessão, número inventado ou palavra vaga (authentic, natural, creative, relatable)?\n\n" +
    "=== FORMATO DA RESPOSTA ===\n" + (abTipo === "email" ? "ASSUNTO: (uma linha)\nMENSAGEM:\n(o texto)\n" : "MENSAGEM:\n(o texto)\n") + "Não escreva nada antes nem depois disso.";
  let pedido = "Escreva: " + instrucaoRedatora() + "\n\n" + dadosDaMarca();
  if (abIdeia && abEstrategia) pedido += "\n=== A ESTRATÉGIA ESCOLHIDA POR ELA ===\nHerói do produto: " + abEstrategia.heroi + "\nO que o cliente sente: " + abEstrategia.objecao +
    "\nUso do vídeo: " + (abEstrategia.uso === "organico" ? "orgânico" : "ads") +
    "\nIdeia: " + abIdeia.nome + "\nGancho visual: " + (abIdeia.gancho_visual || "") + "\nGancho falado: " + abIdeia.gancho + "\nTexto na tela: " + (abIdeia.gancho_texto || "") +
    (abIdeia.gancho_b ? "\nGancho B (teste A/B): " + abIdeia.gancho_b + (abIdeia.gancho_b_texto ? " / texto: " + abIdeia.gancho_b_texto : "") : "") +
    "\nResto da cena: " + abIdeia.cena + "\nFato dela: " + abIdeia.fato_dela + "\nPor que vende: " + abIdeia.por_que_vende + "\n";
  if (ajuste && abResultado) pedido += "\n=== A VERSÃO ANTERIOR ===\n" + (abResultado.assunto ? "ASSUNTO: " + abResultado.assunto + "\n" : "") + abResultado.mensagem + "\n\nAgora: " + ajuste;
  const r = await chamarIA([{ role: "system", content: sistema }, { role: "user", content: pedido }], "low", 6000);
  botao.disabled = false;
  desenharAbordar();
  if (r.erro) { $("#abSaida").innerHTML = (guardaIdeias || "") + '<div class="faixa" style="margin-top:12px">⚠️ ' + esc(r.erro) + "</div>"; return; }
  const separa = (t) => {
    const limpo = semTravessao(t).replace(/\*\*/g, "");
    const a = limpo.match(/ASSUNTO:\s*(.+)/i);
    const mm = limpo.match(/MENSAGEM:\s*([\s\S]+)/i);
    return { assunto: a ? a[1].trim() : "", mensagem: (mm ? mm[1] : limpo.replace(/ASSUNTO:.*\n?/i, "")).trim() };
  };
  abResultado = separa(r.texto);
  desenhaSaida();
  atualizaResumoIA();
  guardaHistorico();
}

function desenhaSaida() {
  const s = $("#abSaida");
  if (!s || !abResultado) return;
  const m = abMarcaId ? D.base.find(x => x.id === abMarcaId) : null;
  const palavras = abResultado.mensagem.split(/\s+/).filter(Boolean).length;
  s.innerHTML = '<div class="bloco abordar__saida">' +
    '<div class="bloco__cab"><h2>' + (TIPOS_ABORDAGEM.find(t => t[0] === abTipo) || [0, ""])[1] + " pronto</h2><span class=\"mudo pequeno\">" + plural(palavras, "palavra", "palavras") + "</span></div>" +
    (abTipo === "email" ? '<div class="campo"><label>Assunto</label><input id="abAssunto" value="' + esc(abResultado.assunto) + '"></div>' : "") +
    '<div class="campo" style="margin-top:8px"><label>Mensagem (dá para editar aqui)</label><textarea id="abTexto" class="entrada" style="height:auto;min-height:260px;padding:12px;line-height:1.6">' + esc(abResultado.mensagem) + "</textarea></div>" +
    '<div class="rot__chips" style="margin-top:10px">' +
      [["outra", "🔄 Outra versão"], ["curta", "✂️ Mais curta"], ["direta", "🔥 Mais direta"], ["calorosa", "🤍 Mais calorosa"]].map(x => '<button type="button" class="rot__chip" data-aj="' + x[0] + '">' + x[1] + "</button>").join("") + "</div>" +
    '<div class="ferramentas" style="margin:10px 0 0">' +
      '<button type="button" class="btn" id="abCopiar">📋 Copiar</button>' +
      (abIdeias && precisaIdeia() ? '<button type="button" class="btn btn--linha" id="abVoltarIdeias">⬅️ Voltar às ideias</button>' : "") +
      (abTipo === "email" || abTipo === "followup" ? '<button type="button" class="btn btn--linha" id="abGmail">✉️ Abrir no Gmail</button>' : "") +
      (m && m.situacao === "quero_prospectar" ? '<button type="button" class="btn btn--linha" id="abProspectei">📨 Prospectei esta marca</button>' : "") +
    "</div></div>";
  const atual = () => ({ assunto: $("#abAssunto") ? $("#abAssunto").value : "", mensagem: $("#abTexto").value });
  $("#abTexto").addEventListener("input", () => { abResultado = atual(); });
  if ($("#abAssunto")) $("#abAssunto").addEventListener("input", () => { abResultado = atual(); });
  $(".rot__chips", s).addEventListener("click", (e) => {
    const b = e.target.closest("[data-aj]");
    if (!b) return;
    abResultado = atual();
    gerarAbordagem({ outra: "escreva uma versão diferente, com outro gancho e outra ideia de conteúdo.", curta: "deixe mais curta, com uns 30% menos palavras, sem perder o gancho.", direta: "deixe mais direta e ousada, com um gancho mais forte na primeira linha.", calorosa: "deixe mais calorosa e próxima, sem perder a objetividade." }[b.dataset.aj]);
  });
  if ($("#abVoltarIdeias")) $("#abVoltarIdeias").addEventListener("click", () => { abResultado = null; desenhaIdeias(); });
  $("#abCopiar").addEventListener("click", async (e) => {
    const t = atual();
    try { await navigator.clipboard.writeText((abTipo === "email" && t.assunto ? "Assunto: " + t.assunto + "\n\n" : "") + t.mensagem); e.target.textContent = "copiado ✓"; }
    catch (x) { $("#abTexto").select(); e.target.textContent = "use Cmd + C"; }
    setTimeout(() => { e.target.textContent = "📋 Copiar"; }, 2000);
  });
  if ($("#abGmail")) $("#abGmail").addEventListener("click", () => {
    const t = atual();
    const para = m && m.email ? m.email : "";
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(para) + "&su=" + encodeURIComponent(t.assunto || "") + "&body=" + encodeURIComponent(t.mensagem), "_blank", "noopener");
  });
  if ($("#abProspectei")) $("#abProspectei").addEventListener("click", async (e) => {
    const salvo = await salvarLinha("base_marcas", { situacao: "prospectada", ultimo_contato: isoLocal(new Date()) }, m.id);
    if (!salvo) return;
    troca(D.base, salvo); desenharBase(); registrarProspeccao([salvo]);
    e.target.remove(); torrada("📨 " + m.nome + " marcada como prospectada hoje.");
  });
}

/* as últimas mensagens ficam só neste navegador, para não perder uma boa versão */
function guardaHistorico() {
  try {
    const h = JSON.parse(localStorage.getItem("admin-abordagens") || "[]");
    h.unshift({ quando: new Date().toISOString(), tipo: abTipo, marca: $("#abMarca").value.trim(), assunto: abResultado.assunto, mensagem: abResultado.mensagem });
    localStorage.setItem("admin-abordagens", JSON.stringify(h.slice(0, 20)));
  } catch (e) {}
}

/* ============================================================
   10. MENU, GAVETA E SAIR
   ============================================================ */
const TITULOS = { portfolio: "Portfólio", marcas: "📥 Inbound pelo portfólio", base: "🏷️ Marcas", funil: "📊 Prospectado × Fechado", abordar: "✍️ Abordagens", calendario: "Calendário", campanhas: "Campanhas", checklist: "Checklist Portfólio", roteiros: "🎬 Análise de vídeo" };
const lateral = $("#lateral"), cortina = $("#cortina");
const fechaGaveta = () => { lateral.classList.remove("aberta"); cortina.classList.remove("aberta"); };
function irPara(aba) {
  if (!TITULOS[aba]) aba = "portfolio";
  $$(".menu__item").forEach(b => b.classList.toggle("ativo", b.dataset.aba === aba));
  $$(".aba").forEach(s => s.classList.toggle("ativa", s.id === "aba-" + aba));
  $("#titulo").textContent = TITULOS[aba];
  document.title = TITULOS[aba] + " · Admin";
  if (location.hash !== "#" + aba) history.replaceState(null, "", "#" + aba);
  fechaGaveta();
  window.scrollTo(0, 0);
}
$$(".menu__item").forEach(b => b.addEventListener("click", () => irPara(b.dataset.aba)));
$("#btnGaveta").addEventListener("click", () => { lateral.classList.add("aberta"); cortina.classList.add("aberta"); });
cortina.addEventListener("click", fechaGaveta);
$("#meuEmail").textContent = sessao.user.email || "";
$("#btnSair").addEventListener("click", async () => {
  try { await banco.auth.signOut(); } catch (e) {}
  location.replace(LOGIN);
});

/* ============================================================
   11. MONTAR TUDO
   Cada aba num bloco separado: se uma der erro, as outras abrem.
   ============================================================ */
function seguro(nome, fn) {
  try { fn(); } catch (e) {
    console.error(e);
    aviso("aba-" + nome, "A aba " + nome + " teve um problema para abrir. As outras funcionam normalmente.");
  }
}
seguro("Portfólio", () => { montarPortfolio(); desenharPortfolio(); });
seguro("Inbound", () => { montarMarcas(); desenharMarcas(); });
seguro("Marcas", () => { montarBase(); desenharBase(); });
seguro("Calendário", () => { montarCalendario(); desenharCalendario(); });
seguro("Campanhas", () => { montarCampanhas(); desenharCampanhas(); });
seguro("Prospectado × Fechado", () => { montarFunil(); desenharFunil(); });
seguro("Abordagens", montarAbordar);
seguro("Checklist", montarChecklist);
seguro("Roteiros", montarRoteiros);

irPara(location.hash.slice(1));
document.documentElement.classList.remove("travado");
})();
