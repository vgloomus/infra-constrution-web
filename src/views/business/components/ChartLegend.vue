<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-28 08:47:40
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\ChartLegent.vue
 * @Description: echart自定义图例
-->
<template>
  <div :class="['chart-legend']">
    <div
      v-for="item in legendList"
      :key="item.name"
      v-show="item.show"
    >
      <span
        class="line"
        :style="{borderBottom: `2px ${item.isDashed ? 'dashed' : 'solid'} ${item.color}`}"
      ></span>
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartLegend',
  data() {
    return {
    }
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    legendList() {
      return this.list.map((item) => {
        return {
          name: item.name,
          color: item.color,
          isDashed: item.extConfig.isDashed,
          show: item.extConfig.isShowLegend
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .chart-legend {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    color: $buttonDefaultColor;
    font-size: 12px;
    div {
      margin: 0 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      span {
        margin-right: 5px;
      }
    }
    .line {
      display: inline-block;
      width: 20px;
      height: 2px;
    }
    .cut-rect {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: linear-gradient(180deg, #ff0000 0%, #ff8000 100%);
    }
    .fill-rect {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: linear-gradient(180deg, #0080ff 0%, #0000ff 100%);
    }
  }
</style>
