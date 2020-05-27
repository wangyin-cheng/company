// 列表url
var baseUrl = window.CONFIGURATION_CONFIG.CONFIGURATION_HOME + 'serverloads/'
var webBar = baseUrl + 'query'

// 列表表头
var column1 = [
  {
    title: 'id',
    key: 'index',
    width: 60
  },
  {
    title: '用户名',
    key: 'name',
    minWidth: 130
  },
  {
    title: '邮箱',
    key: 'email',
    minWidth: 140
  },
  {
    title: '超级管理员',
    key: 'super',
    minWidth: 180
  },
  {
    title: '账号状态',
    key: 'status',
    minWidth: 100
  },
  {
    title: '操作',
    key: 'operate'
  }
]
var column2 = [
  {
    type: 'selection',
    width: 60,
    align: 'center'
  },
  {
    title: '部门id',
    key: 'id',
    width: 100
  },
  {
    title: '部门名称',
    key: 'name',
    minWidth: 130
  },
  {
    title: '操作',
    key: 'operate'
  }
]
var userItem = {
  id: '',
  isSuper: ''
}
var edititem1 = {
  id: '',
  name: ''
}

var sysData = {
  userColumn: column1,
  departmentColumn: column2,
  userItem: userItem,
  departmentItem: edititem1,
  webBar: webBar
}
export default {
  sysData
}
