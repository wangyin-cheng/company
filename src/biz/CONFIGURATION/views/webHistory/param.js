
// 列表url
let baseUrl = window.CONFIGURATION_CONFIG.CONFIGURATION_HOME + 'serverloads/';
// 列表头
let column = [
    {
        title: '版本号 ',
        key: 'versionNumber',
        minWidth: 80,
        align: 'center',
    },
    {
        title: '状态 ',
        key: 'status',
        minWidth: 40,
        align: 'center',
        sortable: true,
    },
    {
        title: '应用ID',
        key: 'useId',
        minWidth: 80,
        align: 'center',
    },
    {
        title: '集群名称 ',
        key: 'colonyName',
        minWidth: 80,
        align: 'center',
    },
    {
        title: '配置文件 ',
        key: 'Profile',
        minWidth: 80,
        align: 'center',
    },
      {
        title: '操作人员',
        key: 'appPerson',
        align: 'center',
        minWidth: 60
      },
      {
        title: '创建时间',
        key: 'create',
        align: 'center',
        sortable: true,
        minWidth: 100
      },
      {
        title: '更新时间',
        key: 'update',
        align: 'center',
        sortable: true,
        minWidth: 100
      },
      {
        title: '操作',
        key: 'operate',
        align: 'center',
        minWidth: 60
      }
]
let comData ={
    baseColumn: column,
}
export default {
    comData
}