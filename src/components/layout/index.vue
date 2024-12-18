<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-07-30 13:46:53
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-11 09:37:14
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\layout\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div :class="['layout', { 'full-screen': isFullScreen }]">
    <MainContent />
  </div>
</template>
<script>
import MainContent from './MainContent.vue'
export default {
  name: 'LayoutWrap',
  components: { MainContent },
  computed: {
    isFullScreen() {
      return this.$route.meta.menuCode === 'bim'
    }
  }
}
</script>
<style lang="scss" scoped>
  .layout {
    width: 100%;
    height: calc(100% - 16px);
    // height: 100%;
    position: absolute;
    &.full-screen {
      height: 100%;
    }
  }
</style>
