/**
 * 这是一个符合 requirejs 规范的模块定义, 需要配合 mergeLocaleFromUrl 方法使用,
 * 可以用来指定特定子系统的语言包文件作为子系统默认语言包文件的补充或者覆写.
 * 常见的场景如下:
 *    当引用的由第三方开发的业务子系统定义了默认的一套语言文件并不满足业务要求时,
 *    可以在这里自定义相关字段以达到定制的目的.
 */
define({
  "zh-CN": {
    m: {
      i: {
        locale: "zh-CN",
        demo: {
          test: "测试"
        }
      }
    }
  },
  "en-US": {
    m: {
      i: {
        locale: "zh-CN",
        demo: {
          test: "test"
        }
      }
    }
  }
});
