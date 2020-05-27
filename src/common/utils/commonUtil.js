import Vue from 'vue'
import Cookies from 'js-cookie'
require('@frame/utils/BizSecurity.js')
export function IsInArray (arr, val) {
  var right = arr[val]
  if (right && right !== '') {
    return true
  } else {
    return false
  }
}

/**
 * 数据库类型对象转驼峰型对象
 * @param obj 数据库类型对象
 * @param item 驼峰类型对象
 * @param type 转换类型（参数存在代表驼峰转成字段）
 * @param transStr 是否将value转换为字符串，默认为true
 * @return
 */
export function covertObj (obj, item, type = false, transStr = true) {
  let newObj = {}
  let isOpenXss = window.LOCAL_CONFIG.isOpenXss + ''
  for (let key in obj) {
    let fieldName = columnName2FieldName(key)
    if (type) {
      fieldName = fieldName2ColumnName(key)
    }

    let val = (obj[key] !== undefined && obj[key] !== null) ? obj[key] : ''
    if (!transStr && val !== null && typeof val === 'object') {
      if (Array.isArray(val)) {
        val = val.map(v => {
          if(typeof v !== "object") return v;
          let tempObj = {}
          covertObj(v, tempObj, type, transStr)
          return tempObj
        })
      } else {
        let tempObj = {}
        covertObj(val, tempObj, type, transStr)
        val = tempObj
      }
    }
    // eval("newObj."+fieldName+"='"+val+"'")
    // 由于输入'会导致eval失败，转为代码直接赋值
    // if (isOpenXss !== 'false' && (transStr || typeof val === 'string')) {
    //   if (key != 'content') {
    //     val = covertHtml(val)
    //   }
    // }
    newObj[fieldName] = transStr ? val + '' : val
  }
  Object.assign(item, newObj)
}
/**
 * 把参数里的内容转义成html语言
 * @param obj 数据库类型对象
 * @return
 */
export function transferenceParam (obj, item) {
  let newObj = {}
  for (let key in obj) {
    let val = obj[key] ? obj[key] : ''
    if (val !== '') {
      if (key != 'content') {
        val = covertHtml(val)
      }
    }
    newObj[key] = val + ''
  }
  Object.assign(item, newObj)
}
/**
 * 跨站脚本攻击，字符转义
 */
export function covertHtml (value) {
  if (!value && value !== 0) return ''
  let val = value + ''
  let tmval = val.toLowerCase()// 转换成小写
  if (tmval == '' || tmval == 'undefined' || tmval == 'null') return ''
  var arrEntities = {'<': '&lt;', '>': '&gt;'}
  var rs = val.replace(/(<|>)/ig, function (all, t) { return arrEntities[t] })
  return rs
}
/**
 * 跨站脚本攻击，字符反转义
 */
export function unCovertHtml (value) {
  if (!value && value !== 0) return ''
  let val = value + ''
  let tmval = val.toLowerCase()// 转换成小写
  if (tmval == '' || tmval == 'undefined' || tmval == 'null') return ''
  var arrEntities = {'&lt;': '<', '&gt;': '>'}
  var rs = val.replace(/(&lt;|&gt;)/ig, function (all, t) { return arrEntities[t] })
  return rs
}
/**
 * 数据库列名转属性(下划线转驼峰)
 * @param columnName 数据库列名
 * @return
 */
function columnName2FieldName (columnName) {
  let result = ''
  let upcaseFlag = false
  if (!columnName || columnName === '') return columnName
  for (let i = 0; i < columnName.length; i++) {
    let ch = columnName[i]
    if (ch === '_') {
      upcaseFlag = true
      continue
    } else if (upcaseFlag) {
      result += ('' + ch).toUpperCase()
      upcaseFlag = false
    } else {
      result += ch
      upcaseFlag = false
    }
  }
  return result
}
/**
 * 属性转数据库列名(驼峰传下划线)
 * @param str 属性名
 * @return
 */
function fieldName2ColumnName (columnName) {
  let result = ''
  var upcaseFlag = false
  if (!columnName || columnName == '') return columnName
  for (var i = 0; i < columnName.length; i++) {
    var ch = columnName[i]
    if (allCaps(ch)) {
      result += ('_' + ch).toLowerCase()
    } else {
      result += ch
    }
  }
  return result
}
function allCaps (text) {
  if (text < 'A' || text > 'Z') {
    return false
  }
  return true
}

const isServer = Vue.prototype.$isServer

/* istanbul ignore next */
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/*
 * 判断是否是json格式
 */
export function isJSONStr (str) {
  if (typeof str === 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}

export function kickout (key) {
  if(!Cookies.get('user_token')) return
  let key1 = 'hs'
  let key2 = 'club'
  let key3 = '33#44'
  let url = '/kickout'
  let encryptKey = BizSecurity.DES.encrypt(key, key1, key2, key3)
  let params = {key: key}
  if (Cookies.get('user_token')) {
    Cookies.remove('user_token')
  }
  if (Cookies.get('operator_code')) {
    Cookies.remove('operator_code')
  }

  return fetch.post(url, params)
}
