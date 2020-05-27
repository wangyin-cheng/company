import _ from "../..//util";

export const SimpleMultiSelectApi = {
  props: {
    // 指定选中项目的 value 值，可以使用 v-model 双向绑定数据，只支持 String，value 之间用 , 分隔
    value: {
      type: String,
      default: ""
    },
    // 输入框默认的提示信息
    placeholder: {
      type: String
    },
    // 在 on-change 返回选项时，是否将 label 和 value 一并返回，默认只返回 value
    labelInValue: {
      type: Boolean,
      default: false
    },
    // 弹窗的展开方向
    placement: {
      default: "bottom",
      validator(value) {
        return ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end"].includes(value);
      }
    },
    // 是否将弹层放置于 body 内，它将不受父级样式影响，从而达到更好的效果
    transfer: {
      type: Boolean,
      default: false
    },
    // 设置下拉框的宽度,不设置时下拉框的宽度等于输入框宽度
    dropWidth: {
      type: [String, Number],
      default: 0
    },
    // 下拉框的自适应时设置的最大宽度，实际值会取输入框宽度与 maxDropWidth 的最大值
    maxDropWidth: {
      type: [String, Number],
      default: 500
    },
    // 下拉框的宽度是否随着内容自适应，以 Simple-select 设置的宽度为最小宽度，最大宽度取输入框宽度与 maxDropWidth 的最大值
    widthAdaption: {
      type: Boolean,
      default: false
    },
    // 下拉面板方向自适应，其相对于外部第一个非静态定位父元素开始定位
    autoPlacement: {
      type: Boolean,
      default: false
    },
    // 是否使用远程搜索
    remote: {
      type: Boolean,
      default: false
    },
    /**
     * @description 远程搜索的方法
     * @description remote-method should take done() as a flag when remote action finish
     * @example
     *   remoteMethod(key, done) {
     *     /// some code
     *     done(); // make sure I know when to continue
     *   }
     */
    remoteMethod: {
      type: Function,
      default(key, done) {
        done();
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
    // 是否开启特殊项目，选择特殊项与其他项互斥
    specialIndex: {
      type: Boolean,
      default: false
    },
    // 特殊项关键值（value）
    specialVal: {
      type: String,
      default: "-1",
      validator(value) {
        return value !== "";
      }
    },
    // 设置输入框 tabindex
    tabindex: {
      type: [String, Number],
      default: 0,
      validator(value) {
        return parseInt(value) >= -1 && parseInt(value) <= 32767;
      }
    },
    // 鼠标在输入框悬浮时显示额外的提示信息
    tooltip: {
      type: String,
      default: ""
    },
    // 是否开启下拉框动画效果
    animated: {
      type: Boolean,
      default: true
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
    }
  },
  methods: {
    /**
     * @description 全选/全不选
     * @param {*} status true/false
     * @example this.$refs.xxx.toggleSelect()
     */
    toggleSelect(status) {
      if (this.blockVm) {
        this.isKeyDown = false; // switch off key down status
        this.isInputting = false; // switch off input status
        this.keyboardEvent = null; // reset keyboard event
        this.selectedRecords = status
          ? this.blockVm.blockData
              .filter(({ disabled, value }) => {
                if (disabled) return false;
                else {
                  // specialIndex && specialVal
                  return this.specialIndex && this.specialVal ? value !== this.specialVal : true;
                }
              })
              .map(item => _.deepCloneAs(item, ["label", "value", ...this.blockVm.showCol]))
          : [];
      }
    },
    // 通过this.refs.xxx.focus()调用,是当前输入框获取焦点,并打开选择面板
    focus() {
      this.$refs.input.focus();
    },
    // 手动取消输入框焦点(this.$refs.xxx.blur())
    blur() {
      this.$refs.input.blur();
    },
    // 外部调用主动发起折叠下拉面板的行为
    fold() {
      this.isDropdownVisible = false;
    }
  },
  events: {
    "on-change": {
      description: "选中的 Option变化时触发，默认返回 value，如需返回 label，详见 label-in-value 属性",
      args: "当前选中项"
    },
    "on-query-change": {
      description: "搜索词改变时触发，伴随可选项发生变化",
      args: "搜索值"
    },
    "on-drop-change": {
      description: "弹框关闭/展开时触发",
      args: "弹窗状态"
    },
    "on-focus": {
      description: "获取焦点时触发",
      args: ""
    },
    "on-input-focus": {
      description: "获取焦点时触发",
      args: ""
    },
    "on-blur": {
      description: "失去焦点时触发",
      args: ""
    },
    "on-keyup": {
      description: "原生的 keyup 事件",
      args: "第一个参数为当前输入框的值，第二个参数为原生的事件对象"
    },
    "on-keydown": {
      description: "原生的 keydown 事件",
      args: "第一个参数为当前输入框的值，第二个参数为原生的事件对象"
    },
    "on-paste": {
      description: "输入框粘贴时触发",
      args: "返回obj对象包括oldval旧值，newval新值"
    }
  }
};

export const SimpleMultiSelectBlockApi = {
  props: {
    // 选择框中数据，必填
    data: {
      type: Array,
      default() {
        return [];
      },
      validator(value) {
        if (_.isArrayLikeObject(value)) {
          return value.length <= 0 || (value.length > 0 && typeof value[0]["label"] === "string" && typeof value[0]["value"] === "string");
        } else return false;
      }
    },
    // 多列配置项，最多新增3列
    showCol: {
      type: Array,
      validator(value) {
        return value.length <= 3;
      },
      default: () => {
        return [];
      }
    }
  },
  events: {
    "on-scroll": {
      description: "下拉框滚动时触发",
      args: "第一个参数为滚动条距离底部的高度，当滚动条到底时，返回值小于列表的一个行高约30；第二个参数是列表的scrollTop；第三个参数为滚动方向（x代表水平滚动，y代表垂直滚动）"
    }
  }
};
