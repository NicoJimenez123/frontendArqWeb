import { RouterView, createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: RouterView,
      children: [
        {
          path:'',
          name:'adminHome',
          component: () => import('../views/AdminHome.vue'),
          meta: {
            titulo: 'Home'
          }
        },
        {
          path:'usuarios',
          name:'adminUsuarios',
          component: () => import('../views/AdminUsuarios.vue'),
          meta: {
            titulo: 'Usuarios'
          }
        },
        {
          path:'roles',
          name:'adminRoles',
          component: () => import('../views/AdminRoles.vue'),
          meta: {
            titulo: 'Roles'
          }
        },
        {
          path:'modulos',
          name:'adminModulos',
          component: () => import('../views/AdminModulos.vue'),
          meta: {
            titulo: 'Modulos'
          }
        },
        {
          path:'recursos',
          name:'adminRecursos',
          component: () => import('../views/AdminRecursos.vue'),
          meta: {
            titulo: 'Recursos'
          }
        },
        {
          path:'permisos',
          name:'adminPermisos',
          component: () => import('../views/AdminPermisos.vue'),
          meta: {
            titulo: 'HomPermisos'
          }
        },
      ]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
