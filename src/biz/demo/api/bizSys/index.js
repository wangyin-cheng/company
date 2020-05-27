// import fetch from '@common/entry/api.js'
/**
 * 根据类型获取类别树
 *  0 : 数据字典
 *  1 : 系统参数
 *  2 : 标准字段
 *  3 : 系统资源
 *  4 : 系统菜单
 *  5 : 子系统
 */
export function getKindTree (parentId, kindType) {
  if (kindType && kindType !== '') {
    return fetch.get('/bizframe/selector/kindTree.json?kind_type=' + kindType)
  } else {
    return fetch.get('/bizframe/selector/kindTree.json?parent_id=' + parentId)
  }
}
/**
 *  获取当前登录用户的所拥有权限
 */
export function getUserPermissions () {
  return fetch.get('/bizframe/getPermissions.json')
}
