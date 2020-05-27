import { login, logout, casLogout, encryptParam } from '@frame/api/login'
import Cookies from 'js-cookie'
import hui from 'h_ui/dist/h_ui.min.js'
import { kickout } from '@common/utils/commonUtil'
const user = {
  state: {
    user: '',
    token: (Cookies.get('user_token') ? Cookies.get('user_token') : Cookies.get('Admin-Token')),
    optAuths: []
  },
  mutations: {
    LOGIN_SUCCESS: () => {
      // console.log('登录成功')
    },
    LOGOUT_USER: state => {
      state.user = ''
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_OPT_AUTHS: (state, optAuths) => {
      state.optAuths = optAuths
    }
  },
  getters: {
    token: state => state.token,
    optAuths: state => state.optAuths
  },
  actions: {
    // 登录
    // 将token信息保存
    Login({ commit }, userInfo) {
      // Cookies.set('Admin-Token', 'admin')
      // commit('SET_TOKEN', 'admin')
      const username = userInfo.username != null ? userInfo.username.trim() : ''
      return new Promise((resolve, reject) => {
        login(username, userInfo.password, userInfo.tenantId, userInfo.kindCode, userInfo.checkcode, userInfo.emailcode).then(response => {
          const data = response.data
          // return_code: 0  登录成功
          // return_code: -1 用户名错误
          // return_code: -2 密码错误
          let sessionId = 'wer3423424wrwedsf'
          let token = ''
          if (data && data.return_code === '0') {
            token = encryptParam(data.user_token ? data.user_token : sessionId)
            Cookies.set('Admin-Token', encryptParam(sessionId))
            Cookies.set('operator_code', data.operator_code)
            Cookies.set('user_token', token)
            window.sessionStorage.setItem('operator_code', data.operator_code)
            window.sessionStorage.setItem('userName', username)
            commit('SET_TOKEN', token)
            commit('SET_OPT_AUTHS', data.optAuths)
          }
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    // 将浏览器保存的token及权限清除
    Logout({ commit, state }) {
      return new Promise((resolve, reject) => {
        let isCasLogin = window.LOCAL_CONFIG.isCasLogin + ''
        logout().then(response => {
          if (isCasLogin === 'true' || !response || response.data.return_code === '0' || response.data.return_code == '-2') {
            commit('SET_TOKEN', '')
            Cookies.remove('Admin-Token')
            Cookies.remove('lock')
            Cookies.remove('menusType')
            Cookies.remove('token')
            Cookies.remove('user_token')
            Cookies.remove('lang')
            Cookies.remove('kindCode')
            Cookies.remove('tenantId')
            Cookies.remove('tenantName')
            Cookies.remove('clientIp')
            Cookies.remove('sidebarStatus')
            Cookies.remove('operator_code')
            window.sessionStorage.removeItem('currUserId')
            window.sessionStorage.removeItem('userName')
            window.sessionStorage.removeItem('nickName')
            window.sessionStorage.removeItem('user_type')
            window.sessionStorage.removeItem('orgList')
            window.sessionStorage.removeItem('menus')
            window.sessionStorage.removeItem('orgName')
            window.sessionStorage.removeItem('lastLoginDateTime')
            window.sessionStorage.removeItem('menusType')
            window.localStorage.removeItem('lang')
            window.sessionStorage.removeItem('kindCode')
            window.sessionStorage.removeItem('tenantId')
            window.sessionStorage.removeItem('tenantName')
            window.sessionStorage.removeItem('userType')
            window.sessionStorage.removeItem('envId')
            window.sessionStorage.removeItem('envName')
            window.sessionStorage.removeItem('operator_code')
            let tmpKey = Cookies.get('user_token') + '#' + Cookies.get('operator_code')
            kickout(tmpKey)
            resolve()
          } else {
            hui.hMessage.error('未退出成功')
          }
        })
      })
    },
    // IAR单点登出
    // 将浏览器保存的token及权限清除
    casLogout({ commit, state }) {
      return new Promise(async (resolve, reject) => {
        commit('SET_TOKEN', '')
        Cookies.remove('Admin-Token')
        Cookies.remove('lock')
        Cookies.remove('menusType')
        Cookies.remove('token')
        Cookies.remove('user_token')
        Cookies.remove('lang')
        Cookies.remove('kindCode')
        Cookies.remove('tenantId')
        Cookies.remove('tenantName')
        Cookies.remove('clientIp')
        Cookies.remove('sidebarStatus')
        Cookies.remove('operator_code')
        window.sessionStorage.removeItem('currUserId')
        window.sessionStorage.removeItem('userName')
        window.sessionStorage.removeItem('nickName')
        window.sessionStorage.removeItem('user_type')
        window.sessionStorage.removeItem('orgList')
        window.sessionStorage.removeItem('menus')
        window.sessionStorage.removeItem('orgName')
        window.sessionStorage.removeItem('lastLoginDateTime')
        window.sessionStorage.removeItem('menusType')
        window.localStorage.removeItem('lang')
        window.sessionStorage.removeItem('kindCode')
        window.sessionStorage.removeItem('tenantId')
        window.sessionStorage.removeItem('tenantName')
        window.sessionStorage.removeItem('userType')
        window.sessionStorage.removeItem('envId')
        window.sessionStorage.removeItem('envName')
        window.sessionStorage.removeItem('operator_code')
        // 清除单点登录的信息，但是不能清除TGC否则正常登出
        // Cookies.remove('TGC')
        Cookies.remove('username')
        let isOpenSourceCas = window.LOCAL_CONFIG.isOpenSourceCas + ''
        if (isOpenSourceCas === 'true') {
          window.location.href = window.LOCAL_CONFIG.API_HOME + window.LOCAL_CONFIG.casLogOutUrl + "?service=" + window.location.href
        } else {
          await casLogout()
          //处理完成后结束，进入then方法重载页面
          resolve()
        }
      })
    },
    ReLogin({ commit, state }) {
      commit('SET_TOKEN', '')
      Cookies.remove('Admin-Token')
      Cookies.remove('lock')
      Cookies.remove('menusType')
      Cookies.remove('token')
      Cookies.remove('user_token')
      Cookies.remove('kindCode')
      Cookies.remove('tenantId')
      Cookies.remove('tenantName')
      Cookies.remove('clientIp')
      Cookies.remove('sidebarStatus')
      Cookies.remove('operator_code')
      window.sessionStorage.removeItem('currUserId')
      window.sessionStorage.removeItem('userName')
      window.sessionStorage.removeItem('nickName')
      window.sessionStorage.removeItem('user_type')
      window.sessionStorage.removeItem('orgList')
      window.sessionStorage.removeItem('menus')
      window.sessionStorage.removeItem('orgName')
      window.sessionStorage.removeItem('lastLoginDateTime')
      window.sessionStorage.removeItem('menusType')
      window.sessionStorage.removeItem('kindCode')
      window.sessionStorage.removeItem('tenantId')
      window.sessionStorage.removeItem('tenantName')
      window.sessionStorage.removeItem('userType')
      window.sessionStorage.removeItem('envId')
      window.sessionStorage.removeItem('envName')
      window.sessionStorage.removeItem('operator_code')
      location.reload()
    }
  }
}
export default user
