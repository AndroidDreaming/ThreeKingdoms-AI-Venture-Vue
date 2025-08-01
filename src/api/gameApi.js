// src/api/gameApi.js

import Vue from 'vue' // 为了使用 Vue.prototype.$get 等

export default {
  // 获取游戏配置
  getGameConfig() {
    return new Promise((resolve, reject) => {
      Vue.prototype.$get('/game/api/config', {}, resolve, reject)
    })
  },

  // 获取模型列表
  getModelsList() {
    return new Promise((resolve, reject) => {
      Vue.prototype.$get('/game/api/models', {}, resolve, reject)
    })
  },

  // AI 对话
  chatWithAI(params) {
    return new Promise((resolve, reject) => {
      Vue.prototype.$post('/game/api/chat', params, resolve, reject)
    })
  },

  // 图片生成（使用静默请求）
  generateImage(params) {
    return new Promise((resolve, reject) => {
      Vue.prototype.$sPost('/game/api/image', params, resolve, reject)
    })
  }
}