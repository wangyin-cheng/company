<template>
  <div class="mainIndexPage"> 
    <div class="mainIndexContent" v-if="sysName === '操作员中心'" :style="{height: responsive + 'px'}">
      <bizIndex ></bizIndex>
    </div>
    <div class="img-responsiv" :style="{height: responsive + 'px'}" v-if="sysName != '操作员中心'">
      <div class="img-responsiv-wrapper" >
        <img v-if="logo" :src="'static/logo/' + logo + '-main.png'" alt="">
        <img v-else src="@frame/assets/main.png" alt="">
        <span class="test">{{$t('m.i.common.welcom') + ' ' + sysName}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import {on, off} from '@common/utils/commonUtil'
import bizIndex from '@frame/components/bizIndex.vue'
export default {
  name: 'mainIndex',
  components: { bizIndex },
  data () {
    return {
      // 系统名
      sysName: window.LOCAL_CONFIG.SYS_NAME,
      responsive: 0,
      logo: window.LOCAL_CONFIG.logo
    }
  },
  methods: {
    handleResize () {
      this.$nextTick(() => {
        let appObj = document.getElementsByClassName('app-main')
        let appOffsetTop = appObj.length === 0 ? 0 : appObj[0].offsetTop
        let noticeObj = document.getElementsByClassName('h-notice-bar')
        let noticeClientHeight = noticeObj.length === 0 ? 0 : noticeObj[0].clientHeight
        this.responsive = window.innerHeight - appOffsetTop - noticeClientHeight - 8
      })
    }
  },
  mounted () {
    this.handleResize()
    on(window, 'resize', this.handleResize)
  },
  activated () {
    this.handleResize()
    on(window, 'resize', this.handleResize)
  },
  deactivated () {
    off(window, 'resize', this.handleResize)
  },
  beforeDestroy () {
    off(window, 'resize', this.handleResize)
  }
}
</script>
