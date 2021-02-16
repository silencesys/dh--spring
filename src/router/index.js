import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/graphs',
    name: 'Graphs',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "graphs" */ '../views/Graphs.vue'),
    children: [
      {
        path: '',
        name: 'PieChart',
        component: () => import(/* webpackChunkName: "graph-pie" */ '../components/PieChart.vue'),
      },
      {
        path: '/axis',
        name: 'AxisChart',
        component: () => import(/* webpackChunkName: "graph-axis" */ '../components/AxisChart.vue'),
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
