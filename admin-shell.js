/* قشرة لوحة تحكم المسؤول: تحقق من صلاحية المسؤول + رسم شريط التنقل العلوي
   هذا موقع مستقل تمامًا عن موقع المستخدم؛ عدّل الرابط أدناه ليشير لموقع
   المستخدم الفعلي بعد نشره (رابط منفصل بالكامل، مش نفس المستودع). */
const RESET_SITE_URL = 'https://awabapp-bit.github.io/awab-reset-site/';

/**
 * يتحقق أن المستخدم الحالي مسجل دخول عبر حساب Firebase وأن isAdmin = true.
 * غير المسؤول يُعاد توجيهه لصفحة دخول المسؤول (index.html) دون تسجيل خروجه
 * من أي جلسة أخرى قد يكون بها.
 */
function requireAdminAuth(onReady) {
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    db.ref('users/' + user.uid).once('value')
      .then(function (snap) {
        const data = snap.val();
        if (!data || data.isAdmin !== true) {
          window.location.href = 'index.html';
          return;
        }
        onReady(user, data);
      })
      .catch(function () {
        window.location.href = 'index.html';
      });
  });
}

/**
 * يرسم القائمة الجانبية (v12 — تصميم جديد بالكامل) داخل #adminNav.
 *  - سطح المكتب: لوحة عائمة على يمين الشاشة قابلة للطي.
 *  - الموبايل: شريط علوي رفيع + درج جانبي بنفس القائمة + شريط تبويب سفلي عائم.
 * activePage: 'home' | 'users' | 'competition' | 'violations' | 'forum' | 'support'
 * (كل المعرّفات/الدوال التي تعتمد عليها باقي الصفحات محفوظة كما هي.)
 */
const ADMIN_PAGE_TITLES = {
  home: 'لوحة القيادة', competition: 'لوحة القيادة', forum: 'منتدى الأسئلة',
  users: 'الحسابات', violations: 'المخالفات', support: 'الدعم الفني'
};

function renderAdminNav(activePage) {
  const nav = document.getElementById('adminNav');
  if (!nav) return;
  nav.className = 'sb';

  function link(href, page, iconName, label, badgeId) {
    return '<a href="' + href + '" class="sb-link' + (activePage === page ? ' active' : '') + '" title="' + label + '"' + (activePage === page ? ' aria-current="page"' : '') + '>' +
      '<span class="sb-ico">' + icon(iconName) + '</span>' +
      '<span class="sb-label">' + label + '</span>' +
      (badgeId ? '<span class="sb-badge" id="' + badgeId + '" style="display:none;">0</span>' : '') +
    '</a>';
  }

  const pageTitle = ADMIN_PAGE_TITLES[activePage] || 'لوحة التحكم';

  nav.innerHTML =
    /* شريط علوي (موبايل فقط) */
    '<div class="sb-topbar">' +
      '<a class="sb-top-brand" href="home.html"><span class="sb-logo"><img src="logo.png" alt="أواب"></span>' +
      '<span class="sb-top-title">' + pageTitle + '</span></a>' +
      '<button class="sb-menu-btn" id="adminMenuToggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="adminLinks">' + icon('lBars') + '</button>' +
    '</div>' +
    /* اللوحة الجانبية (درج على الموبايل) */
    '<aside class="sb-panel" id="adminLinks" aria-label="القائمة الرئيسية">' +
      '<div class="sb-head">' +
        '<a class="sb-brand" href="home.html">' +
          '<span class="sb-logo"><img src="logo.png" alt="أواب"></span>' +
          '<span class="sb-brand-text"><b>أواب</b><small>لوحة تحكم المنصة</small></span>' +
        '</a>' +
        '<button class="sb-collapse" id="adminCollapseToggle" type="button" aria-label="طي القائمة الجانبية" aria-expanded="true" title="طي / فتح القائمة">' + icon('lChevronsRight') + '</button>' +
        '<button class="sb-close" id="adminMenuClose" type="button" aria-label="إغلاق القائمة">' + icon('lX') + '</button>' +
      '</div>' +
      '<div class="sb-scroll">' +
        '<div class="sb-group"><span class="sb-group-label">الرئيسية</span>' +
          link('home.html', 'home', 'lDashboard', 'لوحة القيادة') +
          '<button type="button" class="sb-link" id="adminActivityBtn" title="آخر الأنشطة"><span class="sb-ico">' + icon('lActivity') + '</span><span class="sb-label">آخر الأنشطة</span></button>' +
        '</div>' +
        '<div class="sb-group"><span class="sb-group-label">التفاعل</span>' +
          link('forum.html', 'forum', 'lMessage', 'منتدى الأسئلة', 'forumNavBadge') +
          link('support.html', 'support', 'lHeadset', 'الدعم الفني', 'supportNavBadge') +
        '</div>' +
        '<div class="sb-group"><span class="sb-group-label">المستخدمون</span>' +
          link('users.html', 'users', 'lUsers', 'الحسابات') +
          link('violations.html', 'violations', 'lAlert', 'المخالفات', 'violationsNavBadge') +
        '</div>' +
      '</div>' +
      '<div class="sb-foot">' +
        '<div class="sb-user" id="adminProfileBlock">' +
          '<span class="sb-avatar" id="adminProfileAvatar">…</span>' +
          '<span class="sb-user-info"><span class="sb-user-name" id="adminProfileName">جارٍ التحميل…</span>' +
          '<span class="sb-user-role">' + icon('lShieldCheck') + 'مسؤول المنصة</span></span>' +
        '</div>' +
        '<div class="sb-actions">' +
          '<div class="sb-theme-row"><span class="sb-theme-label">الوضع الليلي</span>' +
            '<button class="sb-theme" id="adminThemeSwitch" type="button" aria-label="تبديل الوضع الليلي" title="الوضع الليلي">' +
              '<span class="sb-theme-thumb"></span>' +
              '<span class="sb-theme-ic sun">' + icon('lSun') + '</span><span class="sb-theme-ic moon">' + icon('lMoon') + '</span>' +
            '</button>' +
          '</div>' +
          '<button class="sb-logout" id="adminLogoutBtn" type="button" title="تسجيل الخروج">' + icon('lLogout') + '<span>تسجيل الخروج</span></button>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    '<div class="sb-overlay" id="adminSidebarOverlay"></div>' +
    '<div class="toast-stack" id="adminToastStack"></div>';

  document.getElementById('adminLogoutBtn').addEventListener('click', function () {
    auth.signOut().then(function () { window.location.href = 'index.html'; });
  });

  renderAdminBottomNav(activePage);
  setupAdminMobileNav();
  setupAdminSidebarCollapse();
  setupAdminThemeToggle();
  setupActivityDrawer();
  loadAdminProfileBlock();
  loadViolationsNavBadge();
  loadSupportNavBadge();
  loadForumNavBadge();
}

/**
 * شريط التبويب السفلي العائم (موبايل فقط عبر CSS): الرئيسية، المنتدى،
 * المستخدمون، المخالفات، الدعم. باقي الأشياء (الحساب/الوضع الليلي/الخروج)
 * داخل الدرج الجانبي اللي بيفتحه زر القائمة في الشريط العلوي.
 */
function renderAdminBottomNav(activePage) {
  let bar = document.getElementById('adminBottomNav');
  if (!bar) {
    bar = document.createElement('nav');
    bar.id = 'adminBottomNav';
    document.body.appendChild(bar);
  }
  bar.className = 'sb-tabbar';
  bar.setAttribute('aria-label', 'التنقل السريع');
  function tab(href, page, iconName, label, badgeId) {
    const on = activePage === page;
    return '<a href="' + href + '" class="sb-tab' + (on ? ' active' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
      '<span class="sb-tab-ico">' + icon(iconName) + (badgeId ? '<span class="bn-badge" id="' + badgeId + '">0</span>' : '') + '</span>' +
      '<span class="sb-tab-label">' + label + '</span></a>';
  }
  bar.innerHTML =
    tab('home.html', 'home', 'lDashboard', 'الرئيسية') +
    tab('forum.html', 'forum', 'lMessage', 'المنتدى', 'bottomNavForumBadge') +
    tab('users.html', 'users', 'lUsers', 'المستخدمون') +
    tab('violations.html', 'violations', 'lAlert', 'المخالفات', 'bottomNavViolationsBadge') +
    tab('support.html', 'support', 'lHeadset', 'الدعم', 'bottomNavSupportBadge');
}

/**
 * يعرض بيانات المسؤول الحالي (الاسم + حرف الأفاتار) أعلى القائمة الجانبية.
 */
function loadAdminProfileBlock() {
  const nameEl = document.getElementById('adminProfileName');
  const avatarEl = document.getElementById('adminProfileAvatar');
  const headerNameEl = document.getElementById('adminHeaderName');
  const headerAvatarEl = document.getElementById('adminHeaderAvatar');
  if ((!nameEl || !avatarEl) && (!headerNameEl || !headerAvatarEl)) return;
  if (typeof auth === 'undefined') return;
  const user = auth.currentUser;
  if (!user) return;

  function apply(name) {
    const label = name || (user.email ? user.email.split('@')[0] : 'المسؤول');
    const initial = label.trim().charAt(0).toUpperCase() || 'A';
    if (nameEl) nameEl.textContent = label;
    if (avatarEl) avatarEl.textContent = initial;
    // زرار "اسم المسؤول + سهم" في الهيدر نفسه (بيفتح نفس قائمة الحساب)
    if (headerNameEl) headerNameEl.textContent = label;
    if (headerAvatarEl) headerAvatarEl.textContent = initial;
  }

  if (typeof db !== 'undefined') {
    db.ref('users/' + user.uid + '/name').once('value')
      .then(function (snap) { apply(snap.val()); })
      .catch(function () { apply(null); });
  } else {
    apply(null);
  }
}

/**
 * يجلب إجمالي عدد المخالفات المسجّلة ويعرضه كشارة جنب رابط "المخالفات".
 */
function loadViolationsNavBadge() {
  const badge = document.getElementById('violationsNavBadge');
  const bnBadge = document.getElementById('bottomNavViolationsBadge');
  if ((!badge && !bnBadge) || typeof db === 'undefined') return;
  db.ref('violations').once('value').then(function (snap) {
    const data = snap.val() || {};
    let total = 0;
    Object.keys(data).forEach(function (uid) {
      total += Object.keys(data[uid] || {}).length;
    });
    const text = total > 99 ? '99+' : String(total);
    if (total > 0) {
      if (badge) { badge.textContent = text; badge.style.display = 'inline-flex'; }
      if (bnBadge) { bnBadge.textContent = text; bnBadge.classList.add('show'); }
    }
  }).catch(function () {});
}

/**
 * يراقب لحظيًا إجمالي الرسائل غير المقروءة في كل محادثات الدعم الفني
 * ويعرضها كشارة جنب رابط "الدعم الفني" (في القائمة الجانبية وشريط التنقل السفلي).
 */
function loadSupportNavBadge() {
  const badge = document.getElementById('supportNavBadge');
  const bnBadge = document.getElementById('bottomNavSupportBadge');
  if ((!badge && !bnBadge) || typeof db === 'undefined') return;
  db.ref('conversations').on('value', function (snap) {
    const data = snap.val() || {};
    let total = 0;
    Object.keys(data).forEach(function (uid) {
      total += Number(data[uid] && data[uid].unreadCountByAdmin) || 0;
    });
    const text = total > 99 ? '99+' : String(total);
    if (total > 0) {
      if (badge) { badge.textContent = text; badge.style.display = 'inline-flex'; }
      if (bnBadge) { bnBadge.textContent = text; bnBadge.classList.add('show'); }
    } else {
      if (badge) badge.style.display = 'none';
      if (bnBadge) bnBadge.classList.remove('show');
    }
  });
}

/**
 * يراقب لحظيًا إجمالي الأسئلة اللي لسه ماردش عليها الأدمن في كل منتديات
 * الكورسات/المسابقات، ويعرضها كشارة جنب رابط "منتدى الأسئلة".
 */
function loadForumNavBadge() {
  const badge = document.getElementById('forumNavBadge');
  const bnBadge = document.getElementById('bottomNavForumBadge');
  if ((!badge && !bnBadge) || typeof db === 'undefined') return;
  db.ref('forumQuestions').on('value', function (snap) {
    const data = snap.val() || {};
    let total = 0;
    Object.keys(data).forEach(function (compId) {
      const questions = data[compId] || {};
      Object.keys(questions).forEach(function (qid) {
        if (!questions[qid].adminReply) total++;
      });
    });
    const text = total > 99 ? '99+' : String(total);
    if (total > 0) {
      if (badge) { badge.textContent = text; badge.style.display = 'inline-flex'; }
      if (bnBadge) { bnBadge.textContent = text; bnBadge.classList.add('show'); }
    } else {
      if (badge) badge.style.display = 'none';
      if (bnBadge) bnBadge.classList.remove('show');
    }
  });
}

/* ============================================================
   🌙 الوضع الليلي (Dark Mode)
   ============================================================ */

/** يطبّق الثيم المحفوظ فورًا (تُستدعى من سكربت مضمّن في <head> لمنع الوميض) */
function getAdminTheme() {
  try { return localStorage.getItem('adminTheme'); } catch (e) { return null; }
}

function applyAdminTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function setupAdminThemeToggle() {
  const btn = document.getElementById('adminThemeSwitch');
  if (!btn) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.classList.toggle('on', isDark);
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

  btn.addEventListener('click', function () {
    const nowDark = !document.documentElement.hasAttribute('data-theme');
    applyAdminTheme(nowDark ? 'dark' : 'light');
    btn.classList.toggle('on', nowDark);
    btn.setAttribute('aria-pressed', nowDark ? 'true' : 'false');
    try { localStorage.setItem('adminTheme', nowDark ? 'dark' : 'light'); } catch (e) {}
  });
}

/* ============================================================
   🔔 إشعارات Toast
   ============================================================ */

/**
 * يعرض إشعار Toast مؤقت أسفل يسار الشاشة.
 * type: 'success' | 'error' | 'warning' | 'info' (افتراضي)
 */
function showToast(message, type) {
  let stack = document.getElementById('adminToastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.id = 'adminToastStack';
    document.body.appendChild(stack);
  }

  const iconName = type === 'success' ? 'circleCheck' : type === 'error' ? 'circleXmark' : type === 'warning' ? 'bell' : 'circleInfo';

  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.innerHTML =
    '<span class="toast-icon">' + icon(iconName, 'icon-sm') + '</span>' +
    '<span class="toast-msg"></span>' +
    '<button class="toast-close" aria-label="إغلاق">' + icon('xmark', 'icon-sm') + '</button>';
  el.querySelector('.toast-msg').textContent = message;
  stack.appendChild(el);

  function remove() {
    el.classList.add('leaving');
    setTimeout(function () { el.remove(); }, 200);
  }
  el.querySelector('.toast-close').addEventListener('click', remove);
  const timer = setTimeout(remove, 4200);
  el.addEventListener('mouseenter', function () { clearTimeout(timer); });
}
window.showToast = showToast;

/* ============================================================
   🔒 قفل تمرير الصفحة (يُستخدم كل ما يُفتح أي درج/قائمة فوق المحتوى:
   القائمة الجانبية، درج الأنشطة، قائمة محادثات الدعم الفني...)
   بيستخدم عدّاد (reference count) عشان لو أكتر من عنصر فاتح في نفس
   الوقت، الصفحة تفضل مقفولة لحد ما كل حاجة تتقفل. وبيحافظ على مكان
   التمرير الحالي بدل ما يرجّع المستخدم لأعلى الصفحة (مهم جدًا على
   الموبايل/سفاري عشان القفل يبقى فعلي 100% ومايفلتش مع اللمس).
   ============================================================ */
let __scrollLockCount = 0;
let __scrollLockY = 0;
function lockBodyScroll() {
  if (__scrollLockCount === 0) {
    __scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = (-__scrollLockY) + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('scroll-locked');
  }
  __scrollLockCount++;
}
function unlockBodyScroll() {
  __scrollLockCount = Math.max(0, __scrollLockCount - 1);
  if (__scrollLockCount === 0) {
    document.body.classList.remove('scroll-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollLockY);
  }
}
window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;

/**
 * يفعّل زر السهم أعلى القائمة الجانبية ليطويها لعرض الأيقونات فقط
 * (على شاشات سطح المكتب)، ويحفظ حالة الطي في localStorage.
 */
function setupAdminSidebarCollapse() {
  const toggle = document.getElementById('adminCollapseToggle');
  if (!toggle) return;

  function applyState(collapsed) {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  const saved = localStorage.getItem('adminSidebarCollapsed') === '1';
  applyState(saved);

  toggle.addEventListener('click', function () {
    const collapsed = !document.body.classList.contains('sidebar-collapsed');
    applyState(collapsed);
    localStorage.setItem('adminSidebarCollapsed', collapsed ? '1' : '0');
  });
}

/**
 * يفعّل زرار حساب المسؤول في الهيدر (الاسم + السهم) ليفتح/يقفل قائمة
 * الحساب على الشاشات الصغيرة، مع إغلاقها بالنقر على الستارة، أو زر
 * Escape، أو اختيار أي رابط/زرار جواها.
 */
function setupAdminMobileNav() {
  const toggle = document.getElementById('adminMenuToggle');
  const links = document.getElementById('adminLinks');
  const overlay = document.getElementById('adminSidebarOverlay');
  if (!toggle || !links || !overlay) return;

  let menuIsOpen = false;
  function openMenu() {
    if (menuIsOpen) return;
    menuIsOpen = true;
    links.classList.add('open');
    overlay.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
  }
  function closeMenu() {
    if (!menuIsOpen) return;
    menuIsOpen = false;
    links.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
  }

  toggle.addEventListener('click', function () {
    if (links.classList.contains('open')) closeMenu(); else openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  const closeBtn = document.getElementById('adminMenuClose');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  links.querySelectorAll('a, button').forEach(function (el) {
    if (el.id === 'adminThemeSwitch' || el.id === 'adminCollapseToggle') return; // تبديل الثيم لا يغلق الدرج
    el.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });
}

/* ============================================================
   🕘 نظام "الأنشطة" (v13 — إعادة تصميم كاملة من الصفر)
   مكوّن واحد مشترك:
     • الدرج الجانبي "آخر الأنشطة" (كل الحسابات) — متاح من كل صفحات اللوحة.
     • قسم "آخر نشاط" داخل صفحة تفاصيل الحساب (نشاط حساب واحد).
   الجديد: أسماء أصحاب الأحداث (حتى المخالفات والاختبارات)، تجميع بالأيام،
   وقت نسبي ("منذ 3 ساعات")، فلاتر بنوع الحدث، ملخّص آخر 24 ساعة،
   "عرض المزيد" بدل الاكتفاء بآخر 30 حدث، وكل حدث بيفتح الحساب بتاعه.
   ============================================================ */

const ACTIVITY_KINDS = {
  signup:    { label: 'تسجيلات', icon: 'user' },
  exam:      { label: 'اختبارات', icon: 'trophy' },
  violation: { label: 'مخالفات', icon: 'bell' }
};
const ACTIVITY_MAX_EVENTS = 500;

/**
 * يجمع أحداث النشاط من قاعدة البيانات ويرجّعها مرتّبة من الأحدث للأقدم.
 * uid اختياري: لو اتحدد، بيرجّع نشاط الحساب ده بس.
 */
function collectActivityEvents(uid) {
  const single = !!uid;
  const usersP = single
    ? db.ref('users/' + uid).once('value').then(function (s) { const o = {}; if (s.exists()) o[uid] = s.val(); return o; }).catch(function () { return {}; })
    : safeRead('users');

  return Promise.all([
    usersP,
    safeRead(single ? 'violations/' + uid : 'violations'),
    safeRead('examAttempts'),
    safeRead('competitions')
  ]).then(function (r) {
    const users = r[0];
    const comps = r[3];
    let violations = r[1];
    if (single) { const wrap = {}; wrap[uid] = r[1]; violations = wrap; }
    const attempts = r[2];

    const nameOf = function (id) { const u = users[id]; return (u && (u.name || u.email)) || 'حساب محذوف'; };
    const events = [];

    Object.keys(users).forEach(function (id) {
      const u = users[id];
      if (!u || !u.createdAt) return;
      if (!single && u.isAdmin === true) return; // في الدرج: تسجيلات الطلاب بس
      events.push({ ts: u.createdAt, kind: 'signup', uid: id, who: nameOf(id), subs: [] });
    });

    Object.keys(violations).forEach(function (id) {
      const list = violations[id] || {};
      Object.keys(list).forEach(function (vid) {
        const v = list[vid];
        if (!v || !v.timestamp) return;
        const subs = ['النوع: ' + (v.type || 'غير معروف')];
        if (v.details) subs.push(String(v.details));
        events.push({ ts: v.timestamp, kind: 'violation', uid: id, who: nameOf(id), subs: subs });
      });
    });

    Object.keys(attempts).forEach(function (cid) {
      const lessons = attempts[cid] || {};
      Object.keys(lessons).forEach(function (lid) {
        const exams = lessons[lid] || {};
        Object.keys(exams).forEach(function (eid) {
          const byUser = exams[eid] || {};
          Object.keys(byUser).forEach(function (id) {
            if (single && id !== uid) return;
            const a = byUser[id];
            if (!a || !a.submittedAt) return;
            const comp = comps[cid] || {};
            const lesson = (comp.lessons || {})[lid] || {};
            const exam = (lesson.exams || {})[eid] || {};
            const subs = [(lesson.title || 'محاضرة') + ' — ' + (comp.title || 'محتوى')];
            events.push({
              ts: a.submittedAt, kind: 'exam', uid: id, who: nameOf(id),
              detail: exam.title || 'اختبار',
              score: (typeof a.lastScore === 'number' && a.lastMaxScore) ? (a.lastScore + '/' + a.lastMaxScore) : '',
              subs: subs
            });
          });
        });
      });
    });

    events.sort(function (a, b) { return b.ts - a.ts; });
    return events.slice(0, ACTIVITY_MAX_EVENTS);
  });
}

const _activityRtf = (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) ? new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }) : null;

function activityRelTime(ts) {
  if (!_activityRtf) return formatArabicDate(ts);
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 45) return 'الآن';
  const min = Math.round(sec / 60);
  if (min < 60) return _activityRtf.format(-min, 'minute');
  const hr = Math.round(min / 60);
  if (hr < 24) return _activityRtf.format(-hr, 'hour');
  const day = Math.round(hr / 24);
  if (day < 7) return _activityRtf.format(-day, 'day');
  return new Date(ts).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}

function activityDayKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
}

function activityDayLabel(ts) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff <= 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
}

function activityItemHtml(e, single) {
  const who = '<b>' + escapeHtml(e.who) + '</b>';
  let main;
  if (e.kind === 'signup') main = single ? 'تسجيل الحساب على المنصة' : who + ' سجّل حسابًا جديدًا';
  else if (e.kind === 'exam') main = (single ? 'تسليم اختبار ' : who + ' سلّم اختبار ') + '<b>' + escapeHtml(e.detail) + '</b>';
  else main = single ? 'مخالفة مسجّلة' : 'مخالفة على ' + who;

  const subs = e.subs.map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; });
  if (e.score) subs.unshift('<span class="ax-score">' + escapeHtml(e.score) + '</span>');

  const inner =
    '<span class="ax-dot" aria-hidden="true">' + icon(ACTIVITY_KINDS[e.kind].icon, 'icon-sm') + '</span>' +
    '<div class="ax-main"><div class="ax-text">' + main + '</div>' +
      (subs.length ? '<div class="ax-sub">' + subs.join('') + '</div>' : '') +
    '</div>' +
    '<time class="ax-time" datetime="' + new Date(e.ts).toISOString() + '" title="' + escapeHtml(formatArabicDate(e.ts)) + '">' + activityRelTime(e.ts) + '</time>';

  return single
    ? '<div class="ax-item ax-' + e.kind + '">' + inner + '</div>'
    : '<a class="ax-item ax-' + e.kind + '" href="user-detail.html?uid=' + encodeURIComponent(e.uid) + '">' + inner + '</a>';
}

/**
 * يركّب مكوّن الأنشطة جوه container.
 * opts.uid      → نشاط حساب واحد (من غيره: كل الحسابات + ملخّص آخر 24 ساعة)
 * opts.pageSize → عدد الأحداث في كل دفعة عرض
 * بيرجّع { reload() }.
 */
function mountActivityFeed(container, opts) {
  opts = opts || {};
  const single = !!opts.uid;
  const pageSize = opts.pageSize || 25;
  const state = { filter: 'all', shown: pageSize, events: [] };

  function draw() {
    const events = state.events;
    const counts = { all: events.length, signup: 0, exam: 0, violation: 0 };
    const recent = { signup: 0, exam: 0, violation: 0 };
    const since = Date.now() - 86400000;
    events.forEach(function (e) { counts[e.kind]++; if (e.ts >= since) recent[e.kind]++; });

    let html = '';

    if (!single) {
      html += '<div class="ax-summary-wrap"><div class="ax-summary-title">آخر 24 ساعة</div><div class="ax-summary">' +
        [['signup', 'تسجيل جديد'], ['exam', 'اختبار مُسلَّم'], ['violation', 'مخالفة']].map(function (p) {
          return '<div class="ax-sum k-' + p[0] + (recent[p[0]] === 0 ? ' is-zero' : '') + '"><b>' + recent[p[0]] + '</b><span>' + p[1] + '</span></div>';
        }).join('') +
      '</div></div>';
    }

    html += '<div class="ax-chips" role="group" aria-label="تصفية الأنشطة">' +
      [['all', 'الكل']].concat(Object.keys(ACTIVITY_KINDS).map(function (k) { return [k, ACTIVITY_KINDS[k].label]; })).map(function (p) {
        return '<button type="button" class="ax-chip" data-filter="' + p[0] + '" aria-pressed="' + (state.filter === p[0]) + '">' + p[1] + ' <span class="n">' + counts[p[0]] + '</span></button>';
      }).join('') +
    '</div>';

    const filtered = state.filter === 'all' ? events : events.filter(function (e) { return e.kind === state.filter; });
    const visible = filtered.slice(0, state.shown);

    if (visible.length === 0) {
      html += '<div class="ax-empty">' + (state.filter === 'all' ? 'لسه مفيش أنشطة مسجّلة.' : 'مفيش أنشطة من النوع ده.') + '</div>';
    } else {
      let lastDay = null;
      visible.forEach(function (e) {
        const key = activityDayKey(e.ts);
        if (key !== lastDay) {
          if (lastDay !== null) html += '</div></section>';
          html += '<section><h4 class="ax-day">' + activityDayLabel(e.ts) + '</h4><div class="ax-list">';
          lastDay = key;
        }
        html += activityItemHtml(e, single);
      });
      html += '</div></section>';

      if (filtered.length > visible.length) {
        html += '<button type="button" class="ax-more" data-more="1">عرض ' + Math.min(pageSize, filtered.length - visible.length) + ' نشاط إضافي</button>';
      }
    }

    container.innerHTML = html;
  }

  function load() {
    container.innerHTML = '<div class="center-loading" style="min-height:140px;"><div class="loader"></div></div>';
    return collectActivityEvents(opts.uid).then(function (events) {
      state.events = events;
      state.shown = pageSize;
      draw();
    }).catch(function (err) {
      container.innerHTML = '<div class="ax-empty"><p style="color:var(--danger);margin:0;">تعذر تحميل الأنشطة: ' + escapeHtml((err && err.message) || '') + '</p></div>';
    });
  }

  // onclick (مش addEventListener) عشان إعادة التركيب ما تكرّرش المستمع
  container.onclick = function (e) {
    const chip = e.target.closest('[data-filter]');
    if (chip) { state.filter = chip.dataset.filter; state.shown = pageSize; draw(); return; }
    if (e.target.closest('[data-more]')) { state.shown += pageSize; draw(); }
  };

  load();
  return { reload: load };
}

/* ---------- الدرج الجانبي ---------- */
let _activityCtrl = null;

/**
 * ينشئ (لو مش موجود) ويربط زرار "آخر الأنشطة" في الشريط الجانبي بدرج منزلق.
 * البيانات بتتحمّل أول ما الدرج يتفتح بس (مش تحميل زيادة لو مافتحوش).
 */
function setupActivityDrawer() {
  const btn = document.getElementById('adminActivityBtn');
  if (!btn || typeof db === 'undefined') return;

  let drawer = document.getElementById('activityDrawer');
  let overlay = document.getElementById('activityDrawerOverlay');
  if (!drawer) {
    overlay = document.createElement('div');
    overlay.className = 'activity-drawer-overlay';
    overlay.id = 'activityDrawerOverlay';
    document.body.appendChild(overlay);

    drawer = document.createElement('div');
    drawer.className = 'activity-drawer';
    drawer.id = 'activityDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'آخر الأنشطة');
    drawer.innerHTML =
      '<div class="activity-drawer-head">' +
        '<h3>' + icon('lActivity', 'icon-sm') + ' آخر الأنشطة</h3>' +
        '<div class="activity-drawer-tools">' +
          '<button type="button" class="activity-drawer-close" id="activityDrawerRefresh" aria-label="تحديث">' + icon('lRefresh', 'icon-sm') + '</button>' +
          '<button type="button" class="activity-drawer-close" id="activityDrawerClose" aria-label="إغلاق">' + icon('xmark', 'icon-sm') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="activity-drawer-body" id="activityDrawerBody"></div>';
    document.body.appendChild(drawer);

    document.getElementById('activityDrawerClose').addEventListener('click', closeActivityDrawer);
    document.getElementById('activityDrawerRefresh').addEventListener('click', function () { if (_activityCtrl) _activityCtrl.reload(); });
    overlay.addEventListener('click', closeActivityDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeActivityDrawer();
    });
  }

  btn.addEventListener('click', function () {
    openActivityDrawer();
  });
}

function openActivityDrawer() {
  const drawer = document.getElementById('activityDrawer');
  const overlay = document.getElementById('activityDrawerOverlay');
  if (!drawer || !overlay) return;
  if (drawer.classList.contains('open')) return;
  drawer.classList.add('open');
  overlay.classList.add('open');
  lockBodyScroll();
  _activityCtrl = mountActivityFeed(document.getElementById('activityDrawerBody'), { pageSize: 25 });
}

function closeActivityDrawer() {
  const drawer = document.getElementById('activityDrawer');
  const overlay = document.getElementById('activityDrawerOverlay');
  if (!drawer || !overlay) return;
  if (!drawer.classList.contains('open')) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  unlockBodyScroll();
}

/** يهرّب أي نص قبل إدراجه في HTML */
if (typeof escapeHtml !== 'function') {
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
}

/** يهرّب معرف يوتيوب من رابط */
if (typeof extractYouTubeId !== 'function') {
  function extractYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
}

/** ينسّق تاريخ/وقت timestamp بالعربي المصري */
function formatArabicDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * يحذف كل بيانات حساب مستخدم من قاعدة البيانات (نقاطه، تقدّمه، اشتراكاته، إلخ)
 * في عملية واحدة (multi-path update).
 * بيرجّع Promise.
 */
function deleteUserAccountData(uid) {
  const updates = {};
  updates['users/' + uid] = null;
  updates['userProgress/' + uid] = null;
  updates['userEnrollments/' + uid] = null;
  updates['notifications/' + uid] = null;
  updates['notifiedLessons/' + uid] = null;
  updates['conversations/' + uid] = null;
  updates['messages/' + uid] = null;

  return db.ref('enrollments').once('value').catch(function () { return { val: function () { return {}; } }; }).then(function (snap) {
    const all = snap.val() || {};
    Object.keys(all).forEach(function (compId) {
      if (all[compId] && Object.prototype.hasOwnProperty.call(all[compId], uid)) {
        updates['enrollments/' + compId + '/' + uid] = null;
      }
    });
    return db.ref().update(updates);
  });
}

/* ============================================================
   📋 إدارة المخالفات
   ============================================================ */

function getAllViolations() {
  return db.ref('violations').once('value').then(function(snap) {
    return snap.val() || {};
  });
}
window.getAllViolations = getAllViolations;

function getUserViolations(uid) {
  return db.ref('violations/' + uid).once('value').then(function(snap) {
    return snap.val() || {};
  });
}
window.getUserViolations = getUserViolations;

/**
 * فتح اختبار لإعادة المحاولة — من غير ما نفقد أفضل نتيجة سابقة.
 * قبل كده الدالة كانت بتمسح كل بيانات المحاولة نهائيًا (remove())، وده
 * كان بيمسح "أفضل نتيجة" (bestScore/earnedPoints) المحفوظة من المحاولة
 * الأولى، فلو المستخدم جاب في المحاولة الثانية درجة أقل، مفيش حاجة
 * تفضل تتذكر إن درجته الأولى كانت أعلى. دلوقتي: بنمسح فقط حالة
 * "المحاولة الحالية" (الإجابات، وقت التسليم، وعلامة submitted) ونسيب
 * أفضل نتيجة (bestScore/bestPoints) زي ما هي، عشان submitExamResult()
 * تحت تقدر تقارن بيها صح وقت ما المستخدم يسلّم من تاني.
 */
function resetExamAttempt(compId, lessonId, examId, uid) {
  const ref = db.ref('examAttempts/' + compId + '/' + lessonId + '/' + examId + '/' + uid);
  return ref.once('value').then(function (snap) {
    const prev = snap.val() || {};
    const keep = {};
    if (prev.bestScore != null) keep.bestScore = prev.bestScore;
    if (prev.bestMaxScore != null) keep.bestMaxScore = prev.bestMaxScore;
    if (prev.bestPoints != null) keep.bestPoints = prev.bestPoints;
    keep.retakeOpenedAt = firebase.database.ServerValue.TIMESTAMP;
    return ref.set(keep);
  });
}
window.resetExamAttempt = resetExamAttempt;

/**
 * تسجيل نتيجة محاولة اختبار — بتحتفظ دايمًا بأعلى درجة بين كل المحاولات.
 *
 * ⚠️ الدالة دي لازم تتنادى من كود تسليم الاختبار الفعلي (صفحة الاختبار
 * اللي الطالب بياخده على الموقع نفسه — مش موجودة في ملفات لوحة التحكم
 * دي، فمقدرش أعدّلها مباشرة). استبدل أي كود بيكتب النتيجة/النقاط في
 * examAttempts أو userProgress بنداء لها بدل الكتابة المباشرة، وهي هتتكفل
 * بمنطق "لو الدرجة الجديدة أعلى من الأول يتحط مكانها، ولو أقل أو تساوي
 * متتغيّرش حاجة" تلقائيًا وبأمان حتى مع محاولات متزامنة (عن طريق transaction).
 *
 * @param {string} compId، lessonId، examId، uid — نفس مسارات examAttempts المعتادة
 * @param {number} score — عدد الإجابات الصحيحة (أو أي مقياس درجة) في المحاولة الحالية
 * @param {number} maxScore — أقصى درجة ممكنة لهذا الاختبار (عدد الأسئلة مثلاً)
 * @param {number} pointsEarned — عدد النقاط المستحقة عن هذه المحاولة
 * @returns {Promise<{improved:boolean, bestScore:number, bestMaxScore:number, bestPoints:number}>}
 */
function submitExamResult(compId, lessonId, examId, uid, score, maxScore, pointsEarned) {
  const attemptRef = db.ref('examAttempts/' + compId + '/' + lessonId + '/' + examId + '/' + uid);
  let improved = false;

  return attemptRef.transaction(function (current) {
    current = current || {};
    const prevBest = typeof current.bestScore === 'number' ? current.bestScore : -1;
    improved = score > prevBest;

    return {
      // نحتفظ بأعلى درجة/نقاط وصل لها المستخدم عبر كل محاولاته
      bestScore: improved ? score : current.bestScore != null ? current.bestScore : score,
      bestMaxScore: improved ? maxScore : current.bestMaxScore != null ? current.bestMaxScore : maxScore,
      bestPoints: improved ? pointsEarned : current.bestPoints != null ? current.bestPoints : pointsEarned,
      // ونحتفظ كمان بتفاصيل آخر محاولة تحديدًا (للعرض في سجل النشاط)
      lastScore: score,
      lastMaxScore: maxScore,
      submitted: true,
      submittedAt: firebase.database.ServerValue.TIMESTAMP,
      attemptsCount: (current.attemptsCount || 0) + 1
    };
  }).then(function (result) {
    const finalData = result.snapshot.val() || {};
    // نحدّث نقاط المحاضرة في تقدّم المستخدم بنفس منطق "الاحتفاظ بالأعلى فقط"
    const progressRef = db.ref('userProgress/' + uid + '/' + compId + '/' + lessonId);
    return progressRef.transaction(function (current) {
      current = current || {};
      const prevPoints = typeof current.earnedPoints === 'number' ? current.earnedPoints : -1;
      return {
        completed: true,
        earnedPoints: finalData.bestPoints > prevPoints ? finalData.bestPoints : current.earnedPoints
      };
    }).then(function () {
      return { improved: improved, bestScore: finalData.bestScore, bestMaxScore: finalData.bestMaxScore, bestPoints: finalData.bestPoints };
    });
  });
}
window.submitExamResult = submitExamResult;

function clearExamViolations(uid, examRef) {
  return db.ref('violations/' + uid).once('value').then(function (snap) {
    const all = snap.val() || {};
    const updates = {};
    Object.keys(all).forEach(function (vid) {
      if (all[vid] && all[vid].examRef === examRef) updates[vid] = null;
    });
    if (Object.keys(updates).length === 0) return Promise.resolve();
    return db.ref('violations/' + uid).update(updates);
  });
}
window.clearExamViolations = clearExamViolations;

function clearUserViolations(uid) {
  return db.ref('violations/' + uid).remove();
}
window.clearUserViolations = clearUserViolations;

function setMaxViolations(value) {
  return db.ref('settings/' + 'maxViolations').set(value);
}
window.setMaxViolations = setMaxViolations;

function getMaxViolations() {
  return db.ref('settings/' + 'maxViolations').once('value').then(function(snap) {
    return snap.val() || 3;
  });
}
window.getMaxViolations = getMaxViolations;

/* ============================================================
   🔧 دوال قراءة بيانات موحّدة (المشتركين / النقاط / المخالفات)
   ============================================================ */

/** رسالة خطأ مفهومة لأخطاء Firebase (خصوصًا PERMISSION_DENIED بسبب القواعد) */
function explainDbError(err) {
  const msg = (err && (err.code || err.message)) || '';
  if (/permission[_ -]?denied/i.test(msg)) {
    return 'صلاحية القراءة مرفوضة من قواعد Firebase — الصق محتوى firebase-rules.json المحدَّث في Firebase Console ← Realtime Database ← Rules ثم Publish.';
  }
  return msg || 'خطأ غير معروف';
}
window.explainDbError = explainDbError;

/** قراءة آمنة: بترجّع {} لو فشلت القراءة بدل ما تكسر الصفحة كلها */
function safeRead(path) {
  return db.ref(path).once('value')
    .then(function (s) { return s.val() || {}; })
    .catch(function (err) { console.warn('safeRead failed:', path, err); return {}; });
}
window.safeRead = safeRead;

/**
 * نقاط المستخدم: الأكبر بين الحقل المخزّن users/{uid}/points
 * ومجموع earnedPoints من userProgress (عشان لو أحدهم ما اتحدّثش يظهر الرقم الصح).
 * progressForUser = userProgress/{uid} كاملة (compId → lessonId → {earnedPoints})
 */
function sumProgressPoints(progressForUser) {
  let sum = 0;
  Object.keys(progressForUser || {}).forEach(function (cid) {
    const lessons = progressForUser[cid] || {};
    Object.keys(lessons).forEach(function (lid) {
      const lp = lessons[lid];
      if (lp && typeof lp === 'object') sum += Number(lp.earnedPoints) || 0;
    });
  });
  return sum;
}
function getUserPoints(user, progressForUser) {
  const stored = Number(user && user.points) || 0;
  return Math.max(stored, sumProgressPoints(progressForUser));
}
window.sumProgressPoints = sumProgressPoints;
window.getUserPoints = getUserPoints;

/**
 * يرجّع قائمة uid لمشتركي محتوى معيّن، من مصدرين معًا:
 *  - enrollments/{compId}/{uid}        (النمط القديم)
 *  - userEnrollments/{uid}/{compId}    (اللي بيكتبه موقع الطالب)
 * أي مصدر يفشل بيتجاهل، والتاني يكمّل.
 */
function getEnrolledUids(compId) {
  return Promise.all([
    safeRead('enrollments/' + compId),
    safeRead('userEnrollments')
  ]).then(function (r) {
    const set = {};
    Object.keys(r[0] || {}).forEach(function (uid) { if (r[0][uid]) set[uid] = true; });
    const ue = r[1] || {};
    Object.keys(ue).forEach(function (uid) {
      if (ue[uid] && ue[uid][compId]) set[uid] = true;
    });
    return Object.keys(set);
  });
}
window.getEnrolledUids = getEnrolledUids;
