/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-17 09:44:34
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-28 20:09:46
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\common\enum.js
 * @Description: 枚举
 * */
export const EnumTypes = {
  RECEIPT_TEMPLATE: 1, // 收方模板
  CENTER_LINE: 2, // 中心线
  AREA: 3, // 区域
  PILE_NUMBER: 4, // 桩号
  DESIGN_LAYER: 5, // 设计图层
  DRAWING: 6, // 图纸
  BASE_MAP_LAYER: 7, // 底图图层
  MODEL: 8, // 模型
  ANNOTATION_LAYER: 9, // 标注图层
  ANNOTATION: 10, // 标注
  RESULT: 11, // 收方成果
  RESULT_REGION: 12, // 收方成果-区域
  RESULT_STAKE: 13, // 收方成果-桩号
  TERRAIN_MODEL: 14, // 地形模型
  SECTION_DATA: 15, // 断面数据
  BASAL_DATA: 17, // 基底分界
  ROCK_SOIL_BOUNDARY: 26, // 土石分界
  ROCK_SOIL_BOUNDARY_GROUP: 16, // 土石分界分组
  REGION_LAYER: 18, // 区域图层
  TERRAIN_PRE: '10', // 地形前期
  TERRAIN_POST: '11', // 地形后期
  COMPARISON_RESULT_POST: '20' // 对比成果-只有后期
}

export const EnumRegionTagType = {
  DIG_AREA: '1', // 挖方区
  FILL_AREA: '2', // 填方区
  BORROW_AREA: '3', // 借方区
  DUMP_AREA: '4', // 弃土场
  TRANSFER_AREA: '5' // 中转场
}

export const EnumComputeStatus = {
  // 断面对比计算状态
  COMPUTED_SUCCESS: 3, // 计算成功
  COMPUTED_FAIL: 2, // 计算失败
  COMPUTING: 1, // 计算中
  COMPUTE_NOT_START: 0 // 计算未开始
}

// 计算方式
const EnumComputeType = [
  {
    label: '测量收方模块(横断面法)',
    value: 1
  },
  {
    label: '两期对比模块(地形扣减法)',
    value: 2
  },
  {
    label: '人工填报',
    value: 3
  }
]

// 区域类型
const EnumRegionType = [
  {
    label: '挖方区',
    value: 1
  },
  {
    label: '填方区',
    value: 2
  },
  {
    label: '借方区',
    value: 3
  },
  {
    label: '弃土场',
    value: 4
  },
  {
    label: '中转场',
    value: 5
  }
]

// 原料要求
const EnumMaterialType = [
  {
    label: '可利用',
    value: 1
  },
  {
    label: '不可利用',
    value: 2
  },
  {
    label: '可利用+不可利用',
    value: '1,2'
  }
]
// 可接受料原
const EnumAcceptMaterialType = [
  {
    label: '土',
    value: 2
  },
  {
    label: '石',
    value: 3
  },
  {
    label: '土+石',
    value: '2,3'
  }
]
export const EnumComputeTypeMap = new Map(EnumComputeType.map((item) => [item.label, item.value]))
export const EnumRegionTypeMap = new Map(EnumRegionType.map((item) => [item.label, item.value]))
export const EnumMaterialTypeMap = new Map(EnumMaterialType.map((item) => [item.label, item.value]))
export const EnumAcceptMaterialTypeMap = new Map(EnumAcceptMaterialType.map((item) => [item.label, item.value]))
