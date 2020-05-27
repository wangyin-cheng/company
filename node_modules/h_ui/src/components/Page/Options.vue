<template>
  <div v-if="showSizer || showElevator||showCustom||showReload" :class="optsClasses">
    <div v-if="showSizer && showSizerLabel" :class="sizerLabelClasses">{{ t('i.page.pageLabel') }}</div>
    <div v-if="showSizer" :class="sizerClasses">
      <h-select v-model="currentPageSize" :size="size" :placement="placement" @on-change="changeSize" :clearable="false">
        <h-option v-for="item in pageSizeOpts" :key="item" :value="item" style="text-align:center;">{{ item }} {{ t('i.page.page') }}</h-option>
      </h-select>
    </div>
    <div v-if="showCustom&&!showSizer" :class="ElevatorClasses">
      <input v-model="currentPageSize" @keyup.enter="changeCustom">
      {{curSize}}条/每页
    </div>
    <div v-if="showElevator" :class="ElevatorClasses">
      {{ t('i.page.goto') }}
      <input v-if="!isBlur" type="text" v-model="currentNo" @keyup.enter="changePage">
      <input v-if="isBlur" type="text" v-model="currentNo" @blur="changePage">
      {{ t('i.page.p') }}
    </div>
    <div v-if="showReload" :class="ReloadClasses">
         <a @click="handleRefresh"><icon name="refresh"></icon></a>
    </div>
  </div>
</template>
<script>
    import hSelect from '../../components/Select/Select.vue';
    import hOption from '../../components/Select/Option.vue';
    import Locale from '../../mixins/locale';

    const prefixCls = 'h-page';

    function isValueNumber (value) {
        return (/^[1-9][0-9]*$/).test(value + '');
    }

    export default {
        name: 'PageOption',
        mixins: [ Locale ],
        components: { hSelect, hOption },
        props: {
            pageSizeOpts: Array,
            showSizer: Boolean,
            showElevator: Boolean,
            current: Number,
            pageSize: Number,
            allPages: Number,
            isSmall: Boolean,
            placement: String,
            isBlur:Boolean,
            showCustom:Boolean,
            showSizerLabel: Boolean,
            showReload:Boolean,
        },
        data () {
            return {
                currentPageSize: this.pageSize,
                curSize:this.pageSize,
                currentNo:''
            };
        },
        watch: {
            pageSize (val) {
                this.currentPageSize = val;
            },
        },
        computed: {
            size () {
                return this.isSmall ? 'small' : 'default';
            },
            optsClasses () {
                return [
                    `${prefixCls}-options`
                ];
            },
            sizerClasses () {
                return [
                    `${prefixCls}-options-sizer`
                ];
            },
            sizerLabelClasses () {
                 return [
                    `${prefixCls}-options-sizer-label`
                ];
            },
            ElevatorClasses () {
                return [
                    `${prefixCls}-options-elevator`
                ];
            },
            ReloadClasses(){
                 return [
                    `${prefixCls}-options-reload`
                ];
            }
        },
        methods: {
            changeSize () {
                this.$emit('on-size', Number(this.currentPageSize));
            },
            changeCustom(){
                if(isValueNumber(this.currentPageSize)){
                    this.curSize = this.currentPageSize;
                    this.changeSize();
                }
            },
            changePage (event) {
                let val = event.target.value.trim();
                let page = 0;

                if (isValueNumber(val)) {
                    val = Number(val);
                    if (val != this.current) {
                        const allPages = this.allPages;

                        if (val > allPages) {
                            page = allPages;
                        } else {
                            page = val;
                        }
                    }
                } else {
                    page = 1;
                }

                if (page) {
                    this.$emit('on-page', page);
                    event.target.value = page;
                }
            },
            handleRefresh(){
                 this.$emit('on-reload');
            }
        }
    };
</script>