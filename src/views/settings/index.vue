<template>
  <div class="settings-page app-page app-page--navbar">
    <t-navbar title="设置" left-arrow @left-click="goBack" class="settings-navbar" />

    <div class="settings-body app-section app-stack">
      <section class="settings-menu app-card">
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="menu-item"
          @click="handleMenu(item)"
        >
          <div class="menu-left">
            <div class="menu-icon" :class="item.type">
              <t-icon :name="item.icon" />
            </div>
            <div class="menu-copy">
              <div class="menu-title">{{ item.title }}</div>
              <div class="menu-desc">{{ item.desc }}</div>
            </div>
          </div>
          <t-icon name="chevron-right" class="menu-arrow" />
        </button>
      </section>

      <section class="logout-wrap">
        <t-button class="logout-btn" variant="outline" theme="danger" block @click="logout">
          退出登录
        </t-button>
      </section>
    </div>

    <transition name="logout-dialog">
      <div v-if="showLogoutDialog" class="logout-dialog-layer" @click.self="closeLogoutDialog">
        <div class="logout-dialog">
          <div class="logout-dialog-icon">
            <t-icon name="logout" />
          </div>
          <div class="logout-dialog-title">退出当前账号？</div>
          <div class="logout-dialog-desc">退出后将返回登录页，当前企业与巡检数据展示会结束。</div>
          <div class="logout-dialog-actions">
            <button type="button" class="dialog-btn dialog-btn--ghost" @click="closeLogoutDialog">取消</button>
            <button type="button" class="dialog-btn dialog-btn--danger" @click="confirmLogout">退出登录</button>
          </div>
        </div>
      </div>
    </transition>

    <div class="version-info">
      <p>智慧巡检 APP · 版本 1.0.0</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()
const showLogoutDialog = ref(false)

const menuItems = ref([
  { id: 'agreement', title: '用户协议', desc: '查看平台服务条款与使用说明', icon: 'file', type: 'violet' },
  { id: 'privacy', title: '隐私政策', desc: '了解数据采集范围与处理方式', icon: 'lock-on', type: 'emerald' }
])

const goBack = () => {
  router.back()
}

const handleMenu = (item) => {
  const handlers = {
    agreement: () => Toast.info('用户协议'),
    privacy: () => Toast.info('隐私政策')
  }
  handlers[item.id]?.()
}

const logout = () => {
  showLogoutDialog.value = true
}

const closeLogoutDialog = () => {
  showLogoutDialog.value = false
}

const confirmLogout = () => {
  showLogoutDialog.value = false
  Toast.success('已退出登录')
  setTimeout(() => {
    router.push('/login')
  }, 500)
}
</script>

<style scoped>
.settings-page {
  background:
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.18), transparent 28%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #f7f9fc 24%, #f4f7fa 100%);
}

.settings-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92) !important;
  border-bottom: 1px solid rgba(228, 235, 244, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.settings-navbar :deep(.t-navbar__content),
.settings-navbar :deep(.t-navbar__title),
.settings-navbar :deep(.t-navbar__left),
.settings-navbar :deep(.t-navbar__right) {
  color: #101828;
}

.settings-body {
  padding-top: 12px;
  padding-bottom: 18px;
}

.settings-menu {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.66);
  box-shadow: 0 14px 30px rgba(73, 114, 145, 0.08);
}

.menu-item {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px;
  text-align: left;
}

.menu-item + .menu-item {
  border-top: 1px solid rgba(236, 240, 246, 0.96);
}

.menu-item:active {
  background: rgba(246, 249, 253, 0.96);
}

.menu-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.menu-icon.violet {
  background: linear-gradient(145deg, rgba(244, 251, 255, 0.98) 0%, rgba(215, 236, 249, 0.96) 100%);
  color: var(--theme-primary-strong);
}

.menu-icon.emerald {
  background: linear-gradient(145deg, #eefcf5 0%, #d8f5e6 100%);
  color: #16935c;
}

.menu-copy {
  min-width: 0;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #202b3c;
}

.menu-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #7c889c;
}

.menu-arrow {
  color: #a0acbc;
  flex-shrink: 0;
}

.logout-wrap {
  padding-top: 6px;
}

.logout-btn {
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(229, 95, 106, 0.54);
  box-shadow: 0 10px 20px rgba(229, 95, 106, 0.08);
}

.logout-dialog-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(13, 23, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.logout-dialog {
  width: 100%;
  padding: 22px 18px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 22px 42px rgba(73, 114, 145, 0.16);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.logout-dialog-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff1f0 0%, #ffe1de 100%);
  color: #d54941;
  font-size: 28px;
}

.logout-dialog-title {
  margin-top: 16px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.logout-dialog-desc {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  color: #7c889c;
}

.logout-dialog-actions {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.dialog-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 0;
  font-size: 15px;
  font-weight: 600;
}

.dialog-btn--ghost {
  background: rgba(241, 245, 251, 0.96);
  color: #52637c;
}

.dialog-btn--danger {
  background: linear-gradient(135deg, #e34d59 0%, #f16d77 100%);
  color: #fff;
  box-shadow: 0 12px 22px rgba(227, 77, 89, 0.18);
}

.version-info {
  padding: 18px var(--prototype-page-padding-x) calc(8px + var(--prototype-safe-bottom));
  text-align: center;
  color: #9aa7ba;
  font-size: 12px;
}

.logout-dialog-enter-active,
.logout-dialog-leave-active {
  transition: opacity 0.24s ease;
}

.logout-dialog-enter-active .logout-dialog,
.logout-dialog-leave-active .logout-dialog {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease;
}

.logout-dialog-enter-from,
.logout-dialog-leave-to {
  opacity: 0;
}

.logout-dialog-enter-from .logout-dialog,
.logout-dialog-leave-to .logout-dialog {
  transform: translate3d(0, 18px, 0);
  opacity: 0.9;
}

@media (max-width: 360px) {
  .menu-item {
    padding-left: 16px;
    padding-right: 16px;
  }

  .menu-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
