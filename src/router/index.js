import { createRouter, createWebHashHistory } from 'vue-router'
import Game from '../views/Game.vue'

const routes = [
  {
    path: '/',
    name: 'Game',
    component: Game,
    meta: {
      keepAlive: true,
      isBack:false
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes
})

export default router
