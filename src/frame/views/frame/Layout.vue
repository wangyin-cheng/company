<template>
	<div class="app-wrapper" >
    <!-- 页面顶部 -->
    <div class="h-topbar-wrapper">
      <topbar></topbar>
    </div>
    <div class="main-wrapper" :class="{hideSidebar : !sidebar.opened}">
      <!-- 侧边栏 -->
      <sidebar class="h-sidebar-wrapper"></sidebar>  
      <!-- 中间区域 -->
      <div class="main-container" :style="{height: responsive + 'px'}">
        <!-- 面包屑导航栏 -->
        <navbar></navbar>
        <!-- 内容 -->
        <app-main ref="appMain"></app-main>
        <!--公告-->
        <noticebar v-if="isShowNoticeBar"></noticebar>
		  </div>
    </div>
	</div>
</template>
<script>
  import { Navbar, Sidebar, AppMain, Topbar, Noticebar } from './index'
  import { mapGetters } from 'vuex'
  import { on, off } from '@common/utils/commonUtil'
  export default {
    name: 'layout',
    components: {
      Navbar,
      Sidebar,
      AppMain,
      Topbar,
      Noticebar
    },
    computed: {
      sidebar () {
        return this.$store.state.app.sidebar
      },
      ...mapGetters([
        'activeIndex'
      ])
    },
    data(){
      return {
        isShowNoticeBar:false,
        responsive: 0
      }
    },
    methods: {
      handleResize () {
        this.$nextTick(() => {
          let appObj = this.$refs.appMain.$el
          let appOffsetTop = appObj.offsetTop
          let noticeObj = document.getElementsByClassName("h-notice-bar")
          let noticeClientHeight = noticeObj.length == 0 ? 0 : noticeObj[0].clientHeight
          this.responsive = window.innerHeight - appOffsetTop - noticeClientHeight + 8
        })
      },
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
    },
    created(){
      let noticeBar = window.LOCAL_CONFIG.isShowNoticeBar + "";
      if (noticeBar == "true") {
        this.isShowNoticeBar  = true
      }
    }
  }
</script>

<style scoped>
.h-sidebar-wrapper {
  position: fixed;
  left: 0;
  top: 50px;
  bottom: 0;
  z-index: 990;
}
</style>