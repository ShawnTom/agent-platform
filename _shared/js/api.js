/**
 * Agent Portal · API 服务层
 *
 * 所有后端接口调用统一走这里。
 * 目前是 stub 实现（返回 mock 数据），后端就绪后替换为真实 fetch 调用。
 *
 * 使用方式:
 *   import { api } from './api.js';  // 如果未来用 ES Module
 *   // 或直接全局调用:
 *   API.getAgents().then(agents => { ... });
 */

const API = {

  // ─── 智能体 ────────────────────────────────────────────

  /**
   * 获取智能体列表
   * @returns {Promise<Array>} 智能体数组
   */
  async getAgents() {
    // TODO: 后端对接后替换为真实请求
    // return this._request('/agents');
    return [];
  },

  /**
   * 获取智能体详情
   * @param {string} id - 智能体 ID
   */
  async getAgentDetail(id) {
    // return this._request(`/agents/${id}`);
    return null;
  },

  // ─── 技能与工具 ────────────────────────────────────────

  /**
   * 获取技能列表
   * @param {Object} params - { filter, sort, query }
   */
  async getSkills(params = {}) {
    // const qs = new URLSearchParams(params).toString();
    // return this._request(`/skills?${qs}`);
    return [];
  },

  /**
   * 获取技能详情
   */
  async getSkillDetail(id) {
    // return this._request(`/skills/${id}`);
    return null;
  },

  // ─── 对话 ──────────────────────────────────────────────

  /**
   * 发送聊天消息
   * @param {Object} payload - { skillId, message, model, history }
   */
  async sendChatMessage(payload) {
    // return this._request('/chat/send', 'POST', payload);
    return {
      reply: `已使用 ${payload.model || '默认模型'} 处理你的请求。\n这是一段示例回复：实际接入后此处会显示模型真实输出。`,
    };
  },

  // ─── 管理员认证 ────────────────────────────────────────

  /**
   * 管理员登录
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: boolean, token?: string, username?: string, error?: string }>}
   */
  async login(username, password) {
    // return this._request('/auth/login', 'POST', { username, password });

    // Mock: 模拟网络延迟
    await new Promise(r => setTimeout(r, 350));

    const ACCOUNTS = {
      admin: 'admin123',
      demo: 'demo',
    };

    const expected = ACCOUNTS[username];
    if (expected && expected === password) {
      return {
        success: true,
        token: 'mock-token-' + Date.now(),
        username,
      };
    }
    return {
      success: false,
      error: '账号或密码错误，请重试。',
    };
  },

  /**
   * 登出
   */
  async logout() {
    // return this._request('/auth/logout', 'POST');
    return { success: true };
  },

  // ─── 收藏 ──────────────────────────────────────────────

  /**
   * 同步收藏列表到服务端
   * @param {string[]} favIds - 收藏的技能 ID 列表
   */
  async syncFavorites(favIds) {
    // return this._request('/user/favorites', 'PUT', { ids: favIds });
    return { success: true };
  },

  // ─── 内部工具方法 ──────────────────────────────────────

  /**
   * 统一请求方法
   * @private
   */
  async _request(path, method = 'GET', body = null) {
    const url = APP_CONFIG.apiUrl + path;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(APP_CONFIG.requestTimeout),
    };

    // 附加认证 token
    const session = JSON.parse(
      localStorage.getItem(APP_CONFIG.storageKeys.adminSession) || 'null'
    );
    if (session?.token) {
      opts.headers['Authorization'] = `Bearer ${session.token}`;
    }

    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(url, opts);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.json();
    } catch (e) {
      console.error(`[API] ${method} ${path} failed:`, e);
      throw e;
    }
  },
};

// 暴露到全局，供非模块脚本使用
window.API = API;
