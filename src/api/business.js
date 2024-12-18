/*
 * @Description  : 业务应用
 * @Author       : 吕宗军
 * @Date         : 2023-03-21 18:35:54
 * @LastEditTime: 2024-12-16 15:47:29
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\api\projectInfo.js
 */
import Services from './baseServices'

const baseUrl = '/api'
export const services = new Services(baseUrl)

// 测量收方列表
export const getReceiveList = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/tasks`, { params })
}

// 测量收方删除
export const deleteReceiveTask = (projectId, id) => {
  return services.baseService.delete(`/earthwork/projects/${projectId}/tasks/${id}`)
}

// 获取收方图层目录
export const getReceiveLayerList = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/task/layers`, { params })
}

// 获取测量收方打标签的日期
export const getTagDate = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/tasks/getTagDate`, {})
}

// 收方任务详情
export const getReceiveDetail = (projectId, taskId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}`, {})
}

// 获取模型列表
export const getModelList = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/images-terrains/models`, params)
}
// 保存收方
export const saveReceive = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks`, params)
}

// 收方上传图纸
export const uploadReceive = (projectId, taskId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}/thumbnails`, params)
}
// 发起计算
export const startCalculate = (projectId, taskId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}/calculation`, params)
}
// 获取桩号计算结果
export const getCalculateResult = (projectId, taskId, stakeId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}/stakes/${stakeId}/result`, {})
}

// 分享页获取桩号计算结果
export const getShareCalculateResult = (shareCode, key) => {
  return services.baseService.get('/earthwork/shares/extend', { params: { shareCode, key } })
}

// 获取各区域计算状态
export const getCalculateStatus = (projectId, taskId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/task/${taskId}/status`, {})
}

// 获取地形边界
export const getTerrainBoundary = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/images-terrains/boundary`, params)
}
// 获取桩点截面
export const getStakeSection = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stakes`, { params })
}

// 获取测量收方分享码
export const getReceiveShareCode = (projectId, body) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/shares`, body)
}

// 获取测量收方分享页数据
export const getReceiveShareDetail = (shareCode) => {
  return services.baseService.get(`/earthwork/shares/info?shareCode=${shareCode}`)
}

// 分享页下载台账
export const downloadShareLeger = (shareCode) => {
  return services.baseService.get('/earthwork/shares/report-url', {
    params: { shareCode }
  })
}

// 分享页下载图纸
export const downloadShareDrawing = (shareCode, type = 2) => {
  return services.baseService.get('/earthwork/shares/drawings', {
    params: { shareCode, type }
  })
}

// 通过区域获取桩号
export const getStakeByArea = (projectId, parentId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/layers/${parentId}`, {})
}

// 收方成果下载
export const getReceiveResultExcel = (projectId, taskId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/tasks/${taskId}/report-url`, {})
}

// 断面对比列表页弹窗中的收方台账下载
export const getComparisonsReceiveResultExcel = (projectId, comparisonId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/report-preview`, {})
}
// 简化收放线
export const simplifyReceive = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/simplify`, params)
}

// 获取收方任务-设置
export const getTaskSetting = (projectId, taskId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/tasks/${taskId}/settings`, { params })
}

// 设置收方任务-设置
export const saveTaskSetting = (projectId, taskId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}/settings`, params)
}

// 合并图纸
export const mergeDrawing = (projectId, taskId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/tasks/${taskId}/drawing`)
}

// 断面对比合并图纸
export const mergeCompareDrawing = (projectId, body) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/stack-comparisons/drawings`, body)
}

// 下载收方成果图纸
export const downloadReceiveDrawing = (projectId, taskId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/tasks/${taskId}/drawing/signed-url`)
}

// 获取mesh面数据
export const getAllMeshData = (projectId, taskId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/task/getMeshData`, { params: { taskId } })
}

// 分享获取mesh面数据
export const getShareMeshData = (shareCode) => {
  return services.baseService.get('/earthwork/shares/mesh/info', { params: { shareCode } })
}
// 断面对比-初始化左侧树
export const getNewCompareTree = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons/init`, { params })
}

// 保存断面对比
export const saveNewCompare = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/stack-comparisons`, params)
}

// 保存断面对比缩略图
export const saveNewCompareThumbnail = (projectId, comparisonId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/thumbnail`, params)
}

// 获取断面对比
export const getCompareDetail = (projectId, id) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons/${id}`, {})
}
// 获取断面对比图层树
export const getCompareTree = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparison/layers`, { params })
}
// 断面对比列表
export const getSectionComparisonList = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons`, { params })
}

// 获取对比下载预览
export const getComparisonDownloadPreview = (projectId, comparisonId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/report-preview`, {})
}
// 获取两期对比图纸下载
export const getComparisonDownload = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/stack-comparisons/drawings`, params)
}
// 断面对比发起计算
export const setComparisonCalculate = (projectId, comparisonId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/calculation`, {})
}

// 删除断面对比任务
export const deleteComparison = (projectId, comparisonId) => {
  return services.baseService.delete(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/delete`)
}

// 轮询计算结果
export const getComparisonResultStatus = (projectId, comparisonId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/comparison/${comparisonId}/status`, {})
}
// 获取对比计算结果
export const getComparisonCalculateResult = (projectId, taskId, stakeId, params) => {
  const { preTaskId, stakeName } = params
  return services.baseService.post(
    `/earthwork/projects/${projectId}/comparison/${taskId}/stakes/${stakeId}/resultNew?preTaskId=${preTaskId}&stakeName=${stakeName}`,
    {}
  )
}
// 断面对比分享数据
export const shareComparisonData = (shareCode) => {
  return services.baseService.get(`/earthwork/shares/stack-comparison/info?shareCode=${shareCode}`)
}

export const saveRangeLine = (projectId, regionId, body) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/regions/${regionId}/boundaries`, body)
}

// 查询范围线
export const getRangeLine = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/boundaries`)
}

// 删除范围线
export const deleteRangeLine = (projectId, regionId) => {
  return services.baseService.delete(`/earthwork/projects/${projectId}/regions/${regionId}/boundaries`)
}

// 获取断面对比mesh数据
export const getCompareMeshData = (projectId, comparisonId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stack-comparisons/${comparisonId}/mesh`, {})
}
// 获取区域列表 有范围线
export const getRegionList = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/periodsComparison/getRegionList`, {})
}
// 获取地形线
export const getTerrainLine = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/periodsComparison/getTerrainList`, { params })
}
// 新建两期对比-确定
export const addPeriodsComparison = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/periodsComparison/saveData`, params)
}
// 上传缩略图
export const uploadComparisonThumbnail = (projectId, comparisonId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/periodsComparison/${comparisonId}/thumbnail`, params)
}
// 轮询计算结果
export const getPeriodsComparisonStatus = (projectId, comparisonId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/periodsComparison/${comparisonId}/status`, {})
}
// 获取两期对比图层树
export const getPeriodsComparisonLayerTree = (projectId, id) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/periodsComparison/layers`, { params: { periodsComparisonId: id } })
}
