<template>
  <table cellspacing="0"
         cellpadding="0"
         border="0"
         :style="styleObject">
    <colgroup>
      <col v-for="(column, index) in columns"
           :width="setCellWidth(column, index, false)"
           :key="column.index">
    </colgroup>
    <tbody :class="[prefixCls + '-tbody']">
      <template v-for="(row,index) in data">
        <tr :key="row.id"
            @mouseenter.stop="handleMouseIn(row.id)"
            @mouseleave.stop="handleMouseOut(row.id)"
            class="not-child"
            :class="rowClasses(row.id,row)"
            @click="clickCurrentRow(row,row.id,$event)"
            @dblclick="dblclickCurrentRow(row,row.id,$event)">
          <td v-for="(column,inx) in columns"
              :class="alignCls(column, row)"
              :key="column.index">
            <span v-if="inx==(columns[0].type=='index'?1:0) && fixed !== 'right'"
                  :style="indentCls">
              <span class="expand-icon">
                <Icon v-if="(row.children && row.children.length !== 0) || (row.leaf + '' === 'false' && row.loading + '' !== 'true')" name = "play_fill" :class="iconClass(row.id,index)" @click.native.stop="toggleExpand(index,row,$event)"></Icon>
                <Icon v-if="(row.leaf + '') !== 'true' && (row.loading + '') === 'true'" name="load-c" class="h-load-loop"></Icon>
              </span>
              <!-- :indeterminate="row.indeterminate" -->
              <Checkbox v-if="isCheckbox"
                        :value="checkValue(row.id)"
                        @on-click="changeSelect(row.id,row,$event)"
                        @click.native.stop="handleclick"></Checkbox>
            </span>
            <span v-if="column.type=='index'">{{Number(index)+1}}</span>
            <Cell v-if="column.render"
                  :row="row"
                  :column="column"
                  :index="index"
                  :render="column.render"></Cell>
            <span v-else>{{row[column.key]}}</span>
          </td>
        </tr>
        <tr v-if="isExpanded(row.id,index,row)"
            :key="row.id+'child'"
            :style="expandStl(row.id,index,row)">
          <td :colspan="columns.length"
              style="border:0">
            <Tree-table :fixed="fixed"
                        :styleObject="styleObject"
                        :indent="indent+1"
                        :data="row.children"
                        :prefix-cls="prefixCls"
                        :columns="columns"
                        :columnsWidth="columnsWidth"
                        :checkStrictly="checkStrictly"
                        :checkedObj="checkedObj"
                        :indexAndId="indexAndId"
                        :isCheckbox="isCheckbox"
                        :selectRoot="selectRoot"
                        :bodyRealHeight="bodyRealHeight"
                        :tableWidth="tableWidth"
                        :initWidth="initWidth"
                        :scrollBarWidth="scrollBarWidth"
                        :rowSelect="rowSelect"
                        :height="height">
            </Tree-table>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
<script>
import Cell from './expand'
import Mixin from './mixin'
import { addClass, removeClass } from '../../util/tools'
export default {
  name: 'TreeTable',
  mixins: [Mixin],
  data() {
    // showchildren:objData[row._index]._isExpanded && row.children && row.children.length!=0
    return {
      collectionState: [],
      _parent: null
    }
  },
  components: { Cell },
  props: {
    styleObject: Object,
    columns: Array,
    indent: Number,
    checkStrictly: Boolean,
    data: Array,
    prefixCls: String,
    isCheckbox: Boolean,
    columnsWidth: Object,
    checkedObj: Array,
    indexAndId: Object,
    selectRoot: Boolean,
    bodyRealHeight: [Number, String],
    height: [Number, String],
    tableWidth: [Number, String],
    initWidth: [Number, String],
    scrollBarWidth: [Number, String],
    rowSelect: Boolean,
    headSelection: Boolean,
    fixed: String
  },
  computed: {
    objData() {
      // return this.$parent.objData;
    },
    indentCls() {
      let style = {}
      style.marginLeft = 20 * this.indent + 'px'
      return style
    }
  },
  methods: {
    rowClasses(id, row) {
      let index = this.indexAndId[id]
      return [
        this.rowClsName(id, row),
        {
          [`${this.prefixCls}-row-highlight`]:
            this.checkedObj[index] && this.checkedObj[index]._isHighlight,
          [`${this.prefixCls}-row-hover`]:
            this.checkedObj[index] && this.checkedObj[index]._isHover
        }
      ]
    },
    rowClsName(id, row) {
      let index = this.indexAndId[id]
      if (this._parent) {
        return this._parent.rowClsName(id, row)
      }
    },
    isExpanded(id, inx, row) {
      let index = this.indexAndId[id]
      return (
        this.checkedObj[index] &&
        this.checkedObj[index]._isExpand != null &&
        row.children &&
        row.children.length > 0
      )
    },
    expandStl(id, inx, row) {
      let index = this.indexAndId[id]
      let style = {}
      if (this.checkedObj[index] && this.checkedObj[index]._isExpand) {
        style.display = 'block'
      } else {
        style.display = 'none'
      }
      return style
    },
    checkValue(id) {
      let index = this.indexAndId[id]
      return this.checkedObj[index] && this.checkedObj[index].checked
    },
    iconClass(id, index) {
      let inx = this.indexAndId[id]
      return [
        `${this.prefixCls}-icon-click`,
        {
          [`${this.prefixCls}-icon-click-expanded`]:
            this.checkedObj[inx] && this.checkedObj[inx]._isExpand
        }
      ]
    },
    handleclick() {},
    clickCurrentRow(row, id, e) {
      this._parent.clickCurrentRow(row)
      if (this.rowSelect) {
        this.changeSelect(id, row, e)
      }
      if (this.selectRoot) {
        let status = this.checkedObj[this.indexAndId[row.id]]._isHighlight
        if (this.indent > 0) {
          this.data.forEach(col => {
            this._parent.changeCheckedObj(
              this.indexAndId[col.id],
              status,
              '_isHighlight'
            )
          })
        }
        if (row._parentId != undefined) {
          this.selectRootUp(row._parentId, status)
        }
        if (row.children && row.children.length > 0) {
          this.updateTreeDown(row.children, status, '_isHighlight')
        }
      }
    },
    dblclickCurrentRow(row, id, e) {
      this._parent.dblclickCurrentRow(row)
      this._parent.clickCurrentRow(row)
      if (this.rowSelect) {
        this.changeSelect(id, row, e)
      }
    },
    selectRootUp(id, status) {
      this._parent.changeCheckedObj(this.indexAndId[id], status, '_isHighlight')
    },
    toggleExpand(index, row, event) {
      let inx = this.indexAndId[row.id]
      let curStatus
      if (this.checkedObj[inx]._isExpand == null) {
        row.children.forEach((col, inx) => {
          this.setStatus(col, inx)
        })
        curStatus = true
      } else {
        let obj = event.target
        let objStl = this.findObj(event, 'TR').nextElementSibling
        if (objStl && objStl.style.display == 'none') {
          curStatus = true
        } else {
          curStatus = false
        }
      }
      this._parent.toggleExpand(row, curStatus)
    },
    findObj(e, name) {
      var obj = e.target
      while (obj && obj.tagName != name) {
        obj = obj.parentElement
      }
      return obj
    },
    findParent() {
      var obj = this
      var i = 0
      while (i <= this.indent) {
        obj = obj.$parent
        i++
      }
      return obj
    },
    changeSelect(id, row, event) {
      this._parent.changeCheckedObj(this.indexAndId[id], null)
      let status = this.checkedObj[this.indexAndId[id]].checked
      this._parent.changeSelect(row)
      if (!this.checkStrictly) {
        if (row._parentId != undefined) {
          this.updateTreeUp(row._parentId)
        }
        if (row.children && row.children.length > 0) {
          this.updateTreeDown(row.children, status)
        }
      }
    },
    updateTreeUp(id) {
      let status = true
      for (var i = 0; i < this.data.length; i++) {
        var curid = this.data[i].id
        var index = this.indexAndId[curid]
        if (!this.checkedObj[index].checked) {
          status = false
          break
        }
      }
      this._parent.changeCheckedObj(this.indexAndId[id], status)
      if (this.checkedObj[this.indexAndId[id]]._parentId != undefined) {
        this.$parent.updateTreeUp(
          this.checkedObj[this.indexAndId[id]]._parentId
        )
      }
    },
    updateTreeDown(data, status, single) {
      data.forEach((col, inx) => {
        this.setStatus(col, inx) //状态初始化
        if (col.children && col.children.length > 0) {
          this.updateTreeDown(col.children, status)
        }
        this._parent.changeCheckedObj(this.indexAndId[col.id], status, single)
      })
    },
    setStatus(col, inx) {
      if (!this.indexAndId[col.id]) {
        this._parent.indexAndId[col.id] = this._parent.checkedObj.length
        this._parent.checkedObj.push({
          id: col.id,
          checked: col.checked || false,
          _isExpand: (col.expand + '') === 'true' || null,
          _collectionState: this.collectionState[inx],
          _parentId: col._parentId,
          _isHighlight: col.highlight || false,
          _isHover: false,
          row: col
        })
      }
      //此处引起性能问题，目的是为了兼容外部选中
      // if(this.isCheckbox&&(!this.checkStrictly||this.headSelection)&&this.indent==0&&col.children&&col.children.length>0){
      //   col.children.forEach((item,inx)=>{
      //     this.setStatus(item,inx)
      //   })
      // }
    },
    getStatus() {
      this._parent = this.findParent()
      this.data.forEach((col, inx) => {
        col.expand = col.expand === 'false' ? false : col.expand
        col.expand = col.expand === 'true' ? true : col.expand
        this.setStatus(col, inx)
      })
    },
    handleMouseIn(_index) {
      this._parent.handleMouseIn(_index)
    },
    handleMouseOut(_index) {
      this._parent.handleMouseOut(_index)
    }
  },
  mounted() {
    this.getStatus()
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.getStatus()
      }
    }
  }
}
</script>
