/*
 * @author: lvzj
 * @Date: 2024-08-06 14:17:09
 * @LastEditors: lvzj
 * @LastEditTime: 2024-08-06 15:08:37
 * @description: file content
 */
import BimfaceCommands from './bimface/bimfaceCommands'
// import CesiumCommands from './cesium/cesiumCommands'

export default class BimFactory {
  /**
   * @description: 创建bim组件
   * @param {*} options 初始化组件参数
   * @param {*} type 应用组件类型
   * @return {*}
   */
  static create(options, type = 'bimface') {
    switch (type) {
      case 'bimface':
        return new BimfaceCommands(options)
      // case 'cesium':
      //   return new CesiumCommands(options)
      default:
        return null
    }
  }
}
