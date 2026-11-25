<template>
  <div class="auth-page login-page">
    <div class="auth-skyline" aria-hidden="true">
      <span class="auth-tower tower-a"></span>
      <span class="auth-tower tower-b"></span>
      <span class="auth-tower tower-c"></span>
      <span class="auth-tower tower-d"></span>
    </div>

    <div class="auth-body">
      <h1 class="auth-title">欢迎登录 鹤梦之家</h1>
      <p class="auth-subtitle">让巡检更智能、更高效</p>

      <button
        type="button"
        class="auth-region"
        aria-haspopup="dialog"
        @click="openServerSheet"
      >
        <t-icon name="earth" class="auth-region-icon" />
        <span class="auth-region-value">{{ currentServer.label }}</span>
        <t-icon name="chevron-down" class="auth-region-caret" />
      </button>

      <div class="auth-form">
        <PhoneField v-model="formData.phone" v-model:country="formData.country" />
        <AuthField
          v-model="formData.password"
          icon="lock-on"
          placeholder="请输入密码"
          type="password"
        />

        <div class="auth-row">
          <button type="button" class="auth-check" @click="formData.remember = !formData.remember">
            <span class="auth-tick" :class="{ 'is-checked': formData.remember }">
              <t-icon name="check" />
            </span>
            <span>记住账号</span>
          </button>
          <button type="button" class="auth-link" @click="forgotPassword">忘记密码？</button>
        </div>

        <button type="button" class="auth-submit" :disabled="loading" @click="onSubmit">
          <span>{{ loading ? '登录中' : '立即登录' }}</span>
          <t-icon v-if="!loading" name="arrow-right" />
          <span v-else class="auth-spinner"></span>
        </button>

        <div class="auth-footer">
          <span>还没有账号？</span>
          <button type="button" class="auth-link" @click="goToRegister">立即注册</button>
        </div>
      </div>
    </div>

    <p class="auth-agreement-note">
      登录即同意
      <button type="button" class="auth-agreement-link" @click="router.push('/agreement')">用户协议</button>
      和
      <button type="button" class="auth-agreement-link" @click="router.push('/privacy')">隐私政策</button>
    </p>

    <transition name="server-sheet">
      <div v-if="serverSheetVisible" class="auth-sheet-layer" @click.self="closeServerSheet">
        <div class="server-sheet">
          <div class="server-sheet-handle"></div>
          <div class="server-sheet-head">
            <h2 class="server-sheet-title">切换服务器</h2>
            <p class="server-sheet-desc">账号与数据按区域独立存储，请选择账号所属区域</p>
          </div>

          <div class="server-options">
            <button
              v-for="server in servers"
              :key="server.value"
              type="button"
              class="server-option"
              :class="{ 'is-active': server.value === pendingServerValue }"
              @click="pendingServerValue = server.value"
            >
              <span class="server-option-icon" aria-hidden="true">
                <svg v-if="server.value === 'cn'" viewBox="0 0 24 24">
                  <path
                    d="M4.2 7 9.4 5l5.2 2 5.2-2v11.8l-5.2 2-5.2-2-5.2 2V7Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9.4 5v11.8M14.6 7v11.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                  />
                  <circle cx="7" cy="11.6" r="1.05" fill="currentColor" />
                </svg>
                <svg v-else viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                  <path
                    d="M4 12h16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                  />
                  <path
                    d="M12 4c2.2 2.2 3.4 5 3.4 8s-1.2 5.8-3.4 8c-2.2-2.2-3.4-5-3.4-8S9.8 6.2 12 4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="server-option-copy">
                <span class="server-option-name">{{ server.label }}</span>
                <span class="server-option-desc">{{ server.desc }}</span>
              </span>
              <span
                class="server-option-radio"
                :class="{ 'is-checked': server.value === pendingServerValue }"
              >
                <t-icon name="check" />
              </span>
            </button>
          </div>

          <button type="button" class="auth-submit server-confirm" @click="confirmServer">
            <span>{{ confirmLabel }}</span>
            <t-icon name="arrow-right" />
          </button>
          <button type="button" class="server-cancel" @click="closeServerSheet">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import AuthField from '../../components/AuthField.vue'
import PhoneField from '../../components/PhoneField.vue'
import { findCountry, getSavedCountryCode, validatePhone } from '../../utils/phone'

const router = useRouter()

// 巡检系统分中国大陆、亚太两台独立服务器
const SERVER_STORAGE_KEY = 'inspection-server-node'
const servers = [
  {
    value: 'cn',
    label: '中国大陆',
    desc: '适用于中国大陆地区账号'
  },
  {
    value: 'ap',
    label: '亚太',
    desc: '适用于亚太地区账号'
  }
]

const formData = ref({
  country: getSavedCountryCode(),
  phone: '',
  password: '',
  remember: false
})

const loading = ref(false)
const serverSheetVisible = ref(false)
const currentServerValue = ref(window.localStorage.getItem(SERVER_STORAGE_KEY) || 'cn')
const pendingServerValue = ref(currentServerValue.value)

const currentServer = computed(() => {
  return servers.find(server => server.value === currentServerValue.value) || servers[0]
})

const pendingServer = computed(() => {
  return servers.find(server => server.value === pendingServerValue.value) || servers[0]
})

const confirmLabel = computed(() => {
  return pendingServerValue.value === currentServerValue.value
    ? '确定切换'
    : `切换至${pendingServer.value.label}`
})

const openServerSheet = () => {
  pendingServerValue.value = currentServerValue.value
  serverSheetVisible.value = true
}

const closeServerSheet = () => {
  serverSheetVisible.value = false
}

const confirmServer = () => {
  const target = servers.find(server => server.value === pendingServerValue.value)
  serverSheetVisible.value = false
  if (!target || target.value === currentServerValue.value) return

  currentServerValue.value = target.value
  window.localStorage.setItem(SERVER_STORAGE_KEY, target.value)
  Toast.success(`已切换至${target.label}服务器`)
}

const onSubmit = () => {
  const phoneError = validatePhone(findCountry(formData.value.country), formData.value.phone)
  if (phoneError) {
    Toast.warning(phoneError)
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
  background:
    radial-gradient(circle at 84% 6%, rgba(61, 78, 245, 0.1), transparent 34%),
    linear-gradient(180deg, #e9eefc 0%, #f2f5fe 26%, #fbfcff 58%, #ffffff 100%);
}

/* 服务器切换入口 */
.auth-region {
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(61, 78, 245, 0.18);
  background: rgba(255, 255, 255, 0.72);
  color: var(--auth-primary);
  box-shadow: 0 6px 16px rgba(61, 78, 245, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
}

.auth-region:active {
  transform: scale(0.97);
  background: #ffffff;
}

.auth-region .auth-region-icon {
  font-size: 15px;
}

.auth-region-value {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--auth-primary);
}

.auth-region-caret {
  margin-left: 1px;
  font-size: 13px;
  color: var(--auth-primary);
  transition: transform 0.16s ease;
}

.auth-region:active .auth-region-caret {
  transform: translateY(1px);
}

/* 服务器切换弹层 */
.server-sheet {
  width: 100%;
  padding: 10px 24px calc(20px + env(safe-area-inset-bottom, 0px));
  border-radius: 28px 28px 0 0;
  background: #f7f8fc;
  box-shadow: 0 -12px 40px rgba(23, 34, 68, 0.14);
}

.server-sheet-handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: rgba(148, 158, 178, 0.42);
}

.server-sheet-head {
  padding-top: 2px;
}

.server-sheet-title {
  margin: 0;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--auth-ink);
}

.server-sheet-desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--auth-sub);
}

.server-options {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.server-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 15px 16px;
  border: 1.5px solid transparent;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(28, 42, 80, 0.05);
  font-family: inherit;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.server-option:active {
  transform: scale(0.99);
}

.server-option.is-active {
  border-color: var(--auth-primary);
  box-shadow: 0 10px 24px rgba(61, 78, 245, 0.15), inset 0 0 0 1px rgba(61, 78, 245, 0.08);
}

.server-option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(61, 78, 245, 0.14);
  border-radius: 15px;
  background: linear-gradient(145deg, #f4f7ff 0%, #e6edff 100%);
  color: #4f63f2;
  box-shadow: inset 0 1px 0 #ffffff, 0 6px 14px rgba(45, 66, 150, 0.08);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.server-option-icon svg {
  display: block;
  width: 26px;
  height: 26px;
}

.server-option.is-active .server-option-icon {
  border-color: transparent;
  background: linear-gradient(145deg, #6b83ff 0%, #3d4ef5 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(61, 78, 245, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.server-option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.server-option-name {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--auth-ink);
}

.server-option-desc {
  font-size: 12.5px;
  line-height: 18px;
  color: #98a1b5;
}

.server-option-radio {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1.5px solid #d7dcea;
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.server-option-radio .t-icon {
  font-size: 12px;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.server-option-radio.is-checked {
  border-color: var(--auth-primary);
  background: var(--auth-primary);
  box-shadow: 0 4px 10px rgba(61, 78, 245, 0.28);
}

.server-option-radio.is-checked .t-icon {
  opacity: 1;
  transform: scale(1);
}

.server-confirm {
  margin-top: 22px;
  height: 54px;
  font-size: 17px;
}

.server-cancel {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--auth-primary);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
}

.server-cancel:active {
  opacity: 0.7;
}

.server-sheet-enter-active,
.server-sheet-leave-active {
  transition: opacity 0.24s ease;
}

.server-sheet-enter-active .server-sheet,
.server-sheet-leave-active .server-sheet {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.server-sheet-enter-from,
.server-sheet-leave-to {
  opacity: 0;
}

.server-sheet-enter-from .server-sheet,
.server-sheet-leave-to .server-sheet {
  transform: translate3d(0, 24px, 0);
}

/* 登录即同意协议：固定页面底部居中 */
.auth-agreement-note {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(22px + env(safe-area-inset-bottom, 0px));
  z-index: 2;
  margin: 0;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: var(--auth-sub);
}

.auth-agreement-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--auth-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
}

.auth-agreement-link:active {
  opacity: 0.7;
}
</style>
