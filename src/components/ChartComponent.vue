<!--
 * @Description  : echarts图表组件封装
 * @Author       : 吕宗军
 * @Date         : 2024-08-13 19:25:13
 * @LastEditTime: 2024-08-27 11:28:23
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : src/components/ChartComponent.vue
-->
<template>
  <div class="container">
    <div
      :id="chartId"
      :key="chartId"
      class="chart-container"
    ></div>
  </div>
</template>

<script>
import { createHash } from '@/utils/index'
import * as echarts from 'echarts'
import mergeWith from 'lodash/mergeWith'
export default {
  name: 'ChartComponent',
  props: {
    // 图表配置
    options: {
      type: Object,
      default: () => ({})
    },
    // 窗口变化时执行
    resize: {
      type: Function
    },
    changeKey: Number,
    // option变化时不执行resize, 性能考虑
    noResize: Boolean,
    source: String
  },
  data() {
    return {
      chartInstance: null,
      chartId: createHash(),
      chartOptions: {
        grid: {
          top: '50',
          left: '2%',
          right: '2%',
          bottom: '30',
          containLabel: true
        },
        legend: {
          top: '10',
          itemGap: 12,
          type: 'scroll'
        },
        xAxis: {
        },
        yAxis: {
          name: '单位：m'
        },
        dataZoom: [
        ]
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    this.chartInstance.off('click') // 移除echarts所有click事件
    this.chartInstance.off('selectChanged') // 移除echarts所有selectChanged事件
    window.removeEventListener('resize', this.resizeChart)
    this.chartInstance = ''
  },
  watch: {
    options: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    changeKey() {
      setTimeout(() => {
        this.resizeChart()
      }, 0)
    }
  },
  methods: {
    initChart() {
      const chart = echarts.init(document.getElementById(this.chartId))
      this.chartInstance = chart
      this.chartInstance.setOption(mergeWith(this.chartOptions, this.options, this.customizer), this.source === 'noMerged')
      window.addEventListener('resize', this.resizeChart)
      this.$emit('chartReady', chart)
    },
    updateChart() {
      const option = mergeWith(this.chartOptions, this.options, this.customizer)
      this.chartInstance.setOption(option, !this.noResize)
    },
    customizer(objValue, srcValue) {
      if (Array.isArray(objValue)) {
        return srcValue
      }
    },
    resizeChart() {
      this.chartInstance.resize()
      this.$emit('chartHandle', 'resize')
      if (this.resize) {
        this.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    width: 100%;
    background: transparent;
    border-radius: 8px;
    .chart-container {
      height: 100%;
      min-height: 150px;
      width: 100%;
    }
  }
</style>
