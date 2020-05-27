import Vue from 'vue'
import Router from 'vue-router'
import store from '@common/entry/store'
import hui from 'h_ui/dist/h_ui.min.js'
import Cookies from 'js-cookie'
import { constantRouterMap } from '@frame/router'
import { getMenuList } from '@frame/api/login'
import { getChildData } from '@common/entry/getChildData'
import Layout from '@frame/views/frame/Layout.vue'
import MainIndex from '@frame/views/mainIndex.vue'
import AppMain from '@frame/views/frame/AppMain.vue'
import History from '@common/utils/history'
import { getMenuInfoInUcf, isUcf, isFrame } from "@common/utils";
import { encryptParam } from '@frame/api/login'

Vue.use(Router)
Vue.use(History)

// 页面外层路由
const wrapperRoute = [
  {
    path: '/',
    component: isUcf() || isFrame() ? AppMain : Layout,
    redirect: '/mainIndex',
    children: [
      {
        path: '/mainIndex',
        name: '首页',
        component: MainIndex,
        hidden: true,
        meta: {
          id: 'mainIndex',
          comName: 'mainIndex'
        }
      }
    ]
  }
]
const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap.concat(wrapperRoute)
})
const whiteList = ['/login', '/beforepage'] // no redirect whitelist

/**
 * 将菜单数据处理成菜单数据map
 * @param {Array} menuList 菜单数据（来自后台或者sysconfig中配置的菜单数据）
 */
export function handleMenuList (menuList) {
  menuList.forEach((menu, index) => {
    const children = menu.children
    if (Array.isArray(children) && children.length > 0) {
      handleMenuList(children)
    } else {
      if (menu.url) {
        menu.originalUrl = menu.url // save original url before handle it
        let isFrame = menu.menu_type === 'iframe'
        let otherPrefix = ''
        if (menu.url.indexOf('http:') > -1 || menu.url.indexOf('https:') > -1) {
          let arr = menu.url.split(':/')
          otherPrefix = arr[0]
          menu.url = arr[1]
        }
        let newparam = isFrame ? menu.url : ''
        if (menu.url && menu.url.indexOf('#') > -1) {
          let arr = menu.url.split('/#')
          menu.url = isFrame ? arr[1] : menu.url
        }
        menu.otherPrefix = otherPrefix
        menu.newparam = newparam
        // 兼容多菜单对应一个页面的情况下，菜单url配置成一样的情况
        if (typeof menu.ext_field === 'string' && menu.ext_field) {
          menu.url += `_${menu.id}`
        }
        store.state.permission.menusMap.set(menu.url, menu)
      }
    }
  })
}

function findMenu (url) {
  let matched = store.state.permission.menusMap.get(url)
  let isTemp = false
  if (!matched) {
    // 临时菜单列表
    const tempRoute = store.state.permission.tempRoute
    // 从临时页中查找
    tempRoute.some(t => {
      if (t.url === url ||
        (t.menu_type === 'iframe' && (('http:/' + url) === t.url || ('https:/' + url) === t.url))) {
        matched = t
        isTemp = true
        return true
      }
      return false
    })
  }
  let activeIndex = matched ? store.state.app.menusRoot.findIndex(m => m.kind_code === matched.kind_code) : -1
  return matched
    ? { menu: matched, activeIndex: !isTemp && activeIndex > -1 ? activeIndex : null }
    : { menu: null, activeIndex: null }
}

function regist (to, next, url, tplMap, menu) {
  // 所有注册路由
  const routers = store.state.permission.routers
  // 判断当前url是否已经注册路由
  if (Array.isArray(routers) && !routers.some(r => r.path === url)) {
    // 生成路由对象
    store
      .dispatch('GenerateRoutesByMenus', {
        menu: [JSON.parse(JSON.stringify(menu))],
        asyncRouterMap: tplMap
      })
      .then(() => {
        router.addRoutes(store.getters.addRouters)
        next({ ...to })
      })
  } else {
    next()
  }
}

function registRouter (to, next) {
  let url = to.path || ''
  const { menu, activeIndex } = findMenu(url)
  if (menu !== null) {
    const sysName = menu.app_code || menu.kind_code
    // 设置激活的顶部子系统序号
    activeIndex !== null && store.commit('ACTIVE_ROOTINDEX', activeIndex)
    getChildData(sysName)
      .then(res => {
        if (typeof res === 'undefined') {
          regist(to, next, url, store.state.app.pageTplMap, menu)
        } else {
          // 保存页面模板映射表
          store.commit('SET_PAGE_TPL_MAP', res.router)
          // 将子系统加入到已加载列表中
          store.commit('ADD_HAS_OPENED_LIST', sysName)
          regist(to, next, url, res.router, menu)
        }
      })
      .catch(() => {
        console.warn(`加载子系统${sysName}失败`)
        next('/')
      })
  } else {
    // 找不到菜单或者临时页时跳转首页
    next('/')
  }
}

router.beforeEach((to, from, next) => {
  // 合并操作员中心的菜单menuArgs参数
  if (to.query && to.name !== '' && to.meta.menuArgs) {
    to.meta.menuArgs = Object.assign({}, to.meta.menuArgs, to.query)
  }

  if (isUcf()) {
    window.LOCAL_CONFIG.isUcf = true
    // 默认UCF登录有返回菜单，并保存至session
    let url =
      window.location.href && window.location.href.split('#')
        ? window.location.href.split('#')[1]
        : '/noPage'
    let huiUrl = getMenuInfoInUcf('HUIurl')
    let mcode = getMenuInfoInUcf('menu_code')
    // 子系统标识
    let sysName = getMenuInfoInUcf('app_code') || getMenuInfoInUcf('kind_code')
    if (huiUrl && huiUrl !== '') {
      url = huiUrl
    }
    const menu = {
      url: url,
      id: mcode,
      title: '',
      parentId: '',
      kind_code: getMenuInfoInUcf('kind_code'),
      app_code: getMenuInfoInUcf('app_code'),
      menu_arg: getMenuInfoInUcf('menu_arg')
    }
    if (!(to.matched && to.matched.length > 0)) {
      getChildData(sysName)
        .then(res => {
          if (typeof res === 'undefined') {
            regist(to, next, url, store.state.app.pageTplMap, menu)
          } else {
            // 保存页面模板映射表
            store.commit('SET_PAGE_TPL_MAP', res.router)
            // 将子系统加入到已加载列表中
            store.commit('ADD_HAS_OPENED_LIST', sysName)
            regist(to, next, url, res.router, menu)
          }
        })
        .catch(() => {
          console.warn(`加载子系统${sysName}失败`)
          next()
        })
    } else {
      next()
    }
  } else {
    hui.hLoadingBar.start()
    // 判断路由是否存在用户信息，如果存在，存入（当单点登陆时会有此需求）
    let redirectUri = to.fullPath
    if (redirectUri.indexOf('operator_code') > 0) {
      let sessionId = encryptParam('wer3423424wrwedsf')
      Cookies.set('Admin-Token', sessionId)
      store.commit('SET_TOKEN', sessionId)
      let userinfos = redirectUri
        .substring(redirectUri.indexOf('?') + 1, redirectUri.length)
        .split('&')
      let orgCode
      for (let i = 0; i < userinfos.length; i++) {
        let userInfo = userinfos[i]
        if (userInfo.indexOf('operator_code') !== -1) {
          window.sessionStorage.setItem(
            'currUserId',
            userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
          )
          window.sessionStorage.setItem(
            'userName',
            userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
          )
        }
        if (userInfo.indexOf('nick_name') !== -1) {
          window.sessionStorage.setItem(
            'nickName',
            decodeURI(
              userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
            )
          )
        }
        if (userInfo.indexOf('user_type') !== -1) {
          window.sessionStorage.setItem(
            'user_type',
            userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
          )
        }
        if (userInfo.indexOf('user_token') !== -1) {
          window.sessionStorage.setItem(
            'token',
            userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
          )
        }
        if (userInfo.indexOf('org_code') !== -1) {
          orgCode = decodeURI(
            userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
          )
        }
        if (userInfo.indexOf('org_name') !== -1) {
          let orgObj = {
            org_code: orgCode,
            org_name: decodeURI(
              userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length)
            )
          }
          window.sessionStorage.setItem('orgName', orgObj.org_name)
          window.sessionStorage.setItem('orgList', JSON.stringify(orgObj))
        }
        if(userInfo.indexOf("last_login_date_time") !== -1){
          window.sessionStorage.setItem(
            'lastLoginDateTime',
            decodeURIComponent(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
        }
        if (userInfo.indexOf('tenant_id') !== -1) {
          window.sessionStorage.setItem(
            'tenantId',
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
          Cookies.set('tenantId', 
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
        }
        if (userInfo.indexOf('kind_code') !== -1) {
          window.sessionStorage.setItem(
            'kindCode',
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
          Cookies.set('kindCode', 
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
        }
        if (userInfo.indexOf('tenant_name') !== -1) {
          window.sessionStorage.setItem(
            'tenantName',
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
          Cookies.set('tenantName', 
            decodeURI(userInfo.substring(userInfo.indexOf('=') + 1, userInfo.length))
          )
        }
      }
      // url重置为正常url
      // window.location.href = window.location.href.substring(0, window.location.href.indexOf('?'))
      if (to.fullPath.indexOf('?') > -1) {
        next(to.path)
        return
      }
    }
    let isCasLogin = window.LOCAL_CONFIG.isCasLogin + ''
    let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ''
    if (isCasLogin === 'true' || isIARCasLogin === 'true') {
      // 当开启单点登录模式，默认已经登录，然后请求后台服务查看当前用户是否已经登录，未登录则后台重定向到登录页面登录后回调到该页面
      let sessionId = encryptParam('wer3423424wrwedsf')
      Cookies.set('Admin-Token', sessionId)
      store.commit('SET_TOKEN', sessionId)
    }

    if (window.LOCAL_CONFIG.isToken) {
      if (store.getters.token) {
        let menus = store.state.app.menusRoot
        let storedMenus = JSON.parse(window.sessionStorage.getItem('menus') || 'null')
        // 有token，证明已登录
        if (to.path === '/login') {
          next({ path: '/' })
        } else {
          // 判断是否加载过菜单
          if (
            Array.isArray(menus) &&
            (menus.length > 0 ||
              /* 处理后台未配置菜单的情况 */
              (Array.isArray(storedMenus) &&
                storedMenus.length === 0 &&
                menus.length === 0))
          ) {
            if (to.path === '/' || to.path === '/mainIndex') {
              next()
              return
            }
            registRouter(to, next)
          } else {
            getMenuList(to.path)
              .then(res => {
                if (res && res.data) {
                  // 根据权限生成对应菜单
                  let data = res.data instanceof Array ? res.data : [res.data]
                  handleMenuList(data)
                  store.dispatch('GenerateMenuByMenus', data)
                  if (to.path === '/' || to.path === '/mainIndex') {
                    next()
                    return
                  }
                  // 根据权限生成路由
                  registRouter(to, next)
                }
              })
              .catch(() => {
                if (Array.isArray(storedMenus)) {
                  hui.hMessage.info({
                    content: i18n.t("m.i.rounterMsg.requestError"),
                    duration: 3
                  })
                  console.warn(i18n.t("m.i.rounterMsg.requestError"))
                  store.dispatch('GenerateMenuByMenus', storedMenus)
                  if (to.path === '/' || to.path === '/mainIndex') {
                    next()
                    return
                  }
                  // 根据权限生成路由
                  registRouter(to, next)
                } else {
                  hui.hMessage.info({
                    content: i18n.t("m.i.rounterMsg.requestInitError"),
                    duration: 3
                  })
                }
              })
          }
        }
      } else {
        if (whiteList.indexOf(to.path) !== -1) {
          next()
        } else {
          next('./login')
          hui.hLoadingBar.finish()
        }
      }
    } else if (!window.LOCAL_CONFIG.isToken && window.LOCAL_CONFIG.menus) {
      if (store.getters.addRouters.length === 0) {
        const menuList = JSON.parse(JSON.stringify(window.LOCAL_CONFIG.menus))
        handleMenuList(menuList)
        store.dispatch('GenerateMenuByMenus', menuList)
      }
      if (to.path === '/' || to.path === '/mainIndex') {
        next()
      } else {
        registRouter(to, next)
      }
    } else {
      next()
    }
  }
})
// afterEach记录历史记录
router.afterEach((to, from) => {
  if (router.isBack) {
    // 后退
    History.pop();
    router.isBack = false;
    router.transitionName = 'route-back';
  } else {
    History.push(to.meta.id);
    router.transitionName = 'route-forward';
  }
  hui.hLoadingBar.finish() // finish progress bar
})
export default router
