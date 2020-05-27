# HUI 前端结构规范


[TOC]

<div STYLE="page-break-after: always;"></div>

## 修订说明

| 版本           | 修订时间      | 修订人      | 修订内容                 |
| -------------- | ------------ |------------| ------------------------ |
| `v0.1.0`       | `2019-05-27` | 王亚男18853 | 新增 HUI前端结构规范      |
| `v0.1.1`       | `2019-06-04` | 王亚男18853 | 修改 主结构添加biz      |

<div STYLE="page-break-after: always;"></div>

## 项目结构

```
build                                 # webpack打包配置文件
  ├── build.js                          ## `npm run build` 入口
  ├── check-version.js                  ## 版本检查
  ├── utils.js                          ## 打包工具函数
  ├── vue-loader.conf.js                ## vue-loader配置
  ├── webpack.base.conf.js              ## webpack基础配置，dev/prod在此基础上增加配置
  ├── webpack.dev.conf.js               ## webpack开发服务配置（`npm run dev`）
  ├── webpack.dll.conf.js               ## webpack打包公共依赖配置（`npm run dll`）
  ├── webpack.child.conf.js             ## webpack打包子模块依赖配置
  ├── config.child.js                   ## webpack打包子模块依赖配置
  ├── build-child.js                   ## webpack打包子模块依赖配置
  ├── webpack.prod.conf.js              ## webpack生产服务配置
config                                # 上方build文件夹依赖的其他**易配置**的配置
  ├── ...
dist                                  # 打包后代码
  ├── ...
node_modules                          # 项目所有依赖包
  ├── ...
src                                   # 项目源码
  ├── common                             ## 项目公共模块，由研发中心提供，包括全局注册组件方法、路由控                                           制、模块化加载及常用方法、指令等
    ├── assets                              · 资源，一般存放图片
    ├── components                          · 公共组件
    ├── directives                          · directives-公共指令
    ├── entry                               · 入口相关文件-模块化等
    ├── mixins                              · mixins-公共混入
    ├── styles                              · 样式
    ├── utils                               · utils-公共方法
    ├── App.vue                             · 入口模板
  ├── frame                              ## 项目基础模块，包括少量业务组件和登录\菜单\路由等相关逻辑，                                           由业务部门编写（子目录结构同上）
    ├── api                                 · API接口
    ├── assets                              · 资源，一般存放图片
    ├── components                          · 公共组件
    ├── directives                          · directives-公共指令
    ├── mixins                              · mixins-公共混入
    ├── router                              · 路由映射列表(规定格式)
    ├── store                               · 全局状态管理(规定格式)
    ├── styles                              · 样式
    ├── utils                               · utils-公共方法
    ├── views                               · 页面组件
    ├── sysconfig.js                        · 项目自定义配置文件，配置api-base-url、分页信息什么的
  ├── biz                                ## 子系统(子模块)集合
    ├── child_sys_a                        ## 子系统a
    ├── child_sys_b                        ## 子系统b
static                                # 静态资源（不被打包内容，项目打包时直接copy到dist目录），可用于                                      存放字体文件
  ├── ...
.babelrc                              # babel配置
.editorconfig                         # 编辑器通用文件风格配置
.eslintignore                         # eslint校验忽略文件配置
.eslintrc.js                          # eslint规则配置，自定规则配置在rules对象中
.postcssrc.js                         # postcss配置
.index.ejs                            # webpackHtmlPlugin打包模板
package.json                          # 项目依赖配置
sysconfig.js                          # 项目自定义配置文件，配置api-base-url、分页信息什么的
package-lock.json                     # 依赖版本锁定配置
```

## 项目运行

1. 安装NodeJS
    - 下载[Node v10.15.3](http://nodejs.cn/)并安装
    - 添加安装路径到环境变量

2. 安装项目依赖

    项目根目录运行：`npm install`
    项目根目录运行：`npm run installChild` [安装子系统第三方插件]

    > 安装前需要替换npm源为恒生镜像: `npm config set http://192.168.102.232:6060/repository/npm-public/` 或使用nrm 进行切换

    > 如果安装node-sass报错提示python版本，请安装[Python v2.7.12](https://www.python.org/downloads/windows/)


3. 运行项目

    - 开发环境 `npm run dll` -> `npm run dev`
    - 生产环境 `npm run dll` -> `npm run build` -> 部署dist下的静态资源
    - 生产环境子系统部署 `npm run child --child=demo` -> 部署dist文件夹下
      > 其中demo为子系统名称，子系统打包后会打包至demo模块，将demo部署至dist中即可
      > 一个工程中两个子模块一起打包，建议npm run child --child=demo && npm run child --child=test

> 如果你想使用yarn，它安装依赖会稍快一些，请`npm install yarn -g`全局安装yarn，再为yarn添加淘宝源`yarn config set registry https://registry.npm.taobao.org`，最后只需要把以上命令中的`npm install`/`npm run`命令替换为`yarn`就行了，比如：`yarn dev`/`yarn build`，须注意**一个项目组最好统一使用一种包管理工具，要么都npm要么都yarn**，否则依赖版本可能会在不经意间就有了差异
