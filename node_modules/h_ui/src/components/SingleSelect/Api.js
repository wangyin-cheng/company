export const SingleSelectApi = {
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: [String, Number, Array],
      default: ''
    },
    firstInit: {
      type: Boolean,
      default: false
    },
    // 是否开启下拉框动画效果
    animated: {
      type: Boolean,
      default: true
    },
    // 默认开启自动匹配勾选
    accuFilter: {
      type: Boolean,
      default: true
    },
    // Block中判断用
    isSingleSelect:{
      type:Boolean,
      default:true,
    },
    // 设置输入框为禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    // 设置输入框为只读
    readonly: {
      type: Boolean,
      default: false
    },
    // 设置输入框为可编辑
    editable: {
      type: Boolean,
      default: true
    },
    // 输入框默认的提示信息
    placeholder: {
      type: String
    },
    // 是否使用远程搜索
    remote: {
      type: Boolean,
      default: false
    },
    // 远程搜索方法
    remoteMethod: {
      type: Function,
      default(key, done) {
        done()
      }
    },
    // 配合远程搜索使用。loading设置为true时显示加载提示文字
    loading: {
      type: Boolean,
      default: false
    },
    // 加载中显示的文字
    loadingText: {
      type: String
    },
    // 设置输入框的宽度
    width: {
      type: [String, Number]
    },
    // 是否将弹层放置于 body 内，它将不受父级样式影响，从而达到更好的效果
    transfer: {
      type: Boolean,
      default: false
    },
    // 下拉面板方向自适应，其相对于外部第一个非静态定位父元素开始定位
    autoPlacement: {
      type: Boolean,
      default: false
    },
    // 弹窗的展开方向
    placement: {
      validator(value) {
        return ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'].includes(value)
      },
      default: 'bottom'
    },
    // 下拉框的宽度是否随着内容自适应，以width设置的宽度为最小宽度，最大宽度取输入框宽度与 maxDropWidth 的最大值
    widthAdaption: {
      type: Boolean,
      default: false
    },
    // 设置下拉框的宽度,不设置时下拉框的宽度等于输入框宽度
    dropWidth: {
      type: [String, Number]
    },
    // 下拉框的自适应时设置的最大宽度，实际值会取输入框宽度与 maxDropWidth 的最大值
    maxDropWidth: {
      type: [String, Number],
      default: 500
    },
    // 开启自动匹配时当输入值不匹配保留输入值
    keepInputValue: {
      type: Boolean,
      default: false
    },
    // 多label时只显示第一个label
    showFirstLabelOnly: {
      type: Boolean,
      default: false
    },
    hiddenEmpty: {
      type: Boolean,
      default: false
    },
    // 设置输入框 tabindex
    tabindex: {
      type: [String, Number],
      default: 0,
      validator(value) {
        let num = parseInt(value)
        return num <= 32767 && num >= -1
      }
    }
  },
  methods: {
    //外部调用收起下拉面板
    fold() {
      this.visible = false
    }
  }
}

export const SingleSelectBlockApi = {
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    itemHeight: {
      type: [Number, String],
      default: 30
    },
    // 显示多列
    showCol: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 显示多列的表头，表头高度默认 30，宽度默认 100
    showHeader: {
      type: Array,
      default: () => [],
    },
    colWidth:{
      type: Array,
      default: () => [],
    }
  },
  events: {

  }
}
