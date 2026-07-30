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
          '<img src="logo.png" alt="" onerror="this.style.display=\'none\'">' +
          icon('gear', 'icon-md') +
          '<div class="admin-brand-text">' +
            '<h2>لوحة تحكم أواب</h2>' +
            '<span>AWWAB ADMIN PANEL</span>' +
          '</div>' +
        '</div>' +
        '<button class="admin-collapse-toggle" id="adminCollapseToggle" type="button" aria-label="طي القائمة الجانبية" aria-expanded="true" title="طي/فتح القائمة">' +
          icon('chevronLeft', 'icon-sm') +
        '</button>' +
      '</div>' +
      '<button class="admin-menu-toggle" id="adminMenuToggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="adminLinks">' +
        '<span class="hamburger-lines"><span></span><span></span><span></span></span>' +
      '</button>' +
      '<div class="admin-links" id="adminLinks">' +
        '<a href="home.html" title="المسابقات" class="' + (activePage === 'home' ? 'active' : '') + '">' + icon('gear', 'icon-sm') + '<span class="link-label">المسابقات</span></a>' +
        '<a href="users.html" title="الحسابات" class="' + (activePage === 'users' ? 'active' : '') + '">' + icon('users', 'icon-sm') + '<span class="link-label">الحسابات</span></a>' +
        '<a href="violations.html" title="المخالفات" class="' + (activePage === 'violations' ? 'active' : '') + '">' + icon('bell', 'icon-sm') + '<span class="link-label">المخالفات</span></a>' +
        '<a href="support.html" title="الدعم الفني" class="' + (activePage === 'support' ? 'active' : '') + '">' + icon('headset', 'icon-sm') + '<span class="link-label">الدعم الفني</span></a>' +
        '<button class="danger-link" id="adminLogoutBtn" title="تسجيل الخروج">' + icon('logout', 'icon-sm') + '<span class="link-label">تسجيل الخروج</span></button>' +
      '</div>' +
    '</div>' +
    '<div class="admin-sidebar-overlay" id="adminSidebarOverlay"></div>';

  document.getElementById('adminLogoutBtn').addEventListener('click', function () {
    auth.signOut().then(function () { window.location.href = 'index.html'; });
  });

  setupAdminMobileNav();
  setupAdminSidebarCollapse();
}

/**
 * يفعّل زر السهم أعلى القائمة الجانبية ليطويها لعرض الأيقونات فقط
 * (على شاشات سطح المكتب)، ويحفظ حالة الطي في localStorage عشان تفضل
 * زي ما هي بين الصفحات وبعد تحديث المتصفح.
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
 * يفعّل زر الهمبرغر ليفتح/يقفل القائمة الجانبية على الشاشات الصغيرة
 * (هواتف وتابلت)، مع إغلاقها بالنقر على الستارة، أو زر Escape،
 * أو اختيار أي رابط، أو تكبير الشاشة لحجم سطح المكتب.
 */
function setupAdminMobileNav() {
  const toggle = document.getElementById('adminMenuToggle');
  const links = document.getElementById('adminLinks');
  const overlay = document.getElementById('adminSidebarOverlay');
  if (!toggle || !links || !overlay) return;

  function openMenu() {
    links.classList.add('open');
    overlay.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    links.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
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

/** يهرّب أي نص قبل إدراجه في HTML (نفس escapeHtml المستخدمة بالموقع الرئيسي) */
if (typeof escapeHtml !== 'function') {
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
}

/** يهرّب معرف يوتيوب من رابط (نفس الدالة المستخدمة بالموقع الرئيسي) */
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
 * يحذف كل بيانات حساب مستخدم من قاعدة البيانات (نقاطه، تقدّمه، اشتراكاته في كل
 * المسابقات، إشعاراته، محادثات الدعم الفني، إلخ) في عملية واحدة (multi-path update).
 * ملحوظة مهمة: هذا يحذف بيانات الحساب فقط من Realtime Database. حساب الدخول
 * نفسه (Firebase Authentication) هيفضل موجود تقنيًا لأن حذفه لمستخدم تاني غير
 * ممكن من كود الموقع مباشرة (محتاج صلاحيات Admin SDK من سيرفر)، لكن بما إن كل
 * بياناته اتمسحت هيتعامل معاه الموقع كأنه حساب جديد تمامًا لو دخل تاني.
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
   📋 إدارة المخالفات — جديد
   ============================================================ */

/**
 * جلب جميع المخالفات المسجلة.
 * @returns {Promise<Object>} - كائن بمفاتيح uid ثم violationId.
 */
function getAllViolations() {
  return db.ref('violations').once('value').then(function(snap) {
    return snap.val() || {};
  });
}
window.getAllViolations = getAllViolations;

/**
 * جلب مخالفات مستخدم معين.
 */
function getUserViolations(uid) {
  return db.ref('violations/' + uid).once('value').then(function(snap) {
    return snap.val() || {};
  });
}
window.getUserViolations = getUserViolations;

/**
 * حذف محاولة اختبار لمستخدم (لإعادة الاختبار أو إلغاء النتيجة).
 */
function resetExamAttempt(compId, lessonId, examId, uid) {
  return db.ref('examAttempts/' + compId + '/' + lessonId + '/' + examId + '/' + uid).remove();
}
window.resetExamAttempt = resetExamAttempt;

/**
 * حذف جميع مخالفات مستخدم معين.
 */
function clearUserViolations(uid) {
  return db.ref('violations/' + uid).remove();
}
window.clearUserViolations = clearUserViolations;

/**
 * تحديث الحد الأقصى للمخالفات في الإعدادات.
 */
function setMaxViolations(value) {
  return db.ref('settings/' + 'maxViolations').set(value);
}
window.setMaxViolations = setMaxViolations;

/**
 * الحصول على الحد الأقصى للمخالفات.
 */
function getMaxViolations() {
  return db.ref('settings/' + 'maxViolations').once('value').then(function(snap) {
    return snap.val() || 3;
  });
}
window.getMaxViolations = getMaxViolations;