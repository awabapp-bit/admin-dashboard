/* قشرة لوحة تحكم المسؤول: تحقق من صلاحية المسؤول + رسم شريط التنقل العلوي
   هذا موقع مستقل تمامًا عن موقع المستخدم؛ عدّل الرابط أدناه ليشير لموقع
   المستخدم الفعلي بعد نشره (رابط منفصل بالكامل، مش نفس المستودع). */
const USER_SITE_URL = 'https://awabapp-bit.github.io/awab-user-site/';

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
 * activePage: 'home' | 'users' | 'competition'
 */
function renderAdminNav(activePage) {
  const nav = document.getElementById('adminNav');
  if (!nav) return;

  nav.innerHTML =
    '<div class="admin-nav-inner">' +
      '<div class="admin-brand">' +
        '<img src="logo.png" alt="" onerror="this.style.display=\'none\'">' +
        icon('gear', 'icon-md') +
        '<div class="admin-brand-text">' +
          '<h2>لوحة تحكم أواب</h2>' +
          '<span>AWWAB ADMIN PANEL</span>' +
        '</div>' +
      '</div>' +
      '<div class="admin-links">' +
        '<a href="home.html" class="' + (activePage === 'home' ? 'active' : '') + '">' + icon('gear', 'icon-sm') + ' المسابقات</a>' +
        '<a href="users.html" class="' + (activePage === 'users' ? 'active' : '') + '">' + icon('users', 'icon-sm') + ' الحسابات</a>' +
        '<a href="' + USER_SITE_URL + '" target="_blank" rel="noopener">' + icon('rightToBracket', 'icon-sm') + ' عرض الموقع</a>' +
        '<button class="danger-link" id="adminLogoutBtn">' + icon('logout', 'icon-sm') + ' تسجيل الخروج</button>' +
      '</div>' +
    '</div>';

  document.getElementById('adminLogoutBtn').addEventListener('click', function () {
    auth.signOut().then(function () { window.location.href = 'index.html'; });
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
