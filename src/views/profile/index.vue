<template>
  <div class="profile-page app-page">
    <header class="profile-top">
      <h1 class="profile-title">我的</h1>
      <button type="button" class="settings-entry" @click="goToSettings" aria-label="打开设置">
        <t-icon name="setting" />
      </button>
    </header>

    <section class="app-section">
      <div class="profile-hero">
        <span class="hero-shape"></span>
        <img class="user-avatar" :src="avatarUrl" alt="用户头像" />
        <div class="user-info">
          <div class="user-name-row">
            <h2 class="user-name">{{ userInfo.name }}</h2>
            <span class="user-role">{{ userInfo.role }}</span>
          </div>
          <div class="user-phone">{{ userInfo.phone }}</div>
        </div>
      </div>
    </section>

    <section class="app-section profile-section">
      <div class="section-head">
        <h3 class="section-title">企业信息</h3>
        <button type="button" class="section-action" @click="switchEnterprise">
          <span class="section-action-icon">
            <t-icon name="swap" />
          </span>
          切换企业
        </button>
      </div>

      <div class="enterprise-card">
        <div class="enterprise-summary">
          <img class="enterprise-logo" :src="logoUrl" alt="企业标识" />
          <div class="enterprise-copy">
            <div class="enterprise-name">{{ enterpriseInfo.name }}</div>
            <div class="enterprise-contact">{{ enterpriseInfo.contact }} · {{ enterpriseInfo.phone }}</div>
          </div>
        </div>

        <div class="enterprise-field">
          <div class="field-label">企业地址</div>
          <div class="field-value">{{ enterpriseInfo.address }}</div>
        </div>

        <div class="enterprise-field">
          <div class="field-label">企业码</div>
          <div class="field-value field-value--row">
            <span class="code-value">{{ enterpriseInfo.code }}</span>
            <button type="button" class="copy-chip" @click="copyEnterpriseCode">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section profile-section">
      <div class="section-head">
        <h3 class="section-title">常用功能</h3>
      </div>

      <div class="shortcut-grid">
        <button
          v-for="item in shortcuts"
          :key="item.title"
          type="button"
          class="shortcut-item"
          @click="item.action"
        >
          <div class="shortcut-head">
            <t-icon :name="item.icon" class="shortcut-icon" />
            <span class="shortcut-title">{{ item.title }}</span>
          </div>
          <div class="shortcut-desc">{{ item.desc }}</div>
        </button>
      </div>
    </section>

    <section class="app-section profile-section">
      <div class="section-head">
        <h3 class="section-title">帮助与支持</h3>
      </div>

      <div class="service-card">
        <button
          v-for="item in serviceItems"
          :key="item.title"
          type="button"
          class="service-item"
          @click="item.action"
        >
          <t-icon :name="item.icon" class="service-icon" />
          <span class="service-title">{{ item.title }}</span>
          <span v-if="item.value" class="service-value">{{ item.value }}</span>
          <t-icon v-else name="chevron-right" class="service-arrow" />
        </button>
      </div>
    </section>

    <div v-if="cacheDialogVisible" class="cache-layer" @click.self="closeCacheDialog">
      <div class="cache-dialog">
        <div class="cache-dialog-title">清理缓存</div>
        <div class="cache-dialog-content">确认清理当前设备的临时缓存文件</div>
        <div class="cache-dialog-actions">
          <button type="button" class="cache-btn cache-btn--ghost" @click="closeCacheDialog">取消</button>
          <button type="button" class="cache-btn cache-btn--primary" @click="confirmClearCache">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { buildImageUrl } from '../../utils/media'

const router = useRouter()

const cacheDialogVisible = ref(false)

const userInfo = ref({
  name: '王发财心想事成',
  phone: '135***51239',
  role: '巡检专员'
})

const enterpriseInfo = ref({
  name: '鹤梦科技有限公司',
  contact: '李经理',
  phone: '400-666-6666',
  address: '江苏省南京市江宁区智慧园 3 号楼 A 座 18 层',
  code: 'HM20260115001'
})

const galleryStats = ref({
  images: 12,
  videos: 5
})

const avatarUrl = buildImageUrl(
  '3D cartoon avatar portrait of a friendly young asian man with short brown hair, big eyes, wearing a light gray jacket, soft Pixar style, clean light lavender background, centered head and shoulders, mobile app profile avatar',
  'square'
)

const logoUrl = buildImageUrl(
  '3D isometric miniature city of glossy translucent blue glass skyscrapers on a small rounded base, soft studio lighting, clean white background, mobile app enterprise logo icon',
  'square'
)

const goToSettings = () => {
  router.push('/settings')
}

const switchEnterprise = () => {
  router.push('/select-enterprise')
}

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('copy failed')
  }
}

const copyEnterpriseCode = async () => {
  try {
    await copyText(enterpriseInfo.value.code)
    Toast.success('企业码已复制')
  } catch (error) {
    Toast.warning('复制失败，请稍后重试')
  }
}

const goToGallery = () => {
  Toast.info('图库管理功能开发中')
}

const handleHelp = () => {
  Toast.info('帮助与反馈')
}

const openCacheDialog = () => {
  cacheDialogVisible.value = true
}

const closeCacheDialog = () => {
  cacheDialogVisible.value = false
}

const confirmClearCache = () => {
  closeCacheDialog()
  Toast.success('缓存已清理')
}

const handleAbout = () => {
  router.push('/about')
}

const shortcuts = computed(() => [
  {
    title: '图库管理',
    desc: `${galleryStats.value.images}张图片 · ${galleryStats.value.videos}个视频`,
    icon: 'image',
    action: goToGallery
  },
  {
    title: '企业切换',
    desc: '管理账号归属企业',
    icon: 'swap',
    action: switchEnterprise
  }
])

const serviceItems = [
  {
    title: '帮助与反馈',
    icon: 'help-circle',
    action: handleHelp
  },
  {
    title: '清理缓存',
    icon: 'delete',
    value: '1.24 MB',
    action: openCacheDialog
  },
  {
    title: '关于我们',
    icon: 'info-circle',
    action: handleAbout
  }
]
</script>

<style scoped>
.profile-page {
  position: relative;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(var(--app-tabbar-space, 92px) + 8px);
}

.profile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 20px;
}

.profile-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.settings-entry {
  width: 34px;
  height: 34px;
  margin-right: -4px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.settings-entry:active {
  opacity: 0.6;
}

.profile-hero {
  position: relative;
  overflow: hidden;
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 249, 255, 0.88) 100%);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-shape {
  position: absolute;
  top: -34px;
  right: -26px;
  width: 168px;
  height: 168px;
  border-radius: 26px;
  transform: rotate(12deg);
  background:
    linear-gradient(118deg, rgba(140, 176, 255, 0.24) 0 22%, rgba(140, 176, 255, 0) 22% 36%, rgba(160, 192, 255, 0.2) 36% 58%, rgba(160, 192, 255, 0) 58% 70%, rgba(180, 206, 255, 0.22) 70% 88%, rgba(180, 206, 255, 0) 88%);
  pointer-events: none;
}

.user-avatar {
  position: relative;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 50%;
  object-fit: cover;
  background: #e9edf8;
}

.user-info {
  position: relative;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  margin: 0;
  min-width: 0;
  font-size: 19px;
  line-height: 1.25;
  font-weight: 700;
  color: #17181d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 7px;
  background: linear-gradient(135deg, #ff7a6b 0%, #ef3f45 100%);
  color: #fff;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 600;
  white-space: nowrap;
}

.user-phone {
  margin-top: 7px;
  font-size: 14px;
  color: #9c9da6;
}

.profile-section {
  padding-top: 24px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 4px;
}

.section-title {
  margin: 0;
  font-size: 19px;
  line-height: 1.3;
  font-weight: 700;
  color: #17181d;
}

.section-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3f6cf5;
  font-size: 13px;
  font-weight: 600;
}

.section-action-icon {
  width: 20px;
  height: 20px;
  border-radius: 7px;
  background: #e7efff;
  color: #3f6cf5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.enterprise-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.93);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.enterprise-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enterprise-logo {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  object-fit: contain;
  border-radius: 12px;
}

.enterprise-copy {
  min-width: 0;
}

.enterprise-name {
  font-size: 17px;
  line-height: 1.35;
  font-weight: 700;
  color: #17181d;
}

.enterprise-contact {
  margin-top: 6px;
  font-size: 13px;
  color: #9c9da6;
}

.enterprise-field {
  margin-top: 18px;
}

.enterprise-field + .enterprise-field {
  margin-top: 16px;
}

.field-label {
  font-size: 12px;
  line-height: 1.3;
  color: #b4b5bd;
}

.field-value {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #23242b;
}

.field-value--row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-value {
  font-weight: 500;
}

.copy-chip {
  border: 0;
  padding: 3px 8px;
  border-radius: 7px;
  background: #e7f0ff;
  color: #3f6cf5;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 600;
}

.copy-chip:active {
  background: #d9e7ff;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.shortcut-item {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.93);
  box-shadow: 0 10px 24px rgba(112, 120, 170, 0.06);
  text-align: left;
}

.shortcut-item:active {
  transform: scale(0.985);
}

.shortcut-head {
  display: flex;
  align-items: center;
  gap: 9px;
}

.shortcut-icon {
  font-size: 24px;
  color: #1c1d22;
}

.shortcut-title {
  font-size: 16px;
  font-weight: 700;
  color: #17181d;
}

.shortcut-desc {
  margin-top: 9px;
  font-size: 12px;
  line-height: 1.45;
  color: #a2a3ac;
}

.service-card {
  padding: 4px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.93);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.service-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.service-item:active {
  opacity: 0.65;
}

.service-icon {
  flex: 0 0 auto;
  font-size: 24px;
  color: #1c1d22;
}

.service-title {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1c1d22;
}

.service-value {
  flex: 0 0 auto;
  font-size: 14px;
  color: #a2a3ac;
}

.service-arrow {
  flex: 0 0 auto;
  font-size: 20px;
  color: #1c1d22;
}

.cache-layer {
  position: fixed;
  inset: 0;
  z-index: 1600;
  padding: 0 24px calc(var(--app-tabbar-space, 92px) + 8px);
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cache-dialog {
  width: 100%;
  max-width: 306px;
  padding: 24px 20px 18px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 24px 48px rgba(30, 40, 80, 0.16);
  text-align: center;
}

.cache-dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: #16171d;
}

.cache-dialog-content {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.5;
  color: #2c2d34;
}

.cache-dialog-actions {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cache-btn {
  height: 52px;
  border: 0;
  border-radius: 26px;
  font-size: 17px;
  font-weight: 600;
}

.cache-btn--ghost {
  background: #ececee;
  color: #16171d;
}

.cache-btn--primary {
  background: #2f7dfa;
  color: #fff;
}

.cache-btn--primary:active {
  background: #1f6ceb;
}
</style>
