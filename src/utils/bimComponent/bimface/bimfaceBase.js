/*
 * @author: lvzj
 * @Date: 2024-08-05 10:08:25
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-03 16:23:00
 * @description: file content
 */
import { version } from './config'
import { flatMultiLayerArea } from '@/utils/index'
import { EnumTypes } from '@/common/enum'
export default class BimfaceBase {
  constructor(options) {
    Object.assign(
      this,
      {
        /**
         * 容器ID
         */
        id: null,
        /**
         * 主模型id
         */
        fileId: null,
        /**
         * token
         */
        viewToken: null,
        /**
         * bimface项目
         */
        app: null,
        /**
         * 3D视图实例
         */
        viewer3D: null,
        /**
         * GIS实例
         */
        map: null,
        /**
         * 场景视图token
         */
        sceneViewToken: '',
        /**
         * 视图器
         */
        viewer: '',
        webAppConfig: null,
        extObjMng: null,
        drawableContainer: null,
        layerMng: null,
        extLayer: null,
        getTileLayer: null, // 获取地图地形路网图层
        tilesetlayers: [], // 图层容器
        drawingList: [], // 图纸列表
        roadLineList: [], // 中心线
        areaList: [], // 区域
        sceneAddedCallback: null,
        isTemplate: true,
        onViewerInitialized: null
      },
      options
    )
    // 初始化bimface
    this.init()
  }

  init() {
    console.log('加载到bimfaceBase.js文件')
    const BimfaceLoaderConfig = new window.BimfaceSDKLoaderConfig()
    BimfaceLoaderConfig.viewToken = this.sceneViewToken
    // BimfaceLoaderConfig.version = version
    console.log('当前bimface版本号', version)
    window.BimfaceSDKLoader.load(BimfaceLoaderConfig, this.onSDKLoadSucceeded.bind(this), this.onSDKLoadFailed.bind(this))
  }

  // SDK加载成功回调函数
  onSDKLoadSucceeded(viewMetaData) {
    const dom4Show = document.getElementById(this.id)
    const webAppConfig = new window.Glodon.Bimface.Earth.Application.WebApplicationGISConfig()
    this.webAppConfig = webAppConfig
    webAppConfig.domElement = dom4Show
    // webAppConfig.enableExplosion = true
    webAppConfig.enableBorderLine = true
    webAppConfig.disableMapOcclusion = true
    const app = new window.Glodon.Bimface.Earth.Application.WebApplicationGIS(webAppConfig)
    this.app = app
    this.viewer = app.getViewer()
    this.viewer.addScene(this.sceneViewToken)

    // 监听场景加载完成
    this.viewer.addEventListener(window.Glodon.Bimface.Earth.Viewer.ViewerGISEvent.SceneAdded, () => {
      this.viewer.getInfoBar().hide()
      this.app.getUIManager().getToolbar('MainToolbar').hide()
      console.log('场景加载完毕1111111111', viewMetaData, this.sceneViewToken)

      const drawableContainerConfig = new window.Glodon.Bimface.Earth.Plugins.Drawable.DrawableContainerConfig()
      drawableContainerConfig.viewer = this.viewer
      const drawableContainer = new window.Glodon.Bimface.Earth.Plugins.Drawable.DrawableContainer(drawableContainerConfig)
      this.drawableContainer = drawableContainer
      const extLayer = new window.Glodon.Bimface.Earth.Layer.ExternalObjectLayer({
        name: '外部构件图层',
        id: 'extLayerId',
        isVisible: true,
        priority: 1
      })
      this.layerMng = this.viewer.getLayerManager()
      this.layerMng.getRootLayer().addLayer(extLayer)
      const extObjMng = extLayer.getExternalObjectManager()
      this.extObjMng = extObjMng
      // this.extLayer = new window.Glodon.Bimface.Earth.Layer.ExternalObjectLayer({
      //   name: '拍平区域',
      //   id: 'extLayerId',
      //   isVisible: true
      // })
      // this.layerMng.addLayer(this.extLayer)
      // console.log('this.extLayer111', this.layerMng.addLayer(this.extLayer))

      // 添加dwg图层
      // this.dwgLayer = new window.Glodon.Bimface.Earth.Layer.DrawingLayer({
      //   viewToken: '366c91c9f6654794831c71250a392a10',
      //   id: '10000047790068',
      //   name: '1.总体布置图.dwg',
      //   isVisible: true
      // })
      // this.layerMng.addLayer(this.dwgLayer)
      // console.log('当前dwg图纸的相关信息this.dwgLayer', this.dwgLayer, this.dwgLayer.getId(), this.dwgLayer.getOpacity())
      // 添加dwg图层图纸
      // console.log('xxxxxxxxx', this.drawingList, this.roadLineList, this.areaList)
      if (this.drawingList.length > 0) {
        console.log('当前图纸列表信息', this.drawingList)
        this.drawingList.forEach((item) => {
          const drawing = new window.Glodon.Bimface.Earth.Layer.DrawingLayer({
            viewToken: item.dwgViewToken,
            id: item.globalBimfaceld,
            name: item.fileName,
            isVisible: true,
            priority: 2
          })
          if (!this.isTemplate) {
            drawing.clampMode({ mode: 'Model' })
          } else {
            drawing.clampMode({ mode: 'Both' })
          }
          this.layerMng.addLayer(drawing)
        })
      }
      if (this.roadLineList.length > 0) {
        this.roadLineList.forEach((item) => {
          item?.children?.forEach((line) => {
            console.log('当前道路列表信息', line)
            const gisCoordinate = JSON.parse(line?.resource?.gisCoordinate || JSON.stringify([]))
            this.createRoadLine(gisCoordinate, line.name, line.checked)
          })
        })
      }
      if (this.areaList.length > 0) {
        // 处理拍平区域
        const areaList = flatMultiLayerArea(this.areaList, [EnumTypes.AREA, EnumTypes.RESULT_REGION])
        console.log('当前拍平区域列表信息', areaList)
        areaList.forEach((item) => {
          // 断面数据
          let data = item.children?.find((it) => it.type === EnumTypes.SECTION_DATA)
          // 无断面数据层级直接拿当前层
          if (!data) {
            data = item
          }
          const points = data?.children || []
          // console.log('当前点', points)
          this.createPointsLabel(points)
        })
      }
      this.sceneAddedCallback && this.sceneAddedCallback()
    })

    // 监听图纸图层加载完成，用来处理已经存在的图层，而不是新加图层
    this.viewer.addEventListener(window.Glodon.Bimface.Earth.Viewer.ViewerGISEvent.LayerAdded, (data) => {
      // 图层加载完毕回调,踩坑：这个时机非常慢，在场景加载完之后很久才开始
      this.LayerAddedCallback && this.LayerAddedCallback()
      // const bbox = this.viewer.getLayerManager().getLayer(data.layerId).getBoundingBox()
      // // 需要捕捉的layerIds
      // this.layerIds.push(data.layerId)
      // console.log('layerIds', this.layerIds, data.layerId)

      if (data.layerType === 'DrawingLayer') {
        if (!this.isTemplate) {
          // console.log('当前图纸加载完成---设置clampMode', data.layerId)
          this.viewer.getLayerManager().getLayer(data.layerId).clampMode({ mode: 'Model' })
        }
      }

      if (data.layerType === 'TilesetLayer') {
        if (!this.isTemplate) {
          // const layer = this.viewer.getLayerManager().getLayer(data.layerId)
          // layer.setOpacity(0.5)
          // this.viewer.render()
        }
      }
      // this.viewer.getLayerManager().getLayer(data.layerId).setGeometryErrorRatio(0.8)
      // // 逐一设置其geometry error ratio （精度设置）
      // this.viewer.getLayerManager().getLayer(data.layerId).setGeometryErrorRatio(0.8)
      // if (window.bimInstancefaceId === data.layerId) {
      //   // 相机视角移动到主模型 window.bimInstancefaceId为主模型bimfaceId
      //   // 倾斜主模型的优先级设置
      //   this.viewer.getLayerManager().setLayerPriority(data.layerId, 1)
      //   this.viewer.zoomToBoundingBox({ boundingBox: bbox, duration: 0 }, () => {
      //     this.setCameraView() // 设置相机的主视角
      //   })
      // }
      // console.log('模型完成添加:::Model Added!', data)
    })
  }

  // // 添加地图地形路网图层
  // addResources(m, parentId) {
  //   // 路网地图
  //   const tileLayerRoad = new window.Glodon.Bimface.Earth.Layer.TileLayer({
  //     id: '1003',
  //     name: '路网',
  //     url: 'https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={x}&TILECOL={y}&tk=da1772607871c6baf0386909bdb0c514',
  //     parentId: '100',
  //     isVisible: true
  //   })

  //   this.viewer.getLayerManager().addLayer(tileLayerRoad)
  //   console.log('tileLayerRoad添加陈工', tileLayerRoad)
  //   this.viewer.getLayerManager().getLayer('1003').hide()

  //   this.tilesetlayers.push(
  //     {
  //       label: '地图',
  //       id: '1001',
  //       type: 'baseLayer'
  //     },
  //     {
  //       label: '地形',
  //       id: '1002',
  //       type: 'baseLayer'
  //     },
  //     {
  //       layer: tileLayerRoad,
  //       label: tileLayerRoad.name,
  //       id: tileLayerRoad.id,
  //       type: 'baseLayer'
  //     }
  //   )

  //   this.addDWG({
  //     viewToken: '3162133f560b44388d7403eed7d0a8ac',
  //     bimfaceId: '10000047098037',
  //     name: '1.总体布置图.dwg',
  //     type: 'DrawingLayer'
  //   })
  // }

  // // 添加dwg图纸
  // addDWG(dwgArray) {
  //   // dwg模型加载
  //   for (let i = 0; i < dwgArray.length; i++) {
  //     const dwgLayer = new window.Glodon.Bimface.Earth.Layer.DrawingLayer({
  //       viewToken: dwgArray[i].viewToken,
  //       id: dwgArray[i].bimfaceId,
  //       name: dwgArray[i].name,
  //       modelType: 'singleModel',
  //       isVisible: true
  //     })
  //     // 添加dwg图层
  //     this.viewer.getLayerManager().addLayer(dwgLayer)
  //   }
  // }

  // SDK加载失败回调函数
  onSDKLoadFailed(error) {
    console.log('onSDKLoadFailed error', error)
  }

  // 抽象方法，子类实现--------------------------------------------------
  // 创建中桩
  createPointsLabel() {
    throw new Error('子类必须实现这个方法')
  }

  // 创建中心线
  createRoadLine() {
    throw new Error('子类必须实现这个方法')
  }

  // 中桩在道路中心线上着重显示的点
  stalePointInRoadLine() {
    throw new Error('子类必须实现这个方法')
  }
}
