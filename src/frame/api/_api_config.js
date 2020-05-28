import Qs from 'qs'
export default{
  // 请求的接口，在请求的时候，如axios.get(url,config);这里的url会覆盖掉config中的url
  url: '/user',
  // 请求的接口
  baseURL: window.LOCAL_CONFIG.API_HOME || 'http://127.0.0.1:8080/server',
  // 默认请求方法
  title: '13',
  method: 'get',
  // 在发送请求之前对请求数据做处理
  transformRequest: [
    function (data) {
    // 为了避免qs格式化时对内层对象的格式化先把内层的对象转为
      // data.strSQL = base64encode(data.strSQL)
    // 由于使用的form-data传数据所以要格式化
      data = Qs.stringify(data)
      return data
    }
  ],

  // 提前处理返回的数据=
  transformResponse: [
    function (data) {
      return data
    }
  ],
  // 请求头信息
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  // 默认parameter参数
  params: {

  },

  // 序列化param
  paramsSerializer: function (params) {
    return Qs.stringify(params)
  },

  // 默认post参数，使用axios.post(url,{},config);如果没有额外的也必须要用一个空对象，否则会报错
  data: {
  },

  // 设置超时时间
  timeout: 500000000,

  // 是否跨站点访问控制请求
  // withCredentials: false, // default
  withCredentials: true, // 自动携带cookie

  // 返回数据类型
  responseType: 'json', // default

  // 将upload事件注释掉，防止跨域状态下发起option请求

  // onUploadProgress: function(progressEvent) {
  //   // Do whatever you want with the native progress event
  // },
  // onDownloadProgress: function(progressEvent) {
  //   // Do whatever you want with the native progress event
  // },
  maxContentLength: 2000 * 10 * 10 * 10,// 2k * 10 * 10 * 10
  validateStatus: function (status) {
    return status >= 200 && status < 300 // default
  },
  // `maxRedirects` 定义在 node.js 中 follow 的最大重定向数目
  // 如果设置为0，将不会 follow 任何重定向
  maxRedirects: 5
}
