<template>
  <h-edit-gird ref="editGrid"
    style="border-left:1px solid #dce1e7;"
    :columns="columns"
    :data="gridData"
    :showEditInput=true
    size="small"
    height=260
    stripe>
  </h-edit-gird>
</template>

<script>
const prefixCls = 'v-hello';
export default {
  name: 'Hello',
  data(){
    return {
      columns: [
        {
          title: '基准利率类型',
          key: 'basisRateType',
          render: (h, params) => {
            if (params.row.basisRateType) {
              const { basisRateType } = params.row;
              const { dictList } = this;
              const dictObj = dictList.basisRateTypeDict.filter(
                item => item.value === basisRateType,
              );
              return h('span', dictObj[0].caption);
            }
            return h('span', '');
          },
        },
        {
          type: 'money',
          title: '年利率',
          key: 'yearRate',
          suffixNum: 6,
        },
        {
          type: 'money',
          title: '月利率',
          key: 'monthRate',
          suffixNum: 6,
        },
        {
          title: '调整日期',
          type: 'date',
          key: 'adjustDate',
          hiddenCol: true,
        },
        {
          title: '币种',
          key: 'currencyNo',
          hiddenCol: true,
        },
        {
          title: '基准利率分类',
          key: 'baseRateTypeClass',
          hiddenCol: true,
        },
      ],
      gridData:[{basisRateType:'1',yearRate:1}],
    }
  },
  created () {
    this.msg = 'bye!'
  },
  computed:{
    helloclass(){
      return `${prefixCls}-hello`
    }
  }

}