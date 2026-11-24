import { ref } from 'vue'

// 隐私政策同意状态：只有用户明确同意后才写入，未同意时视为拒绝
const STORAGE_KEY = 'app-privacy-consent'

// 隐私政策版本号：政策内容更新时递增，用户需要重新确认
export const PRIVACY_POLICY_VERSION = '2026.11'

const readPrivacyConsent = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const record = JSON.parse(raw)
    return record.version === PRIVACY_POLICY_VERSION && record.status === 'accepted'
  } catch {
    return false
  }
}

// 响应式同意状态，供 App 与登录页共享
export const privacyConsentGranted = ref(readPrivacyConsent())

export const hasPrivacyConsent = () => readPrivacyConsent()

export const grantPrivacyConsent = () => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      status: 'accepted',
      version: PRIVACY_POLICY_VERSION,
      acceptedAt: new Date().toISOString()
    })
  )
  privacyConsentGranted.value = true
}

export const revokePrivacyConsent = () => {
  window.localStorage.removeItem(STORAGE_KEY)
  privacyConsentGranted.value = false
}
