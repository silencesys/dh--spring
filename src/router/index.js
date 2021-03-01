import { createRouter, createWebHashHistory } from 'vue-router'
import Document from '../views/Document.vue'

const routes = [
  {
    path: '/',
    name: 'Document',
    component: Document
  },
  {
    path: '/charts',
    name: 'Charts',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "graphs" */ '../views/Charts.vue'),
    children: [
      {
        path: '',
        name: 'PieChart',
        component: () => import(/* webpackChunkName: "graph-pie" */ '../components/PieChart.vue'),
        meta: {
          exportable: true
        }
      },
      {
        path: '/axis',
        name: 'AxisChart',
        component: () => import(/* webpackChunkName: "graph-axis" */ '../components/AxisChart.vue'),
        meta: {
          exportable: true
        }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
