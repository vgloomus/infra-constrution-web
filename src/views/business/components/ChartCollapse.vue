<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-06 09:38:25
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\ChartCollapse.vue
 * @Description: 图标折叠面板
-->
<template>
  <div
    :class="['chart-collapse', { 'chart-hide': !chartExpand }]"
    :style="`left: ${slideWidth.left}px;right:${slideWidth.right}px;`"
  >
    <div
      @click="expand"
      class="bar"
    >
      <span class="label">{{ $t('chartCollapseChart.section') }}</span>
      <i class="el-icon-arrow-down"></i>
    </div>
    <div class="content">
      <div
        class="chart-container"
        :style="{ width: isReduceConfig ? 'calc(100% - 320px)' : '100%'}"
      >
        <ChartComponent
          class="chart-component"
          source="noMerged"
          v-loading="loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          :changeKey="changeKey"
          @chartReady="chartReady"
          :options="chartOption"
        />
        <ChartLegend :list="list" />
        <el-button
          v-if="isShowConfig"
          type="text"
          size="small"
          class="chart-btn"
          @click="openReduceConfig"
        >{{ isReduceConfig ? $t('chartCollapseChart.close') : $t('chartCollapseChart.correct') }}</el-button>
      </div>
      <ReduceConfig
        @close="closeReduceConfig"
        @change="(config) => $emit('onReduceConfig', config)"
        @save="(config) => saveConfig(config)"
        :settings="settings"
        ref="reduceConfigRef"
        v-show="isReduceConfig"
      />
    </div>
  </div>
</template>

<script>
import ChartComponent from '@/components/ChartComponent.vue'
import ChartLegend from './ChartLegend.vue'
import ReduceConfig from './ReduceConfig.vue'

export default {
  name: 'ChartCollapse',
  components: {
    ChartComponent,
    ChartLegend,
    ReduceConfig
  },
  data() {
    return {
      chartExpand: false,
      chart: null,
      changeKey: 0,
      isReduceConfig: false
    }
  },
  props: {
    chartOption: {
      type: Object,
      default: () => {
        return {}
      }
    },
    slideWidth: {
      type: Object,
      default: () => {
        return {
          left: 300,
          right: 300
        }
      }
    },
    isExpand: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => {
        return null
      }
    },
    isShowConfig: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  watch: {
    slideWidth: {
      handler(val) {
        this.changeKey++
      },
      deep: true
    },
    isExpand(val) {
      this.chartExpand = val
    }
  },
  methods: {
    // 展开收起
    expand() {
      this.chartExpand = !this.chartExpand
    },
    chartReady(chart) {
      this.chart = chart
    },
    openReduceConfig() {
      this.isReduceConfig = !this.isReduceConfig
      if (!this.isReduceConfig) {
        this.$refs.reduceConfigRef.resetHandler()
      }
      this.changeKey++
    },
    closeReduceConfig() {
      this.isReduceConfig = false
      this.changeKey++
    },
    saveConfig(config) {
      this.$emit('onSaveConfig', config)
    }
  }
}
</script>

<style lang="scss" scoped>
  .chart-collapse {
    position: absolute;
    left: 300px;
    right: 300px;
    height: 240px;
    bottom: 0;
    background: #191d21;
    z-index: 111;
    // width: calc(100% - 600px);
    .bar {
      height: 25px;
      width: 100px;
      background: url("~@/assets/images/icon-card.png") no-repeat;
      background-size: 100% 100%;
      position: absolute;
      left: 0;
      top: -25px;
      cursor: pointer;
      color: #fff;
      text-align: center;
      line-height: 25px;
      .label {
        margin-right: 5px;
      }
    }
    .content {
      height: 100%;
      width: 100%;
      display: flex;
      .chart-container {
        flex: 1;
        height: 100%;
        position: relative;
        .chart-component {
          height: 100%;
        }
        .chart-btn {
          position: absolute;
          right: 10px;
          top: 10px;
        }
      }
      .reduce-config {
        width: 320px;
        height: 100%;
      }
    }
    &.chart-hide {
      bottom: -240px;
      .el-icon-arrow-down {
        transform: rotate(180deg);
      }
    }
  }
</style>
