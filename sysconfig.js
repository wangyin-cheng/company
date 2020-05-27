window.LOCAL_CONFIG = {
  // 服务及接口
  API_HOME: '/',
  OMC_GSV: '/g/hsxone.omc/v',
  SYS_NAME: '操作员中心',
  FRAME_NAME: 'hui', //研发中心框架
  MENUS_ROOT_NAME: 'bizroot',
  THEME: 'lightblue',//lightblue
  VERSION: '2.0.30',
  SUCCESS_KEY: 'return_code',
  TABS_VIEW_LIMIT: 10, // tab页最大打开数量
  JUMP_TO_HOME_ON_LOCALE_CHANGE: false, // 语言切换之后跳转到首页，默认关闭，即停留在当前页上
  HOW_TO_GET_MENU_INFO_IN_UCF: "cookie", // 在 ucf 模式下如何获取菜单信息，默认为 cookie 即从 cookie 中获取，可选值 search 即通过查询字符串
  INCLUDE_APP_MAIN_ON_THEME_CHANGE: true, // 主题切换时是否包含子系统页面内容，默认打开
  KEEP_IFRAME_PAGE_ALIVE: false, // 是否保持 iframe 页面的状态，即 iframe 菜单切换不刷新
  TABLE_SCROLLBAR_WIDTH: 7, // Table 及其相关组件(包括 SimpleTable EditGird 等)的滚动条宽度, 需要结合滚动条样式设置
  PREFETCH_SUBAPP_LIST: ["demo"], // 执行预取的子系统集合，执行的时机是在 AppMain 的 mounted 生命周期中
  KEEP_VISITED_VIEWS_ON_RELOAD: false, // 页面刷新时保持已经打开的 tab 页签，默认关闭
  CONFIRM_ON_TAB_CLOSE: false, // 关闭页签时是否弹出窗口请用户确认，默认关闭
  isToken: false, // 为false时证明不需要登录
  isFrame: false, // 当前运行是否在Frame中运行
  isUcf: false, // 当前运行是否在UCF中运行s
  isRefresh: true, // 缓存页面时是否需要在关闭选项卡处刷新页面
  isAllKeepAlive: true, // 是否页面都进行缓存（服务端无返回isKeppAlive字段时）
  isUnderscore: true, // 入参是否把驼峰规则转换下划线规则（容微服务模式需要设置为true）
  isUrlLowercase:false,//请求url是否转换为小写
  isKindCodeCanWrite:false,//系统菜单设置 -> 系统编号是否支持修改
  isMergeMenu: false,//是否合并菜单
  isOpenFirstPwd:false,//第一次登陆是否弹出修改密码
  webEncryptType:"3DES",
  isShowNoticeBar:false,//是否显示底部消息提示组件
  isHidePwdAndLockScreen:true,//是否隐藏修改密码和锁屏
  isShowMsg:false,//首页上是否显示站内消息
  isCasLogin: false, // 是否启用MVC单点登录
  isIARCasLogin: false, // 是否启用IAR单点登录
  casSsoName: "omc", // 单点登录跳转参数，跳转到操作员中心配置omc，跳转到uf3配置uf3
  casLogOutUrl: '/cas/user/logout',//IAR登出接口
  isI18n: true,
  isTenantMode:false, //是否是多租户模式
  isShowLocalLang:true,//是否显示国际化切换按钮
  isShowTheme:true,//是否显示换肤
  isRecordUserBehavior:false,//是否记录用户行为分析
  freeLogin: false, // 设置为true时，用于屏蔽锁屏、修改密码、退出登录
  logo: '', // 个性化logo
  showMenuSearch: false,// 是否显示顶部菜单检索框
  isSubSystemMenu:false,//是否以二级菜单的形式展示子系统
  localLangs:['zh-CN','zh-TW','en-US'],//zh-CN=中文，zh-TW=中文（繁体），en-US=English
  isExpandSidebarMenu:true,//第一次登录之后是否就展开左侧菜单
  isTwoFactorCheck:false,//是否开启双因登录验证
  isOpenSpace:false,//是否显示空间切换
  isRefreshLockedScreen:false,//锁屏后再解锁，是否刷新当前浏览器
  menus: [
    {
      // 无token时的默认菜单
      // 菜单对应路径，父节点url为null,子节点路径与views下文件路径相对应
      url: null,
      kind_code: 'demo',
      app_code: 'demo',
      // 菜单对应id
      id: 'demo',
      is_hidden: 'false',
      // 菜单显示名称
      title: 'dmeo系统',
      // 一级菜单显示的图标
      icon: 'home',
      // 当前节点父菜单id，子系统id对应MENUS_ROOT_NAME，若不对应，则认为非子系统根节点
      parent_id: 'bizroot',
      // 子节点集合
      children: [
        {
          url: null,
          kind_code: 'demo',
          app_code: 'demo',
          id: 'bizMenu',
          title: '系统菜单',
          parent_id: 'demo',
          icon: 'home',
          children: [
            {
              url: null,
              kind_code: 'demo',
              app_code: 'demo',
              id: 'bizSysManager',
              title: '用户管理',
              parent_id: 'bizMenu',
              icon: 'home',
              children: [
                {
                  url: '/demo/bizMenu/bizSysManager/bizSetDict',
                  kind_code: 'demo',
                  app_code: 'demo',
                  id: 'bizSetDict',
                  title: '数据字典设置',
                  parent_id: 'bizSysManager',
                  icon: 'home',
                  children: null,
                  is_hidden: false,
                  // 页面切换时是否保存页面状态，子节点设置
                  is_keep_alivea: true,
                  children: null
                },
                {
                  url: '/demo/bizMenu/bizSysManager/bizSetCache',
                  kind_code: 'demo',
                  app_code: 'demo',
                  id: 'bizSetCache',
                  title: '缓存设置',
                  parent_id: 'bizSysManager',
                  is_hidden: false,
                  icon: 'home',
                  children: null,
                  // 页面切换时是否保存页面状态，子节点设置
                  is_keep_alivea: true,
                  children: null
                },
                {
                  url: '/demo/bizMenu/bizSysManager/bizSetCache1',
                  kind_code: 'demo',
                  app_code: 'demo',
                  id: 'bizSetCache1',
                  title: '缓存设置233',
                  is_hidden: false,
                  parent_id: 'bizSysManager',
                  icon: 'home',
                  children: null,
                  // 页面切换时是否保存页面状态，子节点设置
                  is_keep_alivea: true,
                  children: null
                }
              ]
            }
          ]
        },
        {
          url: null,
          kind_code: 'demo',
          app_code: 'demo',
          id: 'bizMsgManager',
          title: '信息管理',
          parent_id: 'demo',
          icon: 'home',
          children: [
            {
              url: null,
              kind_code: 'test',
              app_code: 'test',
              id: 'bizEmail',
              title: 'bizEmail',
              parent_id: 'bizMsgManager',
              icon: 'home',
              children: [
                {
                  url: '/demo/bizMsgManager/bizEmailOutbox',
                  kind_code: 'test',
                  app_code: 'test',
                  id: 'bizEmailOutbox',
                  title: 'bizEmailOutbox实例',
                  parent_id: 'bizEmail',
                  icon: 'home',
                  is_keep_alivea: true,
                  comName: 'bizEmailOutbox',
                  children: null
                }
              ]
            }
          ]
        },
        {
          url: null,
          kind_code: 'demo',
          app_code: 'demo',
          id: 'menuScen',
          title: '菜单场景示例',
          parent_id: 'demo',
          icon: 'home',
          children: [
            {
              url: '/demo/menuScene',
              kind_code: 'demo',
              app_code: 'demo',
              id: 'test',
              title: '菜单场景',
              parent_id: 'demo',
              icon: 'home',
              children: null
            },
            {
              url: '/demo/manyToOne/1',
              kind_code: 'demo',
              app_code: 'demo',
              id: 'manyToOne1',
              title: '多对一菜单-1',
              parent_id: 'menuScen',
              icon: 'home',
              children: null,
              ext_field: 'manyToOne'
            },
            {
              url: '/demo/manyToOne/2',
              kind_code: 'demo',
              app_code: 'demo',
              id: 'manyToOne2',
              title: '多对一菜单-2',
              parent_id: 'menuScen',
              icon: 'home',
              children: null,
              ext_field: 'manyToOne'
            },
            {
              url: 'http://www.baidu.com',
              kind_code: 'demo',
              app_code: 'demo',
              id: 'baidu',
              title: 'iframe 百度',
              menu_type: 'iframe',
              parent_id: 'menuScen',
              icon: 'home',
              children: null,
              is_hidden: 'false',
              menu_arg: '{"a":1,"b":2}'
            },
            {
              url: 'http://www.sogou.com',
              kind_code: 'demo',
              app_code: 'demo',
              id: 'sogou',
              title: 'iframe 搜狗',
              menu_type: 'iframe',
              parent_id: 'menuScen',
              icon: 'home',
              children: null,
              is_hidden: 'false'
            }
          ]
        },
        {
          url: '/demo/hui/test',
          kind_code: 'demo',
          app_code: 'demo',
          id: 'huiTest',
          title: 'HUI测试',
          parent_id: 'demo',
          icon: 'home',
          children: null,
          is_hidden: 'false'
        }
      ]
    },
    {
      url: null,
      kind_code: 'style-isolate',
      app_code: 'style-isolate',
      id: 'style-isolate',
      title: 'subsystem-style-isolate',
      is_hidden: 'false',
      icon: 'home',
      parent_id: 'bizroot',
      children: [
        {
          url: '/style-isolate/index',
          kind_code: 'style-isolate',
          app_code: 'style-isolate',
          id: 'style-isolate-index',
          title: 'style-isolate-index',
          parent_id: 'style-isolate',
          icon: 'home',
          is_keep_alivea: true,
          comName: 'bizEmailOutbox',
          children: null
        }
      ]
    },
    {
      url: null,
      kind_code: 'CONFIGURATION',
      app_code: 'CONFIGURATION',
      id: 'new-configuration',
      title: '新一代配置中心',
      is_hidden: 'false',
      icon: 'home',
      parent_id: 'bizroot',
      children: [
        {
          url: '/CONFIGURATION/views/webSys/index',
          kind_code: 'CONFIGURATION',
          app_code: 'CONFIGURATION',
          id: 'webSys',
          title: '系统管理',
          parent_id: 'new-configuration',
          icon: 'home',
          is_keep_alivea: true,
          children: null
        },
        {
          url: '/CONFIGURATION/views/webApplication/index',
          kind_code: 'CONFIGURATION',
          app_code: 'CONFIGURATION',
          id: 'webApplication',
          title: '应用管理',
          parent_id: 'new-configuration',
          icon: 'home',
          is_keep_alivea: true,
          children: [],
        },
        {
          url: '/CONFIGURATION/views/webColony/index',
          kind_code: 'CONFIGURATION',
          app_code: 'CONFIGURATION',
          id: 'webColony',
          title: '集群管理',
          parent_id: 'new-configuration',
          icon: 'home',
          is_keep_alivea: true,
          children: null
        },
        {
          url: '/CONFIGURATION/views/webSetting/index',
          kind_code: 'CONFIGURATION',
          app_code: 'CONFIGURATION',
          id: 'webSetting',   
          title: '配置管理',
          parent_id: 'new-configuration',
          icon: 'home',
          is_keep_alivea: true,
          children: null
        },
        {
          url: '/CONFIGURATION/views/wtTest/index',
          kind_code: 'CONFIGURATION',
          app_code: 'CONFIGURATION',
          id: 'wtTest',  //对应路由router的模块
          title: '测试hui页面',
          parent_id: 'new-configuration',
          icon: 'home',
          children: null,
          is_keep_alivea: true,
        },
      ]
    }
  ]
}




