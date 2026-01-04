import { createRouter, createWebHistory } from 'vue-router'
import { listKnowledgeBases } from '@/api/knowledge-base'
import { useAuthStore } from '@/stores/auth'
import { useAdminAuthStore } from '@/stores/admin-auth'
import { validateToken } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/platform/knowledge-bases",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/Login.vue"),
      meta: { requiresAuth: false, requiresInit: false }
    },
    {
      path: "/admin",
      name: "Admin",
      redirect: "/admin/tenants",
      component: () => import("../views/admin/Layout.vue"),
      meta: { requiresAdminAuth: true },
      children: [
        {
          path: "login",
          name: "adminLogin",
          component: () => import("../views/admin/Login.vue"),
          meta: { requiresAdminAuth: false }
        },
        {
          path: "register",
          name: "adminRegister",
          component: () => import("../views/admin/Register.vue"),
          meta: { requiresAdminAuth: false }
        },
        {
          path: "tenants",
          name: "adminTenants",
          component: () => import("../views/admin/TenantList.vue"),
          meta: { requiresAdminAuth: true }
        },
        {
          path: "tenants/:id",
          name: "adminTenantDetail",
          component: () => import("../views/admin/TenantDetail.vue"),
          meta: { requiresAdminAuth: true }
        },
        {
          path: "plugins",
          name: "adminPlugins",
          component: () => import("../views/admin/PluginList.vue"),
          meta: { requiresAdminAuth: true }
        },
        {
          path: "plugins/:id",
          name: "adminPluginDetail",
          component: () => import("../views/admin/PluginDetail.vue"),
          meta: { requiresAdminAuth: true }
        },
        {
          path: "models",
          name: "adminModels",
          component: () => import("../views/admin/ModelList.vue"),
          meta: { requiresAdminAuth: true }
        },
        {
          path: "models/:id",
          name: "adminModelDetail",
          component: () => import("../views/admin/ModelDetail.vue"),
          meta: { requiresAdminAuth: true }
        },
      ],
    },
    {
      path: "/knowledgeBase",
      name: "home",
      component: () => import("../views/knowledge/KnowledgeBase.vue"),
      meta: { requiresInit: true, requiresAuth: true }
    },
    {
      path: "/platform",
      name: "Platform",
      redirect: "/platform/knowledge-bases",
      component: () => import("../views/platform/index.vue"),
      meta: { requiresInit: true, requiresAuth: true },
      children: [
        {
          path: "tenant",
          redirect: "/platform/settings"
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("../views/settings/Settings.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "knowledge-bases",
          name: "knowledgeBaseList",
          component: () => import("../views/knowledge/KnowledgeBaseList.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "knowledge-bases/:kbId",
          name: "knowledgeBaseDetail",
          component: () => import("../views/knowledge/KnowledgeBase.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "agents",
          name: "agentList",
          component: () => import("../views/agent/AgentList.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "creatChat",
          name: "globalCreatChat",
          component: () => import("../views/creatChat/creatChat.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "knowledge-bases/:kbId/creatChat",
          name: "kbCreatChat",
          component: () => import("../views/creatChat/creatChat.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
        {
          path: "chat/:chatid",
          name: "chat",
          component: () => import("../views/chat/index.vue"),
          meta: { requiresInit: true, requiresAuth: true }
        },
      ],
    },
  ],
});

// 路由守卫：检查认证状态和系统初始化状态
router.beforeEach(async (to, from, next) => {
  // 管理平台路由处理
  if (to.path.startsWith('/admin')) {
    const adminAuthStore = useAdminAuthStore()
    
    // 如果访问的是登录或注册页面，直接放行
    if (to.meta.requiresAdminAuth === false) {
      // 如果已登录管理员访问登录页面，重定向到租户列表
      if ((to.path === '/admin/login' || to.path === '/admin/register') && adminAuthStore.isLoggedIn) {
        next('/admin/tenants')
        return
      }
      next()
      return
    }

    // 检查管理员认证状态
    if (to.meta.requiresAdminAuth !== false) {
      if (!adminAuthStore.isLoggedIn) {
        // 未登录，跳转到管理平台登录页面
        next('/admin/login')
        return
      }
    }

    next()
    return
  }

  // 原有平台路由处理
  const authStore = useAuthStore()
  
  // 如果访问的是登录页面或初始化页面，直接放行
  if (to.meta.requiresAuth === false || to.meta.requiresInit === false) {
    // 如果已登录用户访问登录页面，重定向到知识库列表页面
    if (to.path === '/login' && authStore.isLoggedIn) {
      next('/platform/knowledge-bases')
      return
    }
    next()
    return
  }

  // 检查用户认证状态
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isLoggedIn) {
      // 未登录，跳转到登录页面
      next('/login')
      return
    }

    // 验证Token有效性
    // try {
    //   const { valid } = await validateToken()
    //   if (!valid) {
    //     // Token无效，清空认证信息并跳转到登录页面
    //     authStore.logout()
    //     next('/login')
    //     return
    //   }
    // } catch (error) {
    //   console.error('Token验证失败:', error)
    //   authStore.logout()
    //   next('/login')
    //   return
    // }
  }

  next()
});

export default router
