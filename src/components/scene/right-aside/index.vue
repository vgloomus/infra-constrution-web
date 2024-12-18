<!--
 * @author: lvzj
 * @Date: 2024-08-07 14:01:21
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-01 10:48:47
 * @description: file content
-->
<template>
  <div class="right-aside">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'RightAside',
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
  .right-aside {
    width: 100%;
    height: 100%;
    background: $mainBackgroundColor;
    border-left: 1px solid $mainBackgroundColor;
    padding: 0 16px 16px 16px;
  }
</style>
