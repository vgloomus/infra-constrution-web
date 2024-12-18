<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-12-02 10:07:20
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-03 10:26:36
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\projectSetting\components\Legends.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="legend-content">
    <div
      v-for="type in regionTypes"
      :key="type.name"
      class="legend-item"
    >
      <span :class="['cut-rect', type.class]"></span>
      <span>{{ type.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Legends',
  data() {
    return {
      regionTypes: [
        { name: this.$t('region.cutFill'), class: 'cut-fill' },
        { name: this.$t('region.fillArea'), class: 'fill-area' },
        { name: this.$t('region.borrow'), class: 'borrow' },
        { name: this.$t('region.spoil'), class: 'spoil' },
        { name: this.$t('region.transit'), class: 'transit' }
      ]
    }
  }
}
</script>

<style scoped>
  .legend-content {
    width: 392px;
    height: 22px;
    border-radius: 4px;
    background: #191d21;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1px 8px 1px 8px;
  }

  .legend-item {
    height: 20px;
    display: flex;
    align-items: center;
    margin-right: 16px;
  }

  .cut-rect {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 5px;
  }

  .cut-fill {
    background: #f3af56;
  }

  .fill-area {
    background: #77fbfd;
  }

  .borrow {
    background: #cf4df3;
  }

  .spoil {
    background: #5688f7;
  }

  .transit {
    background: #c2ef4e;
  }
</style>
