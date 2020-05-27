<template>
  <!-- <collapse-transition> -->
  <!-- <ul :class="classes" v-show="visible"> -->
  <!-- <ul :class="classes"> -->
  <li v-show="canShow">
    <div :class="`${prefixCls}-item`"
         tabindex="-1"
         @keydown="handleKeydown">
      <span :class="arrowClasses"
            @click="handleExpand">
        <Icon v-if="showArrow"
              name="ios-arrow-right"></Icon>
        <Icon v-if="showLoading"
              name="load-c"
              class="h-load-loop"></Icon>
      </span>
      <h-checkbox v-if="showCheckbox"
                  :value="data.checked"
                  :indeterminate="data.indeterminate"
                  :disabled="data.disabled || data.disableCheckbox"
                  @click.native.stop
                  @on-change="handleCheck"
                  ></h-checkbox>
      <Render v-if="data.render"
              :render="data.render"
              :data="data"
              :node="node"></Render>
      <Render v-else-if="isParentRender"
              :render="parentRender"
              :data="data"
              :node="node"></Render>
      <span v-else
            :class="titleClasses"
            @click="handleSelect"
            @mouseover="handeMouseover"
            @contextmenu.prevent.stop="handleRightClick($event)">{{data.title}}</span>
    </div>
    <ul :class="classes"
        ref="children"
        v-if="childrenShow">
      <Tree-node v-if="data.expand && data.expand!='false' && (!data.leaf||data.leaf=='false')"
                 v-for="(item,i) in data.children"
                 :key="i"
                 :data="item"
                 :multiple="multiple"
                 :checkStrictly="checkStrictly"
                 :selectToCheck="selectToCheck"
                 :showIndeterminate="showIndeterminate"
                 :show-checkbox="showCheckbox">
      </Tree-node>
    </ul>
  </li>
  <!-- </ul> -->
  <!-- </collapse-transition> -->
</template>
<script>
import Checkbox from '../Checkbox/Checkbox.vue'
import Icon from '../Icon/Icon.vue'
import Render from './render'
import CollapseTransition from '../Notice/collapse-transition'
import Emitter from '../../mixins/emitter'
import { findComponentsUpward, findComponentsDownward } from '../../util/tools'

const prefixCls = 'h-tree'

export default {
  name: 'TreeNode',
  mixins: [Emitter],
  components: { Checkbox, Icon, CollapseTransition, Render },
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean
    },
    showIndeterminate: {
      type: Boolean
    },
    selectToCheck: Boolean,
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      prefixCls: prefixCls,
      indeterminate: false,
      childrenShow:
        this.data.expand &&
        this.data.expand != 'false' &&
        (!this.data.leaf || this.data.leaf == 'false'),
      iconShow: this.data.expand && this.data.expand != 'false'
    }
  },
  computed: {
    canShow() {
      return !this.data.hidden
    },
    classes() {
      return [`${prefixCls}-children`]
    },
    selectedCls() {
      return [
        {
          [`${prefixCls}-node-selected`]: this.data.selected
        }
      ]
    },
    arrowClasses() {
      return [
        `${prefixCls}-arrow`,
        {
          [`${prefixCls}-arrow-open`]: this.iconShow
          // [`${prefixCls}-arrow-hidden`]: !(this.data.children && this.data.children.length)
        }
      ]
    },
    titleClasses() {
      return [
        `${prefixCls}-title`,
        {
          [`${prefixCls}-title-selected`]:
            this.data.selected || (this.selectToCheck && this.data.checked),
          [`${prefixCls}-title-filterable`]: this.data.filterable,
          [`${prefixCls}-title-focus`]: this.data.focus,
          [`${prefixCls}-title-parent`]: this.showArrow
        }
      ]
    },
    showArrow() {
      // 添加leaf子节点属性--fof系统（数据库存在loading字段，无论loading为true或false,均会被渲染成父节点）
      //fof系统： children.length == 0 && leaf == false时，显示arrow标识
      return (
        (this.data.children &&
          this.data.children.length >= 0 &&
          (!this.data.leaf || this.data.leaf == 'false')) ||
        ('loading' in this.data &&
          (!this.data.loading || this.data.loading == 'false') &&
          (!this.data.leaf || this.data == 'false'))
      )
    },
    showLoading() {
      // 添加leaf子节点属性--fof系统（数据库存在loading字段，无论loading为true或false,均会被渲染成父节点）
      return (
        'loading' in this.data &&
        this.data.loading &&
        (!this.data.leaf || this.data.leaf == 'false') &&
        this.data.loading != 'false'
      )
    },
    isParentRender() {
      const Tree = findComponentsUpward(this, 'Tree')
      return Tree && Tree.render
    },
    parentRender() {
      const Tree = findComponentsUpward(this, 'Tree')
      if (Tree && Tree.render) {
        return Tree.render
      } else {
        return null
      }
    },
    node() {
      const Tree = findComponentsUpward(this, 'Tree')
      if (Tree) {
        // 将所有的 node（即flatState）和当前 node 都传递
        return [
          Tree.flatState,
          Tree.flatState.find(item => item.nodeKey === this.data.nodeKey)
        ]
      } else {
        return []
      }
    }
  },
  watch: {
    'data.autoLoad': function(val, oldVal) {
      if (val && val != 'false' && (!oldVal || oldVal == 'false')) {
        this.handleExpand()
      }
    },
    'data.currentPage': function(val) {
      //默认为1
      const item = this.data
      if (val && this.data.hasPage) {
        const tree = findComponentsUpward(this, 'Tree')
        if (tree && tree.loadData) {
          tree.loadData(item, children => {
            if (children.length) {
              this.$set(this.data, 'children', children)
            }
          })
          return
        }
      }
    },
    'data.expand': {
      deep: true,
      handler: function() {
        this.childrenShow =
          this.data.expand &&
          this.data.expand != 'false' &&
          (!this.data.leaf || this.data.leaf == 'false')
        this.iconShow = this.data.expand && this.data.expand != 'false'
        // 处理expand为true但是处于收缩状态，重新赋值data不能展开的问题
        if (this.childrenShow && this.$refs.children) {
          this.$refs.children.style.display = 'block'
        }
      }
    },
    'data.leaf': function() {
      this.childrenShow =
        this.data.expand &&
        this.data.expand != 'false' &&
        (!this.data.leaf || this.data.leaf == 'false')
      this.iconShow = this.data.expand && this.data.expand != 'false'
    }
  },
  methods: {
    handleExpand() {
      const item = this.data
      // async loading
      if (item.children && item.children.length === 0) {
        const tree = findComponentsUpward(this, 'Tree')
        if (tree && tree.loadData) {
          this.$set(this.data, 'loading', true)
          tree.loadData(item, children => {
            this.$set(this.data, 'loading', false)
            if (children.length) {
              this.$set(this.data, 'children', children)
              this.$nextTick(() => this.handleExpand())
            }
          })
          return
        }
      }
      if (item.children && item.children.length >= 0) {
        if (!this.childrenShow) {
          this.childrenShow = true
          this.$set(this.data, 'expand', true)
          this.dispatchTree()
        } else {
          let status = true
          if (this.$refs.children.style.display == 'none') {
            status = false
          }
          this.$refs.children.style.display = status ? 'none' : 'block'
          this.dispatchTree()
        }
        // let status = Boolean(this.data.expand&&this.data.expand!='false');
        // if (this.data.autoLoad && this.data.autoLoad!='false') {
        // this.$set(this.data, 'autoLoad', !this.data.autoLoad);
        // this.$set(this.data, 'autoLoad', false);
        // this.$set(this.data, 'expand', status);
        // } else {
        // this.$set(this.data, 'expand', !status);
        // this.dispatch('Tree', 'toggle-expand', this.data);
        // }
      }
      this.iconShow = !this.iconShow
    },
    dispatchTree() {
      if (this.data.autoLoad && this.data.autoLoad != 'false') {
        // this.$set(this.data, 'autoLoad', !this.data.autoLoad);
        this.$set(this.data, 'autoLoad', false)
        // this.$set(this.data, 'expand', status);
      } else {
        // this.$set(this.data, 'expand', !status);
        this.dispatch('Tree', 'toggle-expand', this.data, !this.iconShow)
      }
    },
    handleSelect() {
      if (this.data.disabled) return
      if (this.selectToCheck && this.showCheckbox) {
        let val = !this.data.checked
        this.handleCheck(val)
      } else {
        this.dispatch('Tree', 'on-selected', this.data.nodeKey)
      }
    },
    handleRightClick(event) {
      this.dispatch('Tree', 'on-right-click', this.data, event)
    },
    handleKeydown(e) {
      let code = e.keyCode
      if (code == 37) {
        //left
        // this.$set(this.data, 'expand', false);
        if (this.$refs.children) {
          this.$refs.children.style.display = 'none'
        }
        this.iconShow = !this.iconShow
        this.dispatch('Tree', 'toggle-expand', this.data, this.iconShow)
      }
      if (code == 39) {
        //right
        if (!this.childrenShow) {
          this.childrenShow = true
          this.$set(this.data, 'expand', true)
          this.dispatchTree()
        } else {
          this.$refs.children.style.display = 'block'
        }
        this.iconShow = !this.iconShow
        // this.$set(this.data, 'expand', true);
        this.dispatch('Tree', 'toggle-expand', this.data, this.iconShow)
      }
    },
    handeMouseover(e) {
      this.dispatch('Tree', 'mouse-over', this.data)
    },
    handleCheck(val) {
      if (this.data.disabled || this.data.disableCheckbox) return
      // ie下点击某个级联父节点项（非选中状态），点击后其余选项清空，当前级联节点选中，因此修改为点击后级联选项后选中该值
      // 与ie事件处理顺序有关
      var checked = val
      // if (!!this.checkStrictly || !!this.showIndeterminate) {
      //   checked = !this.data.checked
      // } else {
      //   checked = !this.data.checked && !this.data.indeterminate
      // }
      const changes = {
        checked: checked,
        nodeKey: this.data.nodeKey
      }
      this.dispatch('Tree', 'on-check', changes)
    }
  },
  created() {
    // if (!!this.checkStrictly || !!this.showIndeterminate) {
    //   this.data.indeterminate=false;
    // }
    // created node.vue first, mounted tree.vue second
    // if (!this.data.checked) this.$set(this.data, 'checked', false);
    // tree分页
    // 若autoLoad为true 则自动展开并触发loadData -- fof章杰灵提出
    if (this.data.autoLoad && this.data.autoLoad != 'false') {
      this.handleExpand()
    }
  },
  mounted() {
    // this.$refs.item.addEventListener('keydown', this.handleKeydown);
    // this.$on('indeterminate', () => {
    //   this.broadcast('TreeNode', 'indeterminate');
    //   this.setIndeterminate();
    // });
  }
}
</script>
