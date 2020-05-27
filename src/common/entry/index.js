import 'babel-polyfill'
import Vue from 'vue'
import Cookie from 'js-cookie'
import App from '@common/App'
import store from '@common/entry/store'
import router from '@common/entry/router'
import api from '@frame/api/api'
import hui from 'h_ui/dist/h_ui.min.js'
import tabs from '@common/utils/tabs.js'
/*
  @import: i18n
*/
import VueI18n from 'vue-i18n'
import zhLocale from 'h_ui/dist/locale/zh-CN'
import enLocale from 'h_ui/dist/locale/en-US'
import twLocale from 'h_ui/dist/locale/zh-TW'
import Emitter from '@common/mixins/emitter'
import clickoutside from '@common/directives/clickoutside'
import frameStore from '@frame/store'
// store.registerModule()
if (frameStore.modules) {
  for (let j in frameStore.modules) {
    store.registerModule(j, frameStore.modules[j])
  }
}

Vue.mixin(Emitter)
Vue.directive('clickoutside', clickoutside)

// window.fetch = api // TS:202004290383-资管与机构服务业务群(投资管理事业部)_陈俊宏-HUI主框架请勿将原生fetch覆盖掉，第三方库可能使用到
Vue.prototype.$http = api
Vue.prototype.$tabs = tabs
Vue.prototype.LOCAL_CONFIG = window.LOCAL_CONFIG

let bus = new Vue()
Vue.prototype.$bus = bus
/*
  @content: i18n
*/
Vue.use(VueI18n)// 通过插件的形式挂载
// 设置语言
Vue.locale = () => {}
Vue.config.lang = 'en-US'
// 多语言配置--打包后可以自定义设置
const mergeZH = Object.assign(window.zh_cn, zhLocale) // 将我们项目中的语言包与h_ui的语言包进行合并   // 中文语言包
const mergeEN = Object.assign(window.en_us, enLocale) // 英文语言包
const mergeTW = Object.assign(window.zh_tw ? window.zh_tw : {}, twLocale) // 台湾语言包
// Vue.locale('zh-CN', mergeZH)
// Vue.locale('en-US', mergeEN)

const i18n = new VueI18n({
  locale: 'zh-CN', // set locale
  messages: {
    'zh-CN': mergeZH,
    'en-US': mergeEN,
    'zh-TW': mergeTW
  }, // set locale messages
  silentTranslationWarn: true // 去掉warning提示
})
window.i18n = i18n
/*
  @content: component regist
*/
Vue.use(hui, {
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false
/* 开启vue-dev-tools */
if (process.env.NODE_ENV === 'development') Vue.config.devtools = true
/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
  beforeCreate () {
    this.$tabs.setCtx(this)
    // 从localStorage中取，没有就默认是中文
    this.$i18n.locale = localStorage.getItem('lang') || 'zh-CN'
    localStorage.setItem('lang', this.$i18n.locale)
    Cookie.set('lang', this.$i18n.locale)
  },
  watch: {
    '$i18n.locale': {
      handler () {
        const { JUMP_TO_HOME_ON_LOCALE_CHANGE } = window.LOCAL_CONFIG;
        if (JUMP_TO_HOME_ON_LOCALE_CHANGE) {
          this.$router.replace("/mainIndex");
          this.$nextTick(() => {
            setTimeout(() => {
              location.reload();
            }, 200);
          });
        } else {
          location.reload();
        }
      }
    },
    "$store.state.app.visitedViews": {
      handler(visitedViews) {
        const { KEEP_VISITED_VIEWS_ON_RELOAD } = window.LOCAL_CONFIG;
        if (KEEP_VISITED_VIEWS_ON_RELOAD) {
          sessionStorage.setItem("visitedViews", JSON.stringify(visitedViews));
        } else {
          sessionStorage.removeItem("visitedViews")
        }
      }
    }
  }
})
