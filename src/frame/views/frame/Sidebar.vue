<template>
  <div class="h-sidebar-contain" ref="sidebarContain" :class="classObject" @mouseenter="sidebarFocus=true" @mouseleave="sidebarFocus=false">
    <div class="h-sidebar-menu">
      <div class="h-sidebar-menu-home" @click="handleHome" @mouseenter="hideTab(-1,{})">
        <div class="h-sidebar-menu-home-li" :class="{ 'home-active': homeAboard }">
          <div class="home-item">
            <router-link  to="/mainIndex">
              <h-icon class="li-first-i" name='u-a-home'></h-icon>
              <span class="li-span">{{$t('m.i.common.workSpace')}}</span>
            </router-link>
          </div>
        </div>
      </div>
      <div class="h-sidebar-menu-container" >
        <div @mouseleave="hideBlockTab(-1,{})">
          <ul v-for="(item,sIndex) in childRoute" :key="sIndex" :name="item.id">
            <!--只有二级菜单-->
            <div class="h-sidebar-menu-list" v-if="(!item.hasOwnProperty('is_hidden') || item.is_hidden==false || item.is_hidden == 'false') && (item.children == null || item.children.length === 0)">
              <li class="h-sidebar-menu-list-li"  :class="{ 'tab-hover':sIndex==clickItemIndex}" >
                <div class="list-item" @click="tabActived(sIndex,item.id)">
                  <div class="list-item-menu" @click='openThisMenu($event, item, sIndex)' @mouseenter="showTab(sIndex,item)">
                    <h-icon class="li-first-i" :name="item.icon || 'u-a-setting'"></h-icon>
                    <span class="li-span" :title="item.title" style="width:135px;">{{ item.title }}</span>
                    <h-icon class="li-last-i" name="xf-arrow-down-right"></h-icon>
                  </div>
                </div>
              </li>
            </div>
            <!--有二级以上菜单-->
            <div class="h-sidebar-menu-list" v-if="(!item.hasOwnProperty('is_hidden') || item.is_hidden==false || item.is_hidden == 'false') && (item && item.children && item.children.length > 0)" >
              <div :class="{ 'tab-active': item.isActived && collectTotal[item.id] && collectTotal[item.id].length>0 }">
                <li class="h-sidebar-menu-list-li"  :class="{ 'tab-hover':sIndex==clickItemIndex}" >
                  <div class="list-item">
                    <div class="list-item-menu" @mouseenter="showTab(sIndex,item)">
                      <h-icon class="li-first-i" :name="item.icon || 'u-a-setting'"></h-icon>
                      <span v-if="!item.isShow" class="li-span" @mouseenter="showTab(sIndex,item)" :key="sIndex" :title="item.title">{{ item.title }}</span>
                      <span v-else @click="hideTab(sIndex,item)" class="li-span" :key="sIndex+1" :title="item.title">{{ item.title }}</span>
                      <h-icon v-show="collectTotal[item.id] && collectTotal[item.id].length<=0" class="li-last-i" @mouseenter="showTab(sIndex,item)" name="xf-arrow-down-right"></h-icon>
                      <!-- <h-icon class="li-arrow-i" name="enter"></h-icon> -->
                      <span @click="tabActived(sIndex,item.id)">
                        <h-icon v-if="item.isActived && collectTotal[item.id] && collectTotal[item.id].length>0" class="li-last-i" name="packup"></h-icon>
                        <h-icon v-if="!item.isActived && collectTotal[item.id] && collectTotal[item.id].length>0" class="li-last-i" name="unfold"></h-icon>
                      </span>
                    </div>
                  </div>
                  <!--右侧菜单栏-->
                  <div class="list-tab">
                    <!-- <div class="list-tab-panel" v-bind:style="{top:(sIndex)*40+'px'}" :class="classes(item)"> -->
                    <div class="list-tab-panel" :class="classes(item)" :style="styles(sIndex,item.id,item)" @mouseleave="hideTab(sIndex,item)">
                      <div class="list-tab-container clearfix" >
                        <!--搜索栏-->
                        <div class="list-search" v-if="item.children && item.children.length>=4">
                          <h-input :placeholder="$t('m.i.common.searchTitle')" class="list-search"
                                    v-model="search"
                                    @on-enter="handleSearch(item)"
                                    @on-change="handleSearch(item)"
                                    ref = "treeSearch">
                                    <h-icon slot="prepend" name="u-a-search"></h-icon>
                          </h-input>
                        </div>
                        <!-- 没有搜索到内容 -->
                        <div class="list-noSearched" v-show="noSearched" :style="{height:firstMountMaxHeight[item.id]+'px'}">
                          <span class="list-noSearched-title">{{$t('m.i.common.menuSearchedMsg_1')}}{{search}}{{$t('m.i.common.menuSearchedMsg_2')}}</span>
                        </div>
                        <!--菜单-->
                        <div class="list-menu" v-show="!noSearched">
                          <!--菜单模块-->
                          <div class="list-container" :style="{maxHeight:firstMountMaxHeight[item.id]+'px'}">
                            <div class="list-box" :name="item.id + '-list-box'" :class="{'menu-search':search.length>0}" :style="{'column-count':columnsCount(item).counts}">
                              <li class="item" v-for="(subItem, subIndex) in item.children" :key="'b'+subItem.id" :class="{ 'more-fourth-menu-item': (!subItem.hasOwnProperty('is_hidden') || subItem.is_hidden==false || subItem.is_hidden == 'false') && !(subItem.children == null || subItem.children.length === 0),'menu-leaf-item': (!subItem.hasOwnProperty('is_hidden') || subItem.is_hidden==false || subItem.is_hidden == 'false') && ( item.children && (subIndex + 2) <= item.children.length && item.children[subIndex + 1].children !== null && item.children[subIndex + 1].children.length > 0)}">
                                <!--只有三级菜单-->
                                <template v-if="(!subItem.hasOwnProperty('is_hidden') || subItem.is_hidden==false || subItem.is_hidden == 'false') && (subItem.children == null || subItem.children.length === 0)">
                                  <div class="list-box-indent">
                                    <div class="menuLeaf" :class="{'h-menu-searched':subItem.searched}" :style="{'display':subItem.display}">
                                      <span class="menuLeaf-title" @click='openThisMenu($event, subItem, sIndex)' :title="subItem.title">{{subItem.title}}</span>
                                      <span class="menuLeaf-star" :class="{ 'menuLeaf-coll':subItem.has_collect=='1'?true:false}" @click='collectMenu(subItem, item.id)'>
                                        <h-icon name="menu-uncollect" size="12"></h-icon>
                                      </span>
                                    </div>
                                  </div>
                                </template>
                                <!--三级以上菜单-->
                                <template v-if="(!subItem.hasOwnProperty('is_hidden') || subItem.is_hidden==false || subItem.is_hidden == 'false') && (subItem && subItem.children && subItem.children.length > 0)">
                                  <div class="list-box-nest">
                                    <div class="list-box-nest-menu">
                                      <h4 style="width: 173px;" class="list-box-title" @click='openThisMenu($event, subItem, sIndex)' :id="subItem.id" :class="{'h-menu-searched':subItem.searched}" :style="{'display':subItem.display}" :title="subItem.title">{{subItem.title}}</h4>
                                      <span v-if="isSecondMenuCollect" class="list-box-star" :class="{ 'list-box-coll':(subItem.has_collect=='2'||subItem.has_collect=='1')?true:false}" @click='collectMenu(subItem, item.id)'>
                                        <h-icon name="menu-uncollect" size="12"></h-icon>
                                      </span>
                                    </div>
                                    
                                    <div class="list-box-menuLeaf" v-for="(box, index) in subItem.children" :key="'b'+box.id">
                                      <!--只有四级菜单-->
                                      <template  v-if="(!box.hasOwnProperty('is_hidden') || box.is_hidden==false || box.is_hidden == 'false') && (box.children==null || box.children.length === 0)">
                                        <div class="menuLeaf clearfix" :class="{'h-menu-searched': box.searched}" :style="{'display':box.display}">
                                          <span class="menuLeaf-title" @click='openThisMenu($event, box, sIndex)' :title="box.title">{{box.title}}</span>
                                          <span class="menuLeaf-star" :class="{ 'menuLeaf-coll':box.has_collect=='1'?true:false}" @click='collectMenu(box, item.id)'>
                                            <h-icon name="menu-uncollect" size="12"></h-icon>
                                          </span>
                                        </div>
                                      </template>
                                      <!--五级菜单-->
                                      <template v-else>
                                        <div class="list-box-direct" v-if="(!box.hasOwnProperty('is_hidden') || box.is_hidden==false || box.is_hidden == 'false')">
                                          <h4 class="list-box-direct-title" :class="{'h-menu-searched':box.searched}" :style="{'display':box.display}" :title="box.title">{{box.title}}</h4>
                                          <div class="list-box-direct-menu" v-for="nest in box.children" :key="nest.id">
                                            <div class="menuLeaf clearfix" :class="{'h-menu-searched':nest.searched}" :style="{'display':nest.display}" style="font-size: 10px;">
                                              <span class="menuLeaf-title" @click='openThisMenu($event, nest, sIndex)' :title="nest.title">{{nest.title}}</span>
                                              <span class="menuLeaf-star" :class="{ 'menuLeaf-coll':nest.has_collect=='1'?true:false}" @click='collectMenu(nest, item.id,item)'>
                                                <h-icon name="menu-uncollect" size="12"></h-icon>
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </template>
                                    </div>
                                  </div>
                                </template>
                              </li>
                            </div>
                          </div>
                          <!--右边锚点-->
                          <ul class="list-tab-anx" :class="'list-tab-anx-' + sIndex " :style="{maxHeight:firstMountMaxHeight[item.id]+'px'}" :ref="'list-tab-anx-' + sIndex">
                            <li class="list-tab-anx-item"  v-for="anchor in item.children "  v-if="(!anchor.hasOwnProperty('is_hidden') || anchor.is_hidden==false || anchor.is_hidden == 'false') && anchor.children && anchor.children.length>0" :key="anchor.id" :class="{'is-scroll':anchor.scrolled}" :style="{ 'display':anchor.display}">
                                <h4 @click='scrollToView($event, anchor, sIndex, item.children)' >{{anchor.title}}</h4>
                            </li>
                            <div class="tab-anx-icon" v-if="firstMountMaxHeight[item.id] < scrollViewHeight">
                              <div class="icon-style" :class="{'isDisable': scrollTop === 0}" @click="allowToscroll(false, sIndex)">
                                <i class="h-icon iconfont icon-triangle-up"></i>
                              </div>
                              <div class="icon-style" :class="{'isDisable': (firstMountMaxHeight[item.id]+ scrollTop === scrollViewHeight)}"  @click="allowToscroll(true, sIndex)">
                                <i class="h-icon iconfont icon-triangle-down"></i>
                              </div>
                            </div>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <collapse-transition>
                  <div class="h-sidebar-menu-list-coll" v-show="item.isActived">
                    <draggable v-model="collectTotal[item.id]" @start="drag=true" @end="dragOrder(item.id)">
                      <div
                        class="coll-item"
                        v-for="(coll,index) in collectTotal[item.id]"
                        :key="coll.id"
                        @mouseenter="showDragColl(index)"
                        @mouseleave="hideDragColl"
                        v-if="!coll.hasOwnProperty('is_hidden') || coll.is_hidden == false || coll.is_hidden == 'false'">
                        <router-link  :to="coll.url">
                          <span class="coll-item-title" :title="coll.title">{{coll.title}}</span>
                          <h-icon name="xf-move" class="h-drag-icon" v-show="index==dragItemIndex"></h-icon>
                        </router-link>
                      </div>
                    </draggable>
                  </div>
                </collapse-transition>
              </div>
            </div>
          </ul>
        </div>
      </div>
      <div class="h-sidebar-menu-expand" @mouseenter="hideTab(-1,{})">
        <div class="expandIcon" @click.prevent.stop="expandSiderbar">
          <!-- 展开 -->
          <h-icon name="u-a-menu"></h-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* mapGetters工具函数会将store中的getter映射到局部计算属性中 */
/* 使用对象扩展操作符把getter混入到computed中 */

import { mapGetters } from 'vuex'
// import SidebarItem from './SidebarItem'
import { deepClone } from '@common/utils/tools'
import { getChildData } from '@common/entry/getChildData'
import collapseTransition from '@frame/directives/collapse-transition'
import draggable from 'vuedraggable'

const prefixCls = 'list-tab-panel'

export default {
  data () {
    return {
      prefixCls: prefixCls,
      childRoute: [],
      search: '',
      searchText: '请输入关键词',
      notFoundText: '没有匹配页面',
      menusType: window.sessionStorage.getItem('menusType'),
      curMenu: '',
      isVertiSide: false,
      covertMenu: {},
      showOptions: false,
      // menusType: Cookies.get('menusType'),
      openMenu: [],
      value: '',
      tabActiveIndex: 0,
      collect: [],
      // collectTotal:{},
      collActived: {},
      noSearched: false,
      homeAboard: false,
      tabMaxHeight: 0,
      childRouteData: [],
      dragItemIndex: -1, // 菜单拖动项index,
      scrollTop: 0,  //sider滑块 右侧快速选项scrolltop
      scrollViewHeight: 0,  //  sider滑块 右侧快速选项可滚动的高度
      sidebarFocus: false,
      sidebarMenuScrollTop:0,
      isSecondMenuCollect:false,
      firstMountTop:{},
      firstMountMaxHeight:{}
    }
  },
  components: {
    collapseTransition,
    draggable // 菜单拖动
  },
  computed: {
    ...mapGetters([
      'activeIndex',
      'menusRoot',
      'menusNoRoot',
      'searchRoute',
      'sidebar',
      'hasOpened',
      'collectTotal',
      'token',
      'leafTotal',
      'clickItemIndex'
    ]),
    isCollapse () {
      return !this.sidebar.opened
    },
    path () {
      return this.$route.meta.id
    },
    isSidebarExpand () {
      return this.sidebar.opened
    },
    classObject () {
      return {
        'h-sidebar-focus': this.sidebarFocus == true,
        'h-sidebar-blur': this.sidebarFocus == false,
        'openedSidebar':!this.isCollapse
      }
    }
  },

  watch: {
    $route (to) {
      this.$nextTick(() => {
        this.curMenu = to.meta.id ? to.meta.id : ''
        this.openMenu = []
        this.openMenu = this.findUp(to.meta.id)
      })
    },
    activeIndex () {
      this.computChildRoute()
      this.handleMenuColl()
      this.firstMountTop = {}
      this.firstMountMaxHeight = {}
    },
    tabActiveIndex (val, old) {
      if (this.childRoute && this.childRoute.length - 1 >= old) {
        this.$set(this.childRoute[old], 'isActived', false)
      }
    },
    childRouteData: {
      handler (val, oval) {
        this.covertMenu = {}
        this.rebuildMenu(val)
        if (val && val.length > 0) {
          this.childRoute = []
          val.forEach((item, index) => {
            let newItem = deepClone(item)
            // if(oval!==val){
            //   newItem.isShow = false
            // }else{
            //   newItem.isShow = true
            // }
            if(this.clickItemIndex == -1){
              if(index == 0){
                newItem.isActived = true
              }
            }else{
              if (index == this.clickItemIndex) {
                newItem.isActived = true
              }
            }
            this.childRoute.push(newItem)
          })
        }
      },
      deep: true
    }
  },

  methods: {
    allowToscroll (bol, index) {
      let obj = this.$refs[`list-tab-anx-${index}`][0]
      let heightItem = 32
      var hScrollTop = obj.scrollTop // 对象已纵向滚动的距离
      this.scrollViewHeight = obj.scrollHeight // 对象可滚动的高度
      if (bol) {
        obj.scrollTop = hScrollTop + heightItem
      } else {
        obj.scrollTop = hScrollTop - heightItem
      }
      this.scrollTop = obj.scrollTop
    },
    // 鼠标经过菜单显示隐藏可拖动按钮
    showDragColl (index) {
      this.dragItemIndex = index
    },
    hideDragColl () {
      this.dragItemIndex = -1
    },
    // 菜单收藏排序
    dragOrder (id) {
      this.drag = false
      let menuList = []
      if (this.collectTotal) {
        let collectList = this.collectTotal[id]
        collectList.forEach((item, index) => {
          let menu_code = item.id
          let order_no = index + 1
          menuList.push({'menu_code': menu_code, 'order_no': order_no})
        })
      }
      let param = { 'menu_list': JSON.stringify(menuList) }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/sortMenuFavoriteByUserId' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
      }
      this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, param).then(res => {
        if (res) {
          this.$hMessage.success({content:this.$t('m.i.common.orderMenuMsg_1'),duration: 3,closable: true});
        } else {
          this.$hMessage.error({content:this.$t('m.i.common.orderMenuMsg_2'),duration: 3,closable: true});
        }
      })
    },
    columnsCount(item){
      let count = 1
      let floor = this.getMaxFloor(item.children)
      let real = 1
      if(item && item.children){
        real = floor === 1 ? 1 : item.children.length        
        item.children.forEach(x => {
          if(x.is_hidden && x.is_hidden+''=='true'){
            real -= 1
          }
        })
        count = real < 4 ? real : 3
      }
      return {
        counts: count < 1 ? 1 : count,
        maxFloor : floor,
        realCount : real
      }
    },
    classes (item) {
      let temp = this.columnsCount(item)
      let realCountTemp = temp.realCount
      let maxFloorTemp = temp.maxFloor
      return [
        {
          [`${item.id}`]: true,
          [`${prefixCls}-third-col1`]: item.children && maxFloorTemp === 1,
          [`${prefixCls}-fourth-col1`]: item.children && realCountTemp == 1 && maxFloorTemp === 2,
          [`${prefixCls}-fourth-col2`]: item.children && realCountTemp == 2 && maxFloorTemp === 2,
          [`${prefixCls}-fourth-col3`]: item.children && realCountTemp > 2 && realCountTemp < 4 && maxFloorTemp === 2,
          [`${prefixCls}-fifth-col1`]: item.children && realCountTemp == 1 && maxFloorTemp === 3,
          [`${prefixCls}-fifth-col2`]: item.children && realCountTemp == 2 && maxFloorTemp === 3,
          [`${prefixCls}-fifth-col3`]: item.children && realCountTemp > 2 && realCountTemp < 4 && maxFloorTemp === 3,
        }
      ]
    },
    styles (sIndex, id, item) {
      return {
        'top': this.computeTop(sIndex, id, item)
      }
    },
    computeTop (sIndex, id, item) {
      if(this.clickItemIndex == sIndex && !this.firstMountTop[id] && !this.firstMountMaxHeight[id]){
        let dom = document.getElementsByClassName(id)
        let tabNode = document.getElementsByName(id)
        let menuOffsetTop = 0 //左側菜單的總高度
        let topbarOffsetTop = 0 //節點到topbar的距離
        let top = 0 //面板到頂部距離
        let listId = id + '-list-box'
        let box = document.getElementsByName(listId)
        let hasSearchBox = (item && item.children && item.children.length>=4) ? true : false
        if (dom && dom.length > 0 && tabNode && tabNode.length > 0) {
          menuOffsetTop = tabNode[0].offsetTop
          topbarOffsetTop = menuOffsetTop - this.sidebarMenuScrollTop
          if ((dom[0].clientHeight + menuOffsetTop) > window.innerHeight) {//面板超出瀏覽器剩餘高度
            if(topbarOffsetTop > dom[0].clientHeight){ //面板高度小於上面高度，將面板放置在至上
              top = topbarOffsetTop - dom[0].clientHeight + 40
            }else{ //如果面板的高度超出了上方高度
              if(dom[0].clientHeight < window.innerHeight - 50){
                top = 32
              }else{
                top = 32
              }
            }
          } else { //面板高度未超出瀏覽器高度
            top = menuOffsetTop - this.sidebarMenuScrollTop
          }
          top = top < 0 ? 0 : top
        }
        // this.tabMaxHeight = window.innerHeight - top - 115 - (hasSearchBox ? 70 : 0)
        if(!this.firstMountTop[id]){
          this.firstMountTop[id] = top
        }
        if(!this.firstMountMaxHeight[id]){
          let maxHeight = window.innerHeight - top - 115 - (hasSearchBox ? 70 : 0)
          this.firstMountMaxHeight[id] =  maxHeight > 50 ? maxHeight : 50
        }
        return top + 'px'
      }else{
        return this.firstMountTop[id] + 'px'
      }
      
    },
    getMaxFloor (treeData) {
      let floor = 0
      let v = this
      let max = 0
      function each (data, floor) {
        data.forEach(e => {
          e.floor = floor
          if (floor > max) {
            max = floor
          }
          if (e.is_hidden + '' != 'true' && e.children && e.children.length > 0) {
            each(e.children, floor + 1)
          }
        })
      }
      each(treeData, 1)
      return max
    },
    scrollToView (event, item, sIndex, menuItem) {
      let node = document.getElementById(item.id);
      node.scrollIntoView();
      menuItem.forEach( (i, idx) => {
        if (i.id == item.id) {
          this.$set(i, 'scrolled', true)
        } else {
          this.$set(i, 'scrolled', false)
        }
      })
    },
    handleHome () {
      if (this.childRoute[this.tabActiveIndex]) {
        this.$set(this.childRoute[this.tabActiveIndex], 'isActived', false)
      }
      this.homeAboard = !this.homeAboard
    },
    handleSearch (param) {
      let keyCounter = 0
      let flatTree = []
      let data = []
      function flattenChildren (node) {
        node.nodeKey = keyCounter++
        flatTree[node.nodeKey] = node
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => flattenChildren(child))
        }
        return flatTree
      }
      data = flattenChildren(param)
      data.forEach(item => {
        if (this.search != '' && item.title.indexOf(this.search) >= 0) {
          this.$set(item, 'searched', true)
          this.$set(item, 'display', 'inline-block')
        } else if (this.search != '' && item.title.indexOf(this.search) == -1) {
          this.$set(item, 'searched', false)
          this.$set(item, 'display', 'none')
        } else {
          this.$set(item, 'searched', false)
          this.$set(item, 'display', 'inline-block')
        }
      })
      this.$nextTick(() => {
        let dom = document.getElementsByClassName('h-menu-searched')
        if (this.search.length > 0) {
          if (dom.length == 0) {
            this.noSearched = true
          } else {
            this.noSearched = false
          }
        } else {
          this.noSearched = false
        }
      })
    },
    compileFlatState (data) {
      let obj = {}
      let keyCounter = 0
      let flatTree = []
      function flattenChildren (node, flatTree) {
        if (node.has_collect == '1') {
          node.nodeKey = keyCounter++
          flatTree[node.nodeKey] = node
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => flattenChildren(child, flatTree))
        }
      }
      flattenChildren(data, flatTree)
      if (flatTree && flatTree.length > 0) {
        for (let j = 0; j < flatTree.length - 1; j++) {
          for (let i = 0; i < flatTree.length - 1; i++) {
            if (parseInt(flatTree[i].collect_order_no) > parseInt(flatTree[i + 1].collect_order_no)) {
              let temp = flatTree[i]
              flatTree[i] = flatTree[i + 1]
              flatTree[i + 1] = temp
            }
          }
        }
      }
      return flatTree
    },
    // 左侧菜单栏生成收藏菜单对象
    handleMenuColl () {
      let child = []
      let isMergeMenu = window.LOCAL_CONFIG.isMergeMenu + ''
      if(this.menusRoot.length == 0) return
      // isMergeMenu为true时合并菜单
      if (isMergeMenu == 'true') {
        child = this.menusRoot
      } else {
        //所有子系统的二级菜单合并
        // this.menusRoot.map((item,index) => {
        //   child = child.concat(item.children)
        // })
        //优化为只合并第一个子系统的二级菜单，activeIndex变化时，加载对应的子系统二级菜单
        child = this.menusRoot[this.activeIndex].children
      }
      let initData = {}
      if(child){
        child.forEach(rootNode => {
          if (rootNode && rootNode.children && rootNode.children.length > 0) {
            initData[rootNode.id] = this.compileFlatState(rootNode)
          }
        })
        this.$store.dispatch('initCollectMenu', deepClone(initData))
      }
      // let temp = window.LOCAL_CONFIG.temp
      // this.$store.dispatch('initCollectMenu', deepClone(temp))
    },
    // 菜单收藏
    collectMenu (box, id) {
      let status = box.has_collect
      //是否有子菜单
      let hasChildren = "false" 
      if(box && box.children && box.children.length>0){
        hasChildren = "true"
      }
      let temp = status == '0' ? '1' : '0'
      let obj = {
        menuCode: box.id,
        hasChildren: hasChildren
      }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      if (temp == '1') {
        // 收藏菜单
        let url = '/insertUserMenuFavorite' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, obj).then(res => {
          if (res) {
            this.$hMessage.success({content:this.$t('m.i.common.collectMenuMsg_1'),duration: 3,closable: true});
            //是否有子菜单
            if(hasChildren == "true"){
              box.has_collect = '2' 
              //改变上级菜单状态，例如：用户管理
              if (this.childRouteData && this.childRouteData.length > 0) {
                  this.childRouteData[this.activeIndex].children.forEach((subMenuItem, subIndex) => {
                    if(subMenuItem.id==box.id){
                      subMenuItem.has_collect = '2'
                    }
                  })
              }
              //刷新收藏改变所有子菜单
              if(box && box.children && box.children.length>0){
                box.children.forEach(bItem => {
                  if(bItem.has_collect!="1"){
                    this.$store.dispatch('collectMenu', {'box': bItem, 'id': id})
                  }
                })
              }
            }else{
              this.$store.dispatch('collectMenu', {'box': box, 'id': id})
            }
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.collectMenuMsg_2'),duration: 3,closable: true});
          }
        }).catch(error => {
          this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
        })
      } else {
        // 取消菜单收藏
        let cancelurl = '/deleteByMenuCodeAndUserId' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          cancelurl = cancelurl.toLowerCase()
        }
        this.$http.post(window.LOCAL_CONFIG.OMC_GSV + cancelurl, obj).then(res => {
          if (res) {
            this.$hMessage.success({content:this.$t('m.i.common.collectFailedMenuMsg_1'),duration: 3,closable: true});
            //是否有子菜单
            if(hasChildren == "true"){
              box.has_collect = '0' 
              //改变上级菜单状态，例如：用户管理
              if (this.childRouteData && this.childRouteData.length > 0) {
                  this.childRouteData[this.activeIndex].children.forEach((subMenuItem, subIndex) => {
                    if(subMenuItem.id==box.id){
                      subMenuItem.has_collect = '0'
                    }
                  })
              }
              //刷新收藏改变所有子菜单
              if(box && box.children && box.children.length>0){
                box.children.forEach(bItem => {
                  if(bItem.has_collect!="0"){
                    this.$store.dispatch('collectMenu', {'box': bItem, 'id': id})
                  }
                })
              }
            }else{
              this.$store.dispatch('collectMenu', {'box': box, 'id': id})
              //改变上级菜单状态，例如：用户管理
              if (this.childRouteData && this.childRouteData.length > 0) {
                  this.childRouteData[this.activeIndex].children.forEach((subMenuItem, subIndex) => {
                    if(subMenuItem.id==box.parent_code){
                      subMenuItem.has_collect = '0'
                    }
                  })
              }
            }
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.collectFailedMenuMsg_2'),duration: 3,closable: true});
          }
        }).catch(error => {
          this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
        })
      }
    },
    tabActived (index, id) {
      this.firstMountTop = {}
      this.firstMountMaxHeight = {}
      this.tabActiveIndex = index
      let status = this.childRoute[index].isActived
      this.$set(this.childRoute[index], 'isActived', !status)
      // this.collect = this.collectTotal[id]
      this.homeAboard = false
      // 合并菜单时，通过切换菜单栏，进行加载不同的子系统模块
      if (window.LOCAL_CONFIG.isMergeMenu) {
        if (!this.hasOpened) {
          getChildData(this.menusRoot[index].id).then((res) => {
            let data = {
              menu: [this.menusRoot[index]],
              asyncRouterMap: res.router
            }
            this.$store.dispatch('GenerateRoutesByMenus', data).then(() => {
              this.$router.addRoutes(this.$store.getters.addRouters)
            })
          })
        }
      }
    },
    showTab (index,item) {
      if(item && item.children && item.children.length>0 && item.hasOwnProperty('is_hidden')){
        if(item.children.every(x => x.is_hidden + '' == 'true')){
          return false
        }
      }
      if(this.$refs[`list-tab-anx-${index}`]){
        //点击二级菜单 判断右侧栏是否出现滚动条  出现滚动条 显示按钮
        let obj = this.$refs[`list-tab-anx-${index}`][0]
        this.scrollViewHeight = obj.scrollHeight; // 对象可滚动的高度
        this.scrollTop = obj.scrollTop;
        this.$store.dispatch('changeItemIndex', index)
      }else{
        this.$store.dispatch('changeItemIndex', -1)
      }
    },
    hideTab (index, item) {
      // if(event.relatedTarget != null) {
      // doSomeThing()
      // this.$set(this.childRoute[index], 'isShow', false)
      this.$store.dispatch('changeItemIndex', -1)
      // tab隐藏时清空搜索条件
      this.search = ''
      if (item) {
        this.handleSearch(item)
      }
      // }
    },
    hideBlockTab(idx, item){
      let container = document.getElementsByClassName('h-sidebar-menu-container')[0];   // 获取滚动条的dom
      if(container.scrollHeight == (window.innerHeight - 130)){
        this.hideTab(idx,item)
      }
    },
    expandSiderbar () {
      this.$store.dispatch('ToggleSidebar')
    },
    openThisMenu ($event, box, sIndex) {
      if (this.$router.history.current.path === box.url) {
        return
      }
      if (!box.url) {
        return
      }
      this.$router.push({path: box.url})
      this.childRoute[sIndex].isShow = false
      this.hideTab('', null)
    },
    computChildRoute () {
      if (this.menusType && this.menusType == '1' && this.menusRoot.length > 0) { // 多个子系统
        let isMergeMenu = window.LOCAL_CONFIG.isMergeMenu + ''
        // isMergeMenu为true时合并菜单
        if (isMergeMenu == 'true') {
          let tempRoute = []
          this.menusRoot.forEach(item => {
            tempRoute = tempRoute.concat(item)
          })
          this.childRouteData = tempRoute
        } else {
          // 不合并菜单
          this.childRouteData = this.menusRoot[this.activeIndex].children
        }
      } else { // 单个系统
        this.childRouteData = this.menusNoRoot
      }
      // if (this.childRoute && this.childRoute.length > 0) {
      //   this.childRoute.forEach((item, index) => {
      //     this.$set(this.childRouteObj, index, {
      //       id: item.id,
      //       title: item.title,
      //       isShow: false,
      //       isActived: false
      //     })
      //   })
      // }
    },
    rebuildMenu (menus) {
      if (menus && menus.length > 0) {
        for (let menu of menus) {
          this.covertMenu[menu.id] = menu.parent_id
          if (menu.children && menu.children.length > 0) this.rebuildMenu(menu.children)
        }
      }
    },
    findUp (id) {
      let openid = this.covertMenu[id]
      let openMenu = []
      while (openid) {
        openMenu.push(openid)
        openid = this.covertMenu[openid]
      }
      return openMenu
    }
  },
  mounted() {
    this.$nextTick(() => {
　　　// 进入nexTick
      let container = document.getElementsByClassName('h-sidebar-menu-container')[0];   // 获取滚动条的dom
      container.addEventListener('scroll',()=>{
        this.sidebarMenuScrollTop = container.scrollTop
        this.firstMountTop = {}
        this.firstMountMaxHeight = {}
      })
    })
  },
  created () {
    //是否支持上级菜单收藏
    let isSecondMenuCollect = window.LOCAL_CONFIG.isSecondMenuCollect + "";
    if (isSecondMenuCollect == "true") {
      this.isSecondMenuCollect = true;
    }
    this.computChildRoute()
    document.addEventListener('click', (e) => {
      if (this.$refs.sidebarContain && !this.$refs.sidebarContain.contains(e.target)) {
        this.$store.dispatch('changeItemIndex', -1)
      }
    })
    if (this.childRoute && this.childRoute.length > 0) this.openMenu = [this.childRoute[0].id]
    // 兼容IE中路由无法跳转问题
    let that = this
    if ('-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style) {
      // detect it's IE11
      window.addEventListener('hashchange', function (event) {
        var currentPath = window.location.hash.slice(1)
        if (that.$route.path !== currentPath) {
          that.$router.push(currentPath)
        }
      }, false)
    }
    // 生成收藏菜单
    this.handleMenuColl()
  }
}
</script>
