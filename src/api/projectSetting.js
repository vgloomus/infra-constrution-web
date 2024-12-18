/*
 * @Description  : 项目设置
 * @Author       : 吕宗军
 * @Date         : 2023-03-21 18:35:54
 * @LastEditTime: 2024-11-28 20:00:05
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\api\projectInfo.js
 */
import Services from './baseServices'
const baseUrl = '/api'
export const services = new Services(baseUrl)

// 图纸列表
export const getDrawingList = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/dwgDrawings`, {})
}
// 获取当前项目的场景sceneVewToken
export const getSceneViewToken = (projectId) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/drawings/previews`, {})
}

// 图纸启用和停用状态传递
export const enableDrawing = (projectId, fileId, value) => {
  return services.baseService.put(`/earthwork/projects/${projectId}/drawings/${fileId}/status`, {
    enabled: value
  })
}

// 收方模板启用和停用状态传递
export const enableTemplate = (projectId, templateId, value) => {
  return services.baseService.put(`/earthworkTemplate/${projectId}/templates/${templateId}/status`, {
    enabled: value
  })
}

// 删除收方模板
export const deleteTemplate = (projectId, templateId) => {
  return services.baseService.delete(`/earthworkTemplate/projects/${projectId}/templates/${templateId}`, {})
}

// 收方模板配置文件
export const getTemplateConfigFile = (projectId) => {
  return services.baseService.get(`/earthworkTemplate/${projectId}/templates/configFiles`, {})
}

/**
 * @description: 新建编辑收方模板
 * @param {*} projectId // 项目id
 * @param {*} templateId // 模板id
 * @param {*} params // 参数
 * @return {*}
 */
export const createTemplate = (projectId, templateId, params) => {
  return services.baseService.post(`/earthworkTemplate/earthwork/projects/${projectId}/templates/${templateId}`, params)
}

// 图纸启用图纸列表
export const getAllEnableDrawing = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/drawings/getAllEnableDrawing`, {})
}

// 同步收方模板数据
export const syncTemplateData = (projectId) => {
  return services.baseService.post(`/earthworkTemplate/${projectId}/templates/syncBimtwinsData`, {})
}
// 收方任务图层目录树--新建
export const getTaskLayerTree = (projectId, templateId = '', type = 0) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/template/synclayers`, { params: { templateId, type } })
}
// 新建保存收方模板
export const saveTemplate = (projectId, params) => {
  return services.baseService.post(`/earthworkTemplate/earthwork/projects/${projectId}/templates`, params)
}
// 获取收方模板列表
export const getTemplateList = (projectId) => {
  return services.baseService.get(`/earthworkTemplate/${projectId}/templates/templateList`, {})
}

// 获取收方模板详情
export const getTemplateDetail = (projectId, templateId) => {
  return services.baseService.get(`/earthworkTemplate/${projectId}/templates/${templateId}`, { params: { templateId } })
}

// 收方任务图层目录树
export const getTaskLayerTreeForEdit = (projectId, templateId = '') => {
  return services.baseService.get(`/earthwork/projects/${projectId}/template/layers`, { params: { templateId } })
}

// 删除转换失败图纸
export const deleteDrawing = (projectId, params) => {
  return services.baseService.delete(`/earthwork/projects/${projectId}/drawings/delete`, {
    data: params
  })
}

// 获取图纸上传url
export const getUploadUrl = (projectId, fileName, dataType) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/uploadUrl`, { params: { fileName, dataType } })
}

// 点击确定新建图纸列表
export const createDrawing = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/drawings/create`, params)
}

// 上传关联区域数据
export const crossSectionConfig = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/createAreaData`, params)
}

// 获取全部mesh数据
export const getAllMeshData = (projectId, templateId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/template/${templateId}/getMeshData`, {})
}

// 获取坐标转换状态
export const getCoordinateStatus = (projectId) => {
  return services.baseService.get(`/earthworkTemplate/${projectId}/templates/coordSwitchConfigStatus`, {})
}

// 保存区域数据
export const saveRegionsData = (projectId, params) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/regions`, params)
}
// 获取区域图层数据
export const getRegionsData = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/region/getRegionLayer`, {})
}
// 获取区域场景
export const getRegionsScene = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/region/getRegionSceneId`, {})
}
// 获取区域图层数量
export const getRegionsCount = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/region/getFilterRegionLayerCount`, {})
}
// 查询区域参数
export const getRegionInfo = (projectId, regionId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/region/${regionId}/getRegionInfo`)
}
