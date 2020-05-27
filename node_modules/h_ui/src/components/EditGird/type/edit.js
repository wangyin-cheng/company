import GirdTable from '../Gird-table.vue';

export default {
  mixins: [GirdTable],
  props: {
    typeName:{
      default: 'editGird',
    }
  },
  data () {
    return {
      ruleCells: []
    };
  },
  methods: {
    validate(callback) {
      let callbackExecuted = false
      this.ruleCells.forEach(cell => {
        cell.validate('blur', errMsg => {
          if (errMsg && !callbackExecuted) {
            callbackExecuted = true
            callback(false, errMsg)
          }
        })
      })

      if (!callbackExecuted) {
        callback(true)
      }
    }
  },
  created() {
    this.$on('on-rule-cell-add', cell => {
      this.ruleCells.push(cell)
    })

    this.$on('on-rule-cell-remove', cell => {
      this.ruleCells.splice(this.ruleCells.indexOf(cell), 1)
    })
  }
};
