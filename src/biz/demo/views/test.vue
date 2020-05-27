<template>
  <div>
    <span>menuId</span>
    <h-input v-model="menuId"></h-input>
    <span>url</span>
    <h-input v-model="url"></h-input>
    <span>{{$t('m.i.demo.title')}}</span>
    <h-input v-model="title"></h-input>
    <span>menuArgs(非必填)</span>
    <h-input v-model="menuArgs"></h-input>
    <span>compId</span>
    <h-input v-model="compId"></h-input>
    <div class="ins">
      <div>使用Tab API中的addNewTab，配置并打开一个临时页面。</div>
      <pre>
      /**
        * 新增标签页
        * @param menuId 菜单id，必须唯一。跳转临时菜单时必填
        * @param url 路由地址，必填
        * @param query 查询参数
        * @param title 菜单名称，跳转临时菜单时必填
        * @param menuArgs 菜单参数
        * @param isKeepAlive 页面是否需要缓存，默认为false不缓存
        * @param subSysName 子系统标识名，跳转临时菜单时必填，跳转临时菜单时必填
        * @param compId 模板页面映射表key值，跳转临时菜单时必填
        * @param isIframe 是否是iframe，默认为false
        * @param meta 其他添加到menu对象的属性
        */
        addNewTab (menuId, url, query = {}, title, menuArgs = '', isKeepAlive, subSysName, compId = '', isIframe = false, meta = {})
          
      this.$tabs.addNewTab('DemoPage', 'demo/page', undefined, '临时菜单', undefined, true, 'Demo', 'DemoPage', false)
      </pre>
      <div>compId填写为页面组件映射中添加的key值</div>
      <h-button @click="pushTemp">打开临时页</h-button>
    </div>
    <div class="ins">
      <div>子系统入口文件index.js导出staticRoutes属性。</div>
      <pre>
      // @demo/index.js
      import viewMap from '@demo/router'
      export default {
        // 页面组件映射对象
        router: viewMap,
        // 静态菜单路由
          staticRoutes: [{
            url: '/demo/static/page',
            id: 'StaticPage',
            title: '静态菜单页',
            isKeepAlive: true,
            menuArgs: {},
            /* 用于在模板页面映射表中查找页面 */
            tempMenuTplId: 'huiTest'
          }]
      }
      </pre>
      <div>
        tempMenuTplId填写为页面组件映射中添加的key值。
      </div>
      <div>
        同样是使用Tab API中的addNewTab，打开页面。这里可以不用传递menuId。
      </div>
      <pre>
        this.$tabs.addNewTab(undefined, '/demo/static/page')</pre>
      <h-button @click="pushStatic">跳转子系统固定路由</h-button>
    </div>
    <div class="ins">
      <pre>
        this.$tabs.addNewTab(undefined, '/demo/hui/test')
      </pre>
      <h-button @click="pushExist">跳转普通配置菜单</h-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test',
  data () {
    return {
      menuId: '',
      url: '',
      title: '',
      menuArgs: '',
      isKeepAlive: true,
      subSysName: 'demo',
      compId: '',
      query: ''
    }
  },
  methods: {
    // 打开临时页
    pushTemp () {
      this.$tabs.addNewTab(this.menuId, this.url, {key: this.query}, this.title, this.menuArgs, this.isKeepAlive, this.subSysName, this.compId, false)
    },
    // 跳转子系统固定路由
    pushStatic () {
      this.$tabs.addNewTab(undefined, '/demo/static/page')
    },
    // 跳转后台维护的菜单
    pushExist () {
      this.$tabs.addNewTab(undefined, '/demo/hui/test')
    }
  }
}
</script>
<style scoped lang="scss">
.ins {
  margin-bottom: 20px;
  div, pre {
    font-size: 14px;
  }
  pre {
    color: #444;
    font-size: 13px;
    border: 1px solid #bbb;
    background-color: #eee;
    border-radius: 5px;
  }
}
</style>