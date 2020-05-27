/* eslint-disable */
import demoView from "./router/index.js";
import demoStore from "./store/index.js";
import Lang from "@demo/lang";
import { mergeLocaleFromUrl } from "@common/utils";
/* eslint-enable */

const plugin = {
  install() {
    // do something
  },
};

export default {
  // 子系统映射路由
  router: demoView,

  // 静态菜单路由
  staticRoutes: [
    {
      url: "/demo/static/page",
      id: "StaticPage",
      title: "静态菜单页",
      isKeepAlive: true,
      menuArgs: {},
      /* 用于在模板页面映射表中查找页面 */
      tempMenuTplId: "huiTest",
    },
  ],

  // 子系统状态
  store: demoStore,

  // 全局注册的实例化方法
  utils: {},

  // 指令
  directives: {},

  // 注册到全局的公共组件
  components: {},

  // 插件
  uses: {
    plugin,
  },

  // 国际化。设置布尔值时用作是否加载国际化文件的开关，或者设置国际化内容对象
  i18n: Lang,

  /**
   * 引导函数, 执行的时机是在组件、语言包等子系统资源加载完毕之后, 子系统路由注册之前
   * @param {Object.store} store - 支持在子系统加载时访问全局的状态仓库
   * @param {Object.tabs} tabs - 不建议在这里执行 tab 操作，容易引起循环加载，导致浏览器崩溃
   * @param {Function} done - 执行结束后必须调用 done 结束调用
   */
  bootstrap({ store, tabs }, done) {
    // store.dispatch("...");
    mergeLocaleFromUrl("./static/locale/demo.js").finally(done); // 合并子系统外部定义的语言文件
  },
};
