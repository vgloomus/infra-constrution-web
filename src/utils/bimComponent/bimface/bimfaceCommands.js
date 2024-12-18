/*
 * @author: lvzj
 * @Date: 2024-08-05 10:27:28
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-17 10:14:53
 * @description: file content
 */

import BimfaceBase from './bimfaceBase'
import { renderEveryItem } from '@/utils/index'

export default class BimfaceCommand extends BimfaceBase {
  constructor(opt) {
    super({
      ...opt
    })
    this.curve = null
    this.plan = null
    // 中心线中心位置
    this.roadLineCenter = null
    this.arr = []
    this.points = [] // 点的集合
    this.focusList = [] // 焦点集合
  }

  static boundaryArray = []
  static ids = []
  static index = 0

  // 重置视图size
  resize(args) {
    this.viewer?.resize && this.viewer.resize(...args)
    this.viewer?.render && this.viewer.render()
  }

  // 用户点击图标时调用的方法
  handleIconClick() {
    if (!this.measure) {
      this.initMeasure()
    }
    // 其他处理逻辑
  }

  // 初始化测量工具的配置和实例
  initMeasure() {
    const measureConfig = new window.Glodon.Bimface.Earth.Plugins.Measure.MeasureConfig()
    measureConfig.viewer = this.viewer
    this.measure = new window.Glodon.Bimface.Earth.Plugins.Measure.Measure(measureConfig)
  }

  // 退出测量
  exitMeasure() {
    this.measure.switchOff()
  }

  // 重新进入测量模式
  reEnterMeasure() {
    this.measure.switchOn()
  }

  // 添加图纸图层
  addDrawingLayer(options) {
    const layer = new window.Glodon.Bimface.Earth.Layer.DrawingLayer(options)
    this.viewer.getLayerManager().addLayer(layer)
  }

  // 缩放到图纸图层
  zoomToDrawingLayer(layer) {
    this.viewer.getLayerManager().zoomToLayer(layer)
  }

  // 漫游到指定点
  zoomToStart(options) {
    this.viewer.getCamera().setStatus(options)
  }

  // 添加线
  drawLine() {
    this.resetSplineCurve()
    this.viewer.addEventListener(window.Glodon.Bimface.Earth.Viewer.ViewerGISEvent.MouseClicked, this.addLineHandler.bind(this))
  }

  addLineHandler(data) {
    if (data.eventType === 'RightClick') {
      if (BimfaceCommand.boundaryArray.length > 0) {
        // 删除最后一项
        this.drawableContainer.removeItemById(BimfaceCommand.ids.pop())
        BimfaceCommand.boundaryArray.pop()
        this.arr.pop()
        if (this.curve) {
          this.extObjMng.removeById(this.extObjMng.getObjectIdByName('curve'))
        }
        if (this.plan) {
          this.extObjMng.removeById(this.extObjMng.getObjectIdByName('plan'))
        }
      }
    } else {
      if (this.arr.includes(`${data.location.lon}_${data.location.lat}_${data.location.alt}`)) return
      const point = document.createElement('div')
      point.classList.add('point')
      point.style.width = '8px'
      point.style.height = '8px'
      point.style.borderRadius = '50%'
      point.style.border = '2px solid #F9DE4B'
      point.style.marginTop = '-4px'
      point.style.position = 'absolute'
      point.style.zIndex = 100
      point.style.backgroundColor = '#0A84FF'
      const config = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItemConfig()
      config.content = point
      config.id = 'point' + BimfaceCommand.index++
      BimfaceCommand.ids.push(config.id)
      config.location = data.location
      this.arr.push(`${data.location.lon}_${data.location.lat}_${data.location.alt}`)
      // console.log('arr', JSON.stringify(this.arr))
      BimfaceCommand.boundaryArray.push({ ...data.location })
      const customItem = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItem(config)
      this.drawableContainer.addItem(customItem)
    }

    if (BimfaceCommand.boundaryArray.length > 1) {
      if (this.curve) {
        this.extObjMng.removeById(this.extObjMng.getObjectIdByName('curve'))
      }
      if (this.plan) {
        this.extObjMng.removeById(this.extObjMng.getObjectIdByName('plan'))
      }
      // console.log('boundaryArray', BimfaceCommand.boundaryArray)
      this.curve = new window.Glodon.Bimface.Earth.Plugins.Geometry.SplineCurve({
        points: JSON.parse(JSON.stringify(BimfaceCommand.boundaryArray)),
        viewer: this.viewer,
        color: new window.Glodon.Web.Graphics.Color(255, 255, 0, 1),
        width: 2,
        type: 'polyline'
      })
      this.curve.clampMode({ mode: 'Model' })
      this.extObjMng.loadObject({ name: 'curve', object: this.curve })
      if (BimfaceCommand.boundaryArray.length > 2) {
        this.plan = new window.Glodon.Bimface.Earth.Plugins.Geometry.Plane({
          points: JSON.parse(JSON.stringify(BimfaceCommand.boundaryArray)),
          viewer: this.viewer
        })
        this.extObjMng.loadObject({ name: 'plan', object: this.plan }, () => {
          this.plan.setColor({
            color: new window.Glodon.Web.Graphics.Color(42, 63, 170, 0.5)
          })
          // this.plan.clampMode({ mode: 'Both' })
          this.plan.enableDepthTest(false)
        })
      }
    }
  }

  resetSplineCurve() {
    this.viewer.removeEventListener(window.Glodon.Bimface.Earth.Viewer.ViewerGISEvent.MouseClicked, this.addLineHandler.bind(this))
    BimfaceCommand.ids.forEach((id) => this.drawableContainer.removeItemById(id))
    this.extObjMng.removeById(this.extObjMng.getObjectIdByName('curve'))
    BimfaceCommand.boundaryArray = []
    BimfaceCommand.ids = []
    BimfaceCommand.index = 0
    this.arr = []
    this.curve = null
  }

  // 根据经纬度绘制垂直面
  addClampImagePlane(points) {
    const spatialPlane = new window.Glodon.Bimface.Earth.Plugins.Geometry.Plane({ points, viewer: this.viewer })
    this.extObjMng.loadObject({ name: 'spaPlane4', object: spatialPlane }, () => {
      // 面板颜色
      spatialPlane.setColor({
        color: new window.Glodon.Web.Graphics.Color(42, 63, 170, 0.5)
      })
      // 断面置顶
      // spatialPlane.enableDepthTest(false)
      this.viewer.render()
    })
  }

  // 创建道路中心线
  createRoadLine(roadLineArr, name, isVisible = true) {
    if (!roadLineArr) return
    if (roadLineArr && roadLineArr.length < 2) return
    // console.log('1', roadLineArr)
    const poi = roadLineArr.map((item) => {
      return { lon: Number(item[0]), lat: Number(item[1]), alt: this.isTemplate ? 0 : Number(item[2]) }
    })
    this.roadLineCenter = roadLineArr[Math.ceil(roadLineArr.length / 2)] // 中点的位置
    const splineCurve = new window.Glodon.Bimface.Earth.Plugins.Geometry.SplineCurve({
      points: poi,
      viewer: this.viewer,
      color: new window.Glodon.Web.Graphics.Color(0, 255, 10, 1),
      width: 3,
      type: 'spline'
    })
    if (!this.isTemplate) {
      splineCurve.clampMode({ mode: 'Both' })
    }

    // 将曲线作为外部构件载入模型
    this.extObjMng.loadObject({ name: `道路中心线-${name}`, object: splineCurve })
    if (!isVisible) {
      const ids = this.extObjMng.getObjectIdByName(`道路中心线-${name}`)
      this.extObjMng.hide({ ids: [ids] })
    }
    this.viewer.render()
  }

  // 清除断面
  clearDesignLine(ids) {
    ids.forEach((id) => this.extObjMng.removeById(this.extObjMng.getObjectIdByName(`断面线-${id}`)))
    this.extObjMng.removeById(this.extObjMng.getObjectIdByName('spaPlane4'))
  }

  // 创建桩点设计线、地形线
  createDesignLine(lineArr, id, color, type = 'spline', style = { lineType: 'Continuous', lineStyle: null }) {
    if (!lineArr) return
    if (lineArr && lineArr.length < 2) return
    const poi = lineArr.map((item) => {
      return { lon: Number(item[0]), lat: Number(item[1]), alt: this.isTemplate ? 0 : Number(item[2]) }
    })
    const splineCurve = new window.Glodon.Bimface.Earth.Plugins.Geometry.SplineCurve({
      points: poi,
      viewer: this.viewer,
      color: color || new window.Glodon.Web.Graphics.Color(0, 255, 10, 1),
      width: 3,
      type,
      style
    })
    if (!this.isTemplate) {
      // splineCurve.clampMode({ mode: 'Model' })
    }
    // 断面置顶
    // splineCurve.enableDepthTest(false)
    // 将曲线作为外部构件载入模型
    this.extObjMng.loadObject({ name: `断面线-${id}`, object: splineCurve })
    this.viewer.render()
  }

  // 创建中桩
  createPointsLabel(staleArr, isFocus = false) {
    // console.log(staleArr)
    // console.log(staleArr.filter((item) => item.checked))
    const filtersPoints = staleArr.filter((item) => item.checked)
    renderEveryItem(
      filtersPoints,
      (stale) => {
        if (!stale?.resource?.gisCoordinate) return
        const onlyKey = `${stale.resource.gisCoordinate}_${stale.name}`
        if (this.points.includes(onlyKey)) return
        this.points.push(onlyKey)
        this.createPointByNode(stale, isFocus)
      },
      20
    )
  }

  createPointByNode(node, isFocus) {
    // const gisCoordinate = JSON.parse(node?.resource?.gisCoordinate)
    const gisCoordinate = node?.resource?.gisCoordinateNew ? JSON.parse(node?.resource?.gisCoordinateNew) : JSON.parse(node?.resource?.gisCoordinate)
    const position = { lon: Number(gisCoordinate[0]), lat: Number(gisCoordinate[1]), alt: this.isTemplate ? 0 : Number(gisCoordinate[2]) }
    const content = document.createElement('div')
    content.style.width = '80px'
    content.style.overflow = 'hidden'
    content.style.whiteSpace = 'nowrap'
    content.style.textOverflow = 'ellipsis'
    content.style.borderRadius = '3px'
    content.style.backgroundColor = isFocus ? '#F9DE4B' : '#1A1C21'
    content.style.padding = '4px 6px'
    content.style.color = isFocus ? '#000' : 'white'
    content.style.fontSize = '12px'
    content.style.textAlign = 'center'
    // content.style.display = 'flex'
    // content.style.justifyContent = node?.name?.length > 6 ? 'flex-start' : 'center'
    // content.style.alignItems = 'center'
    content.style.transform = 'translateX(-40px)'
    content.style.opacity = '1'
    // content.innerHTML = `<div title=${node.name}><span>${node.name}</span></div>`
    content.innerText = node.name
    content.title = node.name
    if (this.tagNodeClick) {
      content.style.cursor = 'pointer'
      content.addEventListener('click', () => {
        this.tagNodeClick(node)
      })
    }
    const config = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItemConfig()
    config.location = position
    config.draggable = false
    config.content = content
    config.viewer = this.viewer
    config.opacity = isFocus ? 1 : 0.75
    config.id = `tag${node?.resource?.gisCoordinate}_${node.name}`
    const customItem = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItem(config)
    this.drawableContainer.removeItemById(`tag${node?.resource?.gisCoordinate}_${node.name}`)
    this.drawableContainer.addItem(customItem)
    this.stalePointInRoadLine(position, `${node?.resource?.gisCoordinate}_${node.name}`, isFocus)
  }

  // 显示桩号
  showStalePoint(nodes) {
    this.createPointsLabel(nodes)
  }

  // 聚焦桩号
  focusStalePoint(nodes) {
    const hide = nodes.filter((item) => this.points.includes(`${item.resource.gisCoordinate}_${item.name}`))
    if (hide.length) {
      this.deleteStalePoint(hide)
    }
    if (this.focusList.length) {
      const create = this.focusList.filter((item) => this.points.includes(`${item.resource.gisCoordinate}_${item.name}`))
      const hide = this.focusList.filter((item) => !this.points.includes(`${item.resource.gisCoordinate}_${item.name}`))
      if (create.length) {
        this.deleteStalePoint(create)
        const nodeNames = nodes.map((item) => `${item.resource.gisCoordinate}_${item.name}`)
        create.forEach((node) => {
          if (!nodeNames.includes(`${node.resource.gisCoordinate}_${node.name}`)) {
            this.createPointByNode(node, false)
          }
        })
      }
      if (hide.length) {
        this.deleteStalePoint(hide)
      }
    }
    if (nodes.length) {
      const list = renderEveryItem(
        nodes,
        (node) => {
          this.createPointByNode(node, true)
        },
        20
      )
      this.focusList = list
    }
  }

  // 删除桩号
  deleteStalePoint(nodes) {
    nodes.forEach((node) => {
      this.drawableContainer.removeItemById(`tag${node.resource.gisCoordinate}_${node.name}`)
      this.drawableContainer.removeItemById(`point${node.resource.gisCoordinate}_${node.name}`)
    })
  }

  // 隐藏桩号
  hideStalePoint(nodes) {
    const ids = nodes.map((item) => `${item.resource?.gisCoordinate}_${item.name}`)
    // console.log('hideStalePoint', ids, this.points)
    this.points = this.points.filter((item) => !ids.includes(item))
    ids.forEach((id) => {
      this.drawableContainer.removeItemById(`tag${id}`)
      this.drawableContainer.removeItemById(`point${id}`)
    })
  }

  // 中桩在道路中心线上着重显示的点
  stalePointInRoadLine(lonlat, name, isFocus) {
    const content = document.createElement('div')
    content.style.width = '8px'
    content.style.height = '8px'
    content.style.borderRadius = '50%'
    content.style.border = `2px solid ${isFocus ? '#F9DE4B' : '#BBD0E7'}`
    content.style.marginTop = '-4px'
    content.style.position = 'absolute'
    content.style.zIndex = 100
    content.style.backgroundColor = isFocus ? '#fff' : '#0A84FF'
    content.style.transform = 'translateX(-4px)'
    const config = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItemConfig()
    config.opacity = isFocus ? 1 : 0.75
    config.location = lonlat
    config.draggable = false
    config.content = content
    config.viewer = this.viewer
    config.id = 'point' + name
    const customItem = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItem(config)
    this.drawableContainer.removeItemById('point' + name)
    this.drawableContainer.addItem(customItem)
  }

  // 显示当中选中图纸的图层
  showLayer(cardList, layerId) {
    const list = cardList.filter((item) => item.transformStatus === 0)
    list.forEach((item) => {
      this.viewer
        .getLayerManager()
        .getLayer('layer_' + item.globalBimfaceId)
        .hide()
    })
    this.viewer.getLayerManager().getLayer(layerId).show()
    this.viewer.getLayerManager().zoomToLayer(layerId)
    this.viewer.render()
  }

  // 获取当前视角
  getCameraStatus() {
    return this.viewer.getCamera().getStatus()
  }

  // 聚焦到图层
  focusToLayer(layerId) {
    this.viewer?.getLayerManager()?.zoomToLayer(layerId)
  }

  // 销毁
  destroy() {
    this.viewer?.destroy && this.viewer?.destroy()
  }

  // 显示图层
  showLayerById(layerId) {
    this.viewer?.getLayerManager().getLayer(layerId)?.show()
  }

  // 隐藏图层
  hideLayerById(layerId) {
    this.viewer?.getLayerManager().getLayer(layerId)?.hide()
  }

  // 显示外部构件
  showExtByName(names) {
    const ids = names.map((name) => this.extObjMng.getObjectIdByName(name))
    this.extObjMng.show({ ids })
    this.drawableContainer.showItemsById(names)
    this.viewer.render()
  }

  // 隐藏外部构件
  hideExtByName(names) {
    const ids = names.map((name) => this.extObjMng.getObjectIdByName(name))
    this.extObjMng.hide({ ids })
    this.drawableContainer.hideItemsById(names)
    this.viewer.render()
  }

  // 设置相机状态
  setCameraStatus(cameraStatus) {
    this.viewer.setCameraStatus(cameraStatus)
  }

  // 根据经纬度绘制mesh面
  drawMeshPlane(node, isFocus = false) {
    node.resourceData.forEach((points, index) => {
      const newPoint = points.map((item) => {
        return { lon: item.lon, lat: item.lat, alt: this.isTemplate ? 0 : +item.alt }
      })
      const normalLineColor = new window.Glodon.Web.Graphics.Color(0, 255, 10, 1)
      // const normalPlaneColor = new window.Glodon.Web.Graphics.Color(42, 63, 170, 0.7)
      const focusLineColor = new window.Glodon.Web.Graphics.Color(249, 222, 75, 1)
      // const focusPlaneColor = new window.Glodon.Web.Graphics.Color(249, 222, 75, 0.7)
      const spatialPlane = new window.Glodon.Bimface.Earth.Plugins.Geometry.Plane({
        points: newPoint,
        borderColor: isFocus ? focusLineColor : normalLineColor,
        viewer: this.viewer,
        priority: 1,
        isGroup: true
      })
      // const splineCurve = new window.Glodon.Bimface.Earth.Plugins.Geometry.SplineCurve({
      //   points: newPoint,
      //   viewer: this.viewer,
      //   color: isFocus ? focusLineColor : normalLineColor,
      //   width: 3,
      //   type: 'polyline'
      // })
      // this.extObjMng.loadObject({ name: `mesh_line-${index}_${id}`, object: splineCurve })
      this.extObjMng.loadObject({ name: `mesh_${index}_${node.resourceKey}_${node.type}`, object: spatialPlane }, () => {
        // 面板颜色
        // spatialPlane.setColor({
        //   color: isFocus ? focusPlaneColor : normalPlaneColor
        // })
        // checked ? spatialPlane.show() : spatialPlane.hide()
        // spatialPlane.clampMode({ mode: 'Both' })
        this.viewer.render()
      })
    })
  }

  // 根据查询范围线返回的对象绘制平面
  drawBoundaryPlanes(boundaryData, selectedId = null) {
    if (!boundaryData.length) return
    // boundaryData 数据格式
    // [
    //   {
    //     id: '1',
    //     name: '1',
    //     gisCenter: [116.397428, 39.90923, 0],
    //     type:  '1', 对应颜色 1: cutFill, 2: fill, 3: borrow, 4: spoil, 5: transit
    //     points: [
    //       [116.397428, 39.90923, 0],
    //       [116.397428, 39.90923, 0]
    //     ]
    //   }
    // ]
    // TODO:声明五个颜色，根据type对应颜色
    const cutFill = new window.Glodon.Web.Graphics.Color(243, 175, 86, 0.9)
    const fill = new window.Glodon.Web.Graphics.Color(119, 251, 253, 0.9)
    const borrow = new window.Glodon.Web.Graphics.Color(207, 77, 243, 0.9)
    const spoil = new window.Glodon.Web.Graphics.Color(86, 136, 247, 0.9)
    const transit = new window.Glodon.Web.Graphics.Color(194, 239, 78, 0.9)
    const dx = new window.Glodon.Web.Graphics.Color(249, 222, 75, 0.5)
    const dxR = new window.Glodon.Web.Graphics.Color(237, 71, 73, 0.5)
    const cutFillBorder = new window.Glodon.Web.Graphics.Color(243, 175, 86, 1)
    const fillBorder = new window.Glodon.Web.Graphics.Color(119, 251, 253, 1)
    const borrowBorder = new window.Glodon.Web.Graphics.Color(207, 77, 243, 1)
    const spoilBorder = new window.Glodon.Web.Graphics.Color(86, 136, 247, 1)
    const transitBorder = new window.Glodon.Web.Graphics.Color(194, 239, 78, 1)
    const dxBorder = new window.Glodon.Web.Graphics.Color(249, 222, 75, 1)
    const dxRBorder = new window.Glodon.Web.Graphics.Color(237, 71, 73, 1)

    const color = {
      1: cutFill,
      2: fill,
      3: borrow,
      4: spoil,
      5: transit,
      6: dx,
      7: dxR
    }
    const borderColor = {
      1: cutFillBorder,
      2: fillBorder,
      3: borrowBorder,
      4: spoilBorder,
      5: transitBorder,
      6: dxBorder,
      7: dxRBorder
    }
    boundaryData.forEach((boundary) => {
      this.createPlaneByNode(boundary, color[boundary.type], borderColor[boundary.type], boundary.id === selectedId)
    })
  }

  // 创建平面
  createPlaneByNode(node, color, borderColor, isSelected = false) {
    // TODO 临时增加过滤功能，后期需要待bimface支持
    const firstPoint = node?.points?.[0] || []
    node.points = node?.points?.filter((point) => point[0] !== firstPoint[0] || point[1] !== firstPoint[1] || point[2] !== firstPoint[2])
    node.points?.unshift(firstPoint)
    // boundary.points.push(firstPoint)
    const newPoint = node.points.map((item) => {
      return { lon: parseFloat(item[0]), lat: parseFloat(item[1]), alt: item[2] ? parseFloat(item[2]) : 0 }
    })
    if (newPoint?.length < 3) {
      return
    }
    const spatialPlane = new window.Glodon.Bimface.Earth.Plugins.Geometry.Plane({
      points: newPoint,
      viewer: this.viewer
    })
    // const splineCurve = new window.Glodon.Bimface.Earth.Plugins.Geometry.SplineCurve({
    //   points: newPoint,
    //   viewer: this.viewer,
    //   color: color[boundary.regionTypeId],
    //   width: 5,
    //   type: 'spline'
    // })
    // splineCurve.clampMode({ mode: 'Both' })
    this.extObjMng.loadObject({ name: `boundary_mesh_${node.id}`, object: spatialPlane }, () => {
      // 面板颜色
      spatialPlane.setColor({ color, borderColor })
      // spatialPlane.clampMode({ mode: 'Both' })
      spatialPlane.enableDepthTest(false)
      this.viewer.render()
    })
    this.createLabelByNode(node, isSelected)
  }

  createLabelByNode(node, isSelected = false) {
    const key = `boundary_mesh_${node.id}`
    const content = document.createElement('div')
    content.style.width = '80px'
    content.style.overflow = 'hidden'
    content.style.whiteSpace = 'nowrap'
    content.style.textOverflow = 'ellipsis'
    content.style.borderRadius = '3px'
    // content.style.backgroundColor = colors[type]
    content.style.padding = '4px 6px'
    content.style.color = 'rgba(0, 0, 0, 0.88)'
    content.style.fontSize = '12px'
    content.style.fontWeight = 'bold'
    content.style.textAlign = 'center'
    // content.style.textAlign = 'left'
    // content.style.display = 'flex'
    content.style.textShadow = '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white'
    // content.style.justifyContent = node?.name?.length > 6 ? 'flex-start' : 'center'
    // content.style.alignItems = 'center'
    content.style.transform = 'translateX(-40px)'
    content.style.opacity = '1'
    if (isSelected) {
      content.style.backgroundColor = 'rgba(0, 0, 0, 0.5)' // 设置选中文字背景色
    }
    content.innerText = node.name
    content.title = node.name
    const config = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItemConfig()
    config.location = {
      lon: node.gisCenter[0],
      lat: node.gisCenter[1],
      alt: node.gisCenter[2] || 0
    }
    config.draggable = false
    config.content = content
    config.viewer = this.viewer
    config.opacity = 1
    config.id = key
    const customItem = new window.Glodon.Bimface.Earth.Plugins.Drawable.CustomItem(config)
    this.drawableContainer.removeItemById(key)
    this.drawableContainer.addItem(customItem)
  }

  // 聚焦标签
  focusLabelById(id, isSelected = false) {
    const currentItem = this.drawableContainer.getItemById(id)?.getContent()
    if (currentItem) {
      currentItem.style.backgroundColor = isSelected ? 'rgba(0, 0, 0, 0.5)' : 'transparent' // 设置选中文字背景色
    }
    // 面板着色
    // const id2 = this.extObjMng.getObjectIdByName(id)
    // const node = this.extObjMng.getObjectData(id2)
    // console.log('node', node)
  }

  // 测量点坐标
  measurePoint() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.Position)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量距离
  measureDistance() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.PolylineDistance)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量投影面积
  measureProjectedArea() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.ProjectedArea)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量空间面积
  measureSpatialArea() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption?.SpatialArea)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量贴地面积
  measureSurfaceArea() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.SurfaceArea)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量三角形
  measureTriangleDistance() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.TriangleDistance)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  // 测量角度
  measureAngle() {
    this.measure.setMeasureType(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureTypeOption.Angle)
    this.measure.addEventListener(window.Glodon.Bimface.Earth.Plugins.Measure.MeasureEvent.Measuring)
  }

  clearMeasureData() {
    this.measure.clear()
  }

  // 清除外部构件通过names
  removeExtByNames(names) {
    const ids = names.map((name) => this.extObjMng.getObjectIdByName(name))
    this.extObjMng.removeByIds(ids)
    this.viewer.render()

    // 删除名称
    names.forEach((name) => {
      this.drawableContainer.removeItemById(name)
    })
  }

  // 设置外部构建颜色
  setExtColorByNames(names, color = '') {
    const normalPlaneColor = new window.Glodon.Web.Graphics.Color(249, 222, 75, 0.7)
    const ids = names.map((name) => this.extObjMng.getObjectIdByName(name))
    this.extObjMng.overrideColor(
      {
        ids
      },
      color || normalPlaneColor
    )
  }

  // 恢复外部构件颜色
  restoreExtColorByNames(names) {
    const ids = names.map((name) => this.extObjMng.getObjectIdByName(name))
    this.extObjMng.restoreColor({ ids })
  }

  // 通过图层Id获取图层
  getLayerById(id) {
    return this.viewer.getLayerManager().getLayer(id)
  }
}
