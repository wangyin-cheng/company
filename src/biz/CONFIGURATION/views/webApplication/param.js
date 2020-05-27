// 列表url
var baseUrl = window.CONFIGURATION_CONFIG.CONFIGURATION_HOME + 'serverloads/'
var webBar = baseUrl + 'query'

// 列表表头
var column = [
  {
    type: 'selection',
    width: 60,
    align: 'center'
  },
  {
    title: '应用ID',
    key: 'aplicationId',
    width: 100
  },
  {
    title: '应用名称',
    key: 'aplicationName',
    minWidth: 130
  },
  {
    title: '部门ID',
    key: 'departmentId',
    minWidth: 140
  },
  {
    title: '部门名称',
    key: 'departmentName',
    minWidth: 180
  },
  {
    title: '应用负责人',
    key: 'responsePerson',
    minWidth: 100
  },
  {
    title: '创建时间',
    key: 'create',
    sortable: true
  },
  {
    title: '更新时间',
    key: 'update',
    sortable: true
  },
  {
    title: '操作',
    key: 'operate'
  }
]
var initColumn = [
  {
    title: '集群ID',
    key: 'initId'
  },
  {
    title: '集群名称',
    key: 'initName'
  },
  {
    title: '同步节点',
    key: 'initPoint'
  },
  {
    title: '操作',
    key: 'operate'
  }
]

var aplicationItem = {
  appType: '',
  appId: '',
  appName: '',
  departmentName: '',
  person: ''
}
var comData = {
  baseColumn: column,
  editItem: aplicationItem,
  initColumn: initColumn,
  webBar: webBar
}
export default {
  comData
}
