import GirdTable from '../Gird-table.vue';
export default {
  mixins: [GirdTable],
  props: {
    typeName:{
      default: 'treeGird',
    },
  },
  data () {
    return {
    };
  },
  methods: {},
  mounted () {
  },
  beforeDestroy () {
  }
};
