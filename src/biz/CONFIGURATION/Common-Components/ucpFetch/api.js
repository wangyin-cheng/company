import axios from 'axios'
import config from './_api_config.js'
import hui from 'h_ui/dist/h_ui.min.js'
import { covertObj, isJSONStr, transferenceParam } from '../utils/commonUtil'

export const createFetch = (params = {}) => {
  params = Object.assign({}, config, params)
  const fetch = axios.create(params)
  return fetch
}

export const addFetchInterceptors = (fetch) => {
  fetch.interceptors.request.use(config => {
    // 防crsf攻击标识 20190717 add by zhouzx
    let crsf = window.sessionStorage.getItem('omc_crsf')
    if (crsf && crsf != '') {
      config.headers.csrfcheck = crsf
    }

    let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
    let newData = {}
    if (isUnderscore == 'true' && config.data) { // 兼容微服务方式
      covertObj(config.data, newData, true)
      config.data = newData
    } else {
      let isOpenXss = window.LOCAL_CONFIG.isOpenXss + ''
      if (isOpenXss != 'false') { // 防xss攻击转义 20190711 add by zhouzx
        transferenceParam(config.data, newData)
        config.data = newData
      }
    }

    return config
  }, error => {
    return Promise.reject(error)
  })


  fetch.interceptors.response.use(response => {

  // ie中res.data返回为string类型，chorme为obj类型
  if (response.data && typeof response.data === 'string') {
    if (isJSONStr(response.data)) {
      response.data = JSON.parse(response.data)
    }
  }

  if (response.data && response.data.data) {
    response._transdata = response.data.data
  }

  // 为了兼容老的业务系统中的返回值
  if (response.data && response.data.data) {
    response.data = response.data.data.length == 1 ? response.data.data[0] : response.data.data
  }
  return response

  }, error => {
    if (error && error.response && error.response.data && error.response.data.data) { // 兼容IAR模式 20180915 add by 周智星
      error.response.data = error.response.data.data.length === 1 ? error.response.data.data[0] : error.response.data.data
    }
    if (error && error.response && error.response.data && error.response.data.return_code) {
      let flag = true
      let text = ''
      let return_code = error.response.data.return_code
      if (return_code === 9008) {
        text = '对不起,您缺少访问权限'
      } else if (return_code === 9006) {
        text = '页面已经失效,请先登录'
        flag = false
      } else if (return_code === 9007) {
        text = '会话已失效,请重新登录'
        flag = false
      } else if (return_code === 9004) {
        text = '您已被踢出,请先登录'
        flag = false
      } else if (return_code === 9005) {
        text = '您已在别地方登录,请先登录'
        flag = false
      } else if (return_code === 9011) {
        text = '验证码出错'
      } else {
        flag = false
        text = '当前服务端登录验证出错,请重新登录'
      }
      if (!flag) {
        hui.hMessage.info({
          content: text,
          onClose: () => {
            store.dispatch('Logout').then(() => {
              location.reload()
            })
          }
        })
      } else {
        if (text !== '') {
          hui.hMessage.info(text)
        }
      }
    }
    if (error && error.response && error.response.data && error.response.data.error_no) {
      let text = error.response.data.error_info
      if (error.response.data.error_no !== 96000) {
        if (text.trim() !== '') {
          hui.hMessage.info('操作失败，' + text)
        } else {
          hui.hMessage.info('操作失败！')
        }
      }
    } else {
      hui.hMessage.error('未授权或网络通信失败！')
    }
    Promise.reject(error)
  })
}
