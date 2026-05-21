<template>
  <div class="forgot-password-page app-page app-page--navbar">
    <div class="page-glow glow-top"></div>
    <div class="page-glow glow-side"></div>

    <t-navbar title="忘记密码" left-arrow @left-click="goBack" class="auth-navbar" />

    <div class="hero-section">
      <div class="hero-eyebrow">账号恢复</div>
      <div class="hero-title">重置登录密码</div>
      <div class="hero-desc">验证手机号后即可设置新密码，重新恢复账号访问。</div>
    </div>

    <t-notice-bar
      visible
      theme="info"
      content="输入手机号，我们将发送验证码帮您重置密码"
      :prefix-icon="true"
      class="notice-bar"
    />

    <div class="form-card">
      <div class="glass-orb orb-a"></div>
      <div class="glass-orb orb-b"></div>

      <div class="form-section">
        <div class="input-group">
          <t-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="mobile" />
            </template>
          </t-input>
        </div>

        <div class="input-group">
          <t-input
            v-model="formData.code"
            placeholder="请输入验证码"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="verified" />
            </template>
            <template #suffix>
              <t-button
                size="small"
                variant="outline"
                theme="primary"
                :disabled="countdown > 0"
                @click.prevent="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </t-button>
            </template>
          </t-input>
        </div>

        <div class="input-group">
          <t-input
            v-model="formData.password"
            :type="passwordInputType"
            placeholder="请设置新密码（6-20位）"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="secured" />
            </template>
            <template #suffixIcon>
              <t-icon
                :name="showPassword ? 'browse-off' : 'browse'"
                @click="showPassword = !showPassword"
              />
            </template>
          </t-input>
        </div>

        <div class="input-group">
          <t-input
            v-model="formData.confirmPassword"
            :type="confirmPasswordInputType"
            placeholder="请确认新密码"
            clearable
            borderless
          >
            <template #prefixIcon>
              <t-icon name="secured" />
            </template>
            <template #suffixIcon>
              <t-icon
                :name="showConfirmPassword ? 'browse-off' : 'browse'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </t-input>
        </div>

        <t-button block theme="primary" size="large" :loading="loading" @click="onSubmit">
          重置密码
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

const formData = ref({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const countdown = ref(0)

const passwordInputType = computed(() => {
  if (showPassword.value) return 'text'
  return formData.value.password ? 'password' : 'text'
})

const confirmPasswordInputType = computed(() => {
  if (showConfirmPassword.value) return 'text'
  return formData.value.confirmPassword ? 'password' : 'text'
})

const sendCode = () => {
  if (!formData.value.phone) {
    Toast.warning('请输入手机号')
    return
  }

  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  Toast.success('验证码已发送')
}

const onSubmit = () => {
  if (!formData.value.phone) {
    Toast.warning('请输入手机号')
    return
  }
  if (!formData.value.code) {
    Toast.warning('请输入验证码')
    return
  }
  if (!formData.value.password) {
    Toast.warning('请设置新密码')
    return
  }
  if (!formData.value.confirmPassword) {
    Toast.warning('请确认新密码')
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    Toast.warning('两次密码输入不一致')
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    Toast.success('密码重置成功')
    router.push('/login')
  }, 1500)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.forgot-password-page {
  background:
    radial-gradient(circle at top left, rgba(var(--theme-primary-rgb), 0.22), transparent 24%),
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.16), transparent 26%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #f7fafc 24%, #f4f7fa 100%);
  position: relative;
  overflow: hidden;
}

.page-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(58px);
  opacity: 0.3;
  pointer-events: none;
}

.glow-top {
  width: 220px;
  height: 220px;
  top: -80px;
  left: -60px;
  background: rgba(188, 228, 255, 0.92);
}

.glow-side {
  width: 180px;
  height: 180px;
  top: 120px;
  right: -70px;
  background: rgba(var(--theme-primary-rgb), 0.32);
}

.auth-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.78) !important;
  border-bottom: 1px solid rgba(228, 235, 244, 0.68);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.auth-navbar :deep(.t-navbar__content),
.auth-navbar :deep(.t-navbar__title),
.auth-navbar :deep(.t-navbar__left),
.auth-navbar :deep(.t-navbar__right) {
  color: #101828;
}

.hero-section {
  padding: 12px 24px 8px;
}

.hero-eyebrow {
  font-size: 12px;
  line-height: 18px;
  color: #7991ad;
}

.hero-title {
  margin-top: 4px;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  color: #1f2937;
}

.hero-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: #6f8096;
}

.notice-bar {
  margin: 8px 16px 0;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: 0 10px 22px rgba(76, 118, 150, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.form-card {
  position: relative;
  margin: 10px 16px 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: 0 20px 42px rgba(76, 118, 150, 0.12);
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
  width: 96px;
  height: 96px;
  top: -28px;
  right: -24px;
  background: rgba(255, 255, 255, 0.28);
}

.orb-b {
  width: 72px;
  height: 72px;
  left: -18px;
  bottom: -18px;
  background: rgba(var(--theme-primary-rgb), 0.16);
}

.form-section {
  position: relative;
  z-index: 1;
  padding: 20px 20px 22px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group :deep(.t-input) {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(216, 231, 243, 0.94);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.input-group :deep(.t-input__wrap),
.input-group :deep(.t-input__content) {
  padding: 0;
}

.form-section :deep(.t-button--theme-primary) {
  height: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(var(--theme-primary-rgb), 0.18);
}
</style>
