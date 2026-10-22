/* ==========================================================================
   EHVOLUS · Medição do site com consentimento (LGPD)
   - Aviso de cookies: Aceitar / Recusar / Preferências (lembrado por 12 meses)
   - Google Analytics 4 com Consent Mode v2: só coleta depois do aceite
   - Pixel da Meta: só carrega depois do aceite de "marketing"
   - Cliques nos botões por público (empresa, profissional, cliente)

   CONFIGURAÇÃO: preencha os dois IDs abaixo. Com o campo vazio, a ferramenta
   simplesmente não carrega (o aviso de cookies continua funcionando).
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    ga4: "",        // ID do Google Analytics 4, formato G-XXXXXXXXXX
    metaPixel: "",  // ID do pixel da Meta, só números
    privacidade: "https://app.ehvolus.com.br/privacidade",
    versao: 1       // aumente para pedir o consentimento de novo
  };

  var KEY = "ehvolus-consentimento";
  var DOZE_MESES = 365 * 24 * 60 * 60 * 1000;

  /* ---- Consent Mode: tudo negado até a pessoa escolher ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", wait_for_update: 500
  });

  function ler() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.v === CONFIG.versao && Date.now() - c.ts < DOZE_MESES) return c;
    } catch (e) {}
    return null;
  }
  function salvar(analytics, marketing) {
    var c = { v: CONFIG.versao, ts: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  /* ---- carregamento das ferramentas ---- */
  var gaOn = false, pixelOn = false;
  function carregarGA() {
    if (gaOn || !CONFIG.ga4) return; gaOn = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.ga4;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", CONFIG.ga4, { anonymize_ip: true });
  }
  function carregarPixel() {
    if (pixelOn || !CONFIG.metaPixel) return; pixelOn = true;
    /* código padrão do pixel da Meta */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.metaPixel);
    window.fbq("track", "PageView");
  }
  function aplicar(c) {
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    if (c.analytics) carregarGA();
    if (c.marketing) carregarPixel();
  }

  /* ---- aviso de cookies ---- */
  var aviso;
  function montarAviso() {
    if (aviso) return aviso;
    aviso = document.createElement("div");
    aviso.className = "cookie-aviso";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-live", "polite");
    aviso.setAttribute("aria-label", "Preferências de cookies");
    aviso.innerHTML =
      '<div class="cookie-aviso__texto">' +
        '<p class="cookie-aviso__titulo">Sua privacidade</p>' +
        '<p>Usamos cookies para medir as visitas e melhorar o site. Os de medição e de anúncios só são ativados com o seu aceite. ' +
        '<a href="' + CONFIG.privacidade + '" target="_blank" rel="noopener">Política de Privacidade</a></p>' +
        '<div class="cookie-aviso__opcoes" hidden>' +
          '<label><input type="checkbox" checked disabled> Essenciais, sempre ativos</label>' +
          '<label><input type="checkbox" data-c="analytics"> Medição de visitas (Google Analytics)</label>' +
          '<label><input type="checkbox" data-c="marketing"> Anúncios (Meta)</label>' +
        '</div>' +
      '</div>' +
      '<div class="cookie-aviso__botoes">' +
        '<button type="button" class="cookie-btn cookie-btn--link" data-a="pref">Preferências</button>' +
        '<button type="button" class="cookie-btn cookie-btn--ghost" data-a="recusar">Recusar</button>' +
        '<button type="button" class="cookie-btn cookie-btn--gold" data-a="aceitar">Aceitar</button>' +
      '</div>';
    document.body.appendChild(aviso);
    aviso.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-a]"); if (!b) return;
      var opc = aviso.querySelector(".cookie-aviso__opcoes");
      var a = b.getAttribute("data-a");
      if (a === "pref") {
        if (opc.hidden) { opc.hidden = false; b.textContent = "Salvar escolhas"; return; }
        fechar(salvar(opc.querySelector('[data-c="analytics"]').checked, opc.querySelector('[data-c="marketing"]').checked));
      } else if (a === "aceitar") { fechar(salvar(true, true)); }
      else { fechar(salvar(false, false)); }
    });
    return aviso;
  }
  function abrir() {
    var a = montarAviso(), c = ler();
    if (c) {
      a.querySelector('[data-c="analytics"]').checked = c.analytics;
      a.querySelector('[data-c="marketing"]').checked = c.marketing;
    }
    requestAnimationFrame(function () { a.classList.add("is-open"); });
  }
  function fechar(c) {
    aplicar(c);
    aviso.classList.remove("is-open");
  }

  /* ---- cliques nos botões por público ---- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-cta]"); if (!el) return;
    var publico = el.getAttribute("data-cta"), local = el.getAttribute("data-cta-local") || "";
    if (gaOn) gtag("event", "cta_click", { publico: publico, local: local });
    if (pixelOn && window.fbq) window.fbq("trackCustom", "CTA_" + publico, { local: local });
  });

  /* ---- link do rodapé para reabrir as preferências ---- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cookie-pref]")) { e.preventDefault(); abrir(); }
  });

  function iniciar() {
    var c = ler();
    if (c) aplicar(c); else abrir();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
