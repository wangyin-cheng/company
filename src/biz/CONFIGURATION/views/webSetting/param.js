// 列表url
var baseUrl = window.CONFIGURATION_CONFIG.CONFIGURATION_HOME + 'serverloads/'
var search = {
  type: '',
  key: '',
  status:'',
  txt:'',
  colonyName:'',
}
// 列表表头
var column = [
  {
    type: 'selection',
    width: 60,
    align: 'center'
  },
  {
    title: '文件名称',
    key: 'fileName',
    align: 'center',
    width: 160
  },
  {
    title: '文件类型 ',
    key: 'fileType',
    minWidth: 60,
    sortable: true,
    align: 'center'
  },
  {
    title: '状态 ',
    key: 'status',
    minWidth: 40,
    align: 'center',
    sortable: true,
  },
  {
    title: '当前实例数量 ',
    key: 'instanceNum',
    align: 'center',
    sortable: true,
    minWidth: 120
  },
  {
    title: '当前版本号',
    key: 'versionNumber',
    align: 'center',
    sortable: true,
    minWidth: 100
  },
  {
    title: '发布时间',
    key: 'publish',
    align: 'center',
    sortable: true,
    minWidth: 100
  },
  {
    title: '发布人员',
    key: 'appPerson',
    align: 'center',
    minWidth: 60
  },
  {
    title: '变更人员',
    key: 'changePerson',
    align: 'center',
    minWidth: 60
  },
  {
    title: '创建时间',
    key: 'create',
    align: 'center',
    sortable: true,
    minWidth: 160
  },
  {
    title: '更新时间',
    key: 'update',
    align: 'center',
    sortable: true,
    minWidth: 160
  },
  {
    title: '操作',
    key: 'operate',
    align: 'center',
    minWidth: 200
  }
]
var setItem = {
  appId: '',
  fileName: '',
  fileType: '',
  txt: ''
}
// 发布弹框中列表的表头
var publishColumns =[
  {
    title: '变量名称 ',
    key: 'varName',
    width:60,
    align: 'center',
    ellipsis:true,
  },  {
    title: '已发布值 ',
    key: 'publishedValue',
    width:80,
    ellipsis:true,
    align: 'center'
  },  {
    title: '未发布值 ',
    key: 'untreated',
    width: 80,
    ellipsis:true,
    align: 'center'
  },  {
    title: '修改人',
    key: 'changePerson',
    width: 80,
    ellipsis:true,
    align: 'center'
  },  {
    title: '修改时间 ',
    key: 'update',
    width: 160,
    ellipsis:true,
    sortable: true,
    align: 'center'
  },
]
var comData = {
  searchItem: search,
  baseColumn: column,
  setItem: setItem,
  baseUrl: baseUrl,
  publishColumns,
}
export default {
  comData
}
