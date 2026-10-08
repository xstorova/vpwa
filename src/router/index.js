import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import routes from './routes.js'
import { authState } from '../services/auth.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  // Router guard pre ochranu ciest
  Router.beforeEach((to, from, next) => {
    const isAuth = authState.isAuthenticated()

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuth) {
      // Ak stránka vyžaduje prihlásenie a používateľ nie je prihlásený, presmeruj na /login
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else if (to.matched.some(record => record.meta.guestOnly) && isAuth) {
      // Ak je používateľ už prihlásený a ide na login, presmeruj na hlavnú stránku
      next({ path: '/' })
    } else {
      next()
    }
  })

  return Router
})
