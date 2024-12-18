<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-07-30 13:46:53
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-17 11:26:14
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\error.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template functional>
  <div class="page-error">
    <span>页面跳转异常，请刷新页面重试</span>
  </div>
</template>

<script>
export default {
  name: 'PageNotFount'
}
</script>

<style lang="scss" scoped>
  .page-error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(240, 242, 245);
    color: #666;
  }
</style>
