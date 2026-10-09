/* ============================================================
   RMRP LAW — script.js v2 (надёжные модалки)
   ============================================================ */

(function () {
  'use strict';

  var LS = {
    bg: 'rmrp_bg',
    music: 'rmrp_music',
    laws: 'rmrp_custom_laws',
    page: 'rmrp_page'
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function () {
    console.log('[RMRP] script.js loaded');

    try { initModals(); } catch(e){ console.warn('modals', e); }
    try { initAccordion(); } catch(e){ console.warn('accordion', e); }
    try { initBurger(); } catch(e){ console.warn('burger', e); }
    try { initSearch(); } catch(e){ console.warn('search', e); }
    try { initToTop(); } catch(e){ console.warn('toTop', e); }
    try { initPageSwitch(); } catch(e){ console.warn('pageSwitch', e); }
    try { initSliders(); } catch(e){ console.warn('sliders', e); }
    try { initBgTabs(); } catch(e){ console.warn('bgTabs', e); }
    try { initEditor(); } catch(e){ console.warn('editor', e); }
    try { initBgActions(); } catch(e){ console.warn('bgActions', e); }
    try { initExport(); } catch(e){ console.warn('export', e); }
    try { restorePage(); } catch(e){ console.warn('restorePage', e); }
    try { restoreLaws(); } catch(e){ console.warn('restoreLaws', e); }
    try { restoreBg(); } catch(e){ console.warn('restoreBg', e); }

    console.log('[RMRP] init done');
  });

  /* ============================================================
     МОДАЛКИ — закрываются 4 способами:
     1. Кнопка .modal-close / #closeEditor / #closeBgPicker
     2. Кнопка .btn-ghost / #cancelEditor в футере модалки
     3. Клик по тёмному фону (сам .modal-overlay)
     4. Клавиша Escape
     ============================================================ */
  function openModal(m) { if (m) m.hidden = false; }
  function closeModal(m) { if (m) m.hidden = true; }

  function closeAllModals() {
    $$('.modal-overlay').forEach(function (m) { m.hidden = true; });
  }

  function initModals() {
    // Открытие
    var openEditor = $('#openEditor');
    var openBg = $('#openBgPicker');

    if (openEditor) openEditor.addEventListener('click', function () { openModal($('#editorModal')); });
    if (openBg) openBg.addEventListener('click', function () { openModal($('#bgModal')); });

    // Делегирование: любые клики внутри модалок ловим здесь
    document.addEventListener('click', function (e) {
      var target = e.target;

      // Кнопки закрытия (крестик)
      if (target.closest('.modal-close')) {
        closeAllModals();
        return;
      }
      // Кнопки «Отмена» / «Убрать»
      if (target.closest('#cancelEditor, #removeBg, #closeEditor, #closeBgPicker')) {
        closeAllModals();
        return;
      }
      // Клик по тёмному фону — закрываем
      if (target.classList.contains('modal-overlay')) {
        target.hidden = true;
        return;
      }
    });

    // Escape закрывает всё
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  /* ============================================================
     АККОРДЕОН
     ============================================================ */
  function initAccordion() {
    var headers = $$('.acc-header');
    console.log('[RMRP] acc-headers:', headers.length);
    headers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var item = btn.closest('.acc-item');
        if (!item) return;
        var acc = item.closest('.accordion');
        var isOpen = item.classList.contains('open');
        if (acc) $$('.acc-item.open', acc).forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ============================================================
     БУРГЕР
     ============================================================ */
  function initBurger() {
    var burger = $('#burger');
    var nav = $('#nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    $$('.nav-link', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ============================================================
     ПОИСК
     ============================================================ */
  var globalBox = null;

  function removeGlobalBox() {
    if (globalBox) { globalBox.remove(); globalBox = null; }
  }

  function buildResults(q) {
    var query = q.trim().toLowerCase();
    if (!query) return [];
    var results = [];
    $$('#page-law section.section').forEach(function (sec) {
      var titleEl = $('.section-title', sec);
      var secTitle = titleEl ? titleEl.textContent : '';
      var secId = sec.id;
      $$('.acc-item', sec).forEach(function (item, idx) {
        var tEl = $('.acc-title', item);
        var xEl = $('.acc-text', item);
        var title = tEl ? tEl.textContent : '';
        var text = xEl ? xEl.textContent : '';
        if (text.toLowerCase().indexOf(query) !== -1 || title.toLowerCase().indexOf(query) !== -1) {
          var i = text.toLowerCase().indexOf(query);
          var start = Math.max(0, i - 60);
          var excerpt = (start > 0 ? '…' : '') + text.slice(start, start + 160).replace(/\s+/g, ' ') + '…';
          results.push({ secId: secId, secTitle: secTitle, title: title, excerpt: excerpt, accIdx: idx });
        }
      });
    });
    return results.slice(0, 30);
  }

  function renderResults(results) {
    removeGlobalBox();
    var searchInput = $('#searchInput');
    if (!searchInput) return;
    globalBox = document.createElement('div');
    globalBox.id = 'globalSearchResults';
    globalBox.style.cssText = 'position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:60;background:#13141a;border:1px solid #353945;border-radius:14px;max-height:420px;overflow-y:auto;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,.5)';

    if (!results.length) {
      globalBox.innerHTML = '<div style="padding:24px;text-align:center;color:#6e7385">Ничего не найдено</div>';
    } else {
      globalBox.innerHTML = results.map(function (r) {
        return '<a href="#' + r.secId + '" class="gsr-item" data-sec="' + r.secId + '" data-idx="' + r.accIdx + '" style="display:block;padding:12px 14px;border-radius:10px;border-bottom:1px solid #2a2d38;color:inherit;text-decoration:none">' +
          '<div style="font-size:11px;font-weight:700;color:#ff4655;text-transform:uppercase">' + r.secTitle + '</div>' +
          '<div style="font-size:14px;font-weight:600;color:#fff;margin:3px 0">' + r.title + '</div>' +
          '<div style="font-size:12.5px;color:#6e7385">' + r.excerpt + '</div>' +
        '</a>';
      }).join('');
    }
    searchInput.parentElement.appendChild(globalBox);
  }

  function initSearch() {
    var searchInput = $('#searchInput');
    var searchClear = $('#searchClear');
    if (!searchInput || !searchClear) return;
    var t;
    searchInput.addEventListener('input', function () {
      var q = searchInput.value;
      searchClear.hidden = !q;
      clearTimeout(t);
      t = setTimeout(function () {
        if (q.trim().length < 2) { removeGlobalBox(); return; }
        renderResults(buildResults(q));
      }, 200);
    });
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.hidden = true;
      removeGlobalBox();
    });
    document.addEventListener('click', function (e) {
      if (!searchInput.parentElement.contains(e.target)) removeGlobalBox();
      var gsr = e.target.closest('.gsr-item');
      if (gsr) {
        e.preventDefault();
        var secId = gsr.getAttribute('data-sec');
        var idx = parseInt(gsr.getAttribute('data-idx'), 10);
        var sec = document.getElementById(secId);
        if (!sec) return;
        var items = $$('.acc-item', sec);
        items.forEach(function (i) { i.classList.remove('open'); });
        if (items[idx]) items[idx].classList.add('open');
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        removeGlobalBox();
        searchInput.value = '';
        searchClear.hidden = true;
      }
    });
  }

  /* ============================================================
     КНОПКА «НАВЕРХ»
     ============================================================ */
  function initToTop() {
    var toTop = $('#toTop');
    if (!toTop) return;
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 500);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
     ============================================================ */
  function switchPage(page) {
    var pageLaw = $('#page-law');
    var pageVk = $('#page-vk');
    if (!pageLaw || !pageVk) return;
    if (page === 'vk') {
      pageLaw.style.display = 'none';
      pageVk.style.display = 'block';
      pageVk.classList.add('page-active');
      pageLaw.classList.remove('page-active');
      localStorage.setItem(LS.page, 'vk');
    } else {
      pageVk.style.display = 'none';
      pageLaw.style.display = 'block';
      pageLaw.classList.add('page-active');
      pageVk.classList.remove('page-active');
      localStorage.setItem(LS.page, 'law');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initPageSwitch() {
    var switchBtn = $('#switchPage');
    var btnText = $('.btn-page-text');
    var btnIcon = $('.btn-page-icon');

    function updateBtn() {
      var page = localStorage.getItem(LS.page) || 'law';
      if (btnText) btnText.textContent = page === 'vk' ? 'Законы' : 'Военкомат';
      if (btnIcon) btnIcon.textContent = page === 'vk' ? '⚖️' : '🎓';
    }

    if (switchBtn) {
      switchBtn.addEventListener('click', function () {
        var current = localStorage.getItem(LS.page) || 'law';
        switchPage(current === 'vk' ? 'law' : 'vk');
        updateBtn();
      });
    }

    $$('.vk-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchPage('vk');
        updateBtn();
        var nav = $('#nav'); if (nav) nav.classList.remove('open');
      });
    });

    updateBtn();
  }

  function restorePage() {
    var page = localStorage.getItem(LS.page) || 'law';
    if (page === 'vk') switchPage('vk');
  }

  /* ============================================================
     СЛАЙДЕРЫ
     ============================================================ */
  function initSliders() {
    function bind(id, outId, sfx) {
      var el = $('#' + id);
      var o = $('#' + outId);
      if (el && o) el.addEventListener('input', function () { o.textContent = el.value + sfx; });
    }
    bind('bgOverlay', 'bgOverlayValue', '%');
    bind('bgBlur', 'bgBlurValue', 'px');
    bind('bgVolume', 'bgVolumeValue', '%');
  }

  /* ============================================================
     ТАБЫ ФОНА
     ============================================================ */
  function initBgTabs() {
    $$('.bg-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-bg-tab');
        $$('.bg-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
        $$('.bg-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-bg-panel') === name);
        });
      });
    });
  }

  /* ============================================================
     РЕДАКТОР ЗАКОНОВ
     ============================================================ */
  function initEditor() {
    var saveBtn = $('#saveEditor');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', function () {
      var cat = $('#lawCategory').value;
      var tag = $('#lawTag').value.trim();
      var title = $('#lawTitle').value.trim();
      var text = $('#editorArea').innerHTML.trim();
      if (!title || !text) { alert('Заполните заголовок и текст'); return; }
      var laws = JSON.parse(localStorage.getItem(LS.laws) || '{}');
      if (!laws[cat]) laws[cat] = [];
      laws[cat].push({ id: Date.now(), tag: tag, title: title, text: text });
      localStorage.setItem(LS.laws, JSON.stringify(laws));
      renderLaws(cat);
      closeAllModals();
      $('#lawTitle').value = '';
      $('#lawTag').value = '';
      $('#editorArea').innerHTML = '';
    });
  }

  function renderLaws(cat) {
    var container = document.getElementById('custom-' + cat);
    if (!container) return;
    var laws = JSON.parse(localStorage.getItem(LS.laws) || '{}');
    var list = laws[cat] || [];
    if (!list.length) { container.innerHTML = ''; return; }
    container.innerHTML = list.map(function (l) {
      return '<div class="acc-item open">' +
        '<button class="acc-header"><span class="acc-emoji">📌</span><span class="acc-num">' + (l.tag || 'Закон') + '</span><span class="acc-title">' + l.title + '</span><span class="acc-arrow">▾</span></button>' +
        '<div class="acc-body"><div class="acc-text">' + l.text + '</div></div>' +
      '</div>';
    }).join('');
    $$('.acc-header', container).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc-item');
        if (item.classList.contains('open')) item.classList.remove('open');
        else item.classList.add('open');
      });
    });
  }

  function restoreLaws() {
    ['constitution', 'uk', 'koap', 'process', 'weapons', 'property', 'raids', 'vzk',
     'discipline', 'garrison', 'internal', 'drill', 'custom'].forEach(renderLaws);
  }

  /* ============================================================
     ФОН / МУЗЫКА
     ============================================================ */
  function extractYT(url) {
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
    return m ? m[1] : null;
  }

  function applyBg(url, overlay, blur) {
    localStorage.setItem(LS.bg, JSON.stringify({ url: url, overlay: overlay, blur: blur }));
    var style = document.getElementById('dynamic-bg-styles') || document.createElement('style');
    style.id = 'dynamic-bg-styles';
    if (!style.parentNode) document.head.appendChild(style);
    style.textContent =
      'body::before{content:"";position:fixed;inset:0;z-index:-2;' +
      'background:url("' + url + '") center/cover no-repeat fixed;' +
      'filter:blur(' + blur + 'px);transform:scale(1.06);}' +
      'body::after{content:"";position:fixed;inset:0;z-index:-1;' +
      'background:rgba(10,11,15,' + overlay + ');}';
  }

  function initBgActions() {
    var applyBgBtn = $('#applyBg');
    var removeBg = $('#removeBg');

    if (applyBgBtn) {
      applyBgBtn.addEventListener('click', function () {
        var activeTabEl = $('.bg-tab.active');
        var activeTab = activeTabEl ? activeTabEl.getAttribute('data-bg-tab') : 'url';
        var overlayEl = $('#bgOverlay');
        var blurEl = $('#bgBlur');
        var overlay = (overlayEl ? overlayEl.value : 60) / 100;
        var blur = blurEl ? blurEl.value : 0;

        if (activeTab === 'url') {
          var url = $('#bgUrlInput').value.trim();
          if (url) applyBg(url, overlay, blur);
        } else if (activeTab === 'youtube') {
          var ytUrl = $('#bgYoutubeInput').value.trim();
          var ytId = extractYT(ytUrl);
          if (ytId) {
            var style = document.getElementById('dynamic-bg-styles') || document.createElement('style');
            style.id = 'dynamic-bg-styles';
            if (!style.parentNode) document.head.appendChild(style);
            style.textContent = 'body::after{content:"";position:fixed;inset:0;z-index:-1;background:rgba(10,11,15,' + overlay + ');}';
            $$('.yt-bg-frame').forEach(function (el) { el.remove(); });
            var wrap = document.createElement('div');
            wrap.className = 'yt-bg-frame';
            wrap.style.cssText = 'position:fixed;inset:0;z-index:-2;pointer-events:none;overflow:hidden;filter:blur(' + blur + 'px);';
            wrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + ytId + '&showinfo=0&rel=0" style="position:absolute;top:50%;left:50%;width:177.78vh;height:56.25vw;min-width:100%;min-height:100%;transform:translate(-50%,-50%);border:0;" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
            document.body.appendChild(wrap);
          }
        } else if (activeTab === 'file') {
          var file = $('#bgFileInput').files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = function (ev) { applyBg(ev.target.result, overlay, blur); };
            reader.readAsDataURL(file);
          }
        }
        closeAllModals();
      });
    }

    if (removeBg) {
      removeBg.addEventListener('click', function () {
        localStorage.removeItem(LS.bg);
        var style = document.getElementById('dynamic-bg-styles');
        if (style) style.textContent = '';
        $$('.yt-bg-frame').forEach(function (el) { el.remove(); });
        closeAllModals();
      });
    }
  }

  function restoreBg() {
    try {
      var bg = JSON.parse(localStorage.getItem(LS.bg) || 'null');
      if (bg && bg.url) applyBg(bg.url, bg.overlay, bg.blur);
    } catch (e) {}
  }

  /* ============================================================
     ЭКСПОРТ / ИМПОРТ
     ============================================================ */
  function initExport() {
    window.RMRP = {
      export: function () {
        var data = {
          laws: JSON.parse(localStorage.getItem(LS.laws) || '{}'),
          bg: localStorage.getItem(LS.bg)
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rmrp-backup-' + Date.now() + '.json';
        a.click();
      },
      import: function (file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = JSON.parse(e.target.result);
            if (data.laws) localStorage.setItem(LS.laws, JSON.stringify(data.laws));
            if (data.bg) localStorage.setItem(LS.bg, data.bg);
            alert('Импорт выполнен.');
            location.reload();
          } catch (err) { alert('Ошибка: ' + err.message); }
        };
        reader.readAsText(file);
      }
    };
  }

})();
