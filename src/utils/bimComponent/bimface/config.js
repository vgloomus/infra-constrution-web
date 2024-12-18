/*
 * @author: lvzj
 * @Date: 2024-08-05 10:10:10
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-09-27 09:38:00
 * @description: file content
 */
const origin = window.location.origin
const isDev = origin.includes('-fat') || origin.includes('localhost')
const isProd = origin.includes('xmgl.glodon.com')
// const isDev = origin.includes('-fat')
export const APIHost = isDev ? 'https://api-test.bimface.com' : 'https://api.bimface.com'
export const resourceHost = isDev ? 'https://m-test.bimface.com' : 'https://m.bimface.com'
// export const staticHost = isDev ? 'https://static-test.bimface.com' : 'https://static.bimface.com'
export const staticHost = isProd ? 'https://static.bimface.com' : 'https://static-test.bimface.com'
export const dataEnvType = 'BIMFACE'
export const securityApi = true
export const version = '3.5.2731'

window.hostConfig = {
  APIHost,
  resourceHost,
  staticHost,
  dataEnvType,
  securityApi
}
console.log('当前--bimface--hostConfig', window.hostConfig)
