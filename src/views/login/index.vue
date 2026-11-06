<template>
  <div class="login-page">
    <div class="page-glow glow-left"></div>
    <div class="page-glow glow-right"></div>

    <button type="button" class="server-switch" @click="serverSheetVisible = true">
      <t-icon name="server" size="14px" />
      <span class="server-switch-label">{{ currentServer.label }}</span>
      <t-icon name="chevron-down" size="14px" />
    </button>

    <div class="header-bg">
      <div class="header-content">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <t-icon name="search" size="32px" />
          </div>
        </div>
        <h1 class="app-title">智慧巡检</h1>
        <p class="app-slogan">让巡检更智能、更高效</p>
      </div>
    </div>

    <div class="form-card">
      <div class="glass-orb orb-a"></div>
      <div class="glass-orb orb-b"></div>

      <div class="card-header">
        <div>
          <div class="card-eyebrow">欢迎回来</div>
          <h2 class="card-title">账号登录</h2>
        </div>
      </div>

      <div class="card-body">
        <div class="input-group">
          <t-input
            v-model="formData.account"
            placeholder="请输入账号/手机号"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="user" />
            </template>
          </t-input>
        </div>

        <div class="input-group">
          <t-input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="lock-on" />
            </template>
            <template #suffixIcon>
              <t-icon
                :name="showPassword ? 'browse-off' : 'browse'"
                @click="showPassword = !showPassword"
              />
            </template>
          </t-input>
        </div>

        <div class="form-options">
          <t-checkbox v-model="formData.remember">记住账号</t-checkbox>
          <t-link theme="primary" @click="forgotPassword">忘记密码？</t-link>
        </div>

        <t-button
          block
          theme="primary"
          size="large"
          :loading="loading"
          @click="onSubmit"
        >
          登录
        </t-button>
      </div>

      <div class="card-footer">
        <span class="footer-text">还没有账号？</span>
        <t-link theme="primary" @click="goToRegister">立即注册</t-link>
      </div>
    </div>

    <div class="agreement-section">
      <span class="agreement-text">登录即代表你已同意</span>
      <t-link theme="primary">《用户协议》</t-link>
      <span class="agreement-text">和</span>
      <t-link theme="primary">《隐私政策》</t-link>
    </div>

    <transition name="server-sheet">
      <div v-if="serverSheetVisible" class="server-sheet-layer" @click.self="serverSheetVisible = false">
        <div class="server-sheet">
          <div class="server-sheet-handle"></div>
          <div class="server-sheet-head">
            <div class="server-sheet-title">切换服务器</div>
            <div class="server-sheet-desc">中国大陆与亚太服务器数据相互独立，请选择账号所属区域</div>
          </div>

          <div class="server-options">
            <button
              v-for="server in servers"
              :key="server.value"
              type="button"
              class="server-option"
              :class="{ 'is-active': server.value === currentServerValue }"
              @click="selectServer(server)"
            >
              <div class="server-option-icon">
                <t-icon :name="server.icon" />
              </div>
              <div class="server-option-copy">
                <div class="server-option-title">
                  <span>{{ server.label }}</span>
                  <span class="server-option-tag">{{ server.region }}</span>
                </div>
                <div class="server-option-host">{{ server.host }}</div>
              </div>
              <t-icon v-if="server.value === currentServerValue" name="check" class="server-option-check" />
            </button>
          </div>

          <div class="server-sheet-tip">
            <t-icon name="info-circle" />
            <span>切换服务器后需要使用对应区域的账号重新登录</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

// 巡检系统分中国大陆、亚太两台独立服务器
const SERVER_STORAGE_KEY = 'inspection-server-node'
const servers = [
  { value: 'cn', label: '中国大陆', region: '华东节点', host: 'cn-api.inspection.com', icon: 'location' },
  { value: 'ap', label: '亚太', region: '新加坡节点', host: 'ap-api.inspection.com', icon: 'cloud' }
]

const formData = ref({
  account: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const serverSheetVisible = ref(false)
const currentServerValue = ref(window.localStorage.getItem(SERVER_STORAGE_KEY) || 'cn')

const currentServer = computed(() => {
  return servers.find(server => server.value === currentServerValue.value) || servers[0]
})

const selectServer = (server) => {
  serverSheetVisible.value = false
  if (server.value === currentServerValue.value) return

  currentServerValue.value = server.value
  window.localStorage.setItem(SERVER_STORAGE_KEY, server.value)
  Toast.success(`已切换至${server.label}服务器`)
}

const onSubmit = () => {
  if (!formData.value.account) {
    Toast.warning('请输入账号')
    return
  }
  if (!formData.value.password) {
    Toast.warning('请输入密码')
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    Toast.success('登录成功')
    router.push('/select-enterprise')
  }, 1500)
}

const forgotPassword = () => {
  router.push('/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(var(--theme-primary-rgb), 0.24), transparent 26%),
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.18), transparent 28%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #f7fafc 28%, #f4f7fa 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.page-glow {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  filter: blur(56px);
  opacity: 0.32;
  pointer-events: none;
}

.glow-left {
  top: -70px;
  left: -80px;
  background: rgba(185, 226, 255, 0.92);
}

.glow-right {
  top: 120px;
  right: -100px;
  background: rgba(var(--theme-primary-rgb), 0.38);
}

.server-switch {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 6;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.66);
  background: rgba(255, 255, 255, 0.52);
  color: var(--theme-primary-ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(58, 96, 130, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.server-switch:active {
  transform: scale(0.97);
}

.server-switch-label {
  white-space: nowrap;
}

.server-sheet-layer {
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

.server-sheet {
  width: 100%;
  padding: 10px 18px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 44px rgba(64, 104, 135, 0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.server-sheet-handle {
  width: 36px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: rgba(148, 165, 187, 0.42);
}

.server-sheet-title {
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #1f2937;
}

.server-sheet-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 19px;
  color: #7c889c;
}

.server-options {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.server-option {
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(219, 231, 244, 0.94);
  background: rgba(248, 251, 255, 0.96);
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.server-option.is-active {
  border-color: rgba(var(--theme-primary-rgb), 0.56);
  background: rgba(238, 249, 255, 0.98);
  box-shadow: 0 10px 22px rgba(var(--theme-primary-rgb), 0.16);
}

.server-option-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(232, 246, 255, 0.98);
  color: var(--theme-primary-ink);
}

.server-option.is-active .server-option-icon {
  background: linear-gradient(145deg, var(--theme-glass-4) 0%, var(--theme-primary) 100%);
  color: #173153;
}

.server-option-copy {
  flex: 1;
  min-width: 0;
}

.server-option-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #1f2937;
}

.server-option-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(232, 240, 250, 0.96);
  color: #6b7f98;
  font-size: 11px;
  font-weight: 600;
}

.server-option-host {
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: #8794a7;
  word-break: break-all;
}

.server-option-check {
  flex-shrink: 0;
  font-size: 18px;
  color: var(--theme-primary-strong);
}

.server-sheet-tip {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  line-height: 18px;
  color: #7b8794;
}

.server-sheet-enter-active,
.server-sheet-leave-active {
  transition: opacity 0.24s ease;
}

.server-sheet-enter-active .server-sheet,
.server-sheet-leave-active .server-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease;
}

.server-sheet-enter-from,
.server-sheet-leave-to {
  opacity: 0;
}

.server-sheet-enter-from .server-sheet,
.server-sheet-leave-to .server-sheet {
  transform: translate3d(0, 18px, 0);
  opacity: 0.9;
}

.header-bg {
  position: relative;
  padding: 68px 24px 92px;
  border-radius: 0 0 36px 36px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.72), transparent 34%),
    linear-gradient(145deg, var(--theme-glass-3) 0%, var(--theme-glass-4) 54%, var(--theme-primary) 100%);
  overflow: hidden;
  box-shadow: 0 18px 36px rgba(var(--theme-primary-rgb), 0.12);
}

.header-bg::after {
  content: '';
  position: absolute;
  inset: auto -40px -90px auto;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  filter: blur(2px);
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 18px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-primary-ink);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.app-title {
  font-size: 34px;
  line-height: 42px;
  font-weight: 700;
  color: #173153;
  margin: 0 0 10px;
}

.app-slogan {
  font-size: 14px;
  line-height: 22px;
  color: rgba(23, 49, 83, 0.7);
  margin: 0;
}

.form-card {
  position: relative;
  margin: -48px 16px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: 0 20px 44px rgba(76, 118, 150, 0.12);
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.orb-a {
  width: 120px;
  height: 120px;
  top: -50px;
  right: -30px;
  background: rgba(255, 255, 255, 0.34);
}

.orb-b {
  width: 86px;
  height: 86px;
  bottom: -24px;
  left: -20px;
  background: rgba(var(--theme-primary-rgb), 0.18);
}

.card-header,
.card-body,
.card-footer {
  position: relative;
  z-index: 1;
}

.card-header {
  padding: 24px 24px 0;
}

.card-eyebrow {
  font-size: 12px;
  line-height: 18px;
  color: #8aa0c0;
}

.card-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  color: #1f2937;
  margin: 4px 0 0;
}

.card-body {
  padding: 22px 24px 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group :deep(.t-input) {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(216, 231, 243, 0.96);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.input-group :deep(.t-input__wrap),
.input-group :deep(.t-input__content) {
  padding: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-body :deep(.t-button--theme-primary) {
  height: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(var(--theme-primary-rgb), 0.18);
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 18px 24px 24px;
  border-top: 1px solid rgba(214, 227, 244, 0.72);
}

.footer-text {
  font-size: 14px;
  color: #7b8794;
}

.agreement-section {
  text-align: center;
  padding: 18px 16px 22px;
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.agreement-text {
  font-size: 12px;
  color: #8b95a7;
}
</style>
