<!--
 * @author: lvzj
 * @Date: 2024-08-07 14:01:00
 * @LastEditors: lvzj
 * @LastEditTime: 2024-08-07 14:40:25
 * @description: file content
-->
<template>
  <div class="bottom-menu">
    <div>{{ $t('scene.longitude') }}：116.3434，{{ $t('scene.latitude') }}：37.454545</div>
  </div>
</template>
<script>
export default {
  name: 'BottomMenu',
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
  .bottom-menu {
    height: 30px;
    background: #fff;
    display: flex;
    align-items: center;
  }
</style>
