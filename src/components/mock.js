/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-11-28 09:51:41
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-28 10:05:21
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\mock.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { cloneDeep } from 'lodash'
const data = {
  computedMode: null,
  regionName: '',
  subItemName: null,
  regionType: null,
  availableDate: null,
  maxMiningVolume: null,
  designVolume: null,
  designEarthVolume: null,
  designStoneVolume: null,
  designEarthProportion: null,
  designStoneProportion: null,
  utilizationRatioEarth: null,
  utilizationRatioStone: null,
  materialSourceRequireEarth: null,
  materialSourceRequireStone: null,
  processedEarth: null,
  processedStone: null
}
const list = []
for (let i = 0; i < 100; i++) {
  list.push(cloneDeep(data))
}
export default list
