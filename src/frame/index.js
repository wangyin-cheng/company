// import {Vue} from '@common/entry/main.js'
import Vue from 'vue'
import '@common/entry/index.js' // 引入公共入口的文件
import frameComponent from '@frame/components/index'
import {registerGlobalComponents} from '@common/entry/component.js'

/*
  @import: style
*/
// import '@frame/styles/main.scss'
import '@frame/styles/font/iconfont.css'
import '@frame/styles/base.scss'
import '@frame/styles/common.scss'
/*
  @import :style
  主题颜色
*/
import './my-theme-css/hui-black.css'

import './my-theme-css/hui-uf3.css'

import './my-theme-css/hui-lightblue.css'

/**
 * 注册全局组件
 **/
registerGlobalComponents(Vue, frameComponent)
