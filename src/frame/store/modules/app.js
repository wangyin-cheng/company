import Cookies from 'js-cookie'
import Vue from 'vue'
let temp = Cookies.get('lang')
let homePage = temp == 'zh-TW' ? '首頁' : (temp == 'en-US') ? 'Home' : '首页'
const app = {
  state: {
    lock: '',
    activeIndex: 0, // 当前激活根菜单
    sidebar: { // 是否展开菜单栏
      /* !+Cookies.get('sidebarStatus') 会将其他数字转换为false, 将数字0转换为true */
      opened: (typeof Cookies.get('sidebarStatus') === 'undefined') ? (window.LOCAL_CONFIG.isExpandSidebarMenu+''=='true' ? true : false) : !+Cookies.get('sidebarStatus')
    },
    menusRoot: [], // 有多个子系统
    menusNoRoot: [], // 仅有一个系统[没有头部菜单],
    visitedViews: (() => {
      if (sessionStorage.hasOwnProperty("visitedViews")) {
        return JSON.parse(sessionStorage.getItem("visitedViews"));
      }
      return [{ name: homePage, path: "/mainIndex", id: "mainIndex" }];
    })(), // 已打开视图
    mSidebar: {
      /* !+Cookies.get('mSidebarStatus') 会将其他数字转换为false, 将数字0转换为true */
      opened: true
    },
    needKeepAliveList: [],
    // 是否打开过，动态注册路由等子系统信息
    hasOpened: false,
    hasOpenedList: [],
    collectTotal: {},
    // 页面模板映射表（menu.id -> tpl）
    pageTplMap: {},
    leafTotal: [],
    clickItemIndex: -1, // 当前一级菜单index
    systemHeight: 50, // 50说明一行可以放下所有子系统，大于50说明子系统一行放不下
    msgs: []
  },
  getters: {
    lock: state => state.lock,
    sidebar: state => state.sidebar,
    activeIndex: state => state.activeIndex,
    menusRoot: state => state.menusRoot, // 有多个子系统
    menusNoRoot: state => state.menusNoRoot,
    visitedViews: state => state.visitedViews,
    mSidebar: state => state.mSidebar,
    needKeepAliveList: state => state.needKeepAliveList,
    hasOpened: state => state.hasOpened,
    collectTotal: state => state.collectTotal,
    leafTotal: state => state.leafTotal,
    clickItemIndex: state => state.clickItemIndex,
    systemHeight: state => state.systemHeight,
    msgsAll: state => state.msgs
  },
  mutations: {
    INITLEAFTOTAL: (state, data) => {
      state.leafTotal = data
    },
    INITCOLLECTMENU: (state, data) => {
      state.collectTotal = data
    },
    COLLECTMENU: (state, data) => {
      let status = data.box.has_collect + ''
      let temp = status === '0' ? '1' : '0'
      Vue.set(data.box, 'has_collect', temp)
      if (temp === '1') {
        state.collectTotal[data.id].push(data.box)
      } else {
        state.collectTotal[data.id].splice(state.collectTotal[data.id].findIndex(item => item.id === data.box.id), 1)
      }
      let secIndex = state.leafTotal.findIndex(item => item.id === data.box.id)
      Vue.set(state.leafTotal[secIndex], 'has_collect', temp)
    },
    CHANGEITEMINDEX: (state, data) => {
      state.clickItemIndex = data
    },
    CHANGESYSTEMHEIGHT: (state, data) => {
      state.systemHeight = data
    },
    // 对消息的操作
    ADD_MSG: (state, msg) => {
      for (let i = 0; i < state.msgs.length; i++) {
        if (msg.id && state.msgs[i].id === msg.id) {
          state.msgs.splice(i, 1)
        }
      }
      state.msgs.splice(0, 0, msg)
    },
    LOCKSCREEN: state => {
      state.lock = true
      Cookies.set('lock', true)
    },
    UNLOCKSCREEN: state => {
      state.lock = false
      Cookies.set('lock', false)
    },
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    TOGGLE_MSIDEBAR: state => {
      state.mSidebar.opened = !state.mSidebar.opened
    },
    ACTIVE_ROOTINDEX: (state, index) => {
      state.activeIndex = index
    },
    SET_MENUS_ROOT: (state, data) => {
      let child = []
      if(window.LOCAL_CONFIG.isSubSystemMenu + '' == 'true'){
        data.map(item => {
          child = child.concat(item.children)
        })
      }else{
        child = data
      }
      state.menusRoot = child
    },
    SET_MENUS_NO_ROOT: (state, data) => {
      state.menusNoRoot = data
    },
    ADD_VISITED_VIEWS: (state, view) => {
      if (state.visitedViews.some(v => v.path === view.path)){
        let oriIdx = state.visitedViews.findIndex(v => v.path === view.path)
        let aimIdx = state.visitedViews.length - 1
        if(view.path != '/mainIndex' && oriIdx <= (state.visitedViews.length - window.LOCAL_CONFIG.TABS_VIEW_LIMIT) && aimIdx > 0){
          let item = state.visitedViews[oriIdx]
          state.visitedViews.splice(oriIdx, 1)
          state.visitedViews.push(item)
        }
        return
      } 
      state.visitedViews.push({name: view.name, path: view.path, id: view.meta.id, query: view.query})
    },
    DEL_CUR_VISITED_VIEWS: (state, view) => {
      let index
      /* entires返回一个迭代器，它返回数组的键/值对。 */
      /* for of循环功能相似，不同的是每次循环它提供的不是序号而是值。 */
      for (const [i, v] of state.visitedViews.entries()) {
        if (v.path === view.path) {
          index = i
          break
        }
      }
      state.visitedViews.splice(index, 1)
    },
    DEL_ALL_VISITED_VIEWS: (state, view) => {
      state.visitedViews = [{name: homePage, path: '/mainIndex', id: 'mainIndex'}]
    },
    DEL_OTHER_VISITED_VIEWS: (state, view) => {
      state.visitedViews = [{name: homePage, path: '/mainIndex', id: 'mainIndex'}, view]
    },
    ADD_KEEP_ALIVE: (state, comName) => {
      if (state.needKeepAliveList.indexOf(comName) >= 0) return
      state.needKeepAliveList.push(comName)
    },
    DEL_KEEP_ALIVE: (state, comName) => {
      let idx = state.needKeepAliveList.indexOf(comName)
      if (idx >= 0) {
        state.needKeepAliveList.splice(idx, 1)
      }
    },
    DEL_OTHER_KEEP_ALIVE: (state, comName) => {
      state.needKeepAliveList = ['home', comName]
    },
    DEL_ALl_KEEP_ALIVE: (state) => {
      state.needKeepAliveList = ['home']
    },
    ADD_HAS_OPENED_LIST: (state, sysName) => {
      if (!sysName) return
      const hasOpenedList = state.hasOpenedList
      if (hasOpenedList.indexOf(sysName) < 0) {
        hasOpenedList.push(sysName)
      }
    },
    SET_PAGE_TPL_MAP: (state, tplMap) => {
      if (typeof tplMap !== 'object' || tplMap === null) return
      state.pageTplMap = Object.assign({}, state.pageTplMap, tplMap)
    }
  },
  actions: {
    initLeafTotal: ({commit}, data) => {
      commit('INITLEAFTOTAL', data)
    },
    initCollectMenu: ({commit}, data) => {
      commit('INITCOLLECTMENU', data)
    },
    collectMenu: ({commit}, data) => {
      commit('COLLECTMENU', data)
    },
    changeItemIndex: ({commit}, data) => {
      commit('CHANGEITEMINDEX', data)
    },
    changeSystemHeight: ({commit}, data) => {
      commit('CHANGESYSTEMHEIGHT', data)
    },
    // 对消息的操作
    ADD_MSGS: ({ commit }, msgs) => {
      for (let msg of msgs) {
        commit('ADD_MSG', msg)
      }
    },
    addRouteKeepAlive: ({commit}, comName) => {
      commit('ADD_KEEP_ALIVE', comName)
    },
    refreshCurPage: ({commit}, comName) => {
      commit('DEL_KEEP_ALIVE', comName)
    },
    delOtherKeepAlive: ({commit}, comName) => {
      commit('DEL_OTHER_KEEP_ALIVE', comName)
    },
    delAllKeepAlive: ({commit}) => {
      commit('DEL_ALl_KEEP_ALIVE')
    },
    lockscreen: ({commit}) => {
      commit('LOCKSCREEN')
    },
    unlockscreen: ({commit}) => {
      commit('UNLOCKSCREEN')
    },
    ToggleSidebar: ({commit}) => {
      commit('TOGGLE_SIDEBAR')
    },
    ToggleMSidebar: ({commit}) => {
      commit('TOGGLE_MSIDEBAR')
    },
    ActiveRootIndex ({commit}, data) {
      commit('ACTIVE_ROOTINDEX', data)
    },
    GenerateMenuByMenus ({commit}, data) {
      if (data && data.length >= 0) {
        // menu.parentCode === 'BIZFRAME //头部根路径
        let newMenu = data.filter(menu => { return (menu.is_hidden === false || menu.is_hidden === 'false') && menu.parent_id === window.LOCAL_CONFIG.MENUS_ROOT_NAME })
        if (newMenu.length > 0) {
          window.sessionStorage.setItem('menus', JSON.stringify(newMenu))
          window.sessionStorage.setItem('menusType', '1')
          commit('SET_MENUS_ROOT', newMenu)
        } else {
          window.sessionStorage.setItem('menusType', '0')
          // commit('SET_MENUS_NO_ROOT', newMenu)
          window.sessionStorage.setItem('menus', JSON.stringify(data))
          commit('SET_MENUS_NO_ROOT', data)
        }
      }
    },
    addVisitedViews: ({commit}, view) => {
      commit('ADD_VISITED_VIEWS', view)
    },
    delCurVisitedViews: ({commit}, view) => {
      commit('DEL_CUR_VISITED_VIEWS', view)
    },
    delAllVisitedViews: ({commit}, view) => {
      commit('DEL_ALL_VISITED_VIEWS', view)
    },
    delOtherVisitedViews: ({commit}, view) => {
      commit('DEL_OTHER_VISITED_VIEWS', view)
    }
  }
}
export default app
