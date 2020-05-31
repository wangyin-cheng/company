import './styles/main/sys.scss'
import './styles/main/application.scss'
import './styles/main/colony.scss'
import './styles/main/setting.scss'
import './styles/main/common.scss'

import fetchApi from './Common-Components/ucpFetch'


fetchApi.createUcpFetch()
export default {
  router: {
    "webSys": () =>
      import(
        /* webpackChunkName: "configuration/views/webSys/index" */
        `@configuration/views/webSys/index`
      ),
      "wtTest": () =>
      import(
        /* webpackChunkName: "configuration/wtTest/index" */
        `@configuration/views/wtTest/index`
      ),
    "webApplication": () =>
      import(
        /* webpackChunkName: "configuration/views/webApplication/index" */
        `@configuration/views/webApplication/index`
      ),
      "webColony": () =>
      import(
        /* webpackChunkName: "configuration/views/webColony/index" */
        `@configuration/views/webColony/index`
      ),
      "webSetting": () =>
      import(
        /* webpackChunkName: "configuration/views/webSetting/index" */
        `@configuration/views/webSetting/index`
      ),
      "webHistory": () =>
      import(
        /* webpackChunkName: "configuration/views/webHistory/index" */
        `@configuration/views/webHistory/index`
      ),
      "webSync": () =>
      import(
        /* webpackChunkName: "configuration/views/webSync/index" */
        `@configuration/views/webSync/index`
      )
  },
  i18n: false
};
