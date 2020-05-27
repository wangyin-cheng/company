import {findInx} from '../../util/tools';
export default {
    methods: {
        alignCls (column, row = {}) {
            let cellClassName = '';
            if (row.cellClassName && column.key && row.cellClassName[column.key]) {
                cellClassName = row.cellClassName[column.key];
            }
            return [
                `h-ui-${column.key}`,
                {
                    [`${cellClassName}`]: cellClassName,    // cell className
                    [`${column.className}`]: column.className,    // column className
                    [`${this.prefixCls}-column-${column.align}`]: column.align,
                    [`${this.prefixCls}-head-column-${column.headAlign}`]: column.headAlign,
                    [`${this.prefixCls}-hidden`]: (this.fixed === 'left' && column.fixed !== 'left') || (this.fixed === 'right' && column.fixed !== 'right') || (!this.fixed && column.fixed && (column.fixed === 'left' || column.fixed === 'right')),
                    [`${this.prefixCls}-stripe-light`]: this.typeName === 'treeGird' && row.hasOwnProperty('visibleKey') && row.visibleKey % 2 === 0,
                    [`${this.prefixCls}-stripe-dark`]: this.typeName === 'treeGird' && row.hasOwnProperty('visibleKey') && row.visibleKey % 2 === 1
                }
            ];
        },
        isPopperShow (column) {
            return column.filters && ((!this.fixed && !column.fixed) || (this.fixed === 'left' && column.fixed === 'left') || (this.fixed === 'right' && column.fixed === 'right'));
        },
        setCellWidth (column, index, top) {
            let width = '';
            if (column.width) {
                width = column.width;
            } else if (this.columnsWidth[column._index]) {
                width = this.columnsWidth[column._index].width;
            }
            // when browser has scrollBar,set a width to resolve scroll position bug
            if (this.columns.length === index + 1 && top && this.$parent.bodyHeight !== 0&&this.$parent.data.length>0 && this.$parent.typeName!= 'groupTable') {
                // 考虑所有都有宽度，总列宽小于屏幕宽度时，不可加scrollBarWidth
                width += this.$parent.scrollBarWidth
                // 树表格嵌套, 针对所有列设置宽度，总列宽小于屏幕宽度时，表格头全部加scrollBarWidth，此时列上也需要加scrollBarWidth
                // editgird 没有横向滚动条没有纵向滚动条时也不能加滚动条宽度
                // editgird 有横向滚动条没有纵向滚动条时也不能加滚动条宽度
                if ((this.$parent.typeName == 'treeGird' || this.$parent.typeName == 'editGird')&& this.$options.name == 'GirdHead' && (parseInt(this.styleObject.width) <= this.$parent.$el.clientWidth || parseInt(this.$parent.bodyStyle.height) >=  this.$parent.$refs.tbody.$el.clientHeight )) {
                    width -= this.$parent.scrollBarWidth
                }
            }  
            if(this.columns.length === index + 1&&width&&!top&&this.$parent.typeName== 'groupTable'&&this.$parent.height>0){
              const colWidth = this.columns.slice(0, this.columns.length - 1)
                  .reduce((acc, col) => acc + (col._width || 0), 0) + width;
              // 垂直滚动条的情况
              if (this.$parent.bodyHeight < this.$parent.bodyRealHeight) {
                // 剩余宽度小于滚动条宽度或列宽大于表格宽时需要将最后一列单元格宽度减去一定宽度
                if (this.$parent.initWidth - colWidth <= this.$parent.scrollBarWidth) {
                  if (colWidth >= this.$parent.initWidth) {
                    width -= this.$parent.scrollBarWidth;
                  } else if (this.$parent.initWidth - colWidth === this.$parent.scrollBarWidth) {
                    width--;
                  } else {
                    width -= (1 + this.$parent.scrollBarWidth - Math.min((this.$parent.initWidth - colWidth), this.$parent.scrollBarWidth));
                  }
                }
              } else {
                let rest = this.$parent.bodyHeight - this.$parent.bodyRealHeight;
                if (colWidth >= this.$parent.initWidth) {
                  // 处理展开分组后剩余高度不足滚动条宽度的情况
                  if (rest < this.$parent.scrollBarWidth && colWidth !== this.$parent.initWidth) {
                    let temp = width - Math.min(Math.max(this.$parent.scrollBarWidth - colWidth + this.$parent.initWidth, 0), 17);
                    if (colWidth - width + temp >= this.$parent.initWidth) {
                      width = temp;
                    }
                  } else if (colWidth === this.$parent.initWidth) {
                    width--;
                  }
                }
              }
            }
            if (this.columns.length === index + 1&&width&&top&&this.$parent.typeName== 'groupTable'&&this.$parent.height>0) {
              const colWidth = this.columns.slice(0, this.columns.length - 1)
                  .reduce((acc, col) => acc + (col._width || 0), 0) + width;
              if (colWidth >= this.$parent.initWidth
                    && this.$parent.bodyHeight - this.$parent.bodyRealHeight < this.$parent.scrollBarWidth) {
                width += this.$parent.scrollBarWidth;
              }
            }
            // when fixed type,reset first right fixed column's width
            if (this.fixed === 'right') {
                // const firstFixedIndex = this.columns.findIndex((col) => col.fixed === 'right');
                const firstFixedIndex = findInx(this.columns,(col) => col.fixed === 'right');
                if (firstFixedIndex === index) width += this.$parent.scrollBarWidth;
            }
            if (width === '0') width = '';
            return width;
        },
        convertTreeData(rows, attributes) {
            var keyNodes = {}, parentKeyNodes = {};
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    row.id = row[attributes.keyField];
                    row.parentId = row[attributes.parentKeyField];
                    // row.text = row[attributes.textField];
                    row.expanded = row[attributes.expanded]?true:false
                    row.checked = row[attributes.checked]?true:false
                    row.indeterminate = row[attributes.indeterminate]?true:false
                    row.children = [];

                    keyNodes[row.id] = row;

                    if (parentKeyNodes[row.parentId]) { parentKeyNodes[row.parentId].push(row); }
                    else { parentKeyNodes[row.parentId] = [row]; }

                    var children = parentKeyNodes[row.id];
                    if (children) { row.children = children; }

                    var pNode = keyNodes[row.parentId];
                    if (pNode) { pNode.children.push(row); }
                }
            return parentKeyNodes[attributes.rootParentId];
        }
    }
};
