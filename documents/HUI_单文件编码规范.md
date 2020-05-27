# HUI Vue单文件书写规范


[TOC]

<div STYLE="page-break-after: always;"></div>

## 修订说明

| 版本           | 修订时间      | 修订人      | 修订内容                 |
| -------------- | ------------ |------------| ------------------------ |
| `v0.1.0`       | `2019-05-27` | 王亚男18853 | 新增 Vue单文件书写规范    |

<div STYLE="page-break-after: always;"></div>

## Vue单文件书写规范

```vue
  <!-- 页面注释 -->
  <template>
    <!-- 只能存在一个根标签  -->
    <div class="module"></div>
  </template>

  <script>
  // 引入组件
  import HDatagrid from '@/components/HDatagrid'
  // 引入公共方法
  import { oneOf } from '@/utils/index'

  export default {
    /**
    * vue结构
    * export default {
    * name: 当前文件名 --页面组件name
    * data: 页面(组件)局部属性，必须return 一个对象
    * props: 页面(组件)外部属性，定义尽可能详细，尽量定义类型、默认值等
    * components: 页面(组件)依赖非公共组件
    * mixins: 页面(组件)混入
    * computed: 页面(组件)计算属性
    * watch: 页面(组件)监听变量变化
    * methods: 页面(组件)方法
    * created: 页面(组件)实例初始化完成
    * mounted: 页面(组件)渲染完成
    * updated: 页面(组件)更新后的处理
    * activated: keep-alive 组件激活时调用
    * deactivated: keep-alive 组件停用时调用
    * destroyed: 页面(组件)销毁
    * }
    **/
    name: 'module',
    data() {
      return {}
    },
    props: {},
    components: {
      HDataGrid
    },
    mixins: [],
    computed: {},
    watch: {},
    methods: {},
    created() {},
    mounted() {},
    updated() {},
    activated() {},
    deactivated() {},
    destroyed() {}
  }
  </script>

  <!-- 如果有自定义样式本页维护，并注意需要用嵌套方式书写（使生产的样式有一个类似命名空间的概念） -->
  <style lang="scss">
  .module {
    .test1 {
    }
  }
  </style>
```
