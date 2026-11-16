<template>
  <div class="auth-page login-page">
    <div class="auth-skyline" aria-hidden="true">
      <span class="auth-tower tower-a"></span>
      <span class="auth-tower tower-b"></span>
      <span class="auth-tower tower-c"></span>
      <span class="auth-tower tower-d"></span>
    </div>

    <div class="auth-body">
      <h1 class="auth-title">欢迎登录 智能巡检</h1>
      <p class="auth-subtitle">让巡检更智能、更高效</p>

      <button type="button" class="auth-region" @click="openServerSheet">
        <t-icon name="location" />
        <span>{{ currentServer.label }}</span>
      </button>

      <div class="auth-form">
        <AuthField
          v-model="formData.phone"
          icon="user"
          placeholder="请输入手机号"
          type="tel"
          inputmode="tel"
          :maxlength="11"
          clearable
        />
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
      <button type="button" class="auth-agreement-link" @click="router.push('/privacy')">隐私协议</button>
    </p>

    <transition name="server-sheet">
      <div v-if="serverSheetVisible" class="auth-sheet-layer" @click.self="closeServerSheet">
        <div class="server-sheet">
          <div class="server-sheet-handle"></div>
          <div class="server-sheet-title">切换服务器</div>
          <div class="server-sheet-desc">中国大陆与亚太服务器数据相互独立，请选择账号所属区域</div>

          <div class="server-options">
            <button
              v-for="server in servers"
              :key="server.value"
              type="button"
              class="server-option"
              :class="{ 'is-active': server.value === pendingServerValue }"
              @click="pendingServerValue = server.value"
            >
              <span class="server-option-icon">
                <t-icon :name="server.icon" />
              </span>
              <span class="server-option-copy">
                <span class="server-option-title">
                  <span>{{ server.label }}</span>
                  <span class="server-option-tag">{{ server.region }}</span>
                </span>
                <span class="server-option-host">{{ server.host }}</span>
              </span>
              <t-icon
                v-if="server.value === pendingServerValue"
                name="check"
                class="server-option-check"
              />
            </button>
          </div>

          <button type="button" class="auth-submit server-confirm" @click="confirmServer">
            <span>确定切换</span>
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

const router = useRouter()

// 巡检系统分中国大陆、亚太两台独立服务器
const SERVER_STORAGE_KEY = 'inspection-server-node'
const servers = [
  {
    value: 'cn',
    label: '中国大陆',
    region: '华东节点',
    host: 'cn-api.inspection.com',
    icon: 'location'
  },
  {
    value: 'ap',
    label: '亚太',
    region: '新加坡节点',
    host: 'ap-api.inspection.com',
    icon: 'earth'
  }
]

const formData = ref({
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
  if (!formData.value.phone) {
    Toast.warning('请输入手机号')
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

.server-sheet-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: var(--auth-ink);
}

.server-sheet-desc {
  margin-top: 8px;
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
  padding: 14px 16px;
  border: 1.5px solid transparent;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(28, 42, 80, 0.05);
  font-family: inherit;
  text-align: left;
}

.server-option.is-active {
  border-color: var(--auth-primary);
  box-shadow: 0 8px 20px rgba(61, 78, 245, 0.12);
}

.server-option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 24%, #33498c 0%, #1b2751 58%, #0d1430 100%);
  color: #9cc0ff;
  font-size: 22px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.server-option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.server-option-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  line-height: 23px;
  font-weight: 700;
  color: var(--auth-ink);
}

.server-option-tag {
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--auth-primary-soft);
  color: #5468f0;
  font-size: 11px;
  font-weight: 600;
}

.server-option-host {
  margin-top: 3px;
  font-size: 13px;
  line-height: 19px;
  color: var(--auth-sub);
  word-break: break-all;
}

.server-option-check {
  flex-shrink: 0;
  font-size: 18px;
  color: var(--auth-primary);
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
