/**
 * Agent Portal · 全局配置
 *
 * 后端对接时修改此文件即可切换 API 地址。
 * 支持通过 URL 参数 ?api=xxx 临时覆盖，方便调试。
 */

const APP_CONFIG = {
  /** API 基础地址，留空则走同源相对路径 */
  apiBase: '',

  /** API 版本前缀 */
  apiPrefix: '/api/v1',

  /** 请求超时（毫秒） */
  requestTimeout: 15000,

  /** localStorage 存储键名 */
  storageKeys: {
    adminSession: 'agent-portal.admin.session',
    adminUsername: 'agent-portal.admin.username',
    skillFavs: 'agent-portal.skills.favs',
  },

  /** 获取完整 API 地址 */
  get apiUrl() {
    const base = this.apiBase || window.location.origin;
    return base + this.apiPrefix;
  },
};

// 支持 URL 参数临时覆盖: ?api=http://localhost:3000
(function () {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('api');
  if (override) APP_CONFIG.apiBase = override;
})();
