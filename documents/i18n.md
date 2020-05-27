

# 国际化

## 开发规范

### 模板内

使用$t，配合mustache插值语法

```html
<h-button>{{$t('m.i.demo.delete')}}</h-button>
```

### 组件属性

如果属性需要支持国际化，必须以表达式或者计算属性的形式传递。定义在data中的数据是无法在动态切换语言的时候自动重新计算数据的。

表达式形式。

```html
<h-form>
	<h-form-item :label="$t('m.i.demo.name')"></h-form-item>
</h-form>
```

计算属性形式。

```html
<template>
	<h-table :columns="columns" :data="data"></h-table>
</template>
<script>
	export default {
		data() {
			return {
				data: []
			}
		},
		computed: {
			columns() {
				let self = this
				return [
                    {
                        title: self.$t('m.i.demo.name'),
                        key: 'name'
                    },
                    {
                        title: self.$t('m.i.demo.age'),
                        key: 'age'
                    },
                    {
                        title: self.$t('m.i.demo.gender'),
                        key: 'gender'
                    }
                ]
			}
		}
	}
</script>
```
## 获取当前语言
### 组件内
组件内可以通过this.$i18n.locale获取当前的语言。中文是zh-CN，英文是en-US。
### 组件外
组件外可以通过window.i18n.locale获取当前的语言。
### 后台
后台可以通过key为lang的cookie获取当前语言。






