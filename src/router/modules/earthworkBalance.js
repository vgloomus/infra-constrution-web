const routes = [
  {
    path: '/earthworkBalance/engineeringQuantity',
    name: 'EngineeringQuantity',
    component: () => import('@/views/earthworkBalance/EngineeringQuantity.vue'),
    meta: {
      title: '工程量统计',
      menuCode: 'infra_construction_earthworkBalance_engineeringQuantity',
      fncode: 300101
    }
  }
]
export default routes
