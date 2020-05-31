import {
  addFetchInterceptors,
  createFetch
} from './api'

let defaultGlobalAlias = 'ucpFetch'

export default {
  setGlobalAlias (alias) {
    defaultGlobalAlias = alias
  },

  getGlobalAlias () {
    return defaultGlobalAlias
  },
  // 是否有全局的fetch
  isCreateGlobalFetch () {
    if (window[defaultGlobalAlias]) {
      return true
    } else {
      return false
    }
  },
// 没有就是创建全局的fetch
  createUcpFetch (config) {
    let ret
    if (this.isCreateGlobalFetch()) {
      ret = window[defaultGlobalAlias]
    } else {
      ret = createFetch(config)
      addFetchInterceptors(ret)
      window[defaultGlobalAlias] = ret
    }
    return ret
  },

  createFetch,
  addFetchInterceptors
}
