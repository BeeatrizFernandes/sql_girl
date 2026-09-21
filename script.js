/* ===================================================================
   SQL GIRL — script.js
   Conteúdo dinâmico (operadores, funções, erros, desafios, cheat sheet)
   + interatividade: menu, busca, copiar código, dark mode, progresso,
   scroll suave, voltar ao topo.
   =================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     1. DADOS
  --------------------------------------------------------------- */

  var OPERATORS = [
    { symbol: "=", name: "Igual a", syntax: "coluna = valor", example: "status = 'Ativo'" },
    { symbol: "<>", name: "Diferente de", syntax: "coluna <> valor", example: "cidade <> 'Recife'" },
    { symbol: ">", name: "Maior que", syntax: "coluna > valor", example: "idade > 18" },
    { symbol: "<", name: "Menor que", syntax: "coluna < valor", example: "valor < 500" },
    { symbol: ">=", name: "Maior ou igual", syntax: "coluna >= valor", example: "salario >= 3000" },
    { symbol: "<=", name: "Menor ou igual", syntax: "coluna <= valor", example: "idade <= 30" },
    { symbol: "AND", name: "E — as duas condições", syntax: "cond1 AND cond2", example: "idade > 18 AND cidade = 'Recife'" },
    { symbol: "OR", name: "Ou — pelo menos uma", syntax: "cond1 OR cond2", example: "cidade = 'Recife' OR cidade = 'Salvador'" },
    { symbol: "NOT", name: "Nega a condição", syntax: "NOT condição", example: "NOT status = 'Cancelado'" },
    { symbol: "IN", name: "Está numa lista", syntax: "coluna IN (v1, v2)", example: "cidade IN ('Recife','Fortaleza')" },
    { symbol: "BETWEEN", name: "Dentro de um intervalo", syntax: "coluna BETWEEN a AND b", example: "valor BETWEEN 100 AND 500" },
    { symbol: "LIKE", name: "Combina com um padrão de texto", syntax: "coluna LIKE 'padrão%'", example: "nome LIKE 'Ana%'" },
    { symbol: "IS NULL", name: "O valor está vazio", syntax: "coluna IS NULL", example: "telefone IS NULL" },
    { symbol: "IS NOT NULL", name: "O valor não está vazio", syntax: "coluna IS NOT NULL", example: "email IS NOT NULL" }
  ];

  var AGG_FUNCTIONS = [
    { name: "COUNT()", syntax: "COUNT(coluna)", example: "SELECT COUNT(*) FROM vendas;", result: "482 linhas" },
    { name: "SUM()", syntax: "SUM(coluna)", example: "SELECT SUM(valor) FROM vendas;", result: "R$ 125.430,50" },
    { name: "AVG()", syntax: "AVG(coluna)", example: "SELECT AVG(valor) FROM vendas;", result: "R$ 260,15" },
    { name: "MIN()", syntax: "MIN(coluna)", example: "SELECT MIN(valor) FROM vendas;", result: "R$ 39,90" },
    { name: "MAX()", syntax: "MAX(coluna)", example: "SELECT MAX(valor) FROM vendas;", result: "R$ 3.200,00" }
  ];

  var TEXT_FUNCTIONS = ["CONCAT()", "UPPER()", "LOWER()", "LENGTH()", "TRIM()", "SUBSTRING()"];
  var DATE_FUNCTIONS = ["CURRENT_DATE", "YEAR()", "MONTH()", "DAY()", "DATE_DIFF()"];

  var ERRORS = [
    {
      title: "Erro 1 — texto sem aspas",
      wrong: "SELECT nome\nFROM clientes\nWHERE cidade = Fortaleza;",
      problem: "Texto precisa estar entre aspas simples.",
      right: "WHERE cidade = 'Fortaleza';"
    },
    {
      title: "Erro 2 — esqueceu a vírgula",
      wrong: "SELECT nome cidade\nFROM clientes;",
      problem: "Sem vírgula, o SQL entende \"cidade\" como um apelido de \"nome\".",
      right: "SELECT nome, cidade\nFROM clientes;"
    },
    {
      title: "Erro 3 — coluna inexistente",
      wrong: "column \"salarioo\" does not exist",
      problem: "Provavelmente um erro de digitação no nome da coluna — confira o schema da tabela.",
      right: "SELECT salario FROM funcionarios;"
    },
    {
      title: "Erro 4 — GROUP BY incompleto",
      wrong: "SELECT nome, cidade, COUNT(*)\nFROM clientes\nGROUP BY cidade;",
      problem: "Toda coluna do SELECT que não é agregada precisa estar no GROUP BY — aqui falta \"nome\".",
      right: "GROUP BY nome, cidade;"
    },
    {
      title: "Erro 5 — JOIN sem condição",
      wrong: "SELECT *\nFROM clientes c\nJOIN vendas v;",
      problem: "Sem ON, o banco cruza todas as linhas com todas — um produto cartesiano gigante e sem sentido.",
      right: "JOIN vendas v ON c.id = v.cliente_id;"
    },
    {
      title: "Erro 6 — comparar com NULL",
      wrong: "WHERE coluna = NULL",
      problem: "NULL não é um valor comparável com \"=\" — o resultado nunca é verdadeiro.",
      right: "WHERE coluna IS NULL"
    }
  ];

  var CHALLENGES = [
    { level: "Fácil", title: "Desafio 01", prompt: "Liste todos os clientes ativos.", answer: "SELECT *\nFROM clientes\nWHERE status = 'Ativo';" },
    { level: "Fácil", title: "Desafio 02", prompt: "Mostre o nome e a cidade de todos os clientes de Fortaleza.", answer: "SELECT nome, cidade\nFROM clientes\nWHERE cidade = 'Fortaleza';" },
    { level: "Médio", title: "Desafio 03", prompt: "Conte quantos clientes existem em cada cidade.", answer: "SELECT cidade, COUNT(*) AS quantidade\nFROM clientes\nGROUP BY cidade;" },
    { level: "Médio", title: "Desafio 04", prompt: "Liste as vendas com valor acima de R$ 500, da maior para a menor.", answer: "SELECT *\nFROM vendas\nWHERE valor > 500\nORDER BY valor DESC;" },
    { level: "Difícil", title: "Desafio 05", prompt: "Mostre o nome de cada cliente e o total que ele já comprou, ordenado do maior para o menor.", answer: "SELECT c.nome, SUM(v.valor) AS total_compras\nFROM clientes c\nINNER JOIN vendas v ON c.id = v.cliente_id\nGROUP BY c.nome\nORDER BY total_compras DESC;" }
  ];

  var CHEAT_SHEET = [
    ["SELECT", "Escolhe as colunas do resultado", "SELECT nome, cidade"],
    ["FROM", "Define a tabela de origem", "FROM clientes"],
    ["WHERE", "Filtra as linhas", "WHERE idade > 18"],
    ["AND", "Combina condições (todas verdadeiras)", "WHERE a AND b"],
    ["OR", "Combina condições (ao menos uma)", "WHERE a OR b"],
    ["IN", "Valor está em uma lista", "WHERE cidade IN ('A','B')"],
    ["BETWEEN", "Valor dentro de um intervalo", "WHERE valor BETWEEN 1 AND 100"],
    ["LIKE", "Combina com um padrão de texto", "WHERE nome LIKE 'Ana%'"],
    ["IS NULL", "Verifica valor vazio", "WHERE telefone IS NULL"],
    ["JOIN", "Combina linhas de duas tabelas", "JOIN vendas ON id = cliente_id"],
    ["GROUP BY", "Agrupa linhas para agregações", "GROUP BY cidade"],
    ["HAVING", "Filtra depois do agrupamento", "HAVING COUNT(*) > 10"],
    ["ORDER BY", "Ordena o resultado", "ORDER BY valor DESC"],
    ["LIMIT", "Limita o número de linhas", "LIMIT 10"],
    ["DISTINCT", "Remove duplicados", "SELECT DISTINCT cidade"],
    ["CASE", "Cria uma lógica condicional", "CASE WHEN a THEN b END"],
    ["COUNT", "Conta linhas", "COUNT(*)"],
    ["SUM", "Soma valores", "SUM(valor)"],
    ["AVG", "Calcula a média", "AVG(valor)"],
    ["MIN / MAX", "Menor / maior valor", "MIN(valor), MAX(valor)"]
  ];

  /* ---------------------------------------------------------------
     2. HELPERS
  --------------------------------------------------------------- */

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "BETWEEN", "LIKE",
    "IS NULL", "IS NOT NULL", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
    "FULL OUTER JOIN", "JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING",
    "LIMIT", "DISTINCT", "AS", "CASE", "WHEN", "THEN", "ELSE", "END",
    "ASC", "DESC", "NULL"
  ];

  // aplica highlight simples de sintaxe SQL a um trecho de texto puro
  function highlightSql(code) {
    var escaped = escapeHtml(code);
    // strings entre aspas simples
    escaped = escaped.replace(/'([^']*)'/g, "<span class=\"tok-str\">'$1'</span>");
    // números
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, "<span class=\"tok-num\">$1</span>");
    // palavras-chave (ordenadas das mais longas para as mais curtas para não quebrar combinadas)
    var sorted = SQL_KEYWORDS.slice().sort(function (a, b) { return b.length - a.length; });
    sorted.forEach(function (kw) {
      var re = new RegExp("\\b" + kw.replace(/\s+/g, "\\s+") + "\\b", "gi");
      escaped = escaped.replace(re, function (match) {
        return "<span class=\"tok-kw\">" + match + "</span>";
      });
    });
    return escaped;
  }

  function buildCodeWindow(filename, code, extraClass) {
    var wrap = el("div", "code-window" + (extraClass ? " " + extraClass : ""));
    wrap.setAttribute("data-filename", filename);

    var bar = el("div", "window-bar");
    bar.appendChild(el("span", "window-title", filename));

    var copyBtn = el("button", "copy-btn", copySvg() + "copiar");
    copyBtn.type = "button";
    copyBtn.setAttribute("aria-label", "Copiar código");
    bar.appendChild(copyBtn);
    wrap.appendChild(bar);

    var body = el("div", "window-body");
    var pre = el("pre", "code-lines");
    var codeEl = el("code", null, highlightSql(code));
    pre.appendChild(codeEl);
    body.appendChild(pre);
    wrap.appendChild(body);

    return wrap;
  }

  function copySvg() {
    return '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="6" y="6" width="10" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="3" width="10" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  }

  /* ---------------------------------------------------------------
     3. RENDERIZAÇÃO DE CONTEÚDO DINÂMICO
  --------------------------------------------------------------- */

  function renderOperators() {
    var grid = document.getElementById("operatorsGrid");
    if (!grid) return;
    OPERATORS.forEach(function (op) {
      var card = el("div", "op-card");
      card.appendChild(el("span", "op-symbol", escapeHtml(op.symbol)));
      card.appendChild(el("span", "op-name", escapeHtml(op.name)));
      card.appendChild(el("span", "op-example", highlightSql(op.example)));
      grid.appendChild(card);
    });
  }

  function renderAggFunctions() {
    var grid = document.getElementById("aggFunctionsGrid");
    if (!grid) return;
    AGG_FUNCTIONS.forEach(function (fn) {
      var card = el("div", "fn-card");
      card.appendChild(el("span", "fn-name", escapeHtml(fn.name)));
      card.appendChild(el("span", "fn-syntax", highlightSql(fn.syntax)));
      var resultP = el("p", "fn-result");
      resultP.innerHTML = highlightSql(fn.example) + "<br><strong>→ " + escapeHtml(fn.result) + "</strong>";
      card.appendChild(resultP);
      grid.appendChild(card);
    });
  }

  function renderChips(containerId, items) {
    var row = document.getElementById(containerId);
    if (!row) return;
    items.forEach(function (item) {
      row.appendChild(el("span", "chip", escapeHtml(item)));
    });
  }

  function renderErrors() {
    var grid = document.getElementById("errorsGrid");
    if (!grid) return;
    ERRORS.forEach(function (err) {
      var card = el("article", "error-card");
      card.appendChild(el("h3", null, escapeHtml(err.title)));
      card.appendChild(el("span", "error-label wrong", "❌ errado"));
      card.appendChild(buildCodeWindow("erro.sql", err.wrong));
      var p = el("p", null, "<strong>Problema:</strong> " + escapeHtml(err.problem));
      card.appendChild(p);
      card.appendChild(el("span", "error-label right", "✅ correção"));
      card.appendChild(buildCodeWindow("correcao.sql", err.right));
      grid.appendChild(card);
    });
  }

  function renderChallenges() {
    var wrap = document.getElementById("challengesWrap");
    if (!wrap) return;
    CHALLENGES.forEach(function (ch, i) {
      var card = el("article", "challenge");
      var head = el("div", "challenge-head");
      head.appendChild(el("h3", "challenge-title", escapeHtml(ch.title)));
      head.appendChild(el("span", "challenge-level", escapeHtml(ch.level)));
      card.appendChild(head);
      card.appendChild(el("p", "challenge-prompt", escapeHtml(ch.prompt)));

      var btn = el("button", "reveal-btn", "Ver resposta");
      btn.type = "button";
      var answerId = "challenge-answer-" + i;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", answerId);
      card.appendChild(btn);

      var answerWrap = el("div", "challenge-answer");
      answerWrap.id = answerId;
      answerWrap.hidden = true;
      answerWrap.appendChild(buildCodeWindow("resposta.sql", ch.answer));
      card.appendChild(answerWrap);

      btn.addEventListener("click", function () {
        var isHidden = answerWrap.hidden;
        answerWrap.hidden = !isHidden;
        btn.setAttribute("aria-expanded", String(isHidden));
        btn.textContent = isHidden ? "Ocultar resposta" : "Ver resposta";
      });

      wrap.appendChild(card);
    });
  }

  function renderCheatSheet() {
    var tbody = document.querySelector("#cheatTable tbody");
    if (!tbody) return;
    CHEAT_SHEET.forEach(function (row) {
      var tr = el("tr");
      tr.appendChild(el("td", null, escapeHtml(row[0])));
      tr.appendChild(el("td", null, escapeHtml(row[1])));
      var codeTd = el("td");
      codeTd.innerHTML = highlightSql(row[2]);
      tr.appendChild(codeTd);
      tbody.appendChild(tr);
    });
  }

  /* ---------------------------------------------------------------
     4. INTERATIVIDADE
  --------------------------------------------------------------- */

  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var panel = document.getElementById("navPanel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    panel.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem("sqlgirl-theme"); } catch (e) { saved = null; }
    if (saved === "dark" || saved === "light") {
      root.setAttribute("data-theme", saved);
    }
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var isDark = current === "dark" || (!current && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("sqlgirl-theme", next); } catch (e) { /* ignore */ }
    });
  }

  function initCopyButtons() {
    var toast = document.getElementById("toast");
    var toastTimer = null;

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy-btn");
      if (!btn) return;
      var windowEl = btn.closest(".code-window");
      if (!windowEl) return;
      var codeEl = windowEl.querySelector("code");
      var text = codeEl ? codeEl.textContent : "";

      var done = function () {
        showToast("SQL copiado! 💖");
        btn.classList.add("copied");
        setTimeout(function () { btn.classList.remove("copied"); }, 1200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
      } else {
        fallbackCopy(text);
        done();
      }
    });

    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  function initProgressBar() {
    var bar = document.getElementById("progressBar");
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initActiveNav() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    if (!sections.length || !links.length) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var link = map[id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------------
     5. BUSCA
  --------------------------------------------------------------- */

  function buildSearchIndex() {
    var index = [];
    OPERATORS.forEach(function (op) {
      index.push({ label: op.symbol + " — " + op.name, section: "WHERE / Operadores", target: "where" });
    });
    AGG_FUNCTIONS.forEach(function (fn) {
      index.push({ label: fn.name, section: "Funções", target: "funcoes" });
    });
    TEXT_FUNCTIONS.forEach(function (fn) {
      index.push({ label: fn, section: "Funções de texto", target: "funcoes" });
    });
    DATE_FUNCTIONS.forEach(function (fn) {
      index.push({ label: fn, section: "Funções de data", target: "funcoes" });
    });
    CHEAT_SHEET.forEach(function (row) {
      index.push({ label: row[0] + " — " + row[1], section: "Cheat Sheet", target: "cheatsheet" });
    });
    var extras = [
      { label: "SELECT", section: "Fundamentos", target: "select" },
      { label: "FROM", section: "Fundamentos", target: "fundamentos" },
      { label: "WHERE", section: "Filtros", target: "where" },
      { label: "INNER JOIN", section: "JOINs", target: "joins" },
      { label: "LEFT JOIN", section: "JOINs", target: "joins" },
      { label: "RIGHT JOIN", section: "JOINs", target: "joins" },
      { label: "FULL OUTER JOIN", section: "JOINs", target: "joins" },
      { label: "GROUP BY", section: "Agrupamento", target: "groupby" },
      { label: "ORDER BY", section: "Ordenação", target: "orderby" },
      { label: "CASE WHEN", section: "Funções", target: "funcoes" },
      { label: "Erros comuns", section: "Erros", target: "erros" },
      { label: "Desafios", section: "Prática", target: "desafios" }
    ];
    return index.concat(extras);
  }

  function initSearch() {
    var toggle = document.getElementById("searchToggle");
    var panel = document.getElementById("searchPanel");
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    if (!toggle || !panel || !input || !results) return;

    var index = buildSearchIndex();

    toggle.addEventListener("click", function () {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        input.focus();
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        results.innerHTML = "";
        input.value = "";
      }
    });

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) return;
      var matches = index.filter(function (item) {
        return item.label.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);

      matches.forEach(function (item) {
        var btn = el("button", "search-result-item");
        btn.type = "button";
        var labelHtml = escapeHtml(item.label).replace(
          new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"),
          "<mark>$1</mark>"
        );
        btn.innerHTML = labelHtml + '<span class="sr-section">' + escapeHtml(item.section) + "</span>";
        btn.addEventListener("click", function () {
          var target = document.getElementById(item.target);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
          results.innerHTML = "";
          input.value = "";
        });
        results.appendChild(btn);
      });
    });
  }

  /* ---------------------------------------------------------------
     6. INIT
  --------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    renderOperators();
    renderAggFunctions();
    renderChips("textFunctionsRow", TEXT_FUNCTIONS);
    renderChips("dateFunctionsRow", DATE_FUNCTIONS);
    renderErrors();
    renderChallenges();
    renderCheatSheet();

    initMobileMenu();
    initThemeToggle();
    initCopyButtons();
    initProgressBar();
    initBackToTop();
    initActiveNav();
    initSearch();
  });
})();
