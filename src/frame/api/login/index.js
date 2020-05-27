// import axios from 'axios'
import fetch from '@frame/api/api.js'
import Cookies from 'js-cookie'
let key1, key2, key3
require('@frame/utils/BizSecurity.js')
import { getBrowerInfo } from '@frame/utils/browerInfo'
import { covertObj } from '@common/utils/commonUtil'
// 登录-获取key
function getKeys(key1, key2) {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/getSecurityKey'+ '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  let params = { key1: key1, key2: key2 }
  return fetch.post(window.LOCAL_CONFIG.OMC_GSV + url, params)
}

export function reLogin(username, password, tenantId, kindCode) {
  let operatorCode
  let resCode = 'bizSign'
  let bizEncryptFalg = '3DES'
  let opCode = 'bizSignIn2'
  let sessionId = Cookies.get('Admin-Token')
  return new Promise((resolve, reject) => {
    let webEncryptType = window.LOCAL_CONFIG.webEncryptType + ''
    let key1 = 'hs'
    let key2 = 'club'
    let key3 = '33#44'
    let clientip = Cookies.get('clientIp')
    let ip_addr = clientip ? clientip : ""
    if (webEncryptType === 'AES') {
      operatorCode = BizSecurity.DES.encrypt(username, key1, key2, key3)
      password = BizSecurity.DES.encrypt(password, key1, key2, key3)
      getKeys(operatorCode, password).then(res => {
        password = res.data.key1
        operatorCode = username
        let data = {
          operatorCode,
          password,
          tenantId,
          kindCode,
          ip_addr
        }
        resolve(fetch.post(window.LOCAL_CONFIG.OMC_GSV + '/unlock.json'+ '?time=' + new Date().getTime(), data))
      })
    } else {
      operatorCode = BizSecurity.DES.encrypt(username, key1, key2, key3)
      password = BizSecurity.DES.encrypt(password, key1, key2, key3)
      let data = {
        operatorCode,
        password,
        tenantId,
        kindCode,
        ip_addr
      }
      resolve(fetch.post(window.LOCAL_CONFIG.OMC_GSV + '/unlock.json'+ '?time=' + new Date().getTime(), data))
    }
  })
}

export function login(username, password, tenantId, kindCode, checkcode, emailcode) {
  let operatorCode
  let resCode = 'bizSign'
  let bizEncryptFalg = '3DES'
  let opCode = 'bizSignIn2'
  let sessionId = Cookies.get('checkCode-token')
  return new Promise((resolve, reject) => {
    let webEncryptType = window.LOCAL_CONFIG.webEncryptType + ''
    let key1 = 'hs'
    let key2 = 'club'
    let key3 = '33#44'
    let mac = 'OMC_LOGIN_WEB'
    let clientip = Cookies.get('clientIp')
    let ip_addr = clientip ? clientip : ""
    let emailVerificationCode = emailcode
    let uuid = window.sessionStorage.getItem('uuid')
    let isChangeLogin = (window.LOCAL_CONFIG.isOpenSpace!=null && window.LOCAL_CONFIG.isOpenSpace!=undefined)? window.LOCAL_CONFIG.isOpenSpace+"":""
    if (webEncryptType == 'AES') {
      operatorCode = BizSecurity.DES.encrypt(username, key1, key2, key3)
      password = BizSecurity.DES.encrypt(password, key1, key2, key3)
      getKeys(operatorCode, password).then(res => {
        password = res.data.key1
        operatorCode = username
        let verify_code = checkcode
        let data = {
          operatorCode,
          password,
          tenantId,
          kindCode,
          verify_code,
          ip_addr,
          emailVerificationCode,
          isChangeLogin:isChangeLogin,
          mac,
          uuid
        }
        resolve(fetch.post(window.LOCAL_CONFIG.OMC_GSV + '/submitLogin' + '?time=' + new Date().getTime(), data))
      })
    } else {
      operatorCode = BizSecurity.DES.encrypt(username, key1, key2, key3)
      password = BizSecurity.DES.encrypt(password, key1, key2, key3)
      let verify_code = checkcode
      let data = {
        operatorCode,
        password,
        tenantId,
        kindCode,
        verify_code,
        ip_addr,
        emailVerificationCode,
        isChangeLogin:isChangeLogin,
        mac,
        uuid
      }
      resolve(fetch.post(window.LOCAL_CONFIG.OMC_GSV + '/submitLogin'+ '?time=' + new Date().getTime(), data))
    }
  })
}

export function getSubSystem() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/getSubsystem' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

export function getMenuList(toPath) {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/getUserAuthMenus' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  // 如果是IAR单点登录，增加前端应用参数和当前页面参数，以供回调时候显示当前页面
  let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ''
  let lang = window.localStorage.getItem('lang')
  if (isIARCasLogin === 'true') {
    url += '&ssoName=' + window.LOCAL_CONFIG.casSsoName + '&to=' + toPath
  }
  return fetch.post(window.LOCAL_CONFIG.OMC_GSV + url, { "lang": lang })
}

export function changePwd(oldPassword, newPassword) {
  let sessionId = Cookies.get('Admin-Token')
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/updatePwd' + '?time=' + new Date().getTime()
  if (isUrlLowercase === 'true') {
    url = url.toLowerCase()
  }
  return new Promise((resolve, reject) => {
    let key1 = 'hs'
    let key2 = 'club'
    let key3 = '33#44'
    oldPassword = BizSecurity.DES.encrypt(oldPassword, key1, key2, key3)
    newPassword = BizSecurity.DES.encrypt(newPassword, key1, key2, key3)
    const data = {
      oldPassword,
      newPassword
    }
    resolve(fetch.post(window.LOCAL_CONFIG.OMC_GSV + url, data))
  })
}

export function logout() {
  let clientip = Cookies.get('clientIp')
  let ip_addr = clientip ? clientip : ""
  return fetch.post(window.LOCAL_CONFIG.OMC_GSV + '/logout' + '?time=' + new Date().getTime(), { "ip_addr": ip_addr })
}

export function casLogout() {
  return fetch.post(window.LOCAL_CONFIG.casLogOutUrl)
}

export function checkDefPwd() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/checkDefaultPwd' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

export function checkPwdExpired() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/checkPwdExpired' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

export function expiredDays() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/expiredDays' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

export function getCurrUserInfo() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/getCurrUser' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

// 获取密码验证标准
export function getPwdCheckStandard() {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  let url = '/getCheckedPwdStandard' + '?time=' + new Date().getTime()
  if (isUrlLowercase == 'true') {
    url = url.toLowerCase()
  }
  return fetch.get(window.LOCAL_CONFIG.OMC_GSV + url)
}

export function getSystemParm(key) {
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ""
  let url = "/getParamterById" + '?time=' + new Date().getTime()
  if (isUrlLowercase == "true") {
    url = url.toLowerCase()
  }
  let params = { id: key }
  return fetch.post(window.LOCAL_CONFIG.OMC_GSV + url, params)
}

/**
 * 记录用户行为分析
 * @param params
 * appKey：任意
 * consumerId：用户id
 * ipAddr：ip
 * ipPort：端口
 * deviceName：浏览器名称
 * deviceVersion：浏览器版本
 */
export function saveUserBehaviorLog(params) {
  let url = '/saveUserBehaviorLog' + '?time=' + new Date().getTime()
  let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
  if (isUrlLowercase === 'true') {
    url = url.toLowerCase()
  }
  let browser = getBrowerInfo()
  let obj = {
    appKey: 'omc',
    consumerId:Cookies.get('operator_code'),
    ipAddr: Cookies.get('clientIp'),
    ipPort: window.location.port,
    deviceName: browser.split(' ')[0],
    deviceVersion: browser.split(' ')[1],
    resolution: window.outerWidth + '*' + window.outerHeight
  }
  if (params) Object.assign(obj, params)
  let newObj = {}
  covertObj(obj, newObj, true)
  return fetch.post(window.LOCAL_CONFIG.OMC_GSV + url, newObj)
}

/**
 * 加密
 * @param param
 */
export function encryptParam(param) {
  let key1 = 'hs'
  let key2 = 'club'
  let key3 = '33#44'
  return BizSecurity.DES.encrypt(param, key1, key2, key3)
}
