<template>
  <div ref="cell">
    <!-- <template v-if="renderType === 'index'">{{index + 1}}</template>
    <template v-if="renderType === 'selection'">
      <Checkbox size="large" :value="checked" @click.native.stop="handleClick" @on-change="toggleSelect" :disabled="disabled"></Checkbox>
    </template> -->
    <!-- <template v-if="renderType === 'normal'" >
      <span v-html="row[column.key]"></span>
    </template> -->
    <Cell
      :row="row"
      :column="column"
      :index="index"
      :render="column.render"></Cell>
  </div>
</template>
<script>
import Cell from './expand';
export default {
  name: 'TableCell',
  components: {Cell},
  props: {
    row: Object,
    column: Object,
    index: Number,           // _index of data
    fixed: {
      type: [Boolean, String],
      default: false
    },
    // showTitle:Boolean,
    // sum: Boolean,
    // columnIdx: Number
  },
  data () {
    return {
      renderType: '',
      // uid: -1,
    };
  },
  mounted(){
  },
};
</script>
