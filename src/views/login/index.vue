<template>
  <div class="login-page">
    <div class="page-glow glow-left"></div>
    <div class="page-glow glow-right"></div>

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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

const formData = ref({
  account: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)

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
