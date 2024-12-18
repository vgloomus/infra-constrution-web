<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-13 09:18:28
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-08-13 09:22:51
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\NoContent.vue
 * @Description: 空数据组件
-->
<template>
  <div class="no-content">
    <div class="logo">
      <slot name="icon">
        <img
          :src="require(`./../assets/images/icon-data.png`)"
          alt=""
        >
      </slot>
      <p>{{text}}</p>
    </div>
    <div class="extra">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoContentPage',
  props: {
    text: {
      type: String,
      default: '暂无数据'
    }
  }
}
</script>

<style lang="scss" scoped>
  .no-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #8391a4;
    img {
      width: 60px;
      height: 40px;
      margin-bottom: 6px;
    }
  }
</style>
