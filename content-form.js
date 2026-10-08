/* content-form.js — نموذج بيانات المحتوى (كورس/مسابقة)
   مشترك بين add-competition.html (صفحة الإضافة) ودرج الإعدادات في competition.html.
   الحقول المكتوبة في قاعدة البيانات كما هي: type, title, description, coverUrl,
   instructorName, instructorPhotoUrl.
   يحتاج: icons.js (icon) و admin-shell.js (escapeHtml). */
(function () {
  var seq = 0;

  function esc(s) { return typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s); }
  function isUrl(v) { return /^https?:\/\/\S+$/i.test(v); }

  function mount(root, opts) {
    opts = opts || {};
    var uid = 'cf' + (++seq);
    var edit = !!opts.edit;
    var onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};
    var blank = { type: 'course', title: '', description: '', coverUrl: '', instructorName: '', instructorPhotoUrl: '' };

    root.innerHTML =
      '<div class="cc-form">' +
        '<fieldset class="cc-fieldset">' +
          '<legend>نوع المحتوى</legend>' +
          '<div class="cc-types">' +
            '<label class="cc-type"><input type="radio" name="' + uid + '-type" value="course">' +
              '<span class="cc-type-body"><span class="cc-type-title">' + icon('bookOpen', 'icon-md') + ' كورس</span>' +
              '<span class="cc-type-note">يظهر للطالب زر «اشتراك في الكورس».</span></span></label>' +
            '<label class="cc-type"><input type="radio" name="' + uid + '-type" value="competition">' +
              '<span class="cc-type-body"><span class="cc-type-title">' + icon('trophy', 'icon-md') + ' مسابقة</span>' +
              '<span class="cc-type-note">يظهر للطالب زر «انضمام للمسابقة».</span></span></label>' +
          '</div>' +
        '</fieldset>' +

        '<fieldset class="cc-fieldset">' +
          '<legend>البيانات الأساسية</legend>' +
          '<div class="field" id="' + uid + '-titleField">' +
            '<label for="' + uid + '-title">الاسم</label>' +
            '<input type="text" id="' + uid + '-title" placeholder="مثال: كورس التجويد الأساسي" autocomplete="off" maxlength="120">' +
            '<div class="cc-err" id="' + uid + '-titleErr" role="alert"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="' + uid + '-desc">الوصف <span class="cc-opt">اختياري</span></label>' +
            '<textarea id="' + uid + '-desc" rows="4" placeholder="يظهر في صفحة المحتوى عند الطالب"></textarea>' +
          '</div>' +
        '</fieldset>' +

        '<fieldset class="cc-fieldset" style="margin-bottom:0;">' +
          '<legend>الغلاف والمعلم</legend>' +
          '<div class="field">' +
            '<label for="' + uid + '-cover">رابط صورة الغلاف <span class="cc-opt">اختياري</span></label>' +
            '<input type="url" id="' + uid + '-cover" placeholder="https://...">' +
            '<div class="cc-imgstat" id="' + uid + '-coverStat" aria-live="polite">' + (edit ? 'اترك الحقل فارغًا لإزالة الغلاف الحالي.' : '') + '</div>' +
          '</div>' +
          '<div class="cc-row">' +
            '<div class="field">' +
              '<label for="' + uid + '-iname">اسم المعلم <span class="cc-opt">اختياري</span></label>' +
              '<input type="text" id="' + uid + '-iname" placeholder="مثال: الأستاذ محمد أحمد" autocomplete="off">' +
            '</div>' +
            '<div class="field">' +
              '<label for="' + uid + '-iphoto">رابط صورة المعلم <span class="cc-opt">اختياري</span></label>' +
              '<input type="url" id="' + uid + '-iphoto" placeholder="https://...">' +
              '<div class="cc-imgstat" id="' + uid + '-iphotoStat" aria-live="polite"></div>' +
            '</div>' +
          '</div>' +
        '</fieldset>' +
      '</div>';

    var $ = function (s) { return root.querySelector('#' + uid + '-' + s); };
    var titleEl = $('title'), descEl = $('desc'), coverEl = $('cover'), inameEl = $('iname'), iphotoEl = $('iphoto');
    var coverStat = $('coverStat'), iphotoStat = $('iphotoStat');
    var radios = root.querySelectorAll('input[type="radio"]');
    var hints = { cover: coverStat.textContent, iphoto: '' };
    var tokens = { cover: 0, iphoto: 0 };
    var timers = {};

    /* فحص الصورة: بيقول للمسؤول فورًا لو الرابط مش صورة شغّالة */
    function checkImage(key, input, stat) {
      var url = input.value.trim();
      var t = ++tokens[key];
      if (!url) { stat.className = 'cc-imgstat'; stat.textContent = hints[key]; return; }
      if (!isUrl(url)) { stat.className = 'cc-imgstat bad'; stat.textContent = 'الرابط لازم يبدأ بـ https://'; return; }
      stat.className = 'cc-imgstat'; stat.textContent = 'جارٍ فحص الصورة...';
      var img = new Image();
      img.onload = function () { if (t === tokens[key]) { stat.className = 'cc-imgstat ok'; stat.textContent = 'الصورة شغّالة.'; } };
      img.onerror = function () { if (t === tokens[key]) { stat.className = 'cc-imgstat bad'; stat.textContent = 'تعذّر تحميل الصورة. تأكد أن الرابط مباشر لملف صورة.'; } };
      img.src = url;
    }
    function scheduleCheck(key, input, stat) {
      clearTimeout(timers[key]);
      timers[key] = setTimeout(function () { checkImage(key, input, stat); }, 400);
    }

    function get() {
      var chosen = root.querySelector('input[type="radio"]:checked');
      return {
        type: chosen ? chosen.value : 'course',
        title: titleEl.value.trim(),
        description: descEl.value.trim(),
        coverUrl: coverEl.value.trim(),
        instructorName: inameEl.value.trim(),
        instructorPhotoUrl: iphotoEl.value.trim()
      };
    }

    function set(values) {
      var v = Object.assign({}, blank, values || {});
      Array.prototype.forEach.call(radios, function (r) { r.checked = r.value === (v.type === 'competition' ? 'competition' : 'course'); });
      titleEl.value = v.title || '';
      descEl.value = v.description || '';
      coverEl.value = v.coverUrl || '';
      inameEl.value = v.instructorName || '';
      iphotoEl.value = v.instructorPhotoUrl || '';
      clearError();
      checkImage('cover', coverEl, coverStat);
      checkImage('iphoto', iphotoEl, iphotoStat);
    }

    function clearError() {
      $('titleErr').textContent = '';
      $('titleField').classList.remove('has-error');
    }

    /* يرجّع true لو البيانات سليمة، وإلا يعرض السبب جنب الحقل ويركّز عليه */
    function validate() {
      var v = get();
      clearError();
      if (!v.title) {
        $('titleErr').textContent = 'اكتب اسم المحتوى.';
        $('titleField').classList.add('has-error');
        titleEl.focus();
        return false;
      }
      if (v.coverUrl && !isUrl(v.coverUrl)) { coverStat.className = 'cc-imgstat bad'; coverStat.textContent = 'الرابط لازم يبدأ بـ https://'; coverEl.focus(); return false; }
      if (v.instructorPhotoUrl && !isUrl(v.instructorPhotoUrl)) { iphotoStat.className = 'cc-imgstat bad'; iphotoStat.textContent = 'الرابط لازم يبدأ بـ https://'; iphotoEl.focus(); return false; }
      return true;
    }

    titleEl.addEventListener('input', function () { if (titleEl.value.trim()) clearError(); onChange(get()); });
    descEl.addEventListener('input', function () { onChange(get()); });
    inameEl.addEventListener('input', function () { onChange(get()); });
    coverEl.addEventListener('input', function () { scheduleCheck('cover', coverEl, coverStat); onChange(get()); });
    iphotoEl.addEventListener('input', function () { scheduleCheck('iphoto', iphotoEl, iphotoStat); onChange(get()); });
    Array.prototype.forEach.call(radios, function (r) { r.addEventListener('change', function () { onChange(get()); }); });

    set(opts.values);

    return { get: get, set: set, validate: validate, focus: function () { titleEl.focus(); } };
  }

  window.ContentForm = { mount: mount };
})();
