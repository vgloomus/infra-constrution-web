/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-23 14:11:32
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-28 08:00:00
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\chartConfig\comparisonsConfig.js
 * @Description: 断面对比配置
 */
const comparisonsConfig = [
  {
    data: [],
    type: 'line',
    smooth: true,
    name: '原地面线',
    showSymbol: false,
    color: '#F5DF66',
    lineStyle: {
      type: 'dashed'
    },
    extConfig: {
      color: [245, 223, 102, 1],
      type: 'spline',
      id: '3',
      gisKey: 'terrainGisCoords',
      chartKey: 'terrainEngineerCoords',
      sort: false,
      isDashed: true,
      isShowLegend: false
    }
  },
  {
    data: [],
    showSymbol: false,
    type: 'line',
    color: '#1677FF',
    name: '前期收方线',
    smooth: true, // 让线条平滑
    extConfig: {
      color: [22, 119, 255, 1],
      type: 'spline',
      id: '5',
      gisKey: 'preGisCoords',
      chartKey: 'preEngineerCoords',
      sort: true,
      isDashed: false,
      isShowLegend: false
    }
  },
  {
    data: [],
    showSymbol: false,
    type: 'line',
    color: '#00FFC6',
    name: '后期收方线',
    smooth: true, // 让线条平滑
    markLine: {
      symbol: ['circle', 'none'],
      lineStyle: {
        color: 'rgb(249 222 75)'
      },
      label: {
        show: false
      },
      data: []
    },
    extConfig: {
      color: [0, 255, 198, 1],
      type: 'spline',
      id: '1',
      gisKey: 'postGisCoords',
      chartKey: 'postEngineerCoords',
      sort: true,
      isDashed: false,
      isShowLegend: false
    }
  },
  {
    data: [],
    type: 'line',
    smooth: false,
    name: '设计线',
    showSymbol: false,
    color: '#FFFFFF',
    extConfig: {
      color: [255, 255, 255, 1],
      type: 'polyline',
      id: '2',
      gisKey: 'designGisCoords',
      chartKey: 'designEngineerCoords',
      sort: false,
      isDashed: false,
      isShowLegend: false
    }
  },
  {
    data: [],
    type: 'line',
    smooth: true,
    name: '土石分界线',
    showSymbol: false,
    color: '#AB7AE0',
    extConfig: {
      color: [171, 122, 224, 1],
      type: 'spline',
      id: '4',
      gisKey: 'postStoneBoundaryGisCoords',
      chartKey: 'postStoneBoundaryEngineerCoords',
      sort: false,
      isDashed: false,
      isShowLegend: false
    }
  }
]

export default comparisonsConfig