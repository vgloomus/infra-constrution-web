<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-24 09:26:29
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-10 18:49:11
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\scene\map\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div
    class="footer"
    :style="mapToolStyle"
  >
    <div class="icon-additional-container">
      <i
        :class="currentMapMode === 'icon-2d' ? 'icon-2d':'icon-3d'"
        @click="switchMapMode"
      ></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapTool',
  data() {
    return {
      currentMapMode: 'icon-3d'
    }
  },
  props: {
    mapToolStyle: {
      type: Object,
      default: () => ({})
    },
    bimInstanceName: {
      type: String,
      default: 'bimInstance'
    }
  },
  methods: {
    switchMapMode() {
      if (this.currentMapMode === 'icon-2d') {
        this.currentMapMode = 'icon-3d'
        window[this.bimInstanceName]?.showLayerById('tile-layer')
      } else {
        this.currentMapMode = 'icon-2d'
        window[this.bimInstanceName]?.hideLayerById('tile-layer')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 6px;
    width: 34px;
    height: 34px;
    background: #1e2227;
    border-radius: 4px;
    cursor: pointer;
    z-index: 10;
  }
</style>
