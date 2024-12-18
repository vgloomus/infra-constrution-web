<!--
 * @author: lvzj
 * @Date: 2024-08-07 14:01:09
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-09 16:12:22
 * @description: file content
-->
<template>
  <div class="left-aside">
    <div
      v-if="isShowLeftTitle"
      class="title"
    >{{$t('scene.layerList')}}
      <slot name="title-btn">
        <i
          class="icon-folder"
          @click="$emit('addLayer')"
        ></i>
      </slot>
    </div>
    <div
      class="content"
      :style="{height: isShowLeftTitle ? 'calc(100% - 56px)' : '100%'}"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LeftAside',
  data() {
    return {}
  },
  props: {
    isShowLeftTitle: {
      type: Boolean,
      default: true
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
  .left-aside {
    width: 100%;
    height: 100%;
    background: $mainBackgroundColor;
    padding: 0 16px 16px 16px;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      height: 46px;
      font-weight: bold;
      border-bottom: 1px solid $borderDefaultColor;
      margin-bottom: 10px;
    }
    .content {
      // height: calc(100% - 56px);
      overflow-y: auto;
    }
  }
</style>
