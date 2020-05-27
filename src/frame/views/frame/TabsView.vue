<template>
  <div class="tabs-view-container" ref="scrollCon" @DOMMouseScroll.prevent.stop="handlescroll" @mousewheel.prevent.stop="handlescroll">
    <div class="tags-inner-scroll-left" @click="handleLeft">
      <h-icon name="u-a-left" size='17' color="#999999"></h-icon>
    </div>
    <div ref="scrollBody" class="tags-inner-scroll-body" :style="{left: tagBodyLeft + 'px'}">
      <!-- <transition-group name="taglist-moving-animation"> -->
      <router-link class="tabs-view" v-for="(tag, index) in Array.from(visitedViews)" :to="{path: tag.path, query: tag.query}" :key="tag.id" :style="{left: tagBodyLeft + 'px'}">
          <h-tag closable :name="tag.name" :color="isActive(tag.path)? 'active' : 'default'" @on-close ='closeViewTabs($event, tag, index)' @click.right.native.stop.prevent="closeChoice($event, tag, index)" ref="tagsPageOpened">
            {{tag.name}}
          </h-tag>
      </router-link>
      <!-- </transition-group> -->
    </div>
    <div class="tags-inner-scroll-right" @click="handleRight">
      <h-icon name="u-a-right" size='17' color="#999999"></h-icon>
    </div>
    <ul class="h-tag-close-tip" :style="styles" v-clickoutside="handleHide">
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseCurrent()">
        <span>{{$t('m.i.navBar.closeCurTab')}}</span>
      </li>
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseAll()">
        <span>{{$t('m.i.navBar.closeAllTabs')}}</span>
      </li>
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseOther()">
        <span>{{$t('m.i.navBar.closeOtherTabs')}}</span>
      </li>
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleRefresh()" v-if="LOCAL_CONFIG.isRefresh">
        <span>{{$t('m.i.navBar.refreshCurTab')}}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import HTag from '@frame/components/HTag'
export default {
  data () {
    return {
      menusType: window.sessionStorage.getItem('menusType'),
      limit: this.LOCAL_CONFIG.TABS_VIEW_LIMIT,
      styles: {},
      curTag: {},
      sideWidth: 0,
      topHeight: 0,
      tagBodyLeft: 0,
      refsTag: []
    }
  },
  components: {
    HTag
  },
  watch: {
    $route (to) {
      this.addViews()
      this.$nextTick(() => {
        this.refsTag.forEach((item, index) => {
          if (to.name === item.name) {
            let tag = this.refsTag[index].$el
            this.moveToView(tag)
          }
        })
      })
    }
  },
  computed: {
    visitedViews () {
      let arr = this.$store.state.app.visitedViews.slice(1 - this.limit)
      if (arr[0].id !== 'mainIndex') {
        arr.unshift(this.$store.state.app.visitedViews[0])
      }
      return arr
    },
    ...mapGetters([
      'rootPath',
      'activeIndex',
      'menusRoot',
      'menusNoRoot'
    ])
  },
  methods: {
    handleLeft () {
      let curIndex = this.visitedViews.findIndex(x => x.id === this.$route.meta.id)
      if (curIndex >= 1) {
        this.$router.push(this.visitedViews[curIndex - 1].path)
      }
    },
    handleRight () {
      let curIndex = this.visitedViews.findIndex(x => x.id === this.$route.meta.id)
      if (curIndex < this.visitedViews.length - 1) {
        this.$router.push(this.visitedViews[curIndex + 1].path)
      }
    },
    handleHide () {
      this.styles = {}
      this.curTag = {}
    },
    closeViewTabs ($event, view, index) {
      const onOk = () => {
        // 首页不可被关闭
        this.$store.dispatch('delCurVisitedViews', view)
        const routers = this.$store.state.permission.routers
        const viewId = view.id
        let route = routers.find(r => r.meta.id === viewId)
        if (route && route.meta && route.meta.comName && route.meta.isKeepAlive) {
          this.$store.commit('DEL_KEEP_ALIVE', route.meta.comName)
        }
        $event.preventDefault()
        if (this.isActive(view.path)) { // 关闭当前打开页面
          if (index > 0 && this.visitedViews.length < index + 1) { // 关闭最后一个标签
            let newPath = this.visitedViews[index - 1].path
            let newQuery = this.visitedViews[index - 1].query
            this.$router.push({path: newPath, query: newQuery})
          } else if (index > 0) {
            let newPath = this.visitedViews[index].path
            let newQuery = this.visitedViews[index].query
            this.$router.push({path: newPath, query: newQuery})
          }
        } else { // 关闭非当前页面，直接关闭

        }
      }

      const { CONFIRM_ON_TAB_CLOSE } = LOCAL_CONFIG;

      if( CONFIRM_ON_TAB_CLOSE ) {
        this.$hMsgBox.confirm({
          title: "确定要关闭吗？",
          onOk
        })
      } else {
        onOk()
      }
    },
    addViews () {
      if (this.menusType && this.menusType == '1') {
        this.toggleSidebarm()
      }
      this.$store.dispatch('addVisitedViews', this.$route)
      if (this.$route.meta.isKeepAlive && this.$route.meta.comName) {
        this.$store.dispatch('addRouteKeepAlive', this.$route.meta.comName)
      }
    },
    closeChoice ($event, view, index) {
      if (index > 0) {
        this.styles = {
          display: 'block',
          top: `${$event.clientY}px`,
          left: `${$event.clientX}px`,
          height: '132px'
        }
        this.curTag = {
          event: $event,
          view: view,
          index: index
        }
      }
    },
    handleCloseCurrent () {
      this.closeViewTabs(this.curTag.event, this.curTag.view, this.curTag.index)
      this.styles = {}
      this.curTag = {}
    },
    handleCloseAll () {
      this.$store.dispatch('delAllVisitedViews', this.curTag.view)
      if (this.LOCAL_CONFIG.isRefresh) {
        this.$store.dispatch('delAllKeepAlive')
      }
      // 跳转至首页
      let newPath = this.visitedViews[0].path
      this.$router.push({path: newPath})
      this.styles = {}
      this.curTag = {}
    },
    handleCloseOther () {
      this.$store.dispatch('delOtherVisitedViews', this.curTag.view)
      if (this.LOCAL_CONFIG.isRefresh) {
        if (this.$route.meta.isKeepAlive && this.$route.meta.comName) {
          this.$store.dispatch('delOtherKeepAlive', this.$route.meta.comName)
        }
      }
      // 当前页面非激活时，激活
      if (!this.isActive(this.curTag.view.path)) {
        this.$router.push({path: this.curTag.view.path})
      }
      this.styles = {}
    },
    toggleSidebarm () {
      if (this.$route.meta.rootId != this.menusRoot[this.activeIndex].id) {
        for (let [key, value] of this.menusRoot.entries()) {
          if (this.$route.meta.rootId === value.id) {
            this.$store.dispatch('ActiveRootIndex', key)
            return
          }
        }
      }
    },
    isActive (path) {
      return path === this.$route.path
    },
    handlescroll (e) {
      var type = e.type
      let delta = 0
      if (type === 'DOMMouseScroll' || type === 'mousewheel') {
        delta = (e.wheelDelta) ? e.wheelDelta : -(e.detail || 0) * 40
      }
      let left = 0
      if (delta > 0) {
        left = Math.min(0, this.tagBodyLeft + delta)
      } else {
        if (this.$refs.scrollCon.offsetWidth < this.$refs.scrollBody.offsetWidth) {
          if (this.tagBodyLeft < -(this.$refs.scrollBody.offsetWidth - this.$refs.scrollCon.offsetWidth)) {
            left = this.tagBodyLeft
          } else {
            left = Math.max(this.tagBodyLeft + delta, this.$refs.scrollCon.offsetWidth - this.$refs.scrollBody.offsetWidth)
          }
        } else {
          this.tagBodyLeft = 0
        }
      }
      this.tagBodyLeft = left
    },
    moveToView (tag) {
      if (tag.offsetLeft < -this.tagBodyLeft) {
        // 标签在可视区域左侧
        this.tagBodyLeft = -tag.offsetLeft + 10
      } else if (tag.offsetLeft + 10 > -this.tagBodyLeft && tag.offsetLeft + tag.offsetWidth < -this.tagBodyLeft + this.$refs.scrollCon.offsetWidth) {
        // 标签在可视区域
        this.tagBodyLeft = Math.min(0, this.$refs.scrollCon.offsetWidth - tag.offsetWidth - tag.offsetLeft - 20)
      } else {
        // 标签在可视区域右侧
        this.$nextTick(() => {
          let totalWidth = 0
          this.$refs.tagsPageOpened.forEach(item => {
            totalWidth += item.$el.offsetWidth
          })
          if (totalWidth < (window.innerWidth - 200 - 34)) {
            this.tagBodyLeft = 0
          } else {
            // this.tagBodyLeft = -(tag.offsetLeft - (this.$refs.scrollCon.offsetWidth - tag.offsetWidth) + 20);
            this.tagBodyLeft = -(totalWidth - (window.innerWidth - 200 - 34)) - 12
          }
        })
      }
    },
    handleRefresh () {
      this.styles = {}
      this.$nextTick(() => {
        setTimeout(() => {
          this.refresh()
        }, 0)
      })
      // this.$destroy() // destroy后 不能缓存了
    },
    refresh () {
      if (this.$route.meta.isKeepAlive && this.$route.meta.comName) {
        // this.$route.meta.isKeepAlive = false
        this.$store.dispatch('refreshCurPage', this.$route.meta.comName)
        this.$nextTick(() => {
          // this.$route.meta.isKeepAlive = true
          this.$store.dispatch('addRouteKeepAlive', this.$route.meta.comName)
        })
      }
    }
  },
  created () {
    this.addViews()
  },
  mounted () {
    // 右击阻止原生浏览器事件
    document.getElementsByClassName('tabs-view-container')[0].oncontextmenu = function (e) {
      return false
    }
    this.refsTag = this.$refs.tagsPageOpened
    setTimeout(() => {
      this.refsTag.forEach((item, index) => {
        if (this.$route.name === item.name) {
          let tag = this.refsTag[index].$el
          this.moveToView(tag)
        }
      })
    }, 1) // 这里不设定时器就会有偏移bug
  },
  destoryed () {
    this.styles = {}
  }
}
</script>
