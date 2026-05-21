<template>
  <div class="profile-page app-page">
    <header class="profile-header gradient-bg">
      <div class="profile-header-glow profile-header-glow-left"></div>
      <div class="profile-header-glow profile-header-glow-right"></div>
      <div class="profile-header-grid"></div>

      <div class="profile-header-content">
        <div class="profile-hero app-card">
          <div class="profile-user">
            <div class="user-avatar">U</div>
            <div class="user-info">
              <div class="user-name-row">
                <h1 class="user-name">{{ userInfo.name }}</h1>
                <span class="user-role">{{ userInfo.role }}</span>
              </div>
              <div class="user-phone">{{ userInfo.phone }}</div>
            </div>
          </div>

          <button type="button" class="settings-entry" @click="goToSettings" aria-label="打开设置">
            <t-icon name="setting" />
          </button>
        </div>
      </div>
    </header>

    <section class="app-section profile-section">
      <div class="profile-card app-card">
        <div class="section-head">
          <div>

            <div class="section-title">企业信息</div>
          </div>
          <button type="button" class="section-action" @click="switchEnterprise">切换企业</button>
        </div>

        <div class="enterprise-summary">
          <div class="enterprise-icon">{{ enterpriseInfo.logo }}</div>
          <div class="enterprise-copy">
            <div class="enterprise-name">{{ enterpriseInfo.name }}</div>
            <div class="enterprise-contact">{{ enterpriseInfo.contact }} · {{ enterpriseInfo.phone }}</div>
          </div>
        </div>

        <div class="enterprise-panels">
          <div class="info-panel">
            <div class="info-panel-head">
              <div class="info-panel-icon">
                <t-icon name="location" />
              </div>
              <span class="info-panel-label">企业地址</span>
            </div>
            <div class="info-panel-value">{{ enterpriseInfo.address }}</div>
          </div>

          <div class="info-panel info-panel--row">
            <div>
              <div class="info-panel-label">企业码</div>
              <div class="info-panel-value info-panel-value--code">{{ enterpriseInfo.code }}</div>
            </div>
            <button type="button" class="copy-action" @click="copyEnterpriseCode">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section profile-section profile-section--tools">
      <div class="profile-card profile-card--tools app-card">
        <div class="shortcut-grid">
          <button
            v-for="item in shortcuts"
            :key="item.title"
            type="button"
            class="shortcut-item"
            @click="item.action"
          >
            <div class="shortcut-icon" :class="item.type">
              <t-icon :name="item.icon" />
            </div>
            <div class="shortcut-title">{{ item.title }}</div>
            <div class="shortcut-desc">{{ item.desc }}</div>
          </button>
        </div>
      </div>
    </section>

    <section class="app-section profile-section profile-section--support">
      <div class="profile-card profile-card--support">
        <div class="service-list">
          <button
            v-for="item in serviceItems"
            :key="item.title"
            type="button"
            class="service-item"
            @click="item.action"
          >
            <div class="service-item-left">
              <div class="service-icon" :class="item.type">
                <t-icon :name="item.icon" />
              </div>
              <div class="service-copy">
                <div class="service-title">{{ item.title }}</div>
                <div class="service-desc">{{ item.desc }}</div>
              </div>
            </div>
            <t-icon name="chevron-right" class="service-arrow" />
          </button>
        </div>
      </div>
    </section>

    <div v-if="cacheDialogVisible" class="profile-dialog-overlay" @click="closeCacheDialog">
      <div class="profile-dialog" @click.stop>
        <div class="profile-dialog-title">清理缓存</div>
        <div class="profile-dialog-content">确认清理当前设备上的临时缓存文件吗？</div>
        <div class="profile-dialog-actions">
          <button type="button" class="profile-dialog-btn profile-dialog-btn--ghost" @click="closeCacheDialog">
            取消
          </button>
          <button type="button" class="profile-dialog-btn profile-dialog-btn--primary" @click="confirmClearCache">
            清理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

const cacheDialogVisible = ref(false)

const userInfo = ref({
  name: '张三',
  phone: '138****8888',
  role: '巡检主管'
})

const enterpriseInfo = ref({
  logo: 'XX',
  name: 'XX科技有限公司',
  contact: '李经理',
  phone: '400-888-8888',
  address: 'XX省XX市XX区XX路XX号XX大厦A座18层',
  code: 'ENT20240115001'
})

const galleryStats = ref({
  images: 12,
  videos: 5
})

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
  Toast.info('关于APP')
}

const shortcuts = computed(() => [
  {
    title: '图库管理',
    desc: `${galleryStats.value.images} 张图片 · ${galleryStats.value.videos} 个视频`,
    icon: 'image',
    type: 'blue',
    action: goToGallery
  },
  {
    title: '企业切换',
    desc: '管理账号归属企业',
    icon: 'swap',
    type: 'green',
    action: switchEnterprise
  }
])

const serviceItems = [
  {
    title: '帮助与反馈',
    desc: '提交问题与使用建议',
    icon: 'help-circle',
    type: 'orange',
    action: handleHelp
  },
  {
    title: '清理缓存',
    desc: '释放本地临时文件占用',
    icon: 'delete',
    type: 'cyan',
    action: openCacheDialog
  },
  {
    title: '关于 APP',
    desc: '查看版本信息与产品说明',
    icon: 'info-circle',
    type: 'purple',
    action: handleAbout
  }
]
</script>

<style scoped>
.profile-page {
  position: relative;
  background:
    radial-gradient(circle at top, rgba(var(--theme-primary-rgb), 0.12), transparent 24%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #f5f8fb 100%);
}

.profile-header {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 10px) var(--prototype-page-padding-x) 18px;
  border-radius: 0 0 34px 34px;
  box-shadow: 0 22px 42px rgba(var(--theme-primary-rgb), 0.14);
}

.profile-header-glow {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  filter: blur(10px);
}

.profile-header-glow-left {
  width: 140px;
  height: 140px;
  top: -36px;
  left: -24px;
}

.profile-header-glow-right {
  width: 180px;
  height: 180px;
  right: -60px;
  top: 18px;
}

.profile-header-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.2;
}

.profile-header-content {
  position: relative;
  z-index: 1;
}

.profile-hero {
  padding: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.56);
  box-shadow: 0 16px 34px rgba(72, 110, 140, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.profile-user {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(240, 250, 255, 0.98) 0%, rgba(208, 234, 250, 0.94) 100%);
  color: var(--theme-primary-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 700;
  flex: 0 0 76px;
}

.user-info {
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.user-name {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  color: #1f2f46;
  font-weight: 700;
}

.user-role {
  padding: 5px 10px;
  border-radius: 999px;
  background: #edf4ff;
  color: var(--theme-primary-strong);
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.user-phone {
  margin-top: 8px;
  font-size: 13px;
  color: #7d8ba1;
}

.settings-entry {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(230, 237, 248, 0.9);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  color: #4a5d7a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
}

.profile-section {
  padding-top: 14px;
}

.profile-section--support {
  padding-top: 8px;
}

.profile-card {
  padding: 18px;
}

.profile-card--tools {
  box-shadow: 0 14px 28px rgba(73, 114, 145, 0.08);
}

.profile-card--support {
  padding: 0 4px 0;
  background: transparent;
  box-shadow: none;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.section-head--compact {
  margin-bottom: 14px;
}

.section-eyebrow {
  font-size: 12px;
  color: #94a3b8;
}

.section-title {
  margin-top: 4px;
  font-size: 17px;
  line-height: 1.35;
  color: #1f2f46;
  font-weight: 700;
}

.section-action {
  height: 34px;
  padding: 0 14px;
  border: 1.5px solid var(--theme-primary-strong);
  border-radius: 14px;
  background: rgba(242, 247, 255, 0.92);
  color: var(--theme-primary-strong);
  font-size: 14px;
  font-weight: 700;
  flex: 0 0 auto;
}

.enterprise-summary {
  display: flex;
  align-items: center;
  gap: 14px;
}

.enterprise-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--theme-primary-strong) 0%, var(--theme-primary) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex: 0 0 56px;
}

.enterprise-copy {
  min-width: 0;
}

.enterprise-name {
  font-size: 17px;
  line-height: 1.35;
  color: #1f2f46;
  font-weight: 700;
}

.enterprise-contact {
  margin-top: 6px;
  font-size: 13px;
  color: #7d8ba1;
}

.enterprise-panels {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.info-panel {
  padding: 14px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(242, 247, 252, 0.98) 100%);
  border: 1px solid rgba(231, 239, 247, 0.92);
}

.info-panel--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-panel-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: var(--theme-primary-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
}

.info-panel-label {
  font-size: 12px;
  color: #94a3b8;
}

.info-panel-value {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.55;
  color: #334155;
}

.info-panel-value--code {
  color: var(--theme-primary-strong);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.copy-action {
  border: 0;
  background: transparent;
  color: var(--theme-primary-strong);
  font-size: 14px;
  font-weight: 700;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.shortcut-item {
  border: 0;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(242, 247, 252, 0.98) 100%);
  border: 1px solid rgba(231, 239, 247, 0.92);
  padding: 16px;
  text-align: left;
}

.shortcut-icon,
.service-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.shortcut-icon.blue,
.service-icon.blue {
  background: linear-gradient(135deg, #e8f3ff 0%, #cde4ff 100%);
  color: var(--theme-primary-strong);
}

.shortcut-icon.green,
.service-icon.green {
  background: linear-gradient(135deg, #edfdf4 0%, #cff7de 100%);
  color: #159957;
}

.service-icon.orange {
  background: linear-gradient(135deg, #fff4e8 0%, #ffe0bc 100%);
  color: #dd6b20;
}

.service-icon.cyan {
  background: linear-gradient(135deg, #e9fcfb 0%, #c7f5f2 100%);
  color: #0f9da2;
}

.service-icon.purple {
  background: linear-gradient(135deg, #f7efff 0%, #ead9ff 100%);
  color: #7c3aed;
}

.shortcut-title {
  margin-top: 14px;
  font-size: 15px;
  color: #1f2f46;
  font-weight: 700;
}

.shortcut-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #7d8ba1;
}

.service-list {
  display: grid;
  gap: 8px;
}

.service-item {
  border: 0;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(242, 247, 252, 0.98) 100%);
  border: 1px solid rgba(231, 239, 247, 0.92);
  padding: 13px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  text-align: left;
  box-shadow: 0 10px 20px rgba(73, 114, 145, 0.05);
}

.service-item-left {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-copy {
  min-width: 0;
}

.service-title {
  font-size: 15px;
  color: #1f2f46;
  font-weight: 700;
}

.service-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: #7d8ba1;
}

.service-arrow {
  color: #9aa8bc;
  flex: 0 0 auto;
}

.profile-dialog-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 23, 43, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px calc(var(--app-tabbar-space, 92px) + 12px);
  z-index: 1600;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.profile-dialog {
  width: 100%;
  max-width: 288px;
  padding: 22px 18px 16px;
  text-align: center;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 18px 36px rgba(73, 114, 145, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.profile-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #173153;
}

.profile-dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: #70829a;
}

.profile-dialog-actions {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.profile-dialog-btn {
  height: 40px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.profile-dialog-btn--ghost {
  background: rgba(241, 246, 252, 0.96);
  color: #5f7490;
}

.profile-dialog-btn--primary {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-strong) 100%);
  color: #fff;
}
</style>
