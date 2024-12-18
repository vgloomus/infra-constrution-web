/*
 * @Description  : 路由表主文件
 * @Author       : 吕宗军
 * @Date         : 2022-11-10 09:40:12
 * @LastEditTime: 2024-12-10 16:36:41
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\router\index.js
 */
const modulesFiles = require.context('./modules', true, /.js$/)
const modules = []
modulesFiles.keys().forEach((modulePath) => {
  // 执行modulesFiles函数，返回一个对象{default: {// 文件内容}, _esModule: true}
  const value = modulesFiles(modulePath)
  modules.push(...value.default)
})

// 其他路由
const otherRoutes = [
  {
    path: '/excel',
    name: 'excel',
    meta: {
      title: 'Hanson Table',
      menuCode: 'excelDemo'
    },
    component: () => import('@/components/ExcelComponentCopy.vue')
  },
  {
    path: '/bim',
    name: 'bim',
    meta: {
      title: 'BIM',
      menuCode: 'bim'
    },
    component: () => import('@/components/scene/SceneForIframe.vue')
  },
  {
    path: '*',
    name: 'error',
    meta: {
      title: 'error',
      menuCode: 'error'
    },
    component: () => import('@/components/error')
  }
]
// 收集路由列表
let routes = [...modules, ...otherRoutes]
// 为开发环境增加最外层路由,支持路由列表切换
if (process.env.NODE_ENV === 'development') {
  routes = [
    {
      path: '/',
      name: 'index',
      component: () => import(/* webpackChunkName: "index" */ '@/views/DevIndex.vue'),
      children: [...routes]
    }
  ]
}
console.log('路由表', routes)
export default routes
