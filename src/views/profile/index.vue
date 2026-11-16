<template>
  <div class="profile-page app-page">
    <svg class="icon-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="pi-settings" viewBox="0 0 24 24">
          <path
            d="M12 3.5 19.3 7.7v8.6L12 20.5 4.7 16.3V7.7L12 3.5Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="1.7" />
        </symbol>
        <symbol id="pi-swap" viewBox="0 0 24 24">
          <path
            d="M6.6 9.2h10.2m-2.6-2.6 2.6 2.6-2.6 2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.4 14.8H7.2m2.6-2.6-2.6 2.6 2.6 2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
        <symbol id="pi-image" viewBox="0 0 24 24">
          <path
            d="M7.6 7.4V6.2a2.1 2.1 0 0 1 2.1-2.1h9.2a2.1 2.1 0 0 1 2.1 2.1v9.2a2.1 2.1 0 0 1-2.1 2.1h-1.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="3.2"
            y="7.4"
            width="14.1"
            height="12.1"
            rx="2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <circle cx="7.3" cy="10.9" r="0.95" fill="#3d43f2" />
          <path
            d="M5.9 16.4c1.9 0 2-3.4 3.9-3.4 1.5 0 1.6 2.2 3 2.2.9 0 1.5-.5 1.9-1.2"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </symbol>
        <symbol id="pi-switch" viewBox="0 0 24 24">
          <path
            d="M7.6 7.4V6.2a2.1 2.1 0 0 1 2.1-2.1h9.2a2.1 2.1 0 0 1 2.1 2.1v9.2a2.1 2.1 0 0 1-2.1 2.1h-1.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="3.2"
            y="7.4"
            width="14.1"
            height="12.1"
            rx="2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M12.8 11.35H7m2-1.4L7 11.35l2 1.4"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.4 15.55h5.8m-2-1.4 2 1.4-2 1.4"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
        <symbol id="pi-help" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.1" />
          <path
            d="M8.9 9.9c0-1.9 1.3-3.3 3.1-3.3s3.1 1.3 3.1 2.9c0 1.5-1 2.2-1.9 2.8-.7.5-1 1-1 1.8v.1"
            fill="none"
            stroke="#3d43f2"
            stroke-width="2.1"
            stroke-linecap="round"
          />
          <circle cx="12.2" cy="17.3" r="1.2" fill="#3d43f2" />
        </symbol>
        <symbol id="pi-trash" viewBox="0 0 24 24">
          <path
            d="M9.3 6.8V5.1a2 2 0 0 1 2-2h1.4a2 2 0 0 1 2 2v1.7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="3.3"
            y="6.8"
            width="17.4"
            height="3.4"
            rx="1.7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M5.3 10.2v8.3a2.4 2.4 0 0 0 2.4 2.4h8.6a2.4 2.4 0 0 0 2.4-2.4v-8.3"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M8.7 13v5M12 13v5M15.3 13v5"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </symbol>
        <symbol id="pi-info" viewBox="0 0 24 24">
          <path
            d="M12 3.9C16.47 3.9 20.1 7.53 20.1 12 20.1 13.8 19.7 15.2 19.1 16.3L20.7 21.3 14.7 19.9C13.9 20.03 13 20.1 12 20.1 7.53 20.1 3.9 16.47 3.9 12 3.9 7.53 7.53 3.9 12 3.9Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2.1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12.1" cy="7.85" r="1.15" fill="#3d43f2" />
          <path
            d="m12 10.65-.7 4.4c-.1.6.2 1 .7 1 .3 0 .6-.1.9-.4"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.9"
            stroke-linecap="round"
          />
        </symbol>
        <symbol id="pi-chevron-right" viewBox="0 0 24 24">
          <path
            d="m9.4 6.2 5.8 5.8-5.8 5.8"
            fill="none"
            stroke="currentColor"
            stroke-width="2.1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
      </defs>
    </svg>

    <div class="profile-deco" aria-hidden="true">
      <span class="deco-facet deco-facet--a"></span>
      <span class="deco-facet deco-facet--b"></span>
      <span class="deco-facet deco-facet--c"></span>
      <span class="deco-facet deco-facet--d"></span>
    </div>

    <header class="profile-top">
      <button type="button" class="settings-entry" @click="goToSettings" aria-label="打开设置">
        <svg class="ui-icon ui-icon--settings" viewBox="0 0 24 24"><use href="#pi-settings" /></svg>
      </button>
    </header>

    <section class="app-section">
      <div class="profile-hero">
        <span class="hero-facet hero-facet--one"></span>
        <span class="hero-facet hero-facet--two"></span>
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
          <span class="section-action-tag">
            <svg class="ui-icon section-action-icon" viewBox="0 0 24 24"><use href="#pi-swap" /></svg>
            <span class="section-action-text">切换企业</span>
          </span>
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
            <svg class="ui-icon shortcut-icon" viewBox="0 0 24 24"><use :href="`#${item.icon}`" /></svg>
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
          <svg class="ui-icon service-icon" viewBox="0 0 24 24"><use :href="`#${item.icon}`" /></svg>
          <span class="service-title">{{ item.title }}</span>
          <span v-if="item.value" class="service-value">{{ item.value }}</span>
          <svg v-else class="ui-icon service-arrow" viewBox="0 0 24 24"><use href="#pi-chevron-right" /></svg>
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
  '3D cartoon avatar portrait of a smiling young asian man with fluffy short brown hair, big friendly eyes, wearing a light gray shirt, soft clay render style, plain pale lavender background, head and shoulders, centered, mobile app profile avatar',
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
    icon: 'pi-image',
    action: goToGallery
  },
  {
    title: '企业切换',
    desc: '管理账号归属企业',
    icon: 'pi-switch',
    action: switchEnterprise
  }
])

const serviceItems = [
  {
    title: '帮助与反馈',
    icon: 'pi-help',
    action: handleHelp
  },
  {
    title: '清理缓存',
    icon: 'pi-trash',
    value: '1.24 MB',
    action: openCacheDialog
  },
  {
    title: '关于我们',
    icon: 'pi-info',
    action: handleAbout
  }
]
</script>

<style scoped>
.profile-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(120% 46% at 0% 0%, rgba(223, 216, 250, 0.95) 0%, rgba(223, 216, 250, 0) 62%),
    radial-gradient(90% 30% at 82% 0%, rgba(197, 214, 252, 0.72) 0%, rgba(197, 214, 252, 0) 72%),
    radial-gradient(120% 42% at 100% 100%, rgba(199, 240, 232, 0.95) 0%, rgba(199, 240, 232, 0) 62%),
    linear-gradient(168deg, #f1eefc 0%, #eef3fc 46%, #e7f5f2 100%);
  padding-bottom: calc(var(--app-tabbar-space, 92px) + 8px);
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

.ui-icon--sm {
  width: 15px;
  height: 15px;
}

/* 顶部背景的玻璃晶体装饰 */
.profile-deco {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 380px;
  overflow: hidden;
  pointer-events: none;
}

.deco-facet {
  position: absolute;
  border-radius: 24px;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.88) 0%,
    rgba(196, 217, 255, 0.56) 46%,
    rgba(152, 188, 247, 0.32) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: 0 24px 46px rgba(118, 148, 208, 0.14);
}

.deco-facet--a {
  top: 44px;
  right: 24px;
  width: 92px;
  height: 130px;
  transform: rotate(16deg);
  opacity: 0.9;
}

.deco-facet--b {
  top: 0;
  right: -30px;
  width: 118px;
  height: 164px;
  transform: rotate(-12deg);
  opacity: 0.68;
}

.deco-facet--c {
  top: 132px;
  right: 92px;
  width: 148px;
  height: 112px;
  transform: rotate(26deg);
  opacity: 0.5;
}

.deco-facet--d {
  top: 8px;
  left: -62px;
  width: 172px;
  height: 196px;
  transform: rotate(-18deg);
  opacity: 0.32;
}

.profile-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: calc(var(--prototype-safe-top) + 6px) 18px 0 20px;
}

.settings-entry {
  width: 38px;
  height: 38px;
  margin-right: -2px;
  border: 0;
  background: transparent;
  color: #191a20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.settings-entry:active {
  opacity: 0.6;
}

.ui-icon--settings {
  width: 27px;
  height: 27px;
}

.profile-page .app-section {
  position: relative;
  z-index: 1;
  padding-left: 20px;
  padding-right: 20px;
}

.profile-hero {
  position: relative;
  overflow: hidden;
  margin-top: 10px;
  min-height: 100px;
  padding: 20px 18px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(247, 250, 255, 0.87) 55%,
    rgba(240, 246, 255, 0.8) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 34px rgba(116, 132, 186, 0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-facet {
  position: absolute;
  pointer-events: none;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(174, 203, 255, 0.78) 44%,
    rgba(132, 174, 244, 0.44) 100%
  );
  clip-path: polygon(42% 0%, 100% 16%, 86% 82%, 30% 100%, 0% 56%);
}

.hero-facet--one {
  top: -46px;
  right: 36px;
  width: 104px;
  height: 134px;
  transform: rotate(-8deg);
  opacity: 0.95;
}

.hero-facet--two {
  top: 4px;
  right: -26px;
  width: 118px;
  height: 152px;
  transform: rotate(14deg);
  opacity: 0.82;
}

.user-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  flex: 0 0 60px;
  border-radius: 50%;
  object-fit: cover;
  background: #e9edf8;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
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
  background: linear-gradient(135deg, #ff8071 0%, #f0443f 100%);
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
  padding-top: 26px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px 2px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  color: #17181d;
}

.section-action {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3e6df6;
}

.section-action:active {
  opacity: 0.65;
}

.section-action-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px 4px 6px;
  border-radius: 8px;
  background: #e9f1ff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.section-action-text {
  display: inline-block;
}

.section-action-icon {
  width: 17px;
  height: 17px;
}

.enterprise-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: 0 16px 34px rgba(116, 132, 186, 0.07);
}

.enterprise-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enterprise-logo {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  object-fit: contain;
  border-radius: 12px;
}

.enterprise-copy {
  min-width: 0;
}

.enterprise-name {
  font-size: 17.5px;
  line-height: 1.35;
  font-weight: 700;
  color: #17181d;
}

.enterprise-contact {
  margin-top: 7px;
  font-size: 13px;
  color: #9c9da6;
}

.enterprise-field {
  margin-top: 20px;
}

.enterprise-field + .enterprise-field {
  margin-top: 14px;
}

.field-label {
  font-size: 12.5px;
  line-height: 1.3;
  color: #b3b4bd;
}

.field-value {
  margin-top: 7px;
  font-size: 15px;
  line-height: 1.45;
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
  background: #e9f1ff;
  color: #3e6df6;
  font-size: 12.5px;
  line-height: 1.3;
  font-weight: 600;
}

.copy-chip:active {
  background: #dbe8ff;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.shortcut-item {
  padding: 15px 15px 14px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 26px rgba(112, 128, 180, 0.06);
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
  width: 27px;
  height: 27px;
  color: #17181d;
}

.shortcut-title {
  font-size: 16.5px;
  font-weight: 700;
  color: #17181d;
}

.shortcut-desc {
  margin-top: 8px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #a3a4ad;
}

.service-card {
  padding: 2px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: 0 16px 34px rgba(116, 132, 186, 0.07);
}

.service-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.service-item:active {
  opacity: 0.65;
}

.service-icon {
  color: #1b1c22;
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
  color: #a3a4ad;
}

.service-arrow {
  width: 20px;
  height: 20px;
  color: #1b1c22;
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
