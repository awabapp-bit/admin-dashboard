/* ============================================================
   أدوات واجهة مشتركة للصفحات الجديدة (المخالفات / المشتركون والنقاط)
   - pvConfirm: نافذة تأكيد بدل confirm() الخاصة بالمتصفح
   - pvPromptNumber: نافذة إدخال رقم بدل prompt()
   - pvAvatar: لون وحرف أفاتار ثابت لكل اسم
   - pvDebounce / pvDownloadCsv / pvAnimateNumber
   ============================================================ */
(function () {
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function buildDialog(html) {
    const overlay = document.createElement('div');
    overlay.className = 'pv-dialog-overlay';
    overlay.innerHTML = '<div class="pv-dialog" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(overlay);
    if (typeof lockBodyScroll === 'function') lockBodyScroll();
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    return overlay;
  }
  function closeDialog(overlay) {
    overlay.classList.remove('open');
    if (typeof unlockBodyScroll === 'function') unlockBodyScroll();
    setTimeout(function () { overlay.remove(); }, 200);
  }

  /**
   * pvConfirm({title, message, confirmText, cancelText, tone:'danger'|'primary', icon})
   * → Promise<boolean>
   */
  window.pvConfirm = function (opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      const tone = opts.tone || 'primary';
      const overlay = buildDialog(
        '<div class="pv-dialog-icon ' + tone + '">' + icon(opts.icon || (tone === 'danger' ? 'lAlert' : 'lCheckCircle')) + '</div>' +
        '<h3>' + esc(opts.title || 'تأكيد الإجراء') + '</h3>' +
        '<p>' + esc(opts.message || '') + '</p>' +
        '<div class="pv-dialog-actions">' +
          '<button type="button" class="pv-btn" data-act="cancel">' + esc(opts.cancelText || 'إلغاء') + '</button>' +
          '<button type="button" class="pv-btn ' + (tone === 'danger' ? 'danger' : 'primary') + '" data-act="ok">' + esc(opts.confirmText || 'تأكيد') + '</button>' +
        '</div>'
      );
      let done = false;
      function finish(v) {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey);
        closeDialog(overlay); resolve(v);
      }
      function onKey(e) { if (e.key === 'Escape') finish(false); }
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) finish(false); });
      overlay.querySelector('[data-act="cancel"]').addEventListener('click', function () { finish(false); });
      const ok = overlay.querySelector('[data-act="ok"]');
      ok.addEventListener('click', function () { finish(true); });
      ok.focus();
    });
  };

  /**
   * pvPromptNumber({title, message, value, min, max, confirmText}) → Promise<number|null>
   */
  window.pvPromptNumber = function (opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      const overlay = buildDialog(
        '<div class="pv-dialog-icon primary">' + icon('lSliders') + '</div>' +
        '<h3>' + esc(opts.title || 'تعديل القيمة') + '</h3>' +
        '<p>' + esc(opts.message || '') + '</p>' +
        '<div class="pv-stepper">' +
          '<button type="button" class="pv-step-btn" data-step="-1" aria-label="إنقاص">−</button>' +
          '<input type="number" inputmode="numeric" class="pv-step-input" min="' + (opts.min || 1) + '"' + (opts.max ? ' max="' + opts.max + '"' : '') + ' value="' + esc(opts.value != null ? opts.value : 3) + '">' +
          '<button type="button" class="pv-step-btn" data-step="1" aria-label="زيادة">+</button>' +
        '</div>' +
        '<div class="pv-dialog-error" aria-live="polite"></div>' +
        '<div class="pv-dialog-actions">' +
          '<button type="button" class="pv-btn" data-act="cancel">إلغاء</button>' +
          '<button type="button" class="pv-btn primary" data-act="ok">' + esc(opts.confirmText || 'حفظ') + '</button>' +
        '</div>'
      );
      const input = overlay.querySelector('.pv-step-input');
      const err = overlay.querySelector('.pv-dialog-error');
      const min = opts.min || 1;
      let done = false;
      function finish(v) {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey);
        closeDialog(overlay); resolve(v);
      }
      function submit() {
        const n = parseInt(input.value, 10);
        if (isNaN(n) || n < min || (opts.max && n > opts.max)) {
          err.textContent = 'أدخل رقمًا صحيحًا' + (opts.max ? ' بين ' + min + ' و ' + opts.max : ' لا يقل عن ' + min) + '.';
          input.focus();
          return;
        }
        finish(n);
      }
      function onKey(e) { if (e.key === 'Escape') finish(null); if (e.key === 'Enter') submit(); }
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) finish(null); });
      overlay.querySelectorAll('.pv-step-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          const cur = parseInt(input.value, 10) || min;
          let next = cur + Number(b.dataset.step);
          if (next < min) next = min;
          if (opts.max && next > opts.max) next = opts.max;
          input.value = next; err.textContent = '';
        });
      });
      overlay.querySelector('[data-act="cancel"]').addEventListener('click', function () { finish(null); });
      overlay.querySelector('[data-act="ok"]').addEventListener('click', submit);
      input.focus(); input.select();
    });
  };

  /** لون وحرف أفاتار ثابت لكل اسم */
  window.pvAvatar = function (name) {
    const palette = [
      ['#1E5C94', '#EAF4FB'], ['#0F9488', '#E3F8F5'], ['#B45309', '#FEF3C7'],
      ['#7C3AED', '#EEE8FD'], ['#D6455B', '#FDECEF'], ['#0369A1', '#E0F2FE'], ['#4D7C0F', '#ECF6D8']
    ];
    const str = String(name || '?');
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    const c = palette[h % palette.length];
    return { initial: (str.trim().charAt(0) || '?').toUpperCase(), fg: c[0], bg: c[1] };
  };

  window.pvDebounce = function (fn, ms) {
    let t;
    return function () {
      const a = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, a); }, ms || 180);
    };
  };

  /** تنزيل CSV (مع BOM ليفتح العربي صح في Excel) */
  window.pvDownloadCsv = function (filename, rows) {
    const csv = rows.map(function (r) {
      return r.map(function (v) {
        v = v == null ? '' : String(v);
        if (/^[=+\-@]/.test(v)) v = "'" + v; // حماية من حقن الصيغ في Excel
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /** عدّاد أرقام متحرك بسيط */
  window.pvAnimateNumber = function (el, to, suffix) {
    if (!el) return;
    suffix = suffix || '';
    to = Number(to) || 0;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches || to === 0) {
      el.textContent = to.toLocaleString('ar-EG') + suffix; return;
    }
    const start = performance.now(), dur = 600;
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString('ar-EG') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  /** وقت نسبي بالعربي (منذ ٥ دقائق...) */
  window.pvTimeAgo = function (ts) {
    if (!ts) return '—';
    const diff = Math.max(0, Date.now() - ts);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return 'منذ ' + m.toLocaleString('ar-EG') + ' دقيقة';
    const h = Math.floor(m / 60);
    if (h < 24) return 'منذ ' + h.toLocaleString('ar-EG') + ' ساعة';
    const d = Math.floor(h / 24);
    if (d < 30) return 'منذ ' + d.toLocaleString('ar-EG') + ' يوم';
    return new Date(ts).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };
})();
