<template>
    <div class="dropdown">
        <input class="dropdown-input"
            :name="name"
            @focus="showOptions()"
            @blur="exit()"
            @keyup="keyMonitor"
            v-model="searchFilter"
            :disabled="disabled"
            :placeholder="placeholder"
        />
        <div class="dropdown-content"
            v-show="optionsShown">
            <ul>
                <li
                class="dropdown-item"
                v-for="(option,index) in filteredOptions"
                :key="index">
                    <span @mousedown="selectOption(option)">{{ option.name }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default{
  name: 'HSearchNav',
  template: 'HSearchNav',
  props: {
    name: {
      type: String,
      require: false,
      default: 'hsearchnav',
      note: 'Input name'
    },
    options: {
      type: Array,
      required: true,
      default: [],
      note: 'Options of dropdown. An array of options with id and name'
    },
    placeholder: {
      type: String,
      reauireed: false,
      default: 'Please select an option',
      note: 'Placeholder of dropdown'
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Disable the dropdown'
    }
  },
  data () {
    return {
      selected: {},
      optionsShown: false,
      searchFilter: ''
    }
  },
  created () {
    this.$emit('selected', this.selected)
  },
  computed: {
    filteredOptions () {
      const filtered = []
      const regOption = new RegExp(this.searchFilter, 'ig')
      for (const option of this.options) {
        if (this.searchFilter.length < 1 || option.name.match(regOption)) {
          filtered.push(option)
        }
      }
      return filtered
    }
  },
  methods: {
    selectOption (option) {
      this.selected = option
      this.optionsShown = false
      this.searchFilter = this.selected.name
      this.$emit('selected', this.selected)
    },
    showOptions () {
      if (!this.disabled) {
        this.searchFilter = ''
        this.optionsShown = true
      }
    },
    exit () {
      if (!this.selected.id) {
        this.selected = {}
        this.searchFilter = ''
      } else {
        this.searchFilter = this.selected.name
      }
      this.$emit('selected', this.selected)
      this.optionsShown = false
    },
    keyMonitor: function (even) {
      if (event.key === 'Enter' && this.filteredOptions[0]) { this.selectOption(this.filteredOptions[0]) }
    }
  },
  watch: {
    searchFilter () {
      if (this.filteredOptions.length === 0) {
        this.selected = {}
      } else {
        this.selected = this.filteredOptions[0]
      }
      this.$emit('filter', this.searchFilter)
    }
  }
}

</script>

<style lang="scss" scoped>
  .dropdown {
    position: relative;
    display: block;
    margin: auto;
    float: left;
    .dropdown-input {
      background: #fff;
      cursor: pointer;
      border: 1px solid #e7ecf5;
      border-radius: 3px;
      color: #333;
      display: block;
      font-size: .8em;
      padding: 6px;
      min-width: 250px;
      max-width: 250px;
      &:hover {
        background: #f8f8fa;
      }
    }
    .dropdown-content {
      position: absolute;
      background-color: #fff;
      min-width: 248px;
      max-width: 248px;
      max-height: 248px;
      border: 1px solid #e7ecf5;
      box-shadow: 0px -8px 34px 0px rgba(0,0,0,0.05);
      overflow: auto;
      z-index: 1;
      .dropdown-item {
        color: black;
        font-size: .7em;
        line-height: 1em;
        padding: 8px;
        text-decoration: none;
        display: block;
        cursor: pointer;
        &:hover {
          background-color: #e7ecf5;
        }
      }
    }
    .dropdown:hover .dropdowncontent {
      display: block;
    }
  }
</style>
