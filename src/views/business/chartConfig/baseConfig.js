/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-23 14:08:09
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-23 15:07:13
 * @FilePath: \src\views\business\chartConfig\baseConfig.js
 * @Description: echarts基础配置
 */
const baseConfig = {
  legend: {
    // 显示图例
    show: false
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderColor: 'rgba(0,0,0,0.6)',
    textStyle: {
      color: '#fff'
    }
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false, // 关键设置，去掉纵轴线
      lineStyle: {
        type: 'dashed' // 设置分割线为虚线
      }
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true, // 关键设置，去掉纵轴线
      lineStyle: {
        type: 'dashed', // 设置分割线为虚线
        color: '#474A4D'
      }
    }
  },
  series: []
}

export default baseConfig
