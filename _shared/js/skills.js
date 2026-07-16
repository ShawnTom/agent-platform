/* =============================================================================
 * Skills & Tools — data, render, search, favorite, download
 * ============================================================================= */
(function () {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  /* ---- Data set ----
     Colors inspired by the original reference design: pastel icon tiles
     that pop against the cream background. */
  const SKILLS = [
    { id: 'doc',     name: '文档处理',  desc: '自动提取长文档、会议纪要、新闻报道的核心观点和关键信息，生成结构化摘要。', cat: '文档', icon: '📄', bg: '#ffe1d6', stars: 4.8, uses: '12.5K', recommend: true,
      tags: ['长文档', '摘要', '结构化'], prompt: '请阅读我粘贴的长文档，提取核心观点、关键数据和结论，输出一份结构化摘要（要点列表 + 200 字概述）。' },
    { id: 'info',    name: '信息检索',  desc: '基于知识库的实时检索增强生成，引用透明、来源可溯，支持中英文混合查询。',     cat: '搜索', icon: '🔍', bg: '#d6f1e2', stars: 4.8, uses: '12.5K', recommend: true,
      tags: ['检索增强', '引用', '知识库'], prompt: '基于企业知识库回答我接下来提出的问题，每个事实附带来源标注（文档名 + 页码）。' },
    { id: 'summary', name: '会议总结',  desc: '上传会议录音或文字稿，自动生成待办、决议、风险点与下一步行动。',                  cat: '办公', icon: '💡', bg: '#fff1d6', stars: 4.7, uses: '9.2K',  recommend: true,
      tags: ['会议', '待办', '决议'], prompt: '我将提供一段会议记录，请整理出：会议主题、关键决议、待办事项（含负责人与截止日期）、风险点与下一步行动。' },
    { id: 'qa',      name: '智能问答',  desc: '多轮对话式问答，自动反问澄清意图，结合企业知识库给出有出处的答复。',           cat: '搜索', icon: '💬', bg: '#e9f0ff', stars: 4.9, uses: '23.1K', recommend: true,
      tags: ['多轮对话', '澄清', '知识库'], prompt: '进入多轮问答模式。问题模糊时主动反问澄清，结合企业知识库给出有出处的答复，答案结尾标注信息来源。' },
    { id: 'data',    name: '数据分析',  desc: '上传 CSV/Excel/数据库连接，用自然语言提问即可生成图表与洞察报告。',           cat: '数据', icon: '📊', bg: '#efe8ff', stars: 4.8, uses: '8.4K',  recommend: true,
      tags: ['数据', '图表', '洞察'], prompt: '我将提供 CSV/Excel/自然语言描述。请先用自然语言总结主要洞察，必要时给出可执行的图表/统计建议。' },
    { id: 'draft',   name: '邮件草稿',  desc: '根据上下文自动起草邮件、润色语气、生成多版本候选。',                              cat: '办公', icon: '✏️', bg: '#ffe1ee', stars: 4.6, uses: '6.1K',  recommend: true,
      tags: ['邮件', '润色', '多版本'], prompt: '我将描述邮件目的、收件人与期望语气。请输出 2-3 个不同语气版本（正式 / 半正式 / 直接），并解释各自适用场景。' },
    { id: 'qa2',     name: '文档处理',  desc: '自动提取长文档、会议纪要、新闻报道的核心观点和关键信息，生成结构化…',           cat: '文档', icon: '🗂️', bg: '#dff0fb', stars: 4.8, uses: '12.5K', recommend: false,
      tags: ['长文档', '摘要', '对比'], prompt: '请比较两份长文档的差异点，输出对比表格（差异类型 / 文档A / 文档B / 影响），并给出总结性观点。' },
    { id: 'info2',   name: '信息检索',  desc: '基于知识库的实时检索增强生成，引用透明、来源可溯，支持中英文混合查询…',         cat: '搜索', icon: '🛡️', bg: '#d6f1e2', stars: 4.8, uses: '12.5K', recommend: false,
      tags: ['检索', '引用', '溯源'], prompt: '请基于内部知识库回答问题。每条结论必须附带可点击的引用，至少标注文档名与段落位置。' },
    { id: 'draft2',  name: '文本润色',  desc: '对中英文长文进行风格、语气、可读性润色，保留原意的同时提升表达力。',           cat: '内容', icon: '✨', bg: '#fff1d6', stars: 4.7, uses: '7.8K',  recommend: false,
      tags: ['润色', '风格', '可读性'], prompt: '我将贴一段文字。请先指出其中三处最影响可读性的问题，再给出润色后的版本，保留原意。' },
    { id: 'trans',   name: '多语翻译',  desc: '支持 100+ 语种互译，保留原文格式、术语一致性与上下文语气。',                      cat: '内容', icon: '🌐', bg: '#e9f0ff', stars: 4.9, uses: '15.2K', recommend: false,
      tags: ['翻译', '术语', '上下文'], prompt: '我将贴一段文字与目标语言。请翻译并保持原文格式；术语使用我指定的对照表（无对照表时自动推断并在末尾列出）。' },
    { id: 'code',    name: '代码助手',  desc: '代码生成、重构、解释、单元测试与 Bug 定位，覆盖 30+ 主流语言。',               cat: '开发', icon: '⌨️', bg: '#efe8ff', stars: 4.9, uses: '20.4K', recommend: false,
      tags: ['代码生成', '重构', '单测'], prompt: '我将描述需求或贴一段代码。请生成/重构/补全，并附简短说明与必要的单元测试用例。' },
    { id: 'img',     name: '图像理解',  desc: '对截图、设计稿、表格图片进行结构化解析与文字提取。',                              cat: '视觉', icon: '🖼️', bg: '#ffe1ee', stars: 4.6, uses: '5.7K',  recommend: false,
      tags: ['OCR', '设计稿', '表格'], prompt: '我将提供一张图片（截图 / 设计稿 / 表格）。请先描述所见内容，再结构化提取其中的文字与数据。' }
  ];

  /* ---- Persisted favourites (localStorage) ----
     使用全局配置中的 storageKeys，方便统一管理。 */
  const FAV_KEY = APP_CONFIG.storageKeys.skillFavs;
  let favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
  const saveFavs = () => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    // 后端就绪后取消注释以同步到服务端
    // API.syncFavorites([...favs]).catch(() => {});
  };

  /* ---- Download counter (in-memory demo) ---- */
  const dlCount = {};

  /* ---- State ---- */
  let filter = 'all';
  let query  = '';
  /* sort: 'default' | 'name' | 'uses' | 'time-asc' | 'time-desc'.
     `added` is set on each skill the first time it's loaded so we can
     sort by insertion time. */
  let sort = 'default';
  if (!SKILLS[0].added) {
    const base = Date.now();
    SKILLS.forEach((s, i) => { s.added = base - (SKILLS.length - i) * 60_000; });
  }

  /* ---- Render ---- */
  function render() {
    let list = SKILLS.slice();
    if (filter === 'favorites') list = list.filter(s => favs.has(s.id));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q)  ||
        s.cat.toLowerCase().includes(q)
      );
    }

    /* Sort — keeps a stable secondary sort by `added` for deterministic
       ordering when keys are tied (e.g. identical `uses` values). */
    const cmpAdded = (a, b) => (a.added || 0) - (b.added || 0);
    const parseUses = u => {
      if (typeof u === 'number') return u;
      const m = String(u || '').match(/([\d.]+)\s*([KkMm]?)/);
      if (!m) return 0;
      const n = parseFloat(m[1]) || 0;
      return n * (m[2].toLowerCase() === 'm' ? 1_000_000
                : m[2].toLowerCase() === 'k' ? 1_000 : 1);
    };
    if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN') || cmpAdded(a, b));
    } else if (sort === 'uses') {
      list.sort((a, b) => parseUses(b.uses) - parseUses(a.uses) || cmpAdded(a, b));
    } else if (sort === 'time-asc') {
      list.sort((a, b) => cmpAdded(a, b));
    } else if (sort === 'time-desc') {
      list.sort((a, b) => cmpAdded(b, a));
    } else {
      /* 'default' — preserve original order (already `added` ascending). */
      list.sort(cmpAdded);
    }

    if (!list.length) {
      const emptyMsg =
        filter === 'favorites' ? '还没有收藏的技能，点击卡片上的星标收藏。' :
        `没有找到与 “${escapeHtml(query)}” 相关的技能。`;
      grid.innerHTML = `<div class="skills-empty">${emptyMsg}</div>`;
      return;
    }

    grid.innerHTML = list.map(s => `
      <article class="skill-card" data-id="${s.id}">
        <div class="skill-icon" style="background:${s.bg}">${s.icon}</div>
        <div class="skill-body">
          <div class="skill-title-row">
            <span class="skill-title">${escapeHtml(s.name)}</span>
            <span class="skill-meta">使用 ${s.uses}</span>
          </div>
          <p class="skill-desc">${escapeHtml(s.desc)}</p>
        </div>
        <div class="skill-actions">
          <button class="icon-btn js-dl" title="下载" aria-label="下载">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/>
            </svg>
          </button>
          <button class="icon-btn js-fav ${favs.has(s.id) ? 'faved' : ''}"
                  title="${favs.has(s.id) ? '取消收藏' : '收藏'}" aria-label="收藏">
            <svg viewBox="0 0 24 24" fill="${favs.has(s.id) ? 'currentColor' : 'none'}"
                 stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/>
            </svg>
          </button>
        </div>
      </article>
    `).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ---- Event delegation ---- */
  grid.addEventListener('click', e => {
    const favBtn = e.target.closest('.js-fav');
    if (favBtn) {
      const id = favBtn.closest('.skill-card').dataset.id;
      const svg = favBtn.querySelector('svg');
      if (favs.has(id)) {
        favs.delete(id);
        favBtn.classList.remove('faved');
        if (svg) svg.setAttribute('fill', 'none');
      } else {
        favs.add(id);
        favBtn.classList.add('faved');
        if (svg) svg.setAttribute('fill', 'currentColor');
      }
      saveFavs();
      return;
    }
    const dlBtn = e.target.closest('.js-dl');
    if (dlBtn) {
      const card = dlBtn.closest('.skill-card');
      const id = card.dataset.id;
      dlCount[id] = (dlCount[id] || 0) + 1;
      dlBtn.style.background = 'var(--accent)';
      dlBtn.style.color = '#fff';
      dlBtn.style.borderColor = 'var(--accent)';
      setTimeout(() => {
        dlBtn.style.background = '';
        dlBtn.style.color = '';
        dlBtn.style.borderColor = '';
      }, 600);
      console.log(`[download] ${id} · count=${dlCount[id]}`);
    }
  });

  /* Tabs */
  document.querySelectorAll('.skills-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.skills-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      filter = t.dataset.filter;
      render();
    });
  });

  /* Search */
  const searchInput = document.getElementById('skills-search-input');
  let searchTimer;
  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      query = e.target.value.trim();
      render();
    }, 120);
  });
  /* ⌘K / Ctrl+K shortcut focuses search when on skills page. */
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const skills = document.getElementById('skills');
      if (skills && !skills.classList.contains('is-hidden')) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  /* =====================================================================
   * Sort dropdown — generic, robust pattern.
   * Pattern:
   *   - Trigger button (`#skills-sort`) with `aria-haspopup="menu"`,
   *     `aria-expanded` toggled between "true" / "false".
   *   - Menu element (`#skills-sort-menu`) with class `is-open` toggled.
   *     CSS handles visibility via opacity / transform / pointer-events,
   *     so the element is always in the DOM (no `hidden` attribute) and
   *     can be transitioned in and out cleanly.
   *   - One delegated `pointerdown` listener on `document` catches
   *     outside clicks — works whether the trigger toggle happens on
   *     `click` or `mousedown`, no race conditions.
   *   - `Esc` closes the menu and returns focus to the trigger.
   * ===================================================================== */
  const sortBtn   = document.getElementById('skills-sort');
  const sortMenu  = document.getElementById('skills-sort-menu');
  const sortLabel = document.getElementById('skills-sort-label');

  function isMenuOpen() { return sortMenu.classList.contains('is-open'); }
  function openMenu()   { sortMenu.classList.add('is-open'); sortBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu()  { sortMenu.classList.remove('is-open'); sortBtn.setAttribute('aria-expanded', 'false'); }
  function toggleMenu() { isMenuOpen() ? closeMenu() : openMenu(); }

  /* Toggle on trigger click */
  sortBtn.addEventListener('click', e => {
    e.stopPropagation();   // prevent the document listener from closing immediately
    toggleMenu();
  });

  /* Pick a sort option */
  sortMenu.addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    const next = item.dataset.sort;
    if (next && next !== sort) {
      sort = next;
      sortLabel.textContent = item.textContent.trim();
      sortMenu.querySelectorAll('.dropdown-item').forEach(x =>
        x.classList.toggle('is-active', x === item));
    }
    closeMenu();
    render();
    sortBtn.focus();
  });

  /* Close on outside click. Uses pointerdown so it fires BEFORE the click
     that would re-open the menu, eliminating race conditions. */
  document.addEventListener('pointerdown', e => {
    if (!isMenuOpen()) return;
    if (sortBtn.contains(e.target))   return;  // button handles itself
    if (sortMenu.contains(e.target))  return;  // menu handled its own click
    closeMenu();
  });

  /* Close on Escape, return focus to trigger */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      sortBtn.focus();
    }
  });

  /* Initial render */
  render();

  /* =====================================================================
   * Skill Detail Modal — click a skill card to open it
   * ===================================================================== */
  const skillModal = document.getElementById('skill-modal');
  const sm = {
    root:    skillModal,
    icon:    document.getElementById('skill-modal-icon'),
    title:   document.getElementById('skill-modal-title'),
    cat:     document.getElementById('skill-modal-cat'),
    stars:   document.getElementById('skill-modal-stars'),
    uses:    document.getElementById('skill-modal-uses'),
    desc:    document.getElementById('skill-modal-desc'),
    tags:    document.getElementById('skill-modal-tags'),
    prompt:  document.getElementById('skill-modal-prompt'),
    tryBtn:  document.getElementById('skill-modal-try'),
    current: null
  };
  function openSkillModal(skill) {
    sm.current = skill;
    sm.icon.textContent = skill.icon;
    sm.icon.style.background = skill.bg;
    sm.title.textContent = skill.name;
    sm.cat.textContent = skill.cat;
    sm.stars.textContent = skill.stars;
    sm.uses.textContent = skill.uses;
    sm.desc.textContent = skill.desc;
    sm.tags.innerHTML = (skill.tags || [])
      .map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    sm.prompt.textContent = skill.prompt || '';
    sm.root.classList.add('is-open');
    sm.root.setAttribute('aria-hidden', 'false');
  }
  function closeSkillModal() {
    sm.root.classList.remove('is-open');
    sm.root.setAttribute('aria-hidden', 'true');
    sm.current = null;
  }

  /* Make the whole card clickable, but ignore clicks on the inner action
     buttons (favorite/download) so they keep their own handlers. */
  grid.addEventListener('click', e => {
    if (e.target.closest('.js-fav') || e.target.closest('.js-dl')) return;
    const card = e.target.closest('.skill-card');
    if (!card) return;
    const skill = SKILLS.find(s => s.id === card.dataset.id);
    if (skill) openSkillModal(skill);
  });

  /* Click on 立即试用 → close detail modal, open chat modal pre-filled */
  sm.tryBtn.addEventListener('click', () => {
    const skill = sm.current;
    closeSkillModal();
    if (skill) openChatModal(skill);
  });

  /* =====================================================================
   * Chat Modal — opens with default prompt seeded from the skill
   * Closes cleanly every time → next "立即试用" re-seeds fresh state.
   * ===================================================================== */
  const chatModal = document.getElementById('chat-modal');
  const cm = {
    root:    chatModal,
    title:   document.getElementById('chat-modal-title'),
    sub:     document.getElementById('chat-modal-sub'),
    body:    document.getElementById('chat-modal-body'),
    input:   document.getElementById('chat-modal-input'),
    model:   document.getElementById('chat-modal-model'),
    sendBtn: document.getElementById('chat-modal-send'),
    tagsBox: document.getElementById('chat-modal-tags'),
    current: null
  };

  function openChatModal(skill) {
    cm.current = skill;
    /* Header: skill name + the user-editable prompt description */
    cm.title.textContent = skill.name;
    cm.sub.textContent = skill.prompt || skill.desc;
    /* Inside the input shell: a single read-only tag showing the skill name.
       Sits at the LEFT of the first input row; textarea starts to its right.
       Not editable, not clickable. */
    cm.tagsBox.textContent = skill.name;
    /* Pre-fill input with the auto-generated prompt — user can edit freely */
    cm.input.value = skill.prompt || '';
    /* Reset body */
    cm.body.innerHTML = `<div class="chat-msg empty">会话已开始，发送第一条消息吧。</div>`;
    /* Reset model to default (千问) */
    cm.model.value = 'qwen3-max';
    fitModelSelect();
    cm.root.classList.add('is-open');
    cm.root.setAttribute('aria-hidden', 'false');
    /* Autofocus + cursor at end so user can immediately edit.
       Also resize now that the default prompt is seeded, so the box grows
       to fit it (capped at 250px). */
    setTimeout(() => {
      autoResize(cm.input);
      cm.input.focus();
      const v = cm.input.value;
      cm.input.setSelectionRange(v.length, v.length);
    }, 50);
  }
  function closeChatModal() {
    cm.root.classList.remove('is-open');
    cm.root.setAttribute('aria-hidden', 'true');
    /* CRITICAL: wipe all skill-bound state so the next 立即试用 starts fresh.
       No prior messages, no leftover prompt, no leftover skill. */
    cm.current = null;
    cm.body.innerHTML = '';
    cm.input.value = '';
    cm.tagsBox.innerHTML = '';
  }

  /* The skill tag is a read-only label. Clicking it just focuses the
     textarea (cursor goes to the end of existing input). */
  cm.tagsBox.addEventListener('click', () => {
    cm.input.focus();
    const v = cm.input.value;
    cm.input.setSelectionRange(v.length, v.length);
  });

  /* Auto-grow textarea: grow with content up to 200px, then scroll inside. */
    const TEXTAREA_MAX = 200;
    function autoResize(el) {
      // Reset to natural height so scrollHeight reflects the content size.
      el.style.height = 'auto';
      const newH = Math.min(el.scrollHeight, TEXTAREA_MAX);
      el.style.height = newH + 'px';
      // Show textarea scroll only when content actually overflows.
      el.style.overflowY = el.scrollHeight > TEXTAREA_MAX ? 'auto' : 'hidden';
    }
    cm.input.addEventListener('input', () => autoResize(cm.input));
    /* Also resize after the default prompt is seeded on open. */
    cm.input.addEventListener('focus', () => autoResize(cm.input));

    /* =====================================================================
     * Model select — width follows the currently-selected option text
     * (not the longest option in the list). We measure with a hidden
     * mirror element and apply the measured width back to the select.
     * ===================================================================== */
    const modelSelect = cm.model;
    const sizer = document.createElement('span');
    sizer.setAttribute('aria-hidden', 'true');
    sizer.style.cssText =
      'position:absolute; visibility:hidden; white-space:pre;' +
      'left:-9999px; top:-9999px; pointer-events:none;';
    // Mirror the select's typographic style so the measurement is accurate.
    const cs = window.getComputedStyle(modelSelect);
    sizer.style.font = cs.font;
    document.body.appendChild(sizer);

    function fitModelSelect() {
      const opt = modelSelect.options[modelSelect.selectedIndex];
      sizer.textContent = opt ? opt.textContent : modelSelect.value;
      // 2px slack so the caret doesn't kiss the right edge.
      const w = sizer.getBoundingClientRect().width + 2;
      modelSelect.style.width = Math.ceil(w) + 'px';
    }
    modelSelect.addEventListener('change', fitModelSelect);
    /* Window font load can shift widths after first paint — refit then too. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitModelSelect);
    }
  cm.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  cm.sendBtn.addEventListener('click', handleSend);

  function handleSend() {
    const text = cm.input.value.trim();
    if (!text) return;
    /* Remove placeholder empty state if present */
    const empty = cm.body.querySelector('.chat-msg.empty');
    if (empty) empty.remove();
    /* Append user bubble */
    appendMessage('user', text);
    cm.input.value = '';
    autoResize(cm.input);
    cm.sendBtn.disabled = true;
    /* Simulated assistant echo — 后端就绪后替换为 API.sendChatMessage() */
    // API.sendChatMessage({ skillId: cm.current?.id, message: text, model: cm.model.value, history: [] })
    //   .then(res => appendMessage('assistant', res.reply))
    //   .catch(err => appendMessage('assistant', '请求失败：' + err.message))
    //   .finally(() => { cm.sendBtn.disabled = false; });
    setTimeout(() => {
      const skillName = cm.current ? cm.current.name : '技能';
      appendMessage('assistant',
        `已使用 ${cm.model.value} 处理你的请求（${escapeHtml(skillName)}）。\n` +
        `这是一段示例回复：实际接入后此处会显示模型真实输出。`);
      cm.sendBtn.disabled = false;
    }, 600);
  }
  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    cm.body.appendChild(div);
    cm.body.scrollTop = cm.body.scrollHeight;
  }

  /* Generic modal close (works for all 3) */
  document.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', () => {
      closeSkillModal();
      closeChatModal();
      closeCadDetailModal();
    });
  });
  /* ESC closes any open modal (priority: chat > skill > cad) */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (cm.root.classList.contains('is-open')) closeChatModal();
      else if (sm.root.classList.contains('is-open')) closeSkillModal();
      else if (cdm.root.classList.contains('is-open')) closeCadDetailModal();
    }
  });

  /* =====================================================================
   * CAD Knowledge Assistant · detail modal
   * Same pattern as `sm` and `cm` — class `is-open` toggles visibility.
   * ===================================================================== */
  const cdm = {
    root: document.getElementById('cad-detail-modal')
  };
  function openCadDetailModal() {
    cdm.root.classList.add('is-open');
    cdm.root.setAttribute('aria-hidden', 'false');
    /* Reset scroll position each time it opens */
    const body = cdm.root.querySelector('.cad-detail-body');
    if (body) body.scrollTop = 0;
  }
  function closeCadDetailModal() {
    cdm.root.classList.remove('is-open');
    cdm.root.setAttribute('aria-hidden', 'true');
  }

  /* The CAD card has `data-action="cad-detail"` — clicking it opens the
     detail modal instead of the chat modal. */
  const cadCard = document.getElementById('agent-card-cad');
  if (cadCard) {
    cadCard.addEventListener('click', e => {
      e.stopPropagation();                 // don't bubble to a parent card
      openCadDetailModal();
    });
  }
})();
