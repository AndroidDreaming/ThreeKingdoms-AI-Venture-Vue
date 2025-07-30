// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import util from './util/index'

Vue.config.productionTip = false

import { gameVision, gameTitle, gameSubtitle } from './config.js'
Vue.prototype.$gameVision = gameVision
Vue.prototype.$gameTitle = gameTitle
Vue.prototype.$gameSubtitle = gameSubtitle

// 使用ElementUI框架
Vue.use(ElementUI);

// 重写Vue实例的$get和$post，用我们自己封装的get与post方法来替代
Vue.prototype.$get = util.get
Vue.prototype.$post = util.post
Vue.prototype.$sGet = util.sGet
Vue.prototype.$sPost = util.sPost

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
