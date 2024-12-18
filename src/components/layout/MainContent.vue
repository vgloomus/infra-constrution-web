<template>
  <div class="main-content-wrap">
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  name: 'MainContent'
}
</script>
<style lang="scss" scoped>
  .main-content-wrap {
    height: 100%;
    transition: margin-left 0.28s;
    position: relative;
    background-color: $mainBackgroundColor;
    color: #fff;
    .content {
      height: 100%;
      overflow: auto;
      // padding: 20px;
    }
  }
</style>
