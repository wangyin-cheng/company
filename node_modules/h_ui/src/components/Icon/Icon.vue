<template>
	<i :class="iconCls" :style="styleCls" @click="iconClick"></i>
</template>
<script>
  const prefixCls = 'h-icon'
	export default{
		name:'Icon',
		props:{
			name:String,
			color:{
				type:String,
				default:''
			},
      size:[Number, String],
      fontClass: {
        type: String,
        default: 'iconfont'
      }
		},
		computed:{
			iconCls(){
				return [
          `${prefixCls}`,
          `${this.fontClass}`,
          `${this.fontClass === 'iconfont' ? 'icon' : this.fontClass}-${this.name}`,
          `${prefixCls}-${this.name}`
        ];
			},
			styleCls(){
				let style={}
				if(this.color){
					style.color = this.color
				}
				if(this.size){
					style['font-size'] = `${this.size}px`
				}
				return style
			}
		},
		methods:{
			iconClick(e){
				this.$emit("on-click",e)
			}
		}
	}
</script>
