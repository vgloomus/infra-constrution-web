/*
 * @Description  : 公共接口
 * @Author       : 吕宗军
 * @Date         : 2023-03-21 18:35:54
 * @LastEditTime: 2024-09-24 19:19:03
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\api\common.js
 */
import Services from './baseServices'
const baseUrl = '/api'
export const services = new Services(baseUrl)
const uploadService = new Services()
/**
 * @description: 新建临时场景
 * @param {*} params // projectId, type :1：收方模板，2：收方任务
 * @return {*}
 */
export const addTemporaryScenes = (params) => {
  return services.baseService.post('/earthwork/temporary/scenes', params)
}
/**
 * @description: 恢复临时场景
 * @param {*} params // projectId, type :1：收方模板，2：收方任务
 * @return {*}
 */
export const restoreTemporaryScenes = (projectId, params) => {
  return services.baseService.put(`/earthwork/projects/${projectId}/scenes/recover`, params)
}

/**
 * @description: 更新场景
 * @param {*} projectId
 * @param {*} params
 * @return {*}
 */
export const updateScenes = (projectId, params) => {
  return services.baseService.put(`/earthwork/projects/${projectId}/scenes/resources`, params)
}

// 上传地址
export const getUploadUrl = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/uploadUrl`, { params })
}

// 上传
export const uploadFile = (url, params, config) => {
  return uploadService.uploadService.put(`${url}`, params, config)
}

// 计算zip问价md5
export const getZipMd5 = (projectId, file, config) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/cross/section/configs/digest`, file, config)
}
