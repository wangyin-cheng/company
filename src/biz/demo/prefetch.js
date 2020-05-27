/**
 * @description 预执行函数，应用启动后（AppMain mounted）会按照 PREFETCH_SUBAPP_LIST 依次加载并执行该函数
 * @this {object} 在预执行函数中, this 指向的是主系统的 AppMain 组件实例
 *
 * 注意：预执行函数的执行逻辑跟子系统的加载逻辑没有先后关系，子系统的加载时机仍然是首次打开子系统下任意菜单的时候，而预执行
 *      函数的加载时机是在主系统 AppMain mounted 之后
 */
export default function() {
  // 可以通过 this.$http 完成数据请求
  // this.$http.post(/** 请求参数 */).then(result => {
  // do something with result
  // });
}
