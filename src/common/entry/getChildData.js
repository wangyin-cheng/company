import Vue from 'vue'
import store from '@common/entry/store'
import tabs from '@common/utils/tabs.js'
import {registerGlobalComponents} from '@common/entry/component.js'

const _import = require('@common/entry/_import_' + process.env.NODE_ENV)
/**
 * 加载子系统
 * @param {String} sysName 子系统名
 */
export function getChildData (sysName) {
  const hasOpenedList = store.state.app.hasOpenedList
  // 如果已经加载过子系统，则promise返回undefined
  if (hasOpenedList.indexOf(sysName) > -1) {
    return Promise.resolve()
  }
  return new Promise(async (resolve, reject) => {
    let res = await _import(sysName)
    if (res) {
      if ((res.length && res.length > 0) || res.default) {
        let newRes = res && res[0] && res[0].default ? res[0].default : res.default
        // 注册子系统store
        if (newRes.store && newRes.store.modules) {
          for (let j in newRes.store.modules) {
            // 判断模块是否已经存在，已存在则不注册
            if (!store._modules.root._children[j]) {
              store.registerModule(j, newRes.store.modules[j])
            } else {
              console.warn(`${sysName}子系统store模块${j}已经存在，不再重复注册`)
            }
          }
        }
        // 注册子系统的公共组件
        if (newRes.components && Object.keys(newRes.components).length > 0) {
          registerGlobalComponents(Vue, newRes.components)
        }
        // 注册子系统指令
        if (newRes.directives) {
          for (let key in newRes.directives) {
            Vue.directive(key, newRes.directives[key])
          }
        }
        // 注册子系统公共实例化
        if (newRes.utils) {
          for (let key in newRes.utils) {
            Vue.prototype[key] = newRes.utils[key]
          }
        }
        // 注册插件
        if (newRes.uses) {
          for (let key in newRes.uses) {
            Vue.use(newRes.uses[key])
          }
        }
        // 加载国际化
        if (newRes.i18n) {
          const i18n = newRes.i18n
          if (typeof i18n === 'object' && i18n !== null) {
            for (let key in i18n) {
              window.i18n.mergeLocaleMessage(key, i18n[key])
            }
          }
        }
        // 静态菜单路由
        const staticRoutes = newRes.staticRoutes
        if (Array.isArray(staticRoutes) && staticRoutes.length > 0) {
          store.commit('SET_STATIC_ROUTE_MAP', staticRoutes.map(route => {
            route.subSysName = sysName
            return route
          }))
        }

        // 执行子系统暴露的 bootstrap 引导函数
        const resolveData = Object.assign({}, newRes, { ident: sysName });
        if (newRes.bootstrap) {
          newRes.bootstrap({ store, tabs }, () => {
            resolve(resolveData);
          });
        } else {
          resolve(resolveData);
        }
        return;
      }
    }
    reject(new Error('subsystem resources don\'t exist'))
  })
}
