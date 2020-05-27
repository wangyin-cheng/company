import {findInx} from '../../util/tools';
export default {
    methods: {
        alignCls (column, row = {},fixed) {
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
                    [`${this.prefixCls}-head-column-${this.headAlgin}`]: this.headAlgin,
                    [`${this.prefixCls}-body-column-${this.bodyAlgin}`]: this.bodyAlgin,
                    [`${this.prefixCls}-split-index`]: this.splitIndex && column.type=='index',
                    [`${this.prefixCls}-cell-check`]: this.cellClick && !row._isGroup && this.cellCheckObj[row._index] && this.cellCheckObj[row._index][column.key] ? true : false
                }
            ];
        
        },
        setCellWidth (column, index, top) {
            let width = '';
            if (column.width) {
                width = column.width;
            } else if (this.columnsWidth[column._index]) {
                width = this.columnsWidth[column._index].width;
            }
            // when browser has scrollBar,set a width to resolve scroll position bug
            if (this.cloneColumns.length === index + 1&& this.bodyHeight !== 0&& width!='') {
              if(this.tableWidth+1>=this.initWidth-this.scrollBarWidth&&top){
                  width += this.scrollBarWidth;
              }else if(this.contentHeight<this.height){
                  width += this.scrollBarWidth;
              }
            }
            if (width === '0') width = '';
            return width;
        }
    }
};
