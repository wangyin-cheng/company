<template>
  <div class="h-top-search"
       :class="{'active':showMenu}"
       @click="openOptions"
       @focus="openOptions"
       @mouseleave="closeOptions">
    <h-icon name="search"></h-icon>
    <input class="search"
           autocomplete="off"
           tabindex="0"
           :id="id"
           :name="name"
           v-model="query"
           type="text"
           readonly
           onfocus="this.removeAttribute('readonly');" 
           onblur="this.setAttribute('readonly',true);"
           @input="searchText = $event.target.value"
           ref="input"
           @focus.prevent="openOptions"
           @keyup.esc="closeOptions"
           @blur="blurInput"
           @keydown.up="prevItem"
           @keydown.down="nextItem"
           @keydown.enter.prevent=""
           @keyup.enter.prevent="enterItem"
           @keydown.delete="deleteTextOrItem"
    />
    <!-- <div class="text"
         :class="textClass" :data-vss-custom-attr="searchTextCustomAttr">{{inputText}}
    </div> -->
    <transition name="slide-up">
      <div class="menu"
          ref="menu"
          @mousedown.prevent
          v-show="showMenu"
          tabindex="-1"
          key="index">
          <div v-if="filteredOptions.length<=0" class="find-noitem">没有匹配的项</div>
          <div v-else>
            <div v-for="(option, idx) in filteredOptions" :key="'a-'+idx">
              <div class="item" v-if="option.is_hidden==false || option.is_hidden == 'false'">
                  <span class="item-title"
                      :class="{'selected': option.selected, 'current': pointer === idx }"
                      @click.stop="selectItem(option)"
                      @mousedown="mousedownItem"
                      @mouseenter="pointerSet(idx)">
                    {{option.title}}
                  </span>
                  <span class="menuLeaf-star" :class="{'menuLeaf-coll':option.has_collect=='1'?true:false}" @click='collectMenu(option, option.search_id)'>
                    <h-icon name="u-a-xding"></h-icon>
                  </span>
              </div>
            </div>
          </div>
      </div>
    </transition>
  </div>
</template>

<script>
import common from './common'
import { baseMixin, commonMixin, optionAwareMixin } from './mixins'

export default {
  mixins: [baseMixin, commonMixin, optionAwareMixin],
  props: {
    selectedOption: {
      type: Object
    }
  },
  data () {
    return {
      showMenu: false,
      searchText: '',
      query: '',
      mousedownState: false, // mousedown on option menu
      pointer: -1
    }
  },
  watch: {
    selectedOption (newValue) {
      if (newValue && newValue.value) {
        this.pointer = this.filteredOptions.findIndex(option => {
          return option.value === newValue.value
        })
      } else {
        this.pointer = -1
      }
    }
  },
  computed: {
    searchTextCustomAttr () {
      if (this.selectedOption && this.selectedOption.value) {
        return this.customAttr(this.selectedOption)
      }
      return ''
    },
    // inputText () {
    //   if (this.searchText) {
    //     return ''
    //   } else {
    //     let text = this.placeholder
    //     if (this.selectedOption.title) {
    //       text = this.selectedOption.title
    //     }
    //     return text
    //   }
    // },
    filteredOptions () {
      if (this.searchText) {
        return this.options.filter((option) => {
          try {
            return this.filterPredicate(option.title, this.searchText)
          } catch (e) {
            return true
          }
        })
      } else {
        return this.options
      }
    }
  },
  methods: {
    collectMenu (box, id) {
      let status = box.has_collect
      let temp = status === '0' ? '1' : '0'
      let obj = {
        menuCode: box.id
      }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      if (temp === '1') {
        // 收藏菜单
        let url = '/insertUserMenuFavorite' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, obj).then(res => {
          if (res) {
            this.$hMessage.success({content:this.$t('m.i.common.collectMenuMsg_1'),duration: 3,closable: true});
            this.$store.dispatch('collectMenu', {'box': box, 'id': id})
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.collectMenuMsg_2'),duration: 3,closable: true});
          }
        }).catch(() => {
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
            this.$store.dispatch('collectMenu', {'box': box, 'id': id})
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.collectFailedMenuMsg_2'),duration: 3,closable: true});
          }
        }).catch(() => {
          this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
        })
      }
    },
    deleteTextOrItem () {
      if ((!this.searchText && this.selectedOption) || !this.query) {
        // this.selectItem({})
        this.openOptions()
      }
    },
    openOptions () {
      common.openOptions(this)
    },
    blurInput () {
      common.blurInput(this)
    },
    closeOptions () {
      common.closeOptions(this)
    },
    prevItem () {
      common.prevItem(this)
    },
    nextItem () {
      common.nextItem(this)
    },
    enterItem () {
      common.enterItem(this)
    },
    pointerSet (index) {
      common.pointerSet(this, index)
    },
    pointerAdjust () {
      common.pointerAdjust(this)
    },
    mousedownItem () {
      common.mousedownItem(this)
    },
    selectItem (option) {
      this.query = option.title
      this.searchText = '' // reset text when select item
      this.closeOptions()
      this.$emit('select', option)
    }
  }
}
</script>
<style scoped lang="scss">
</style>
