module.exports = name => {
  requirejs(["./" + name + "/" + "sysconfig.js"]);

  const defer = require("defer-promise");
  const deferred = defer();

  const bootstrap = data => {
    deferred.resolve(data);

    const capitalName = name.toUpperCase();
    const { isI18n } = window.LOCAL_CONFIG;
    const {
      default: { i18n }
    } = data;

    if (i18n || (typeof i18n === "undefined" && isI18n)) {
      window[capitalName + "_ZH_CN"] &&
        window.i18n.mergeLocaleMessage("zh-CN", window[capitalName + "_ZH_CN"]);
      window[capitalName + "_ZH_TW"] &&
        window.i18n.mergeLocaleMessage("zh-TW", window[capitalName + "_ZH_TW"]);
      window[capitalName + "_EN_US"] &&
        window.i18n.mergeLocaleMessage("en-US", window[capitalName + "_EN_US"]);
    }
  };

  requirejs(
    [`./${name}/${name}.js`],
    data => {
      const { isI18n } = window.LOCAL_CONFIG;
      const {
        default: { i18n }
      } = data;

      if (i18n === false || isI18n === false) {
        bootstrap(data);
      } else {
        requirejs(
          [
            `./${name}/static/lang/zh-CN.js`,
            `./${name}/static/lang/zh-TW.js`,
            `./${name}/static/lang/en-US.js`
          ],
          () => bootstrap(data),
          error => {
            console.error(error);
            bootstrap(data);
          }
        );
      }
    },
    error => {
      deferred.resolve(null);
      console.warn(`${name} 子系统加载失败`);
      console.error(error);
    }
  );

  return deferred.promise;
};
