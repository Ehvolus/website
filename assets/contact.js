/* ==========================================================================
   EHVOLUS · Fale conosco
   Modal, validação e envio para o backend do app.
   ========================================================================== */
var RECAPTCHA_SITE_KEY = 'PREENCHER';
var CONTACT_ENDPOINT = 'https://app.ehvolus.com.br/api/v1/site/contact/';

(function () {
  'use strict';

  var dialog = document.getElementById('contactDialog');
  var form = document.getElementById('contactForm');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;

  var success = document.getElementById('contactSuccess');
  var statusBox = document.getElementById('contactStatus');
  var live = document.getElementById('contactLive');
  var submitBtn = document.getElementById('contactSubmit');
  var messageField = document.getElementById('cf-message');
  var profileFieldset = form.querySelector('.contact-profile');

  var FALLBACK_EMAIL = 'contato@ehvolus.com.br';
  var REQUEST_TIMEOUT = 15000;
  var RECAPTCHA_TIMEOUT = 8000;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var FIELDS = {
    name: { label: 'Nome', required: true, max: 120 },
    company: { label: 'Empresa', required: false, max: 120 },
    email: { label: 'E-mail', required: true, max: 254, email: true },
    phone: { label: 'Telefone ou WhatsApp', required: false, max: 30 },
    profile: { label: 'Você é', required: true, choices: ['company', 'professional', 'customer'] },
    subject: { label: 'Assunto', required: false, max: 120 },
    message: { label: 'Mensagem', required: true, max: 2000 }
  };
  var FIELD_ORDER = ['profile', 'name', 'company', 'email', 'phone', 'subject', 'message'];

  var MESSAGE_HINTS = {
    '': 'Conte como podemos ajudar.',
    company: 'Conte quais serviços sua empresa precisa executar, em que região e com que frequência.',
    professional: 'Conte sua área de atuação, os serviços que você oferece e as regiões onde atende.',
    customer: 'Conte qual serviço você precisa resolver e onde ele será feito.'
  };

  var opener = null;
  var sending = false;
  var resetOnNextOpen = false;

  /* ---- reCAPTCHA v3: carregado só ao abrir o modal ---- */
  var recaptchaPromise = null;

  function recaptchaConfigured() {
    return RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'PREENCHER';
  }

  function loadRecaptcha() {
    if (!recaptchaConfigured()) return Promise.resolve(null);
    if (recaptchaPromise) return recaptchaPromise;
    recaptchaPromise = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(RECAPTCHA_SITE_KEY);
      script.async = true;
      script.onload = function () {
        if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(function () { resolve(window.grecaptcha); });
        } else {
          resolve(null);
        }
      };
      script.onerror = function () {
        recaptchaPromise = null; // permite nova tentativa na próxima abertura
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return recaptchaPromise;
  }

  function getRecaptchaToken() {
    var timeout = new Promise(function (resolve) {
      window.setTimeout(function () { resolve(''); }, RECAPTCHA_TIMEOUT);
    });
    var token = loadRecaptcha().then(function (grecaptcha) {
      if (!grecaptcha) return '';
      return grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'site_contact' });
    }).catch(function () { return ''; });
    // Sem token o servidor decide; a validação que vale é a dele.
    return Promise.race([token, timeout]).then(function (value) { return value || ''; });
  }

  /* ---- abrir e fechar ---- */
  function openDialog(trigger) {
    opener = trigger || document.activeElement;
    if (resetOnNextOpen) {
      resetForm();
      resetOnNextOpen = false;
    }
    if (!success.hidden) resetOnNextOpen = true;
    dialog.showModal();
    document.documentElement.classList.add('contact-open');
    loadRecaptcha();
    var first = success.hidden ? form.querySelector('input[name="profile"]:checked') || form.querySelector('input[name="profile"]') : success;
    if (first) first.focus();
  }

  function isVisible(el) {
    return !!(el && el.isConnected && el.getClientRects().length);
  }

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('contact-open');
    var target = opener;
    if (!isVisible(target)) target = document.getElementById('navToggle');
    if (target && typeof target.focus === 'function') target.focus();
    opener = null;
  });

  document.querySelectorAll('[data-contact-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      var panel = document.getElementById('navPanel');
      if (panel && panel.contains(trigger) && panel.classList.contains('is-open')) {
        var closeBtn = document.getElementById('navPanelClose');
        if (closeBtn) closeBtn.click();
        openDialog(document.getElementById('navToggle'));
        return;
      }
      openDialog(trigger);
    });
  });

  dialog.querySelectorAll('[data-contact-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { dialog.close(); });
  });

  // clique no fundo escurecido fecha; o que foi digitado continua lá
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  /* ---- contadores e texto de exemplo ---- */
  var counters = Array.prototype.slice.call(form.querySelectorAll('[data-count-for]')).map(function (el) {
    var field = document.getElementById(el.getAttribute('data-count-for'));
    return { el: el, field: field, max: parseInt(field.getAttribute('maxlength'), 10), announced: '' };
  });

  function updateCounter(counter, announce) {
    var length = counter.field.value.length;
    var left = counter.max - length;
    counter.el.textContent = length + '/' + counter.max;
    counter.el.classList.toggle('is-near', left <= counter.max * 0.1 && left > 0);
    counter.el.classList.toggle('is-full', left <= 0);
    if (!announce) return;
    var label = FIELDS[counter.field.name].label;
    var message = '';
    if (left <= 0) message = label + ': limite de ' + counter.max + ' caracteres atingido.';
    else if (left <= counter.max * 0.1) message = label + ': restam ' + left + ' caracteres.';
    // anuncia só ao cruzar faixas, para não falar a cada tecla
    var band = left <= 0 ? 'full' : (left <= counter.max * 0.1 ? 'near' : '');
    if (band !== counter.announced) {
      counter.announced = band;
      if (message) announceLive(message);
    }
  }

  counters.forEach(function (counter) {
    counter.field.addEventListener('input', function () { updateCounter(counter, true); });
  });

  function announceLive(text) {
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 50);
  }

  function currentProfile() {
    var checked = form.querySelector('input[name="profile"]:checked');
    return checked ? checked.value : '';
  }

  form.querySelectorAll('input[name="profile"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      messageField.setAttribute('placeholder', MESSAGE_HINTS[currentProfile()]);
      setFieldError('profile', '');
    });
  });

  /* ---- erros ---- */
  function errorEl(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function setFieldError(name, text) {
    var el = errorEl(name);
    if (!el) return false;
    el.textContent = text || '';
    if (name === 'profile') {
      profileFieldset.classList.toggle('is-invalid', !!text);
    } else {
      var input = form.elements[name];
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
    return true;
  }

  function clearErrors() {
    FIELD_ORDER.forEach(function (name) { setFieldError(name, ''); });
    statusBox.textContent = '';
  }

  function focusField(name) {
    var target = name === 'profile'
      ? form.querySelector('input[name="profile"]:checked') || form.querySelector('input[name="profile"]')
      : form.elements[name];
    if (target) target.focus();
  }

  function showStatus(html) {
    statusBox.innerHTML = html;
  }

  function showFailure() {
    showStatus('Não conseguimos enviar agora. Escreva para <a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a>.');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  ['name', 'company', 'email', 'phone', 'subject', 'message'].forEach(function (name) {
    form.elements[name].addEventListener('input', function () {
      if (form.elements[name].getAttribute('aria-invalid') === 'true') setFieldError(name, '');
    });
  });

  /* ---- validação no navegador (a do servidor é a que vale) ---- */
  function readValues() {
    return {
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      profile: currentProfile(),
      subject: form.elements.subject.value.trim(),
      message: form.elements.message.value.trim(),
      website: form.elements.website.value
    };
  }

  function validate(values) {
    var errors = {};
    FIELD_ORDER.forEach(function (name) {
      var rule = FIELDS[name];
      var value = values[name];
      if (rule.choices) {
        if (rule.choices.indexOf(value) === -1) errors[name] = 'Escolha uma opção: empresa, profissional ou cliente.';
        return;
      }
      if (rule.required && !value) {
        errors[name] = 'Preencha o campo ' + rule.label + '.';
      } else if (value.length > rule.max) {
        errors[name] = 'Use no máximo ' + rule.max + ' caracteres.';
      } else if (rule.email && value && !EMAIL_PATTERN.test(value)) {
        errors[name] = 'Informe um e-mail válido, como nome@empresa.com.br.';
      }
    });
    return errors;
  }

  function applyErrors(errors) {
    var names = Object.keys(errors);
    var first = null;
    FIELD_ORDER.forEach(function (name) {
      if (errors[name]) {
        setFieldError(name, errors[name]);
        if (!first) first = name;
      }
    });
    return { first: first, count: names.length };
  }

  /* ---- envio ---- */
  function setSending(state) {
    sending = state;
    submitBtn.disabled = state;
    submitBtn.classList.toggle('is-sending', state);
    submitBtn.textContent = state ? 'Enviando…' : 'Enviar mensagem';
    form.setAttribute('aria-busy', state ? 'true' : 'false');
  }

  function postContact(payload) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT) : null;
    return fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, application/problem+json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      mode: 'cors',
      signal: controller ? controller.signal : undefined
    }).finally(function () {
      if (timer) window.clearTimeout(timer);
    });
  }

  function handleUnprocessable(response) {
    return response.json().catch(function () { return null; }).then(function (body) {
      var list = body && Array.isArray(body.errors) ? body.errors : [];
      var errors = {};
      var loose = [];
      list.forEach(function (item) {
        if (!item || !item.reason) return;
        if (item.name && FIELDS[item.name] && !errors[item.name]) errors[item.name] = String(item.reason);
        else loose.push(String(item.reason));
      });
      var result = applyErrors(errors);
      if (!result.count && !loose.length) {
        showFailure();
        statusBox.focus();
        return;
      }
      if (loose.length) {
        showStatus(loose.map(escapeHtml).join('<br>'));
      }
      if (result.first) focusField(result.first);
      else statusBox.focus();
    });
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    if (dialog.open) {
      resetOnNextOpen = true;
      success.focus();
    }
  }

  function resetForm() {
    form.reset();
    clearErrors();
    messageField.setAttribute('placeholder', MESSAGE_HINTS['']);
    counters.forEach(function (counter) { counter.announced = ''; updateCounter(counter, false); });
    form.hidden = false;
    success.hidden = true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (sending) return;

    clearErrors();
    var values = readValues();
    var result = applyErrors(validate(values));
    if (result.count) {
      announceLive(result.count === 1 ? 'Há 1 campo para corrigir.' : 'Há ' + result.count + ' campos para corrigir.');
      focusField(result.first);
      return;
    }

    setSending(true);
    getRecaptchaToken().then(function (token) {
      values.recaptchaToken = token;
      return postContact(values);
    }).then(function (response) {
      if (response.status === 202) {
        showSuccess();
        return;
      }
      if (response.status === 422) return handleUnprocessable(response);
      if (response.status === 429) {
        showStatus('Muitas tentativas. Tente de novo em alguns minutos.');
      } else {
        showFailure();
      }
      statusBox.focus();
    }).catch(function () {
      showFailure();
      statusBox.focus();
    }).then(function () {
      setSending(false);
    });
  });
})();
