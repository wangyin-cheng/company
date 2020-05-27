import Vue from 'vue'

export default {
  // vue实例
  ctx: null,
  // 设罝vue实例，用于在tabs api中获取当前路由，vuex等
  setCtx (vueInstance) {
    if (vueInstance instanceof Vue) {
      this.ctx = vueInstance
    }
  },
  /**
   * 新增标签页
   * @param menuId 菜单id，必须唯一。跳转非静态菜单时必填
   * @param url 路由地址，必填
   * @param query 查询参数
   * @param title 菜单名称，必填
   * @param menuArgs 菜单参数
   * @param isKeepAlive 页面是否需要缓存，默认为false不缓存
   * @param subSysName 子系统标识名，必填
   * @param compId 模板页面映射表key值，打开临时页必填
   * @param isIframe 是否是iframe，默认为false
   * @param meta 其他添加到menu对象的属性
   */
  addNewTab (menuId, url, query = {}, title, menuArgs = '', isKeepAlive, subSysName, compId = '', isIframe = false, meta = {}) {
    isKeepAlive = typeof isKeepAlive === 'boolean' ? isKeepAlive
      : (typeof window.LOCAL_CONFIG.isAllKeepAlive === 'boolean' ? window.LOCAL_CONFIG.isAllKeepAlive : false)
    const ctx = this.ctx
    const tempRoute = ctx.$store.state.permission.tempRoute
    const menusMap = ctx.$store.state.permission.menusMap
    let route = menusMap.get(url) || tempRoute.find(r => r.url === url || r.id === menuId)
    // 打开临时页
    if (!route) {
      const staticRouteMap = ctx.$store.state.permission.staticRouteMap
      let staticRoute = staticRouteMap.get(url)
      // 如果url不在子系统静态菜单中
      if (typeof staticRoute === 'undefined' &&
         (!menuId || !url || typeof query !== 'object' || !title || !subSysName || typeof meta !== 'object' || meta === null)) {
        throw new Error('Parameters Assertion Error throwed in addNewTab')
      }
      staticRoute = staticRoute || {}
      let menuConfig = {
        url: url || staticRoute.url,
        path: url || staticRoute.url,
        kind_code: subSysName || staticRoute.subSysName,
        app_code: subSysName || staticRoute.subSysName,
        id: menuId || staticRoute.id,
        title: title || staticRoute.title,
        isKeepAlive: typeof staticRoute.isKeepAlive === 'boolean' ? staticRoute.isKeepAlive : isKeepAlive,
        menu_arg: typeof staticRoute.menuArgs === 'string' ? staticRoute.menuArgs : menuArgs,
        /* 用于在模板页面映射表中查找页面 */
        tempMenuTplId: typeof staticRoute.tempMenuTplId === 'string' ? staticRoute.tempMenuTplId : compId
      }
      if (isIframe) {
        menuConfig.menu_type = 'iframe'
        menuConfig.originalUrl = url // save original url before handle it

        const a = document.createElement('a');
        a.href = url;
        url = `/${a.host}${a.pathname}` // 201083 调用 addNewTab 方法支持打开相同域下的 iframe 类型临时页面
        menuConfig.url = menuConfig.path = url
      }
      ctx.$store.commit('SET_TEMP_ROUTE', [...tempRoute, Object.assign(menuConfig, meta)])
    } else {
      url = route.url
    }
    ctx.$router.push({path: url, query: query})
  },
  /**
   * 关闭标签页
   * @param id 菜单id (等同于路由对象的meta.id)
   * @param activeId 关闭菜单以后激活的菜单id
   * @param query 路由参数
   * @example this.$tabs.closeTab("huiTest", "mainIndex", {a: 123})
   */
  closeTab (id, activeId, query = null) {
    // 首页不可关闭
    if (id === 'mainIndex') return
    const ctx = this.ctx
    const visitedViews = ctx.$store.state.app.visitedViews
    const allRoutes = ctx.$store.state.permission.routers
    const viewIndex = visitedViews.findIndex(v => v.id === id)
    const view = visitedViews[viewIndex]
    if (view) {
      ctx.$store.dispatch('delCurVisitedViews', view)
    }
    const route = allRoutes.find(r => r.meta.id === id)
    if (route && view) {
      // 若页面有缓存，清除当前页面缓存
      ctx.$store.dispatch('refreshCurPage', route.meta.comName)
      if (typeof activeId === 'string' && activeId.trim() !== '') {
        this.activate(activeId, query);
        return
      }
      if (ctx.$route.path === view.path) {
        // 关闭当前打幵员面
        if (viewIndex > 0 && visitedViews.length < viewIndex + 1) {
          // 关闭最后一个标签
          ctx.$router.push({ path: visitedViews[viewIndex - 1].path, query: visitedViews[viewIndex - 1].query || null })
        } else if (viewIndex > 0) {
          ctx.$router.push({ path: visitedViews[viewIndex].path, query: visitedViews[viewIndex].query || null })
        }
      }
    }
  },
  /**
   * 刷新标签页
   * @param id 菜单id (等同于路由对象的meta.id)
   */
  refresh (id) {
    const ctx = this.ctx
    const needKeepAliveList = ctx.$store.state.app.needKeepAliveList
    const allRoutes = ctx.$store.state.permission.routers
    const route = allRoutes.find(r => r.meta.id === id)
    if (route && route.meta && needKeepAliveList.indexOf(route.meta.comName) > -1 && route.meta.isKeepAlive) {
      const compName = route.meta.comName
      // ctx.$route.meta.isKeepAlive = false
      ctx.$store.dispatch('refreshCurPage', compName)
      ctx.$nextTick(() => {
        // ctx.$route.meta.isKeepAlive = true
        ctx.$store.dispatch('addRouteKeepAlive', compName)
      })
    }
  },
  /**
   * 激活标签页
   * @param id菜单id (等同于路由对象的meta.id)
   * @param query 路由参数
   */
  activate (id, query = null) {
    const ctx = this.ctx
    if (ctx.$route.meta.id !== id) {
      const allVisited = [...ctx.$store.state.app.visitedViews.slice(1 - window.LOCAL_CONFIG.TABS_VIEW_LIMIT), {id: 'mainIndex'}]
      const route = allVisited.find(r => r.id === id)
      route && ctx.$router.push({ path: route.path, query })
    }
  }
}
