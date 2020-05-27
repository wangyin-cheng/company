import { constantRouterMap } from '@frame/router'
import Layout from '@frame/views/frame/Layout.vue'
import AppMain from '@frame/views/frame/AppMain.vue'
import TempPageWrapper from '@frame/components/TempPageWrapper.vue'
import { isUcf, isFrame } from "@common/utils";
const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    searchRoute: [],
    /* 临时路由 */
    tempRoute: [],
    ucfAllPath: ['/', '/mainIndex'],
    /* 子系统静态菜单路由 */
    staticRouteMap: new Map(),
    /* 菜单数据映射表（url -> menu） */
    menusMap: new Map()
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.routers = [...state.routers.concat(routers)]
    },
    SEARCH_ROUTE: (state, data) => {
      state.searchRoute = data
    },
    SET_UCF_ALL_PATH: (state, data) => {
      state.ucfAllPath.push(data)
    },
    SET_ADD_ROUTERS: (state, routers) => {
      state.addRouters = routers
    },
    SET_TEMP_ROUTE: (state, data) => {
      state.tempRoute = data
    },
    SET_STATIC_ROUTE_MAP: (state, routes) => {
      if (Array.isArray(routes) && routes.length > 0) {
        const staticRouteMap = state.staticRouteMap
        routes.forEach(route => {
          if (route.url && typeof staticRouteMap.get(route.url) === 'undefined') {
            staticRouteMap.set(route.url, route)
          }
        })
      }
    }
  },
  getters: {
    permission_routers: state => state.routers,
    addRouters: state => state.addRouters,
    searchRoute: state => state.searchRoute,
    ucfAllPath: state => state.ucfAllPath
  },
  actions: {
    // 根据服务端菜单生成路由
    GenerateRoutesByMenus ({ commit }, data) {
      // return new Promise(async resolve => {
      return new Promise(resolve => {
        let route = []
        let accessedRouters = filterRouterByMenus([], data.menu, [], data.asyncRouterMap)
        let allRouter = accessedRouters
        if (isUcf() || isFrame()) { // ucf中不嵌套外层菜单Layout
          route = [{
            path: '/',
            component: AppMain,
            redirect: '/mainIndex',
            children: allRouter
          }]
        } else {
        // 初始化页面配置
          route = [{
            path: '/',
            component: Layout,
            redirect: '/mainIndex',
            children: allRouter
          }]
          commit('SEARCH_ROUTE', accessedRouters)
        }
        commit('SET_ROUTERS', accessedRouters)
        commit('SET_ADD_ROUTERS', route)
        resolve()
      })
    }
  }
}
export default permission
let rootId = ''
/**
 * 根据后台传回的可用menus,递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param router
 * @param menus
 */

function filterRouterByMenus (router, menus, parentName, asyncRouterMap) {
  if (menus && menus.length > 0) {
    for (let menu of menus) {
      // 将每个路由的rootId保存，用于切换子系统
      if (menu && menu.parentId && menu.parentId === window.LOCAL_CONFIG.MENUS_ROOT_NAME) rootId = menu.id
      if (menu.children && menu.children.length > 0) {
        filterRouterByMenus(router, menu.children, [], asyncRouterMap)
      } else {
        // menu.comName 页面组件设置的name值，对于需要缓存的页面必须设置
        // 从映射表中找到对应的component
        // 映射表配置：{
        // id: 页面id
        //   component:() => import(/* webpackChunkyName: "/valuate/security/stock" */'@/views/bizViews/valuate/security/stock.vue')
        // }
        let menuArgs = {}
        try {
          menuArgs = JSON.parse(menu.menu_arg) || {}
        } catch (e) {
          menuArgs = {}
        }
        let isFrame = menu.menu_type === 'iframe'
        let route = {
          path: menu.url,
          name: menu.title,
          meta: {
            menuArgs: Object.assign(menuArgs, {
              menu_arg: menu.menu_arg
            }),
            icon: menu.icon,
            hidden: !!((menu.is_hidden === 'true' || menu.is_hidden === true)),
            param: menu.newparam,
            // 子系统标识
            subSysName: menu.app_code || menu.kind_code,
            systemCode: menu.system_code,
            optRight: menu.optRight,
            otherPrefix: menu.otherPrefix,
            isKeepAlive: (typeof menu.is_keep_alivea === 'string' && menu.is_keep_alivea !== '') || typeof menu.is_keep_alivea === 'boolean'
              ? menu.is_keep_alivea + '' === 'true'
              : (typeof menu.isKeepAlive === 'boolean' ? menu.isKeepAlive : window.LOCAL_CONFIG.isAllKeepAlive),
            comName: menu.id, // 必须-keepAlive
            rootId: rootId,
            id: menu.id, // 用于tabs切换时可以定位到菜单栏
            kindCode: menu.kind_code,
            hasCollect: menu.has_collect,
            operatorCode: menu.operator_code
          },
          props: menu.props,
          redirect: menu.redirect
        }

        const { KEEP_IFRAME_PAGE_ALIVE } = window.LOCAL_CONFIG;

        if (isFrame && KEEP_IFRAME_PAGE_ALIVE) {
          // no component, it's gonna be blank when iframe page
          route.meta.menu_type = menu.menu_type;
        } else {
          // 区分临时页和多菜单对应一个页面的情况
          if (
            menu.tempMenuTplId ||
            (typeof menu.ext_field === "string" && menu.ext_field)
          ) {
            route.component = {
              extends: TempPageWrapper,
              name: menu.id,
              components: {
                pageView: isFrame
                  ? () =>
                      import(
                        /* webpackChunkName: "frame/viewframe" */ `@frame/views/frame`
                      )
                  : asyncRouterMap[menu.tempMenuTplId || menu.ext_field]
                  ? asyncRouterMap[menu.tempMenuTplId || menu.ext_field]
                  : () =>
                      import(
                        /* webpackChunkName: "frame/noPage" */ `@frame/views/noPage.vue`
                      )
              }
            };
          } else {
            route.component = isFrame
              ? () =>
                  import(
                    /* webpackChunkName: "frame/viewframe" */ `@frame/views/frame`
                  )
              : asyncRouterMap[menu.id]
              ? asyncRouterMap[menu.id]
              : () =>
                  import(
                    /* webpackChunkName: "frame/noPage" */ `@frame/views/noPage.vue`
                  );
          }

          // iframe component depends on url prop
          if (isFrame) {
            route.props = route.props
              ? { ...route.props, url: menu.originalUrl }
              : { url: menu.originalUrl };
          }
        }

        router.push(route)
      }
    }
  }
  return router
}
