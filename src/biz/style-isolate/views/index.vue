<style module="style" lang="less" src="@style-isolate/index.less"></style>
<template>
  <div :class="index.abc">
    <div :class="style.header">
      <p :class="style.title">hello world</p>
      <h-input :class="style['style-isolate-input']" value="我改写了 h-input 的默认样式"></h-input>
    </div>
  </div>
</template>

<style module="index" lang="less">
.abc {
  width: 100%;
}
</style>