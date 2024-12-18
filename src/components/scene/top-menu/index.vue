<!--
 * @author: lvzj
 * @Date: 2024-08-07 13:59:36
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-08-17 15:04:49
 * @description: file content
-->
<template>
  <div class="top-menu">
    <!-- <el-button
      @click="goBack"
      icon="el-icon-arrow-left"
    >返回</el-button> -->
    <slot></slot>
  </div>
</template>
<script>
import { EventBus } from '@/utils/eventBus'
export default {
  name: 'TopMenu',
  data() {
    return {}
  },
  methods: {
    goBack() {
      EventBus.$emit('goBack')
      history.go(-1)
      // this.$router.go(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
  .top-menu {
    height: 50px;
    background: #191d21;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    padding: 0 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>
