/*
 * @Description  : 项目设置
 * @Author       : 吕宗军
 * @Date         : 2022-04-27 13:04:39
 * @LastEditTime: 2024-11-27 17:39:36
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : src/router/modules/projectSetting.js
 */
const routes = [
  {
    path: '/projectSetting/drawing',
    name: 'ProjectInfo',
    component: () => import('@/views/projectSetting/Drawing.vue'),
    meta: {
      title: '图纸管理',
      menuCode: 'infra_construction_projectSetting_drawing',
      fncode: 100101
    }
  },
  {
    path: '/projectSetting/recipientTemplate',
    name: 'RecipientTemplate',
    component: () => import('@/views/projectSetting/RecipientTemplate.vue'),
    meta: {
      title: '收方模板',
      menuCode: 'infra_construction_projectSetting_template',
      fncode: 100102
    }
  },
  {
    path: '/projectSetting/templateEdit',
    name: 'TemplateEdit',
    component: () => import('@/views/projectSetting/TemplateEdit.vue'),
    meta: {
      title: '模板编辑-新建',
      menuCode: 'infra_construction_projectSetting_template',
      fncode: 100103
    }
  },
  {
    path: '/projectSetting/regionalManagement',
    name: 'RegionalManagement',
    component: () => import('@/views/projectSetting/RegionalManagement.vue'),
    meta: {
      title: '区域管理',
      menuCode: 'infra_construction_projectSetting_regional',
      fncode: 100104
    }
  },
  {
    path: '/projectSetting/regionalAdd',
    name: 'regionalAdd',
    component: () => import('@/views/projectSetting/RegionalAdd.vue'),
    meta: {
      title: '区域添加',
      menuCode: 'infra_construction_projectSetting_regional',
      fncode: 100105
    }
  }
]
export default routes
