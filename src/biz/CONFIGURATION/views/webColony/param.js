// 列表url
var baseUrl = window.CONFIGURATION_CONFIG.CONFIGURATION_HOME + 'serverloads/'

// 列表表头
var column = [
  {
    type: 'selection',
    width: 60,
    align: 'center'
  },
  {
    title: '集群名称',
    key: 'colonyName',
    width: 130
  },
  {
    title: '集群ID',
    key: 'colonyId',
    minWidth: 100
  },
  {
    title: '应用ID',
    key: 'appId',
    minWidth: 140
  },
  {
    title: '部署环境',
    key: 'enviroment',
    minWidth: 100
  },
  {
    title: '配置文件数量',
    key: 'fileNum',
    minWidth: 80
  },
  {
    title: '应用负责人',
    key: 'appPerson',
    minWidth: 120
  },
  {
    title: '创建时间',
    key: 'create',
    sortable: true,
    minWidth: 180
  },
  {
    title: '更新时间',
    key: 'update',
    sortable: true,
    minWidth: 180
  },
  {
    title: '操作',
    key: 'operate'
  }
]
var setItem = {
  appId: '',
  fileName: '',
  fileType: '',
  txt: ''
}
var comData = {
  baseColumn: column,
  setItem: setItem,
  baseUrl: baseUrl
}
export default {
  comData
}
