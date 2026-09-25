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
  calendario: ["titulo", "marca", "tipo", "data", "status"],
  campanhas: ["campanha", "cliente", "tipo", "status", "qtd", "valor", "prazo", "pagamento", "ativa", "favorita"],
  marcados: ["chave"],
  roteiros: ["fonte", "url", "perfil", "de_quem", "titulo", "transcricao", "legenda", "postado_em", "tags", "obs", "status", "erro"],
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
  try {
    const q = id ? banco.from(tabela).update(dados).eq("id", id) : banco.from(tabela).insert(dados);
    const { data, error } = await q.select().single();
    if (error) throw error;
    return data;
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
function editor({ titulo, campos, valores, aoSalvar, aoApagar, larga, topo }) {
  valores = valores || {};
  const j = abrirJanela({
    titulo, larga,
    corpo: (topo || "") + '<form class="grade-form" novalidate>' + campos.map(c => campoHTML(c, valores[c.nome])).join("") +
           '<div class="faixa inteiro escondido" data-erro></div></form>',
    rodape: (aoApagar ? '<button class="btn btn--perigo" type="button" data-apagar>' + ic("lixo") + " Apagar</button>" : "") +
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
const D = { videos: [], visitas: [], marcas: [], calendario: [], campanhas: [], roteiros: [], config: {}, marcados: new Set() };
const inicio14 = hoje(); inicio14.setDate(inicio14.getDate() - 13);

const [videos, visitas, marcas, calendario, campanhas, marcados, roteiros, configuracoes] = await Promise.all([
  ler("videos", q => q.order("ordem", { ascending: true }).order("criado_em", { ascending: true })),
  ler("visitas", q => q.gte("data", inicio14.toISOString()).order("data", { ascending: true })),
  ler("marcas", q => q.order("criado_em", { ascending: false })),
  ler("calendario", q => q.order("data", { ascending: true })),
  ler("campanhas", q => q.order("criado_em", { ascending: false })),
  ler("marcados"),
  ler("roteiros", q => q.order("created_at", { ascending: false })),
  ler("configuracoes")
]);
Object.assign(D, { videos, visitas, marcas, calendario, campanhas, roteiros, marcados: new Set(marcados.map(m => m.chave)) });
configuracoes.forEach(c => { D.config[c.chave] = c.valor; });

const nomesDeMarcas = () => Array.from(new Set(D.marcas.map(m => m.nome).concat(D.campanhas.map(c => c.cliente), D.videos.map(v => v.marca)).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt"));

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
      (falhou.marcas ? "As marcas não puderam ser carregadas. Veja o aviso lá em cima." : D.marcas.length ? "Nenhuma marca encontrada com essa busca." : "Nenhuma marca ainda. Clique em Adicionar marca.") + "</p></td></tr>";
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
    } : null
  });
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
   8. ABA CAMPANHAS
   ============================================================ */
const FUNIL = ["Briefing", "Roteiro", "Aprovação Roteiro", "Gravação", "Edição", "Aprovado", "Entregue"];
const COR_STATUS = { "Briefing": "c-cinza", "Roteiro": "c-azul", "Aprovação Roteiro": "c-roxo", "Gravação": "c-coral", "Edição": "c-mostarda", "Aprovado": "c-verde", "Entregue": "c-destaque" };
const COR_TIPO = { "Conteúdo": "c-azul", "Publicidade": "c-coral" };
const COLUNAS = [
  { k: "favorita", rot: "", titulo: "Favorita", tipo: "fav" },
  { k: "campanha", rot: "Campanha", tipo: "texto" },
  { k: "cliente", rot: "Cliente", tipo: "texto" },
  { k: "tipo", rot: "Tipo", tipo: "texto" },
  { k: "status", rot: "Status", tipo: "funil" },
  { k: "qtd", rot: "Qtd", tipo: "num", num: true },
  { k: "valor", rot: "Valor", tipo: "num", num: true },
  { k: "prazo", rot: "Prazo", tipo: "data" },
  { k: "pagamento", rot: "Pagamento", tipo: "texto" }
];
let ordemCamp = { k: "prazo", dir: 1 };
let filtroCamp = "todas";

function valorOrdem(c, col) {
  const v = c[col.k];
  if (col.tipo === "fav") return v ? 0 : 1;
  if (col.tipo === "funil") { const i = FUNIL.indexOf(v); return i < 0 ? null : i; }
  if (col.tipo === "num") return v == null || v === "" ? null : Number(v);
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
      '<input class="entrada" id="kBusca" type="search" placeholder="Buscar campanha ou cliente">' +
      '<span class="mudo pequeno" id="kConta"></span><span class="espaco"></span>' +
      '<button class="btn btn--linha" id="kCsv">' + ic("baixar") + " Baixar CSV</button>" +
      '<button class="btn" id="kNova">' + ic("mais") + " Adicionar campanha</button>" +
    "</div>" +
    '<div class="tabela-caixa"><table class="tabela"><thead><tr id="kCab"></tr></thead><tbody id="kCorpo"></tbody></table></div>';

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
    if (!D.campanhas.length) { torrada("Ainda não tem nenhuma campanha para baixar."); return; }
    baixarCSV("campanhas", ["Favorita", "Campanha", "Cliente", "Tipo", "Status", "Qtd", "Valor", "Prazo", "Pagamento", "Situação"],
      D.campanhas.slice().sort(comparaCamp).map(c => [c.favorita ? "sim" : "", c.campanha, c.cliente, c.tipo, c.status, Number(c.qtd) || 0, Number(c.valor) || 0,
        dataBR(c.prazo), c.pagamento === "pago" ? "Pago" : "Pendente", c.ativa === false ? "Finalizada" : "Ativa"]));
  });
}

function desenharCampanhas() {
  const todas = D.campanhas;
  const ativas = todas.filter(c => c.ativa !== false);
  const valorTotal = soma(todas, c => c.valor);
  const videos = soma(todas, c => c.qtd);
  const aReceber = soma(todas.filter(c => c.pagamento !== "pago"), c => c.valor);
  const recebido = soma(todas.filter(c => c.pagamento === "pago"), c => c.valor);
  $("#kNumeros").innerHTML =
    numero("Campanhas", inteiro(todas.length)) +
    numero("Ativas", inteiro(ativas.length)) +
    numero("Valor total", dinheiro(valorTotal), videos > 0 ? "ticket médio por vídeo: " + dinheiro(valorTotal / videos) : "ticket médio aparece quando houver vídeos") +
    numero("A receber", dinheiro(aReceber), "já recebido: " + dinheiro(recebido));

  /* cabeçalho com setas */
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
  $("#kConta").textContent = lista.length === todas.length ? plural(todas.length, "campanha", "campanhas") : lista.length + " de " + todas.length;

  const corpo = $("#kCorpo");
  if (!lista.length) {
    corpo.innerHTML = '<tr><td colspan="9"><p class="vazio">' +
      (falhou.campanhas ? "As campanhas não puderam ser carregadas. Veja o aviso lá em cima." : todas.length ? "Nenhuma campanha com esse filtro." : "Nenhuma campanha ainda. Clique em Adicionar campanha.") + "</p></td></tr>";
    return;
  }
  corpo.innerHTML = lista.map(c => {
    const pago = c.pagamento === "pago";
    return '<tr class="clica' + (c.favorita ? " favorita" : "") + '" data-id="' + esc(c.id) + '">' +
      '<td class="curta"><button type="button" class="btn--icone estrela' + (c.favorita ? " ligada" : "") + '" data-estrela aria-label="' + (c.favorita ? "Tirar destaque" : "Destacar") + '">' + ic("estrela") + "</button></td>" +
      "<td><b>" + esc(c.campanha || "") + "</b>" + pilExemplo(c) + "</td>" +
      "<td>" + esc(c.cliente || "") + "</td>" +
      "<td>" + (c.tipo ? '<span class="pil ' + (COR_TIPO[c.tipo] || "c-cinza") + '">' + esc(c.tipo) + "</span>" : "") + "</td>" +
      "<td>" + (c.status ? '<span class="pil ' + (COR_STATUS[c.status] || "c-cinza") + '">' + esc(c.status) + "</span>" : "") + "</td>" +
      '<td class="num">' + inteiro(c.qtd) + "</td>" +
      '<td class="num">' + dinheiro(c.valor) + "</td>" +
      '<td style="white-space:nowrap">' + dataBR(c.prazo) + avisoPrazo(c) + "</td>" +
      '<td><span class="pil ' + (pago ? "c-verde" : "c-amarelo") + '">' + (pago ? "Pago" : "Pendente") + "</span></td></tr>";
  }).join("");
}

function editorCampanha(c) {
  editor({
    titulo: c ? "Editar campanha" : "Adicionar campanha",
    valores: c || { tipo: "Conteúdo", status: "Briefing", qtd: 1, valor: 0, pagamento: "pendente", ativa: true, favorita: false },
    campos: [
      { nome: "campanha", rot: "Campanha", obrigatorio: true, inteiro: true },
      { nome: "cliente", rot: "Cliente", lista: nomesDeMarcas() },
      { nome: "tipo", rot: "Tipo", tipo: "select", opcoes: ["Conteúdo", "Publicidade"] },
      { nome: "status", rot: "Status", tipo: "select", opcoes: FUNIL },
      { nome: "prazo", rot: "Prazo", tipo: "date" },
      { nome: "qtd", rot: "Quantidade de vídeos", tipo: "number", min: 0, passo: 1 },
      { nome: "valor", rot: "Valor total", tipo: "number", min: 0, passo: "0.01" },
      { nome: "pagamento", rot: "Pagamento", tipo: "select", opcoes: [["pendente", "Pendente"], ["pago", "Pago"]] },
      { nome: "ativa", rot: "Campanha ativa (desmarque quando finalizar)", tipo: "check" },
      { nome: "favorita", rot: "Destacar com estrela", tipo: "check" }
    ],
    aoSalvar: async (dados, erro) => {
      if (dados.qtd < 0 || dados.valor < 0) { erro("Quantidade e valor não podem ser negativos."); return false; }
      dados.qtd = Math.round(dados.qtd);
      const salvo = await salvarLinha("campanhas", dados, c && c.id);
      if (!salvo) return false;
      if (c) troca(D.campanhas, salvo); else D.campanhas.unshift(salvo);
      desenharCampanhas(); desenharCalendario();
      torrada("Campanha salva.");
      return true;
    },
    aoApagar: c ? async () => {
      if (!(await apagarLinha("campanhas", c.id))) return false;
      D.campanhas = D.campanhas.filter(x => x.id !== c.id); desenharCampanhas(); desenharCalendario(); torrada("Campanha apagada."); return true;
    } : null
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
async function supadata(caminho) {
  const chave = D.config[CHAVE_SUPADATA];
  let r;
  try { r = await fetch(SUPADATA + caminho, { headers: { "x-api-key": chave } }); }
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
  const capa = '<div class="rot__capa' + (yt ? " tem-foto" : "") + '"' + (yt ? ' style="background-image:url(\'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg\')"' : "") + ">" +
    (yt ? "" : '<span class="rot__capa-emoji">' + fonte.emoji + "</span>") +
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
    meio = r.transcricao ? '<p class="rot__texto">' + esc(r.transcricao) + "</p>" : '<p class="rot__texto mudo">Sem transcrição ainda.</p>';
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
      "</div>" + meio +
      '<div class="rot__acoes">' +
        (r.status === "pronto" && r.transcricao ? '<button type="button" class="btn btn--linha" data-copiar>📋 Copiar transcrição</button>' : "") +
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
  const atual = salvo || Object.assign({}, r, dados);
  troca(D.roteiros, atual);
  desenharRoteiros();
  atualizaSaldo();

  if (!resultado.falha) {
    mostraAviso("ok", "✅ Pronto em " + tempo() + ". Revisa, dá um nome e salva.");
    editorRoteiro(atual, null, "✅ Pronto. Revisa, dá um nome e salva.");
  } else if (resultado.semFala) {
    mostraAviso("erro", "🔇 " + SEM_FALA + ' <button type="button" class="btn btn--linha" id="rGuardar">📝 Guardar assim mesmo</button>');
    $("#rGuardar").addEventListener("click", () => editorRoteiro(atual));
  } else {
    mostraAviso("erro", "⚠️ " + esc(resultado.falha));
  }
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
   10. MENU, GAVETA E SAIR
   ============================================================ */
const TITULOS = { portfolio: "Portfólio", marcas: "Marcas", calendario: "Calendário", campanhas: "Campanhas", checklist: "Checklist Portfólio", roteiros: "📜 Roteiros" };
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
seguro("Marcas", () => { montarMarcas(); desenharMarcas(); });
seguro("Calendário", () => { montarCalendario(); desenharCalendario(); });
seguro("Campanhas", () => { montarCampanhas(); desenharCampanhas(); });
seguro("Checklist", montarChecklist);
seguro("Roteiros", montarRoteiros);

irPara(location.hash.slice(1));
document.documentElement.classList.remove("travado");
})();
