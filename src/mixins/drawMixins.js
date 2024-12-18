/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-17 09:01:36
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-25 10:32:32
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\mixins\drawMixins.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 *
 */
import baseConfig from '@/views/business/chartConfig/baseConfig'
import { EnumTypes } from '@/common/enum'
import { verticalForce, elevationInterpolation } from '@/utils/bimCompute'
import {
  findMaxSubarray,
  findMinSubarray,
  findNodeListsWithType,
  translateCoordinates,
  calculateAngleRight,
  calculateAngleBetweenPoints
} from '@/utils/index'
const drawMixins = {
  data() {
    return {
      legendArr: []
    }
  },
  methods: {
    mappingData(sort, data) {
      return sort ? JSON.parse(data).sort((a, b) => a[3] - b[3]) : JSON.parse(data)
    },
    // 处理收方成果数据
    drawHandle(node, tree, configList, type = EnumTypes.PILE_NUMBER) {
      // 查找当前桩点
      const nodes = findNodeListsWithType(tree, type)
      const curNode = nodes.find((item) => item.name === node.name && item.resource.engineerCoordinate === node.resource.engineerCoordinate)
      // 将工程坐标加入到节点
      node.engineerCoordinate = curNode?.resource?.engineerCoordinate
      // 工程坐标、图标计算-----------------------------------
      // 设计线
      const coords = []
      const gisArr = []
      configList.forEach((item) => {
        const chartKey = item.extConfig.chartKey
        const gisKey = item.extConfig.gisKey
        const isSort = item.extConfig.sort
        const chartCoords = this.curPointData[chartKey] ? this.mappingData(isSort, this.curPointData[chartKey]) : []
        const gisCoords = this.curPointData[gisKey] ? this.mappingData(isSort, this.curPointData[gisKey]) : []
        coords.push(chartCoords)
        gisArr.push(gisCoords)
        item.extConfig.isShowLegend = chartCoords.length > 0
      })
      this.legendArr = configList
      // 绘制图表, 并返回
      const [xMinIndex, xMaxIndex, xMinInd, xMaxInd] = this.drawChart(node, coords, configList)

      this.clampPlane(...gisArr, xMinIndex, xMaxIndex, xMinInd, xMaxInd)
      // 绘制gis线
      this.drawDesignLine(gisArr, configList)
      // 计算垂直飞入视角
      const minCoord = gisArr[xMinIndex][xMinInd]
      const maxCoord = gisArr[xMaxIndex][xMaxInd]
      const opt = [
        { lat: maxCoord[1], lon: maxCoord[0], alt: maxCoord[2] - 2 },
        { lat: minCoord[1], lon: minCoord[0], alt: minCoord[2] - 2 }
      ]
      const options = verticalForce(opt)
      if (curNode) {
        // 替换桩点gis高程, 参照收放线
        const findIndex = configList.findIndex((item) => item.name === '后期收方线' || item.name === '收方线')
        const newGisCoordinate = elevationInterpolation(gisArr[findIndex], JSON.parse(node.resource.gisCoordinate))
        // 兼容新高程
        curNode.resource.gisCoordinateNew = JSON.stringify(newGisCoordinate)
        this.$refs.layerTreeRef.handleFocusNode({}, curNode, options)
      }
    },
    // 绘制地形线，设计线
    drawDesignLine(gisArr, configList) {
      const dashed = {
        lineType: 'Dashed',
        lineStyle: { dashLength: 1, gapLength: 1 }
      }
      configList.forEach((item, index) => {
        const data = gisArr[index]
        const color = new window.Glodon.Web.Graphics.Color(...item.extConfig.color)
        const isDashed = item.extConfig.isDashed
        const type = item.extConfig.type
        const id = item.extConfig.id
        const params = [data, id, color, type]
        if (isDashed) {
          params.push(dashed)
        }
        window.bimInstance?.createDesignLine(...params)
      })
    },
    // 绘制chart
    drawChart(node, coordsArr, configList) {
      // **  注意顺序 **
      // 0 : 收放线 1 : 设计线 2 : 原地面线
      const yMaxArr = []
      const yMinArr = []
      const xMaxArr = []
      const xMinArr = []
      const first = coordsArr[0]
      const allData = []
      this.angle = calculateAngleBetweenPoints(first[0], first[first.length - 1])
      this.isRight = calculateAngleRight(first[0], first[first.length - 1])
      baseConfig.series = configList
      coordsArr.forEach((item, index) => {
        const newItem = translateCoordinates(item, this.angle, this.isRight)
        baseConfig.series[index].data = newItem
        const flag = newItem?.length > 1
        yMinArr.push(flag ? findMinSubarray(newItem, 1)[1] : Infinity)
        yMaxArr.push(flag ? findMaxSubarray(newItem, 1)[1] : -Infinity)
        xMinArr.push(flag ? findMinSubarray(newItem, 0)[0] : Infinity)
        xMaxArr.push(flag ? findMaxSubarray(newItem, 0)[0] : -Infinity)
        allData.push(newItem)
      })
      if (node.engineerCoordinate) {
        const engineerCoordinate = JSON.parse(node.engineerCoordinate)
        const newEngineerCoordinate = translateCoordinates([engineerCoordinate], this.angle, this.isRight)
        const findIndex = configList.findIndex((item) => item.name === '后期收方线' || item.name === '收方线')
        baseConfig.series[findIndex].markLine.data = [
          {
            xAxis: newEngineerCoordinate[0][0]
          }
        ]
      }
      const yMin = Math.min(...yMinArr)
      const yMax = Math.max(...yMaxArr)
      baseConfig.yAxis.min = yMin - 1
      baseConfig.yAxis.max = yMax + 1
      baseConfig.yAxis.axisLabel = {
        formatter: function (value) {
          return parseInt(+value)
        }
      }
      // 根据y轴确定x轴最大值
      const xMin = Math.min(...xMinArr)
      const xMaxVal = Math.max(...xMaxArr)
      const xMinIndex = xMinArr.indexOf(xMin)
      const xMaxIndex = xMaxArr.indexOf(xMaxVal)
      const xMinInd = allData[xMinIndex].findIndex((item) => {
        return item[0] === xMin
      })
      const xMaxInd = allData[xMaxIndex].findIndex((item) => item[0] === xMaxVal)
      const wrapHeight = this.$refs.chartRef.$el.offsetHeight
      const wrapWidth = this.$refs.chartRef.$el.offsetWidth - 50
      // 根据 y轴最小，最大值确定x轴最大值
      const xMax = xMin + (yMax - yMin) * (wrapWidth / wrapHeight)
      const space = (xMax - xMaxVal) / 2
      baseConfig.xAxis.min = space > 0 ? parseInt(xMin - space) : parseInt(xMin) - 1
      baseConfig.xAxis.max = space > 0 ? parseInt(xMaxVal + space) : parseInt(xMaxVal) + 1
      baseConfig.tooltip.formatter = (params) => {
        return this.tipFormatterHandler(node, configList, params)
      }
      this.chartOption = baseConfig
      return [xMinIndex, xMaxIndex, xMinInd, xMaxInd]
    },
    // 提示框处理逻辑
    tipFormatterHandler(node, configList, params) {
      const strArr = []
      configList.forEach((config) => {
        const data = params.find((item) => item.seriesName === config.name)
        if (data) {
          strArr.push(data)
        }
      })
      const strMap = strArr.map((item) => {
        return `${item.seriesName}高度` + ': ' + parseInt(+item.data[1])
      })
      let str = ''
      if (strMap.length > 1) {
        str = strMap.join('<br/>')
      } else {
        str = strMap[0]
      }
      return `${node.name}` + '<br/>' + str
    },
    // 画面
    clampPlane(...arr) {
      // 提取参数
      const [xMinIndex, xMaxIndex, xMinInd, xMaxInd] = arr.slice(-4)
      const dataArr = arr.slice(0, -4)
      const altArr = []
      dataArr.forEach((item) => {
        item.forEach((it) => {
          altArr.push(it[2])
        })
      })
      const min = dataArr[xMinIndex][xMinInd]
      const max = dataArr[xMaxIndex][xMaxInd]
      const altMax = Math.max(...altArr)
      const altMin = Math.min(...altArr)
      const points = [
        { lat: min[1], lon: min[0], alt: altMin - 2 },
        { lat: max[1], lon: max[0], alt: altMin - 2 },
        { lat: max[1], lon: max[0], alt: altMax + 2 },
        { lat: min[1], lon: min[0], alt: altMax + 2 }
      ]
      window.bimInstance?.addClampImagePlane(points)
    },
    // 点击场景标签触发
    tagNodeClick(node) {
      const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_STAKE)
      const curNode = nodes.find((item) => item.name === node.name && node.resource?.gisCoordinate === item.resource?.gisCoordinate)
      if (curNode) {
        this.handleNodeClick(curNode)
        this.$refs.resultTreeRef?.setCurrentKey(curNode.key)
      } else {
        this.$message.warning('此桩号无收方数据!')
      }
    }
  }
}

export default drawMixins
