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
 * يرسم شريط تنقل المسؤول العلوي داخل #adminNav
 * activePage: 'home' | 'users' | 'competition' | 'violations' | 'support'
 */
function renderAdminNav(activePage) {
  const nav = document.getElementById('adminNav');
  if (!nav) return;

  nav.innerHTML =
    '<div class="admin-nav-inner">' +
      '<div class="admin-brand-row">' +
        '<div class="admin-brand">' +
          '<span class="admin-brand-mark">' +
            '<img src="logo.png" alt="أواب">' +
          '</span>' +
          '<div class="admin-brand-text">' +
            '<h2>أواب</h2>' +
            '<span>لوحة التحكم بمنصة أواب</span>' +
          '</div>' +
        '</div>' +
        '<button class="admin-collapse-toggle" id="adminCollapseToggle" type="button" aria-label="طي القائمة الجانبية" aria-expanded="true" title="طي/فتح القائمة">' +
          icon('chevronLeft', 'icon-sm') +
        '</button>' +
      '</div>' +
      '<button class="admin-menu-toggle" id="adminMenuToggle" type="button" aria-label="حساب المسؤول وقائمة الإعدادات" aria-expanded="false" aria-controls="adminLinks">' +
        '<span class="amt-avatar" id="adminHeaderAvatar">…</span>' +
        '<span class="amt-name" id="adminHeaderName">جارٍ التحميل…</span>' +
        icon('chevronDown', 'icon-xs') +
      '</button>' +
      '<div class="admin-links" id="adminLinks">' +
        '<div class="admin-profile-block" id="adminProfileBlock">' +
          '<div class="ap-avatar" id="adminProfileAvatar">…</div>' +
          '<div class="ap-info"><div class="ap-name"><span class="ap-name-text" id="adminProfileName">جارٍ التحميل…</span>' + icon('chevronDown', 'icon-xs') + '</div><div class="ap-role">' + icon('shieldCheck', 'icon-xs') + '<span>مسؤول المنصة</span></div></div>' +
        '</div>' +
        '<div class="nav-scroll">' +
          '<div class="nav-group">' +
            '<span class="nav-group-label">الرئيسية</span>' +
            '<a href="home.html" title="لوحة القيادة والمحتوى" class="dup-mobile ' + (activePage === 'home' ? 'active' : '') + '">' + icon('gauge', 'icon-sm') + '<span class="link-label">لوحة القيادة</span></a>' +
            '<button type="button" id="adminActivityBtn" title="آخر الأنشطة">' + icon('clock', 'icon-sm') + '<span class="link-label">آخر الأنشطة</span></button>' +
          '</div>' +
          '<div class="nav-group dup-mobile-group">' +
            '<span class="nav-group-label">المستخدمون</span>' +
            '<a href="users.html" title="الحسابات" class="' + (activePage === 'users' ? 'active' : '') + '">' + icon('users', 'icon-sm') + '<span class="link-label">الحسابات</span></a>' +
            '<a href="violations.html" title="المخالفات" class="' + (activePage === 'violations' ? 'active' : '') + '">' + icon('bell', 'icon-sm') + '<span class="link-label">المخالفات</span><span class="nav-badge" id="violationsNavBadge" style="display:none;">0</span></a>' +
          '</div>' +
          '<div class="nav-group dup-mobile-group">' +
            '<span class="nav-group-label">النظام</span>' +
            '<a href="support.html" title="الدعم الفني" class="' + (activePage === 'support' ? 'active' : '') + '">' + icon('headset', 'icon-sm') + '<span class="link-label">الدعم الفني</span><span class="nav-badge" id="supportNavBadge" style="display:none;">0</span></a>' +
          '</div>' +
        '</div>' +
        '<div class="nav-foot">' +
          '<div class="theme-toggle-row">' +
            '<span class="ttr-label">' + icon('sun', 'icon-sm') + '<span class="link-label">الوضع الليلي</span></span>' +
            '<button class="theme-switch" id="adminThemeSwitch" type="button" aria-label="تبديل الوضع الليلي"></button>' +
          '</div>' +
          '<button class="danger-link" id="adminLogoutBtn" title="تسجيل الخروج">' + icon('logout', 'icon-sm') + '<span class="link-label">تسجيل الخروج</span></button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="admin-sidebar-overlay" id="adminSidebarOverlay"></div>' +
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
}

/**
 * يرسم شريط التنقل السفلي الثابت (يظهر على الموبايل فقط عبر CSS).
 * بيحتوي على أهم 4 أقسام: الرئيسية، المستخدمون، المخالفات، الدعم الفني.
 * حساب المسؤول (البروفايل/آخر الأنشطة/الوضع الليلي/تسجيل الخروج) بقى
 * ليه زرار مخصص في الهيدر نفسه (اسم المسؤول + سهم) بدل ما يتكرر هنا.
 */
function renderAdminBottomNav(activePage) {
  let bar = document.getElementById('adminBottomNav');
  if (!bar) {
    bar = document.createElement('nav');
    bar.className = 'admin-bottom-nav';
    bar.id = 'adminBottomNav';
    document.body.appendChild(bar);
  }
  bar.innerHTML =
    '<a href="home.html" class="' + (activePage === 'home' ? 'active' : '') + '">' +
      icon('gauge', 'icon') + '<span>الرئيسية</span>' +
    '</a>' +
    '<a href="users.html" class="' + (activePage === 'users' ? 'active' : '') + '">' +
      icon('users', 'icon') + '<span>المستخدمون</span>' +
    '</a>' +
    '<a href="violations.html" class="' + (activePage === 'violations' ? 'active' : '') + '">' +
      icon('bell', 'icon') + '<span class="bn-badge" id="bottomNavViolationsBadge">0</span><span>المخالفات</span>' +
    '</a>' +
    '<a href="support.html" class="' + (activePage === 'support' ? 'active' : '') + '">' +
      icon('headset', 'icon') + '<span class="bn-badge" id="bottomNavSupportBadge">0</span><span>الدعم</span>' +
    '</a>';
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

  btn.addEventListener('click', function () {
    const nowDark = !document.documentElement.hasAttribute('data-theme');
    applyAdminTheme(nowDark ? 'dark' : 'light');
    btn.classList.toggle('on', nowDark);
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
  links.querySelectorAll('a, button').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });
}

/* ============================================================
   🕘 درج "آخر الأنشطة" الجانبي (متاح من كل صفحات لوحة التحكم)
   ============================================================ */

/**
 * ينشئ (لو مش موجود) ويربط زرار "آخر الأنشطة" في الشريط الجانبي
 * بدرج منزلق يعرض أحدث التسجيلات والمخالفات وتسليمات الاختبارات،
 * بيتحمّل من قاعدة البيانات أول ما المستخدم يفتح الدرج فقط (مش تحميل زيادة لو مافتحوش).
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
    drawer.innerHTML =
      '<div class="activity-drawer-head">' +
        '<h3>' + icon('clock', 'icon-sm') + ' آخر الأنشطة</h3>' +
        '<button type="button" class="activity-drawer-close" id="activityDrawerClose" aria-label="إغلاق">' + icon('xmark', 'icon-sm') + '</button>' +
      '</div>' +
      '<div class="activity-drawer-body" id="activityDrawerBody">' +
        '<div class="center-loading" style="min-height:160px;"><div class="loader"></div></div>' +
      '</div>';
    document.body.appendChild(drawer);

    document.getElementById('activityDrawerClose').addEventListener('click', closeActivityDrawer);
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
  loadActivityDrawerData();
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

/** يجيب أحدث الأنشطة من قاعدة البيانات ويعرضها جوه الدرج */
function loadActivityDrawerData() {
  const body = document.getElementById('activityDrawerBody');
  if (!body) return;
  body.innerHTML = '<div class="center-loading" style="min-height:160px;"><div class="loader"></div></div>';

  Promise.all([
    db.ref('users').once('value'),
    db.ref('violations').once('value'),
    db.ref('examAttempts').once('value'),
    db.ref('competitions').once('value')
  ]).then(function (results) {
    const usersObj = results[0].val() || {};
    const violations = results[1].val() || {};
    const examAttempts = results[2].val() || {};
    const comps = results[3].val() || {};

    const realUsers = Object.keys(usersObj)
      .map(function (uid) { return Object.assign({ uid: uid }, usersObj[uid]); })
      .filter(function (u) { return u.isAdmin !== true; });

    const events = [];

    realUsers.forEach(function (u) {
      if (!u.createdAt) return;
      events.push({ ts: u.createdAt, type: 'user', text: '<b>' + escapeHtml(u.name || u.email || 'مستخدم') + '</b> سجّل حسابًا جديدًا' });
    });

    Object.keys(violations).forEach(function (uid) {
      Object.keys(violations[uid] || {}).forEach(function (vid) {
        const v = violations[uid][vid];
        if (!v || !v.timestamp) return;
        events.push({ ts: v.timestamp, type: 'violation', text: 'تسجيل <b>مخالفة</b> (' + escapeHtml(v.type || 'غير معروف') + ')' });
      });
    });

    Object.keys(examAttempts).forEach(function (cid) {
      Object.keys(examAttempts[cid]).forEach(function (lid) {
        Object.keys(examAttempts[cid][lid]).forEach(function (eid) {
          Object.keys(examAttempts[cid][lid][eid]).forEach(function (uid) {
            const a = examAttempts[cid][lid][eid][uid];
            if (a && a.submittedAt) {
              events.push({ ts: a.submittedAt, type: 'comp', text: 'تسليم اختبار في <b>' + escapeHtml((comps[cid] && comps[cid].title) || 'محتوى') + '</b>' });
            }
          });
        });
      });
    });

    events.sort(function (a, b) { return b.ts - a.ts; });
    const top = events.slice(0, 30);

    if (top.length === 0) {
      body.innerHTML = '<p style="color:var(--text-muted); font-size:0.8125rem; text-align:center; padding:20px 0;">لا يوجد نشاط مسجّل بعد.</p>';
      return;
    }

    const iconFor = { user: 'user', violation: 'bell', comp: 'trophy' };
    body.innerHTML = '<div class="activity-feed">' + top.map(function (e) {
      return '<div class="activity-item act-' + e.type + '">' +
        '<div class="act-icon">' + icon(iconFor[e.type], 'icon-sm') + '</div>' +
        '<div class="act-body"><div class="act-text">' + e.text + '</div><div class="act-time">' + formatArabicDate(e.ts) + '</div></div>' +
      '</div>';
    }).join('') + '</div>';
  }).catch(function (err) {
    body.innerHTML = '<p style="color:var(--danger); font-size:0.8125rem; text-align:center; padding:20px 0;">تعذر تحميل الأنشطة: ' + escapeHtml(err.message || '') + '</p>';
  });
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

  return db.ref('enrollments').once('value').then(function (snap) {
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