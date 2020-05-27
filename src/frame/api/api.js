import axios from 'axios'
import config from './_api_config.js'
import hui from 'h_ui/dist/h_ui.min.js'
import store from '@common/entry/store'
import Cookies from 'js-cookie'
import { casLogout } from '@frame/api/login'
import { covertObj, isJSONStr, transferenceParam, kickout } from '@common/utils/commonUtil'
import transWhiteListTest from '@frame/utils/transWhiteList'
import { switchTheme } from "@common/utils"

const httpFetch = axios.create(config)
// request拦截器
httpFetch.interceptors.request.use(config => {
  // 防crsf攻击标识 20190717 add by zhouzx
  let crsf = window.sessionStorage.getItem('omc_crsf')
  if (crsf && crsf != '') {
    config.headers.csrfcheck = crsf
  }

  //如果是IAR单点登录，请求头里面需要携带ssoName(IAR的V1.2.6&V1.1.63及其以上支持读取头)
  let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ""
  if (isIARCasLogin == "true") {
    config.headers.ssoName = window.LOCAL_CONFIG.casSsoName + ""
  }

  //防止xss攻击
  // let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
  // let newData = {}
  // if (isUnderscore == 'true' && config.data) { // 兼容微服务方式
  //   covertObj(config.data, newData, true)
  //   config.data = newData
  // } else {
  //   let isOpenXss = window.LOCAL_CONFIG.isOpenXss + ''
  //   if (isOpenXss != 'false') { // 防xss攻击转义 20190711 add by zhouzx
  //     transferenceParam(config.data, newData)
  //     config.data = newData
  //   }
  // }
  let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ""
  if (isUnderscore == "true" && config.data) {//兼容微服务方式
    let newData = {}
    covertObj(config.data, newData, true)
    config.data = newData
  }
  return config
}, error => {
  // console.log(error)
  return Promise.reject(error)
})
httpFetch.interceptors.response.use(response => {
  // 获取IAR返回的防crsf攻击标识 20190717 add by zhouzx
  let crsf = response.headers['csrfcheck']
  if (crsf && crsf != '') {
    window.sessionStorage.setItem('omc_crsf', crsf)
  }
  // ie中res.data返回为string类型，chorme为obj类型
  if (response.data && typeof response.data === 'string') {
    if (isJSONStr(response.data)) {
      response.data = JSON.parse(response.data)
    }
  }
  if (response.data && response.data.data) { // 兼容IAR模式 20180915 add by 周智星
    response.data = response.data.data.length == 1 ? response.data.data[0] : response.data.data
  }

  if ((response.data && (response.data.return_code === 9008 || response.data.return_code === 9007 || response.data.return_code === 9006 || response.data.return_code === 9005 || response.data.return_code === 9004)) || !response) {
    let text = ''
    if (document.getElementsByTagName('html')[0].className === '') {
      // document.getElementsByTagName('html')[0].className = Cookies.get('theme') ? Cookies.get('theme') : window.LOCAL_CONFIG.THEME
      switchTheme(Cookies.get('theme') ? Cookies.get('theme') : window.LOCAL_CONFIG.THEME);
    }
    let tmpKey = Cookies.get('user_token') + '#' + Cookies.get('operator_code')
    let flag = true
    let return_code = response.data.return_code
    if (return_code === 9008) {
      // text = '对不起,您缺少访问权限'
      text = i18n.t("m.i.fetchMsg.unAuthorized")
      hui.hMessage.info(text)
    } else if (return_code === 9006) {
      // text = '页面已经失效,请先登录'
      text = i18n.t("m.i.fetchMsg.pageTimeOut")
      flag = false
    } else if (return_code === 9007) {
      // text = '会话已失效,请重新登录'
      text = i18n.t("m.i.fetchMsg.sessionTimeOut")
      flag = false
    } else if (return_code === 9004) {
      // text = '您已被踢出,请先登录'
      text = i18n.t("m.i.fetchMsg.kickOut")
      flag = false
    } else if (return_code === 9005) {
      // text = '您已在别地方登录,请先登录'
      text = i18n.t("m.i.fetchMsg.occupied")
      flag = false
    } else if (return_code === 9021) {
      // text = '锁屏状态不能操作，请先解锁'
      text = i18n.t("m.i.fetchMsg.lockScreenStatus")
      flag = false
    } else {
      flag = false
      if (response.data.error_info) {
        text = i18n.t("m.i.fetchMsg.error") + response.data.error_info
      } else {
        text = i18n.t("m.i.fetchMsg.sysError")
      }
    }
    if (!flag && window.LOCAL_CONFIG.isToken) {
      if (window.sessionStorage.getItem('has_reload')) {
        store.commit('SET_TOKEN', '')
        Cookies.remove('Admin-Token')
        Cookies.remove('user_token')
        Cookies.remove('lock')
        Cookies.remove('menusType')
        Cookies.remove('lang')
        Cookies.remove('sidebarStatus')
        Cookies.remove('tenantId')
        Cookies.remove('tenantName')
        Cookies.remove('kindCode')
        Cookies.remove('operator_code')
        window.sessionStorage.removeItem('currUserId')
        window.sessionStorage.removeItem('userName')
        window.sessionStorage.removeItem('nickName')
        window.sessionStorage.removeItem('user_type')
        window.sessionStorage.removeItem('orgList')
        window.sessionStorage.removeItem('token')
        window.sessionStorage.removeItem('menus')
        window.localStorage.removeItem('lang')
        window.sessionStorage.removeItem('has_reload')
        window.sessionStorage.removeItem('tenantId')
        window.sessionStorage.removeItem('tenantName')
        window.sessionStorage.removeItem('kindCode')
        window.sessionStorage.removeItem('envId')
        window.sessionStorage.removeItem('envName')
        window.sessionStorage.removeItem('operator_code')
        location.reload()
      }
      hui.hMsgBox.confirm({
        title: i18n.t("m.i.fetchMsg.loginConfirm"),
        content: text,
        zIndex: 9999,
        height: 50,
        loading: true,
        cancelType: 'msg-fetch-close',
        onOk: () => {
          window.sessionStorage.setItem('has_reload', true)
          store.dispatch('Logout').then(() => {
            store.dispatch('unlockscreen')
            store.commit('SET_TOKEN', '')
            Cookies.remove('Admin-Token')
            Cookies.remove('user_token')
            Cookies.remove('lock')
            Cookies.remove('menusType')
            Cookies.remove('lang')
            Cookies.remove('sidebarStatus')
            Cookies.remove('tenantId')
            Cookies.remove('tenantName')
            Cookies.remove('kindCode')
            Cookies.remove('operator_code')
            window.sessionStorage.removeItem('currUserId')
            window.sessionStorage.removeItem('userName')
            window.sessionStorage.removeItem('nickName')
            window.sessionStorage.removeItem('user_type')
            window.sessionStorage.removeItem('orgList')
            window.sessionStorage.removeItem('token')
            window.sessionStorage.removeItem('menus')
            window.localStorage.removeItem('lang')
            window.sessionStorage.removeItem('tenantId')
            window.sessionStorage.removeItem('tenantName')
            window.sessionStorage.removeItem('kindCode')
            window.sessionStorage.removeItem('envId')
            window.sessionStorage.removeItem('envName')
            window.sessionStorage.removeItem('operator_code')
            location.reload()
          })
        },
        onCancle: () => {
        }
      })
    }
    if (response.data && response.data.return_code === -5) {
      // 如果是IAR单点登录，单点登出
      let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ''
      if (isIARCasLogin === 'true') {
        casLogout()
        return true
      } else {
        // 锁屏状态，不能请求
        // hui.hMessage.info('请解锁！')
        hui.hMessage.info(i18n.t("m.i.fetchMsg.unlock"))
        store.dispatch('lockscreen')
        return true
      }
    }
  } else {
    // 如果是IAR单点登录且返回为空，表示尚未登录或者已经单点登出，这是需要跳转到登录页
    let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ''
    let isCasAdapter = window.LOCAL_CONFIG.isCasAdapter + ''
    let data = response.data
    if (response && data != null) {
      // 微服务模式下，将下划线属性转换为驼峰
      if ((window.LOCAL_CONFIG.isUnderscore + '') === 'true' && typeof data === 'object' && data !== null && !transWhiteListTest(response.config.url)) {
        let temp
        if (Array.isArray(data)) {
          temp = data.map(d => {
            let tempObj = {}
            covertObj(d, tempObj, false, false)
            return tempObj
          })
        } else {
          temp = {}
          covertObj(data, temp, false, false)
        }
        response.data = temp
      }
      return response
    } else if (isIARCasLogin == 'true') {
      if (response.status + '' !== '200') {
        //当返回302时
        //清空当前的菜单缓存
        window.sessionStorage.removeItem("menus")
        if (response.request.responseURL.indexOf('cas') > 0 && response.request.responseURL.indexOf('logout') == -1) {
          //当302的地址是cas服务器且不是登出请求
          //跳转到cas登录页
          window.location.href = response.request.responseURL
        } else if (response.request.responseURL.indexOf('cas') > 0 && isCasAdapter == 'true' && response.request.responseURL.indexOf('logout') != -1) {
          //当302的地址是cas服务器且是cas适配器且是登出接口
          //拼接登出url后跳转到适配器登出，登出后再跳转到当前页面
          window.location.href = response.request.responseURL + "?service=" + window.location.href
        } else {
          //刷新当前页面
          location.reload()
        }
      } else if (response.request.responseURL.indexOf('cas') > 0 && response.request.responseURL.indexOf('logout') == -1) {
        //当返回200页面且是cas服务器且不是登出接口
        //清空当前的菜单缓存
        window.sessionStorage.removeItem("menus")
        //跳转到cas登录页
        window.location.href = response.request.responseURL
      } else if (response.request.responseURL.indexOf('cas') > 0 && isCasAdapter == 'true' && response.request.responseURL.indexOf('logout') != -1) {
        //当返回200且是cas适配器且是登出接口
        //清空当前的菜单缓存
        window.sessionStorage.removeItem("menus")
        //拼接登出url后跳转到适配器登出，登出后再跳转到当前页面
        window.location.href = response.request.responseURL + "?service=" + window.location.href
      } else {
        return response
      }
    } else {
      return response
    }
  }
}, error => {
  const response = error.response
  // ie中res.data返回为string类型，chorme为obj类型
  if (response.data && typeof response.data === 'string') {
    if (isJSONStr(response.data)) {
      response.data = JSON.parse(response.data)
    }
  }
  if (response.data && response.data.data) { // 兼容IAR模式
    response.data = response.data.data.length === 1 ? response.data.data[0] : response.data.data
  }
  if (error && response && response.data && response.data.return_code) {
    let flag = true
    let text = ''
    let tmpKey = Cookies.get('user_token') + '#' + Cookies.get('operator_code')
    let tmpData = response.data.data ? response.data.data : response.data
    let data = (tmpData instanceof Array) ? tmpData[0] : tmpData
    let return_code = data.return_code ? data.return_code : 9023
    if (return_code == 9008) {
      // text = '对不起,您缺少访问权限'
      text = i18n.t("m.i.fetchMsg.unAuthorized")
    } else if (return_code === 9006) {
      window.LOCAL_CONFIG.isToken && kickout(tmpKey)
      // text = '页面已经失效,请先登录'
      text = i18n.t("m.i.fetchMsg.pageTimeOut")
      flag = false
    } else if (return_code === 9007) {
      window.LOCAL_CONFIG.isToken && kickout(tmpKey)
      // text = '会话已失效,请重新登录'
      text = i18n.t("m.i.fetchMsg.sessionTimeOut")
      flag = false
    } else if (return_code === 9004) {
      // text = '您已被踢出,请先登录'
      text = i18n.t("m.i.fetchMsg.kickOut")
      flag = false
    } else if (return_code === 9005) {
      // text = '您已在别地方登录,请先登录'
      text = i18n.t("m.i.fetchMsg.occupied")
      flag = false
    } else if (return_code === 9011) {
      // text = '验证码出错'
      text = i18n.t("m.i.fetchMsg.verifyCode")
    } else if (return_code === 9021) {
      // text = '锁屏状态不能操作，请先解锁'
      text = i18n.t("m.i.fetchMsg.lockScreenStatus")
      // flag = false
    } else {
      // flag = false
      if (data.error_info) {
        text = i18n.t("m.i.fetchMsg.sysException") + data.error_info
      } else if (data.error_code || data.error_no) {
        text = i18n.t("m.i.fetchMsg.sysException") + (data.error_code ? data.error_code : data.error_no)
      } else {
        text = i18n.t("m.i.fetchMsg.sysException_1")
      }
    }
    if (!flag && window.LOCAL_CONFIG.isToken) {
      if (window.sessionStorage.getItem('has_reload')) {
        store.commit('SET_TOKEN', '')
        Cookies.remove('Admin-Token')
        Cookies.remove('user_token')
        Cookies.remove('lock')
        Cookies.remove('menusType')
        Cookies.remove('lang')
        Cookies.remove('sidebarStatus')
        Cookies.remove('tenantId')
        Cookies.remove('tenantName')
        Cookies.remove('kindCode')
        Cookies.remove('operator_code')
        window.sessionStorage.removeItem('currUserId')
        window.sessionStorage.removeItem('userName')
        window.sessionStorage.removeItem('nickName')
        window.sessionStorage.removeItem('user_type')
        window.sessionStorage.removeItem('orgList')
        window.sessionStorage.removeItem('token')
        window.sessionStorage.removeItem('menus')
        window.localStorage.removeItem('lang')
        window.sessionStorage.removeItem('has_reload')
        window.sessionStorage.removeItem('tenantId')
        window.sessionStorage.removeItem('tenantName')
        window.sessionStorage.removeItem('kindCode')
        window.sessionStorage.removeItem('envId')
        window.sessionStorage.removeItem('envName')
        window.sessionStorage.removeItem('operator_code')
        return
      }
      //如果是验证码地址，就直接放过20200323 add by zhouzx
      let url = response.config.url
      if (url.indexOf("getVerifyCode") != -1 || url.indexOf("getverifycode") != -1) return Promise.reject(error)

      hui.hMsgBox.confirm({
        title: i18n.t("m.i.fetchMsg.loginConfirm"),
        content: text,
        zIndex: 9999,
        height: 50,
        loading: true,
        cancelType: 'msg-fetch-close',
        onOk: () => {
          window.sessionStorage.setItem('has_reload', true)
          store.dispatch('Logout').then(() => {
            store.dispatch('unlockscreen')
            store.commit('SET_TOKEN', '')
            Cookies.remove('Admin-Token')
            Cookies.remove('user_token')
            Cookies.remove('lock')
            Cookies.remove('menusType')
            Cookies.remove('lang')
            Cookies.remove('sidebarStatus')
            Cookies.remove('tenantId')
            Cookies.remove('tenantName')
            Cookies.remove('kindCode')
            Cookies.remove('operator_code')
            window.sessionStorage.removeItem('currUserId')
            window.sessionStorage.removeItem('userName')
            window.sessionStorage.removeItem('nickName')
            window.sessionStorage.removeItem('user_type')
            window.sessionStorage.removeItem('orgList')
            window.sessionStorage.removeItem('token')
            window.sessionStorage.removeItem('menus')
            window.localStorage.removeItem('lang')
            window.sessionStorage.removeItem('tenantId')
            window.sessionStorage.removeItem('tenantName')
            window.sessionStorage.removeItem('kindCode')
            window.sessionStorage.removeItem('envId')
            window.sessionStorage.removeItem('envName')
            window.sessionStorage.removeItem('operator_code')
            location.reload()
          })
        },
        onCancle: () => {
        }
      })
    } else {
      if (text !== '') {
        hui.hMessage.info({
          content: text,
          duration: 3
        })
      }
    }
  }
  return Promise.reject(error)
})

export default httpFetch
