export function deepClone (source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  for (const keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = source[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepClone(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}
export function param2Obj (url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}
export function toggleClass (element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length)
  }
  element.className = classString
}
export function allToggleClass (element, className) {
  if (!element || !className) {
    return
  }
  element.className = className
}
export function oneOf (value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}
export function hasClass (el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}
export function addClass (el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}
export function removeClass (el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}
/**
 * 把参数里的内容转义成html语言
 * @param obj 数据库类型对象
 * @return
 */
export function transferenceParam (obj, item) {
  let newObj = {}
  for (var key in obj) {
    let val = obj[key] ? obj[key] : ''
    if (val != '') {
      val = covertHtml(val)
    }
    newObj[key] = val + ''
  }
  Object.assign(item, newObj)
}
/**
 * 跨站脚本攻击，字符转义
 */
export function covertHtml (value) {
  if (!value) return ''
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
  if (!value) return ''
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
  var result = ''
  var upcaseFlag = false
  if (!columnName || columnName == '') return columnName
  for (var i = 0; i < columnName.length; i++) {
    var ch = columnName[i]
    if (ch == '_') {
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
  var result = ''
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
