/*
 * @Description  : 设置基础的请求头
 * @Author       : 吕宗军
 * @Date         : 2023-05-18 11:35:25
 * @LastEditTime: 2024-09-23 15:45:16
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\api\config.js
 */
import Cookies from 'js-cookie'
import store from '@/store'
import { getQueryString } from '@/utils'
import JSONbig from 'json-bigint'
import axios from 'axios'

axios.defaults.transformResponse = [
  (data) => {
    if (data) {
      const json = JSONbig({ storeAsString: true })
      const res = json.parse(data)
      return res
    } else {
      return {
        code: 0,
        data: 1,
        message: 'success'
      }
    }
  }
]

export default function setHttpBaseHeader(config) {
  if (window.location.pathname.indexOf('projectInfo/ParameterSettings') > -1) {
    config.headers.Authorization = `bearer ${getQueryString(window.location.search, 'token') || ''}`
  } else {
    config.headers.Authorization = `bearer ${localStorage.getItem('geipToken') || Cookies.get('geipToken') || ''}`
  }

  config.headers['x-tenant-id'] = store?.state?.platformStore?.tenantId || Cookies.get('.CLOUDT_TENANT_ID') || ''
  config.headers['x-product-code'] = 'bimtwins_earthwork'
  return config
}
