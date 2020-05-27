const loadI18N = function (name) {
  import('@src/biz/' + name + '/static/lang/zh-CN.js').then(res => {
    window.i18n.mergeLocaleMessage('zh-CN', window[name.toUpperCase() + '_ZH_CN'])
  }).catch(() => {
    requirejs(['./' + name + '/static/lang/zh-CN.js'], function () {
      window.i18n.mergeLocaleMessage('zh-CN', window[name.toUpperCase() + '_ZH_CN'])
    }, () => {})
  })
  import('@src/biz/' + name + '/static/lang/zh-TW.js').then(res => {
    window.i18n.mergeLocaleMessage('zh-TW', window[name.toUpperCase() + '_ZH_TW'])
  }).catch(() => {
    requirejs(['./' + name + '/static/lang/zh-TW.js'], function () {
      window.i18n.mergeLocaleMessage('zh-TW', window[name.toUpperCase() + '_ZH_TW'])
    }, () => {})
  })
  import('@src/biz/' + name + '/static/lang/en-US.js').then(res => {
    window.i18n.mergeLocaleMessage('en-US', window[name.toUpperCase() + '_EN_US'])
  }).catch(() => {
    requirejs(['./' + name + '/static/lang/en-US.js'], function () {
      window.i18n.mergeLocaleMessage('en-US', window[name.toUpperCase() + '_EN_US'])
    }, () => {})
  })
}

module.exports = (name) => {
  import('@src/biz/' + name + '/sysconfig.js').catch(() => {
    requirejs(['./' + name + '/' + 'sysconfig.js'], function () {}, () => {})
  })
  const defer = require('defer-promise')
  const deferred = defer()
  import('@src/biz/' + name + '/index.js')
    .then(res => {
      deferred.resolve(res)
      if (res && res.default) {
        let i18n = res.default.i18n
        if ((typeof i18n === 'boolean' && i18n) ||
        ((typeof i18n === 'undefined' || i18n === null) && window.LOCAL_CONFIG.isI18n)) {
          loadI18N(name)
        }
      }
    })
    .catch(() => {
      requirejs(['./' + name + '/' + name + '.js'], function (res) {
        deferred.resolve(res)
        if (res && res.default) {
          let i18n = res.default.i18n
          if ((typeof i18n === 'boolean' && i18n) ||
          ((typeof i18n === 'undefined' || i18n === null) && window.LOCAL_CONFIG.isI18n)) {
            loadI18N(name)
          }
        }
      }, () => {
        console.warn(`加载${name}子系统失败`)
        deferred.resolve(null)
      })
    })
  return deferred.promise
}
