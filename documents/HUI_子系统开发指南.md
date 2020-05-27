# HUI 子系统开发指南

[TOC]

<div STYLE="page-break-after: always;"></div>

## 修订说明

| 版本           | 修订时间      | 修订人      | 修订内容                 |
| -------------- | ------------ |------------| ------------------------ |
| `v0.1.0`       | `2019-05-27` | 王亚男18853 | 新增 HUI子系统开发指南    |

<div STYLE="page-break-after: always;"></div>

## 子系统结构

```
child_sys_a                        子系统A
  ├── api                          ## API调用集合
    ├── fun_a                        ### 功能A的接口集合
    ├── fun_b                        ### 功能B的接口集合
    ├── index.js                     ### API总出口（所有API都从这里导出）
  ├── mixins                       ## 子系统混入
  ...  
  ├── router                       ## router集合
    ├── index.js                     ### router映射（一般使用懒加载）
  ├── store                        ## 子系统通用状态集合
    ├── modules                      ### 状态分模块管理
    ├── index.js                     ### 状态总出口（取/存）
  ├── views                        # 子系统页面
    ├── page_a                       ## 页面文件夹根据需求设置文件夹深度
      ├── page_a_1.vue                 ### vue文件开发参照《vue单文件书写规范》
      ├── page_a_2.vue                 ### ...
    ├── page_b                        ## ...
      ├── page_b_1.vue                  ### ...
      ├── page_b_2.vue                  ### ...
  ├── index.js                     # 子系统入口配置
  ├── config.js                    # 子系统build配置
  ├── sysconfig.js                 # 子系统外部全局变量配置
```

## 子系统入口index.js
  
  ```javascript
    import Vue from 'vue'
    import HDatagridh from './components/HDatagrid.vue'
    import usercenterRouter from './scripts/router'

    export default {
      router: usercenterRouter,
      store: {},
      components: {
        'h-datagridh': HDatagridh
      },
      utils: {

      }
    }
  ```
  1. 定义全局组件/全局变量【针对完全独立业务模块如操作员中心、工作流等，注意唯一性，不可与业务部门冲突】
  2. export子系统资源store/router(必须)

## API集合
### 直接在.vue中使用
  ```javascript
    this.$http.post('account/passwordEdit', {
      password
    }).then(res => {

    }).catch(err => {
      
    })
  ```
### 在api中定义
  `common/script/http.js` http请求包装/拦截等
  ```javascript
  import axios from 'axios'
  axios.defaults.withCredentials = true

  axios.interceptors.request.use(config => {
    // 请求拦截处理
    return config
  }, error => {
    // 请求报错处理
    return Promise.reject(error)
  })

  axios.interceptors.response.use(response => {
    // 响应拦截处理
    return response
  }, error => {
    // 响应报错处理
    return Promise.reject(error)
  })

  let CancelToken = axios.CancelToken
  let source = CancelToken.source()
  export default {
    get(url, params = {}) {
      return axios({
        method: 'get',
        baseURL: config.baseUrl,  // eslint-disable-line config是配置在sysconfig.js中的变量
        url,
        params,
        timeout: 1000 * 60 * 30,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        cancelToken: source.token
      })
    },
    post(url, data = {}, onUploadProgress = null) { // eslint-disable-line
      return axios({
        method: 'post',
        baseURL: config.baseUrl, // eslint-disable-line
        url,
        // data: qs.stringify(data),
        data,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        timeout: 1000 * 60 * 30,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        cancelToken: source.token
      })
    },
    all(iterable) {
      return axios.all(iterable).then(response => {
        return response
      })
    },
    cancel() {
      source.cancel('cancel')
      // 赋值新source，否则之后的请求会全部被取消
      source = CancelToken.source()
    }
  }
  ```

  `script/api/sys/user.js` 用户管理功能相关API集合
  ```javascript

  /**
  * @description 修改密码
  */
  const modifyPwd = function (password) {
    return http.post('account/passwordEdit', {
      password
    })
  }

  /**
  * @description 修改用户名
  */
  const modifyCustName = function (loginName) {
    return http.post('account/loginNameEdit', {
      loginName
    })
  }

  export { modifyPwd, modifyCustName}
  ```
  `script/api/sys/role.js` 角色管理功能相关API集合
  ```javascript

  /**
  * @description 新增角色
  */
  const addRole = function (name, desc, menuIds) {
    return http.post('/role/roleAdd', {
      name: name,
      desc: desc,
      menuIds: menuIds
    })
  }

  /**
  * @description 修改角色
  */
  const editRole = function (id, name, desc, menuIds) {
    return http.post('/role/roleEdit', {
      id: id,
      name: name,
      desc: desc,
      menuIds: menuIds
    })
  }

  export { addRole, editRole}
  ```
  `script/api/index.js` API统一出口

  ```javascript
  export * from './sys/user'
  export * from './sys/role'
  ```


## store
  `script/store/index.js`
  ```javascript
  import demo from './modules/app'
  export default {
    modules: {
      demo
    }
  }
  ```
  `script/store/modules/demo.js`
  - 每个module中均包含state,getters,mutations,actions
  ```javascript
  const demo = {
    state: {
      demotest: '123123'
    },
    getters: {
      demotest: state => state.demotest
    },
    mutations: {

    },
    actions: {

    }
  }
  export default demo
  ```
## router
  `script/router/index.js`
  ```javascript
  // 假设存在#子系统结构介绍#中的views结构
  export default {
    page_a_1: () => import(/* webpackChunkName: "child_sys_a/page_a/page_a_1" */'@child_sys_a/views/page_a/page_a_1'),
    page_a_2: () => import(/* webpackChunkName: "child_sys_a/page_a/page_a_2" */'@child_sys_a/views/page_a/page_a_2'),
    page_b_1: () => import(/* webpackChunkName: "child_sys_a/page_b/page_b_1" */'@child_sys_a/views/page_b/page_b_1'),
    page_b_2: () => import(/* webpackChunkName: "child_sys_a/page_b/page_b_2" */'@child_sys_a/views/page_b/page_b_2'),
  }
  ```
  > - `page_a_1`这样的key值应和相应菜单对象的id保持一致
  > - `webpackChunkName`是打包生成chunk的名，比如`dist/child_sys_a/page_a/page_a_1.js`是page_a_1组件打包后的chunk
  > - `@child_sys_a`别名配置在`./build/webpack.base.conf.js`的`resolve.alias`中

## 新增一个业务页面

  - 数据库配置菜单`test`,`test.url = src/child_sys_a/test`
  - 在`src/child_sys_a/`下添加`test.vue`文件
  - 按照《vue单文件编码规范》编辑`test.vue`
  - 如果需要调用API，在`src/child_sys_a/script/api/test/index.js`(路径自定)添加API调用，本页 import 写好的 API 函数或直接调用this.$http.post


## 菜单配置

  `sysconfig.js` 项目配置
  ```javascript
    menus: [
      {
        // 菜单对应路径，父节点url为null,子节点路径与views下文件路径相对应
        "url": null,
        // 菜单对应id
        "id": "bizMenu",
        // 操作员菜单树子模块名称
        "kind_code": "",
        // 前端子系统模块名称
        "app_code": "",
        // 菜单显示名称
        "title": "系统菜单",
        // 一级菜单显示的图标    
        "icon": "home",
        // 当前节点父菜单id，子系统id对应MENUS_ROOT_NAME，若不对应，则认为非子系统根节点
        "parent_id": "BIZFRAME",
        // 子节点集合
        "children": [
          {
            "url": null,
            "id": "bizSysManager",
            "title": "用户管理",
            "parent_id": "bizMenu",
            "icon": "home",
            "children": [
              // 菜单对象,与上方一致...
            ]
          }
        ]
      }
    ]
  ```
## Tab API
*提供页签相关的操作*
### addNewTab
打开新页面  
- menuId 菜单id，必须唯一。必填
- url 路由地址，必填
- query url查询参数
- title 菜单名称，必填
- menuArgs 菜单参数
- isKeepAlive 页面是否需要缓存，默认为false不缓存
- subSysName 子系统标识名，必填
- compId 模板页面映射表key值，打开临时页必填
- isIframe 是否是iframe页面
- meta 其他添加到menu对象的属性

### closeTab
关闭页面
- menuId 菜单id，必须唯一。必填

### refresh
刷新页面
- menuId 菜单id，必须唯一。必填

### activate
激活已打开页面
- menuId 菜单id，必须唯一。必填

### 组件内使用
``` javascript
this.$tabs.closeTab('bizframe')
```

## 现有工程如何模块化打包
  1. 添加子模块打包入口文件-index.js,参考上述
  2. 添加router中的路由映射
  3. 修改store中的getters
     原:getters 单独文件
     现:getters 写入module中，参考上述--使用无差别
  4. 打包后的module > 子系统模块可以独立部署至see平台,业务部门将其部署在dist中即可运行

## 子系统打包配置config.js[0513新增]
```javascript
  /*
  * alias: 子系统路径全局依赖
  * plugins: 子系统依赖第三方插件
  */
  module.exports = {
    alias: {
      '@demo': 'src/demo'
    },
    plugins: [
      'h_ui@1.0.35',
      'xlsx'
    ]
  }
```

## 注意事项
### 国际化时，static中添加lang > zh-CN.js,en-US.js, window.子模块的大写+ '_ZH_CN'/window.子模块的大写+ '_EN_US'/
### 子系统的名称必须与menu菜单中返回的子系统id保持一致
### fetch/cookies/vuex 等均全局注册
  Vue.prototype.$http = fetch
  window.fetch = fetch
  例如:.vue中使用this.$http,.js中使用window.fetch