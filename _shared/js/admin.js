/* =============================================================================
 * Admin Login Modal
 *
 * Demo credentials (front-end only, no real auth):
 *   admin / admin123
 *   demo  / demo
 *
 * On success the modal animates out and the "管理员登录" button switches to
 * the user's name. The session is kept in localStorage so the state survives
 * a reload.
 * ============================================================================= */
(function () {
  const loginModal   = document.getElementById('admin-login-modal');
  const loginBtn     = document.getElementById('admin-login-btn');
  const loginForm    = document.getElementById('admin-login-form');
  const userInput    = document.getElementById('admin-login-username');
  const passInput    = document.getElementById('admin-login-password');
  const rememberChk  = document.getElementById('admin-login-remember');
  const eyeBtn       = document.getElementById('admin-login-eye');
  const errorBox     = document.getElementById('admin-login-error');
  const submitBtn    = document.getElementById('admin-login-submit');

  if (!loginModal || !loginBtn) return;

  /* 使用全局配置统一管理 storage keys。
     后端就绪后，登录验证走 API.login()，无需本地账号表。 */
  const SESSION_KEY = APP_CONFIG.storageKeys.adminSession;
  const REMEMBER_KEY = APP_CONFIG.storageKeys.adminUsername;

  /* ---- Session helpers ---- */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else   localStorage.removeItem(SESSION_KEY);
  }

  /* Reflect logged-in state on the header button. */
  function paintLoginButton() {
    const s = getSession();
    if (s && s.username) {
      loginBtn.classList.add('is-logged-in');
      loginBtn.innerHTML = `<span class="admin-avatar">${escapeHtml((s.username[0] || 'A').toUpperCase())}</span>${escapeHtml(s.username)}`;
      loginBtn.setAttribute('aria-label', `已登录 · ${s.username}（点击登出）`);
    } else {
      loginBtn.classList.remove('is-logged-in');
      loginBtn.textContent = '管理员登录';
      loginBtn.setAttribute('aria-label', '管理员登录');
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ---- Open / close ---- */
  function openLoginModal() {
    errorBox.hidden = true;
    errorBox.textContent = '';
    /* Prefill username from "remember me" if present */
    const remembered = localStorage.getItem(REMEMBER_KEY);
    if (remembered) userInput.value = remembered;
    rememberChk.checked = !!remembered;
    loginModal.classList.add('is-open');
    loginModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => userInput.focus(), 50);
  }
  function closeLoginModal() {
    loginModal.classList.remove('is-open');
    loginModal.setAttribute('aria-hidden', 'true');
    loginForm.reset();
    errorBox.hidden = true;
    /* Reset password visibility toggle */
    eyeBtn.setAttribute('aria-pressed', 'false');
    passInput.type = 'password';
  }
  function logout() {
    setSession(null);
    paintLoginButton();
  }

  /* ---- Events ---- */
  loginBtn.addEventListener('click', () => {
    const s = getSession();
    if (s && s.username) {
      if (confirm(`当前已登录为 “${s.username}”，是否登出?`)) logout();
    } else {
      openLoginModal();
    }
  });
  loginModal.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', closeLoginModal);
  });
  /* ESC closes */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && loginModal.classList.contains('is-open')) {
      closeLoginModal();
    }
  });
  /* Submit */
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = userInput.value.trim();
    const password = passInput.value;
    if (!username || !password) {
      showError('请输入账号和密码。');
      return;
    }
    /* Mimic server round-trip */
    submitBtn.disabled = true;
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = '登录中…';
    /* 调用 API 服务层进行登录验证 */
    API.login(username, password).then(result => {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = originalText;
      if (result.success) {
        const session = { username, token: result.token, loggedInAt: Date.now() };
        setSession(session);
        if (rememberChk.checked) {
          localStorage.setItem(REMEMBER_KEY, username);
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        loginModal.querySelector('.admin-login-panel').classList.add('is-success');
        showSuccess(`欢迎，${username}！`);
        setTimeout(() => {
          closeLoginModal();
          paintLoginButton();
          loginModal.querySelector('.admin-login-panel').classList.remove('is-success');
        }, 700);
      } else {
        showError(result.error || '登录失败，请重试。');
      }
    }).catch(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = originalText;
      showError('网络错误，请稍后重试。');
    });
  });
  /* Password reveal toggle */
  eyeBtn.addEventListener('click', () => {
    const showing = eyeBtn.getAttribute('aria-pressed') === 'true';
    const next = !showing;
    eyeBtn.setAttribute('aria-pressed', String(next));
    eyeBtn.setAttribute('aria-label', next ? '隐藏密码' : '显示密码');
    passInput.type = next ? 'text' : 'password';
  });

  /* ---- Inline error / success message helpers ---- */
  function showError(msg) {
    errorBox.hidden = false;
    errorBox.textContent = msg;
    errorBox.classList.remove('is-success-msg');
  }
  function showSuccess(msg) {
    errorBox.hidden = false;
    errorBox.textContent = msg;
    errorBox.classList.add('is-success-msg');
  }

  /* Initial paint from stored session */
  paintLoginButton();
})();
