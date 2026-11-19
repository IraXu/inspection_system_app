<template>
  <div class="auth-page">
    <div class="auth-skyline" aria-hidden="true">
      <span class="auth-tower tower-a"></span>
      <span class="auth-tower tower-b"></span>
      <span class="auth-tower tower-c"></span>
      <span class="auth-tower tower-d"></span>
    </div>

    <div class="auth-body">
      <h1 class="auth-title">加入鹤梦之家</h1>
      <p class="auth-subtitle auth-subtitle--narrow">创建巡检账号后即可进入企业工作台，接收任务与设备告警</p>

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
          v-model="formData.code"
          icon="secured"
          placeholder="请输入验证码"
          type="tel"
          inputmode="numeric"
          :maxlength="6"
        >
          <template #suffix>
            <button
              type="button"
              class="auth-code"
              :disabled="countdown > 0"
              @click.prevent="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </template>
        </AuthField>
        <AuthField
          v-model="formData.password"
          icon="lock-on"
          placeholder="请设置密码（6-20位）"
          revealable
        />
        <AuthField
          v-model="formData.confirmPassword"
          icon="lock-on"
          placeholder="请确认密码"
          revealable
        />

        <div class="auth-agreement">
          <button
            type="button"
            class="auth-tick-btn"
            aria-label="同意协议"
            @click="formData.agreement = !formData.agreement"
          >
            <span class="auth-tick" :class="{ 'is-checked': formData.agreement }">
              <t-icon name="check" />
            </span>
          </button>
          <span class="auth-agreement-text">
            我已阅读并同意
            <span class="auth-link-text">《用户协议》</span>
            和
            <span class="auth-link-text">《隐私政策》</span>
          </span>
        </div>

        <button type="button" class="auth-submit" :disabled="loading" @click="onSubmit">
          <span>{{ loading ? '注册中' : '注册' }}</span>
          <t-icon v-if="!loading" name="arrow-right" />
          <span v-else class="auth-spinner"></span>
        </button>

        <div class="auth-footer">
          <span>已有账号？</span>
          <button type="button" class="auth-link" @click="goToLogin">立即登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import AuthField from '../../components/AuthField.vue'

const router = useRouter()

const formData = ref({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const loading = ref(false)
const countdown = ref(0)

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
    Toast.warning('请设置密码')
    return
  }
  if (!formData.value.confirmPassword) {
    Toast.warning('请确认密码')
    return
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    Toast.warning('两次密码输入不一致')
    return
  }
  if (!formData.value.agreement) {
    Toast.warning('请阅读并同意用户协议')
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    Toast.success('注册成功')
    router.push('/login')
  }, 1500)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.auth-tick-btn {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
}

.auth-tick-btn .auth-tick {
  width: 19px;
  height: 19px;
}

.auth-tick-btn:active {
  opacity: 0.7;
}
</style>
