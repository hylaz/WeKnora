<template>
  <div class="admin-layout">
    <!-- 登录/注册页面不需要布局 -->
    <RouterView v-if="isAuthPage" />
    
    <!-- 管理平台主布局 -->
    <div v-else class="admin-main-layout">
      <!-- 顶部导航栏 -->
      <div class="admin-header">
        <div class="header-left">
          <img src="@/assets/img/weknora.png" alt="WeKnora" class="logo" />
          <span class="platform-name">{{ $t('admin.layout.platformName') }}</span>
        </div>
        <div class="header-right">
          <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
            <div class="user-info">
              <t-avatar :image="adminAuthStore.user?.avatar" size="small">
                {{ adminAuthStore.user?.username?.charAt(0).toUpperCase() }}
              </t-avatar>
              <span class="username">{{ adminAuthStore.user?.username }}</span>
              <t-icon name="chevron-down" size="16px" />
            </div>
          </t-dropdown>
        </div>
      </div>

      <div class="admin-body">
        <!-- 左侧菜单 -->
        <div class="admin-sidebar">
          <t-menu
            :value="currentRoute"
            theme="light"
            @change="handleMenuChange"
            style="border-right: 1px solid #e5e7eb;"
          >
            <t-menu-item value="/admin/tenants">
              <t-icon name="usergroup" />
              <span>{{ $t('admin.menu.tenants') }}</span>
            </t-menu-item>
            <t-menu-item value="/admin/plugins">
              <t-icon name="app" />
              <span>{{ $t('admin.menu.plugins') }}</span>
            </t-menu-item>
            <t-menu-item value="/admin/models">
              <t-icon name="control-platform" />
              <span>{{ $t('admin.menu.models') }}</span>
            </t-menu-item>
          </t-menu>
        </div>

        <!-- 主内容区 -->
        <div class="admin-content">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useAdminAuthStore } from '@/stores/admin-auth'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const adminAuthStore = useAdminAuthStore()
const { t } = useI18n()

const isAuthPage = computed(() => {
  return route.path === '/admin/login' || route.path === '/admin/register'
})

const currentRoute = computed(() => {
  return route.path
})

const userMenuOptions = computed(() => [
  {
    content: t('admin.layout.logout'),
    value: 'logout'
  }
])

const handleMenuChange = (value: string) => {
  router.push(value)
}

const handleUserMenuClick = ({ value }: { value: string }) => {
  if (value === 'logout') {
    const dialog = DialogPlugin.confirm({
      header: t('admin.layout.logoutConfirm'),
      body: t('admin.layout.logoutConfirmMessage'),
      onConfirm: () => {
        adminAuthStore.logout()
        router.push('/admin/login')
        dialog.destroy()
        MessagePlugin.success(t('admin.layout.logoutSuccess'))
      }
    })
  }
}
</script>

<style lang="less" scoped>
.admin-layout {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
}

.admin-main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      height: 32px;
      width: auto;
    }

    .platform-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      font-family: "PingFang SC", sans-serif;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f3f4f6;
      }

      .username {
        font-size: 14px;
        color: #374151;
        font-family: "PingFang SC", sans-serif;
      }
    }
  }
}

.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 240px;
  background: #ffffff;
  overflow-y: auto;

  :deep(.t-menu) {
    padding: 16px 0;
  }

  :deep(.t-menu-item) {
    padding: 12px 24px;
    font-size: 14px;
    font-family: "PingFang SC", sans-serif;

    .t-icon {
      margin-right: 12px;
    }
  }
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 24px;
}
</style>

