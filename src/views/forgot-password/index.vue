<template>
  <div class="auth-page">
    <div class="auth-skyline" aria-hidden="true">
      <span class="auth-tower tower-a"></span>
      <span class="auth-tower tower-b"></span>
      <span class="auth-tower tower-c"></span>
      <span class="auth-tower tower-d"></span>
    </div>

    <div class="auth-body">
      <div class="auth-heading">
        <button type="button" class="auth-back" aria-label="返回" @click="goBack">
          <t-icon name="chevron-left" />
        </button>
        <div class="auth-heading-copy">
          <h1 class="auth-title">重置登录密码</h1>
          <p class="auth-subtitle auth-subtitle--narrow">验证手机号后即可设置新密码，重新恢复账号访问。</p>
        </div>
      </div>

      <div class="auth-form">
        <PhoneField v-model="formData.phone" v-model:country="formData.country" />
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
          placeholder="请设置新密码（6-20位）"
          revealable
        />
        <AuthField
          v-model="formData.confirmPassword"
          icon="lock-on"
          placeholder="请确认新密码"
          revealable
        />

        <button type="button" class="auth-submit" :disabled="loading" @click="onSubmit">
          <span>{{ loading ? '提交中' : '重置密码' }}</span>
          <t-icon v-if="!loading" name="arrow-right" />
          <span v-else class="auth-spinner"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import AuthField from '../../components/AuthField.vue'
import PhoneField from '../../components/PhoneField.vue'
import { findCountry, getSavedCountryCode, validatePhone } from '../../utils/phone'

const router = useRouter()

const formData = ref({
  country: getSavedCountryCode(),
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const countdown = ref(0)

const sendCode = () => {
  const phoneError = validatePhone(findCountry(formData.value.country), formData.value.phone)
  if (phoneError) {
    Toast.warning(phoneError)
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
  const phoneError = validatePhone(findCountry(formData.value.country), formData.value.phone)
  if (phoneError) {
    Toast.warning(phoneError)
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
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/login')
  }
}
</script>
