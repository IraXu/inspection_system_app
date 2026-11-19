<template>
  <div class="settings-page app-page">
    <svg class="icon-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="pi-doc" viewBox="0 0 24 24">
          <path
            d="M7.1 3h6.2L19.1 8.7v10.1a2.1 2.1 0 0 1-2.1 2.1H7.1a2.1 2.1 0 0 1-2.1-2.1V5.1A2.1 2.1 0 0 1 7.1 3Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M13.3 3v5.7h5.8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M7.7 12h8.2M7.7 15h8.2M7.7 18h5"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </symbol>
        <symbol id="pi-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2" />
          <path
            d="M3.6 12h16.8M12 3.4c2.4 2.3 3.7 5.3 3.7 8.6S14.4 18.3 12 20.6C9.6 18.3 8.3 15.3 8.3 12S9.6 5.7 12 3.4Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="1.5" fill="#3d43f2" />
        </symbol>
        <symbol id="pi-shield" viewBox="0 0 24 24">
          <path
            d="M12 3.2 18.7 5.6v6c0 4.2-2.7 7.4-6.7 9.2-4-1.8-6.7-5-6.7-9.2v-6L12 3.2Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="10.3" r="1.5" fill="#3d43f2" />
          <path d="M12 11.8v3.1" fill="none" stroke="#3d43f2" stroke-width="1.9" stroke-linecap="round" />
        </symbol>
      </defs>
    </svg>

    <header class="settings-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="settings-title">设置</h1>
    </header>

    <section class="app-section settings-main">
      <div class="settings-card">
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="menu-item"
          @click="handleMenu(item)"
        >
          <svg class="ui-icon menu-icon" viewBox="0 0 24 24"><use :href="`#${item.icon}`" /></svg>
          <span class="menu-title">{{ item.title }}</span>
          <span v-if="item.id === 'language'" class="menu-value">{{ currentLanguageLabel }}</span>
          <t-icon name="chevron-right" class="menu-arrow" />
        </button>
      </div>
    </section>

    <div class="settings-spacer"></div>

    <section class="app-section settings-footer">
      <button type="button" class="logout-btn" @click="logout">退出登录</button>
    </section>

    <transition name="sheet">
      <div v-if="showLogoutDialog" class="sheet-layer" @click.self="closeLogoutDialog">
        <div class="logout-sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">退出当前账号?</div>
          <div class="sheet-desc">退出后将返回登录页，当前企业与巡检数据展示会结束。</div>
          <button type="button" class="sheet-primary" @click="confirmLogout">退出登录</button>
          <button type="button" class="sheet-cancel" @click="closeLogoutDialog">取消</button>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="languageSheetVisible" class="sheet-layer" @click.self="closeLanguageSheet">
        <div class="language-sheet">
          <span class="sheet-handle"></span>
          <div class="language-sheet-title">语言</div>
          <div class="language-options">
            <button
              v-for="option in languageOptions"
              :key="option.value"
              type="button"
              class="language-option"
              :class="{ 'is-active': option.value === pendingLanguage }"
              @click="pendingLanguage = option.value"
            >
              <span class="language-option-copy">
                <span class="language-option-title">{{ option.label }}</span>
              </span>
              <t-icon
                v-if="option.value === pendingLanguage"
                name="check"
                class="language-option-check"
              />
            </button>
          </div>
          <button type="button" class="language-confirm" @click="confirmLanguage">确定</button>
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
const showLogoutDialog = ref(false)

const menuItems = ref([
  { id: 'language', title: '语言', icon: 'pi-globe' },
  { id: 'agreement', title: '用户协议', icon: 'pi-doc', path: '/agreement' },
  { id: 'privacy', title: '用户隐私', icon: 'pi-shield', path: '/privacy' }
])

const LANGUAGE_STORAGE_KEY = 'app-language'

const languageOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-Hant', label: '繁体中文' },
  { value: 'en', label: 'English' }
]

const getLanguageLabel = (value) =>
  languageOptions.find((option) => option.value === value)?.label ?? ''

const readStoredLanguage = () => {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return languageOptions.some((option) => option.value === stored) ? stored : 'system'
}

const selectedLanguage = ref(readStoredLanguage())
const pendingLanguage = ref(selectedLanguage.value)
const languageSheetVisible = ref(false)

const currentLanguageLabel = computed(() => getLanguageLabel(selectedLanguage.value))

const goBack = () => {
  router.back()
}

const openLanguageSheet = () => {
  pendingLanguage.value = selectedLanguage.value
  languageSheetVisible.value = true
}

const closeLanguageSheet = () => {
  languageSheetVisible.value = false
}

const confirmLanguage = () => {
  languageSheetVisible.value = false
  if (pendingLanguage.value === selectedLanguage.value) return

  selectedLanguage.value = pendingLanguage.value
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, pendingLanguage.value)
  Toast.success(
    pendingLanguage.value === 'system'
      ? '已跟随系统语言'
      : `已切换至${getLanguageLabel(pendingLanguage.value)}`
  )
}

const handleMenu = (item) => {
  if (item.id === 'language') {
    openLanguageSheet()
    return
  }
  router.push(item.path)
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
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(16px + var(--prototype-safe-bottom));
}

.icon-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.ui-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
}

.settings-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 14px;
}

.back-entry {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-left: -2px;
}

.back-entry:active {
  opacity: 0.6;
}

.settings-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.settings-main {
  padding-top: 18px;
}

.settings-card {
  padding: 2px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 19px 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.menu-item:active {
  opacity: 0.6;
}

.menu-icon {
  flex: 0 0 auto;
  color: #1c1d22;
}

.menu-title {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  font-weight: 500;
  color: #1c1d22;
}

.menu-arrow {
  flex: 0 0 auto;
  font-size: 20px;
  color: #1c1d22;
}

.menu-value {
  flex: 0 0 auto;
  font-size: 15px;
  color: #9a9ba3;
}

.settings-spacer {
  flex: 1;
  min-height: 24px;
}

.settings-footer {
  padding-top: 8px;
}

.logout-btn {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  color: #e5372b;
  font-size: 19px;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(112, 120, 170, 0.09);
}

.logout-btn:active {
  background: rgba(255, 255, 255, 0.78);
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 1600;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.logout-sheet {
  width: 100%;
  padding: 10px 22px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
  text-align: center;
}

.sheet-handle {
  display: block;
  width: 42px;
  height: 5px;
  margin: 0 auto 26px;
  border-radius: 999px;
  background: #e5e5e8;
}

.sheet-title {
  font-size: 21px;
  font-weight: 700;
  color: #16171d;
}

.sheet-desc {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #9a9ba3;
}

.sheet-primary {
  width: 100%;
  height: 54px;
  margin-top: 26px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #ff6a5f 0%, #e5372b 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(229, 55, 43, 0.22);
}

.sheet-primary:active {
  background: linear-gradient(135deg, #f2564a 0%, #d62c20 100%);
}

.sheet-cancel {
  width: 100%;
  height: 48px;
  margin-top: 6px;
  border: 0;
  background: transparent;
  color: #6b6c76;
  font-size: 17px;
  font-weight: 500;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}

.sheet-enter-active .logout-sheet,
.sheet-leave-active .logout-sheet,
.sheet-enter-active .language-sheet,
.sheet-leave-active .language-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .logout-sheet,
.sheet-leave-to .logout-sheet,
.sheet-enter-from .language-sheet,
.sheet-leave-to .language-sheet {
  transform: translate3d(0, 100%, 0);
}

.language-sheet {
  width: 100%;
  padding: 10px 20px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
  text-align: left;
}

.language-sheet-title {
  font-size: 21px;
  font-weight: 700;
  color: #16171d;
  text-align: center;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.language-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(22, 23, 29, 0.06);
  border-radius: 16px;
  background: #f7f7fa;
  text-align: left;
}

.language-option.is-active {
  border-color: rgba(61, 67, 242, 0.5);
  background: rgba(61, 67, 242, 0.06);
}

.language-option:active {
  opacity: 0.72;
}

.language-option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.language-option-title {
  font-size: 16px;
  font-weight: 600;
  color: #1c1d22;
}

.language-option-check {
  flex: 0 0 auto;
  font-size: 20px;
  color: #3d43f2;
}

.language-confirm {
  width: 100%;
  height: 54px;
  margin-top: 20px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(61, 67, 242, 0.24);
}

.language-confirm:active {
  background: linear-gradient(135deg, #4f52ea 0%, #353bd9 100%);
}
</style>
