(function () {
  'use strict';

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- header scroll state ---- */
  var header = document.getElementById('siteHeader');
  var ticking = false;

  function updateHeaderState() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }, { passive: true });

  updateHeaderState();

  /* ---- nav panel (overlay menu) ---- */
  var navToggle = document.getElementById('navToggle');
  var navPanel = document.getElementById('navPanel');
  var navPanelClose = document.getElementById('navPanelClose');
  var navScrim = navPanel ? navPanel.querySelector('[data-nav-scrim]') : null;

  function openNav() {
    if (!navPanel || !navToggle) return;
    navPanel.classList.add('is-open');
    navPanel.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    if (navPanelClose) navPanelClose.focus();
  }

  function closeNav() {
    if (!navPanel || !navToggle) return;
    navPanel.classList.remove('is-open');
    navPanel.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function isNavOpen() {
    return !!(navPanel && navPanel.classList.contains('is-open'));
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (isNavOpen()) {
        closeNav();
        navToggle.focus();
      } else {
        openNav();
      }
    });
  }

  if (navPanelClose) {
    navPanelClose.addEventListener('click', function () {
      closeNav();
      if (navToggle) navToggle.focus();
    });
  }

  if (navScrim) {
    navScrim.addEventListener('click', closeNav);
  }

  if (navPanel) {
    navPanel.querySelectorAll('.nav-panel-list a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* ---- smooth, header-aware anchor scrolling ---- */
  function headerOffset() {
    return header ? header.offsetHeight : 0;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      closeNav();

      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() + 1;
      window.scrollTo({
        top: top,
        behavior: reduceMotionQuery.matches ? 'auto' : 'smooth'
      });

      window.setTimeout(function () {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, reduceMotionQuery.matches ? 0 : 420);
    });
  });

  /* ---- Escape closes nav panel or triangle panel ---- */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isNavOpen()) {
      closeNav();
      if (navToggle) navToggle.focus();
      return;
    }

    if (event.key === 'Tab' && isNavOpen() && navPanel) {
      var focusable = Array.prototype.slice.call(navPanel.querySelectorAll('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ==========================================================================
     TRIÂNGULO TRILATERAL
     ========================================================================== */
  var TRI_DATA = {
    empresa: {
      tag: 'Empresa',
      title: 'Demanda e gestão',
      dor: [
        'Depende de contatos avulsos para montar cada operação.',
        'Cada nova demanda começa do zero, sem histórico reaproveitável.',
        'Falta visibilidade sobre o andamento do que já está em execução.'
      ],
      sol: [
        'Encontra profissionais adequados à demanda em um só lugar.',
        'Organiza o fluxo de trabalho sem depender de planilha paralela.',
        'Acompanha a execução do início ao fim em tempo real.'
      ]
    },
    profissional: {
      tag: 'Profissional',
      title: 'Execução e experiência',
      dor: [
        'Cada trabalho novo começa sem levar o histórico anterior.',
        'Oportunidades chegam de forma informal e irregular.',
        'Falta uma estrutura que sustente a autonomia no dia a dia.'
      ],
      sol: [
        'Acessa demandas compatíveis com sua especialidade.',
        'Constrói reputação que acompanha sua trajetória ao longo do tempo.',
        'Ganha autonomia apoiada por uma estrutura consistente.'
      ]
    },
    cliente: {
      tag: 'Cliente',
      title: 'Necessidade e avaliação',
      dor: [
        'Não sabe ao certo quem vai atender a própria necessidade.',
        'Fica sem visibilidade entre o pedido e a execução.',
        'Depende de indicação informal para confiar no serviço.'
      ],
      sol: [
        'Encontra a solução adequada para a necessidade apresentada.',
        'Acompanha quem atende, quando atende e como o serviço avança.',
        'Avalia a execução até a conclusão do serviço.'
      ]
    },
    ehvolus: {
      tag: 'EHVOLUS',
      title: 'Coordenação do fluxo',
      dor: [
        'Os três lados trabalhavam isolados, cada um com sua própria rotina.',
        'A comunicação entre demanda, execução e acompanhamento se perdia no caminho.'
      ],
      sol: [
        'Reúne empresa, profissional e cliente no mesmo fluxo.',
        'Conecta demanda, execução e acompanhamento em tempo real.',
        'Torna o progresso do serviço visível para todos os lados.'
      ]
    }
  };

  var triOrder = ['empresa', 'profissional', 'ehvolus', 'cliente'];
  var trilateralSection = document.querySelector('.trilateral');
  var triNodes = Array.prototype.slice.call(document.querySelectorAll('[data-tri-node]'));
  var triPanel = document.getElementById('triPanel');
  var triClose = document.getElementById('triClose');
  var triPanelContent = document.getElementById('triPanelContent');
  var triPanelTag = document.getElementById('triPanelTag');
  var triPanelTitle = document.getElementById('triPanelTitle');
  var triPanelDor = document.getElementById('triPanelDor');
  var triPanelSol = document.getElementById('triPanelSol');
  var triActive = null;
  var triSwapTimer = null;

  function triRender(key) {
    var data = TRI_DATA[key];
    if (!data || !triPanelContent) return;

    triPanelTag.textContent = data.tag;
    triPanelTitle.textContent = data.title;
    triPanelDor.innerHTML = data.dor.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('');
    triPanelSol.innerHTML = data.sol.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('');
  }

  function triSetActive(key) {
    triNodes.forEach(function (node) {
      var isActive = node.getAttribute('data-tri-node') === key;
      node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      node.classList.toggle('is-dim', !!key && !isActive);
    });
  }

  function triOpen(key) {
    if (!TRI_DATA[key] || !triPanel) return;

    var swap = !!triActive;
    triActive = key;
    triSetActive(key);

    if (swap) {
      window.clearTimeout(triSwapTimer);
      triPanelContent.classList.add('is-swapping');
      triSwapTimer = window.setTimeout(function () {
        triRender(key);
        triPanelContent.classList.remove('is-swapping');
        triSwapTimer = null;
      }, reduceMotionQuery.matches ? 0 : 220);
    } else {
      triRender(key);
      triPanel.removeAttribute('inert');
      triPanel.setAttribute('aria-hidden', 'false');
      if (trilateralSection) trilateralSection.classList.add('is-open');
    }
  }

  function triCloseFn(restoreFocus) {
    if (!triActive) return;
    var lastKey = triActive;
    window.clearTimeout(triSwapTimer);
    triSwapTimer = null;
    if (triPanelContent) triPanelContent.classList.remove('is-swapping');
    triActive = null;
    triSetActive(null);
    if (triPanel) {
      triPanel.setAttribute('aria-hidden', 'true');
      triPanel.setAttribute('inert', '');
    }
    if (trilateralSection) trilateralSection.classList.remove('is-open');

    if (restoreFocus) {
      var trigger = triNodes.filter(function (node) {
        return node.getAttribute('data-tri-node') === lastKey;
      })[0];
      if (trigger) trigger.focus();
    }
  }

  triNodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var key = node.getAttribute('data-tri-node');
      if (triActive === key) {
        triCloseFn(false);
      } else {
        triOpen(key);
      }
    });
  });

  if (triClose) {
    triClose.addEventListener('click', function () {
      triCloseFn(true);
    });
  }

  document.addEventListener('click', function (event) {
    if (!triActive || !trilateralSection) return;
    var withinNode = event.target.closest('[data-tri-node]');
    var withinPanel = event.target.closest('#triPanel');
    if (!withinNode && !withinPanel) {
      triCloseFn(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && triActive) {
      triCloseFn(true);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      var withinTriangle = document.activeElement && document.activeElement.closest &&
        (document.activeElement.closest('[data-tri-stage]') || document.activeElement.closest('#triPanel'));
      if (!withinTriangle) return;
      event.preventDefault();

      var currentIndex = triActive ? triOrder.indexOf(triActive) : -1;
      var nextIndex = event.key === 'ArrowRight'
        ? (currentIndex + 1 + triOrder.length) % triOrder.length
        : (currentIndex - 1 + triOrder.length) % triOrder.length;
      triOpen(triOrder[nextIndex]);

      var nextNode = triNodes.filter(function (node) {
        return node.getAttribute('data-tri-node') === triOrder[nextIndex];
      })[0];
      if (nextNode) nextNode.focus();
    }
  });

  /* ---- subtle scroll reveals ---- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ==========================================================================
     HERO · GLOBO E CANVAS DO FECHAMENTO
     ========================================================================== */
  var flowChapter = document.querySelector('.flow-chapter');
  var flowPin = document.querySelector('[data-flow-pin]');
  function initGsapReveals() {
    if (!(window.gsap && window.ScrollTrigger) || reduceMotionQuery.matches) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    /* Cascatas por grupo: os itens de cada seção entram em sequência */
    var groups = [
      { trigger: '.tensao-grid', items: '.tensao-item' },
      { trigger: '.steps-list', items: '.step' },
      { trigger: '.mercados-list', items: '.mercado-item' },
      { trigger: '.mv-grid', items: '.mv-block' },
      { trigger: '.values-list', items: '.values-list li' }
    ];

    groups.forEach(function (group) {
      var items = window.gsap.utils.toArray(group.items);
      if (!items.length) return;
      window.gsap.fromTo(items, { y: 36, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: group.trigger,
          start: 'top 80%',
          once: true
        }
      });
    });

    window.gsap.utils.toArray('.journey').forEach(function (el) {
      window.gsap.fromTo(el, { y: 48, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true
        }
      });
    });

    /* Parallax sutil nas fotos editoriais durante o scroll */
    window.gsap.utils.toArray('.journey-photo, .markets-photo').forEach(function (img) {
      window.gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
        yPercent: 5,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('figure') || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  function initTriTilt() {
    if (reduceMotionQuery.matches || !window.matchMedia('(hover: hover)').matches) return;
    var stage = document.querySelector('[data-tri-stage]');
    var triCanvas = document.querySelector('[data-tri-canvas]');
    if (!stage || !triCanvas) return;
    stage.addEventListener('mousemove', function (event) {
      var rect = stage.getBoundingClientRect();
      var ry = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      var rx = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
      triCanvas.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () {
      triCanvas.style.transform = '';
    });
  }

  function initHeroParallax() {
    if (!flowChapter || reduceMotionQuery.matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    var backdrop = document.querySelector('.flow-backdrop');
    if (!backdrop) return;
    flowChapter.addEventListener('mousemove', function (event) {
      var x = (event.clientX / window.innerWidth - 0.5) * -14;
      var y = (event.clientY / window.innerHeight - 0.5) * -10;
      backdrop.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(1.05)';
    });
    flowChapter.addEventListener('mouseleave', function () {
      backdrop.style.transform = '';
    });
  }

  function initTensaoSlider() {
    var slider = document.querySelector('[data-tensao-slider]');
    if (!slider) return;
    var track = slider.querySelector('[data-tensao-track]');
    var cards = Array.prototype.slice.call(track.children);
    var dotsWrap = slider.querySelector('[data-tensao-dots]');
    var prevBtn = slider.querySelector('[data-tensao-prev]');
    var nextBtn = slider.querySelector('[data-tensao-next]');
    if (!track || !cards.length || !dotsWrap) return;

    var current = 0;

    cards.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'tensao-dot';
      dot.setAttribute('aria-label', 'Ir para a posição ' + (index + 1));
      dot.addEventListener('click', function () {
        goTo(index);
      });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function cardStep() {
      return cards.length > 1 ? Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft) : 1;
    }

    function maxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    /* Só existem cards.length - visíveis + 1 posições reais de scroll;
       dots além disso não levariam a lugar nenhum */
    function pageCount() {
      var visible = Math.max(1, Math.round(track.clientWidth / cardStep()));
      return Math.max(1, cards.length - visible + 1);
    }

    function setActive(index) {
      var pages = pageCount();
      current = Math.max(0, Math.min(pages - 1, index));
      dots.forEach(function (dot, dotIndex) {
        dot.hidden = dotIndex >= pages;
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function goTo(index) {
      var pages = pageCount();
      var clamped = Math.max(0, Math.min(pages - 1, index));
      track.scrollTo({
        left: Math.min(clamped * cardStep(), maxScroll()),
        behavior: reduceMotionQuery.matches ? 'auto' : 'smooth'
      });
      setActive(clamped);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(current > 0 ? current - 1 : pageCount() - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(current < pageCount() - 1 ? current + 1 : 0);
      });
    }

    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        setActive(Math.round(track.scrollLeft / cardStep()));
      }, 90);
    }, { passive: true });

    window.addEventListener('resize', function () {
      setActive(current);
    });

    setActive(0);
  }

  function initMvvCarousel() {
    var root = document.querySelector('[data-mvv]');
    if (!root) return;
    var rail = root.querySelector('[data-mvv-rail]');
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-mvv-chip]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-mvv-card]'));
    if (!rail || !chips.length || chips.length !== cards.length) return;

    var count = chips.length;
    var ITEM_HEIGHT = 62;
    var current = 0;
    var timer = null;
    var hoverPaused = false;

    function wrapDist(diff) {
      var half = count / 2;
      if (diff > half) diff -= count;
      if (diff < -half) diff += count;
      return diff;
    }

    function render() {
      chips.forEach(function (chip, index) {
        var d = wrapDist(index - current);
        chip.style.setProperty('--y', (d * ITEM_HEIGHT) + 'px');
        chip.style.opacity = String(Math.max(0, 1 - Math.abs(d) * 0.28));
        chip.classList.toggle('is-active', index === current);
        chip.tabIndex = Math.abs(d) > 2 ? -1 : 0;
      });
      cards.forEach(function (card, index) {
        var d = wrapDist(index - current);
        card.classList.toggle('is-active', d === 0);
        card.classList.toggle('is-prev', d === -1);
        card.classList.toggle('is-next', d === 1);
      });
    }

    function goTo(index) {
      current = ((index % count) + count) % count;
      render();
    }

    function start() {
      if (reduceMotionQuery.matches) return;
      stop();
      timer = window.setInterval(function () {
        if (!hoverPaused && !document.hidden) goTo(current + 1);
      }, 3600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    chips.forEach(function (chip, index) {
      chip.addEventListener('click', function () {
        goTo(index);
        start();
      });
    });

    rail.addEventListener('mouseenter', function () { hoverPaused = true; });
    rail.addEventListener('mouseleave', function () { hoverPaused = false; });

    render();
    start();
  }

  function initSpotlight() {
    if (!flowChapter || !flowPin || reduceMotionQuery.matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    flowChapter.addEventListener('mousemove', function (event) {
      var rect = flowPin.getBoundingClientRect();
      flowPin.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100) + '%');
      flowPin.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  initSpotlight();
  initGsapReveals();
  initTriTilt();
  initHeroParallax();
  initTensaoSlider();
  initMvvCarousel();

  window.addEventListener('resize', function () {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
})();
