/*
 * @Description  : 项目设置
 * @Author       : 吕宗军
 * @Date         : 2022-04-27 13:04:39
 * @LastEditTime: 2024-12-13 16:56:34
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : src/router/modules/business.js
 */
const routes = [
  {
    path: '/business/measurementReceiver',
    name: 'MeasurementReceiver',
    component: () => import('@/views/business/MeasurementReceiver.vue'),
    meta: {
      title: '测量收方',
      menuCode: 'infra_construction_business_measurementReceiver',
      fncode: 200101
    }
  },
  {
    path: '/business/measurementReceiverEdit',
    name: 'MeasurementReceiverEdit',
    component: () => import('@/views/business/MeasurementReceiverEdit.vue'),
    meta: {
      title: '测量收方编辑',
      menuCode: 'infra_construction_business_measurementReceiver',
      fncode: 200102
    }
  },
  {
    path: '/business/measurementReceiverShare',
    name: 'MeasurementReceiverShare',
    component: () => import('@/views/business/MeasurementReceiverShare.vue'),
    meta: {
      title: '测量收方分享',
      menuCode: 'infra_construction_business_share',
      fncode: 200103
    }
  },
  {
    path: '/business/sectionComparison',
    name: 'SectionComparison',
    component: () => import('@/views/business/SectionComparison.vue'),
    meta: {
      title: '断面对比',
      menuCode: 'infra_construction_business_sectionComparison',
      fncode: 200104
    }
  },
  {
    path: '/business/sectionComparisonEdit',
    name: 'SectionComparisonEdit',
    component: () => import('@/views/business/SectionComparisonEdit.vue'),
    meta: {
      title: '断面对比编辑',
      menuCode: 'infra_construction_business_sectionComparison',
      fncode: 200105
    }
  },
  {
    path: '/business/sectionComparisonShare',
    name: 'SectionComparisonShare',
    component: () => import('@/views/business/SectionComparisonShare.vue'),
    meta: {
      title: '断面对比分享',
      menuCode: 'infra_construction_business_share',
      fncode: 200106
    }
  },
  {
    path: '/business/twoPhasesComparison',
    name: 'TwoPhasesComparison',
    component: () => import('@/views/business/TwoPhasesComparison.vue'),
    meta: {
      title: '两期对比',
      menuCode: 'infra_construction_business_twoPhasesComparison',
      fncode: 200107
    }
  },
  {
    path: '/business/twoPhasesComparisonEdit',
    name: 'TwoPhasesComparisonEdit',
    component: () => import('@/views/business/TwoPhasesComparisonEdit.vue'),
    meta: {
      title: '两期对比编辑',
      menuCode: 'infra_construction_business_twoPhasesComparison',
      fncode: 200108
    }
  }
]
export default routes
