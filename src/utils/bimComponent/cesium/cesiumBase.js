/*
 * @author: lvzj
 * @Date: 2024-08-06 14:21:01
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-09-12 19:14:42
 * @description: file content
 */

export default class CesiumBase {
  /**
   * 接收参数
   * @param  {{ id:string;fileId: string; viewToken:string; addFIleIds:{     fileId:string;     fileKey:string;     viewToken:string;     transformation:number[]     }[]; showMap:boolean, viewAddedCb: {():void}, isMapLoadedCb:  {():void}, }} opt
   */
  constructor(opt) {
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
        viewer: null,
        /**
         * GIS实例
         */
        map: null,
        /**
         * 初始视图角度
         */
        cameraState: null,
        /**
         * 当前bimface容器
         * 方便之后添加自定义控件
         */
        container: null,
        /**
         * 多模型加载
         */
        addFIleIds: null
      },
      opt
    )
    console.log('开始加载cesium', this)
    this.init()
  }

  /**
   * 初始
   */
  init() {
    console.log('cesium init')
  }
}
