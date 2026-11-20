<template>
  <div class="device-page">
    <svg class="icon-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="dev-alarm" viewBox="0 0 24 24">
          <path
            d="M12 4.2a5.6 5.6 0 0 0-5.6 5.6v3.4l-1.7 3a1.2 1.2 0 0 0 1 1.8h12.6a1.2 1.2 0 0 0 1-1.8l-1.7-3V9.8A5.6 5.6 0 0 0 12 4.2Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linejoin="round"
          />
          <path
            d="M10 20.2a2.2 2.2 0 0 0 4 0"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
          />
          <circle cx="17.6" cy="6.4" r="2.2" fill="#3d43f2" />
        </symbol>
        <symbol id="dev-storage" viewBox="0 0 24 24">
          <path
            d="M7 3.2h7.4l3.8 3.8v11.8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.2a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linejoin="round"
          />
          <path d="M9 3.4v4.2M11.4 3.4v4.2M13.8 3.4v4.2" stroke="#3d43f2" stroke-width="1.6" stroke-linecap="round" />
          <path d="M8.4 15.6h7.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </symbol>
      </defs>
    </svg>

    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="24" />
      </button>
      <h1 class="page-title">设备设置</h1>
    </header>

    <section class="app-section device-info">
      <div class="device-card">
        <div class="device-name-row">
          <h2>{{ device.name }}</h2>
          <span class="status-pill" :class="device.status === 'online' ? '' : 'is-offline'">
            <i></i>
            {{ device.status === 'online' ? '在线' : '离线' }}
          </span>
        </div>

        <dl class="device-meta">
          <div class="meta-item">
            <dt>设备ID</dt>
            <dd>{{ device.deviceNo }}</dd>
          </div>
          <div class="meta-item">
            <dt>固件版本</dt>
            <dd>{{ device.firmware }}</dd>
          </div>
          <div class="meta-item">
            <dt>SDK 版本</dt>
            <dd>{{ device.sdkVersion }}</dd>
          </div>
          <div class="meta-item is-wide">
            <dt>所属路径</dt>
            <dd>{{ device.path }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="app-section section">
      <div class="settings-card">
        <button type="button" class="menu-item" @click="goAlarmSettings">
          <svg class="ui-icon menu-icon" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#dev-alarm" />
          </svg>
          <span class="menu-copy">
            <span class="menu-title">报警设置</span>
            <span class="menu-desc">侦测类型、灵敏度与消息推送</span>
          </span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>

        <button type="button" class="menu-item" @click="goStorageSettings">
          <svg class="ui-icon menu-icon" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#dev-storage" />
          </svg>
          <span class="menu-copy">
            <span class="menu-title">存储设置</span>
            <span class="menu-desc">录制时间、录像清晰度与存储卡</span>
          </span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>
      </div>
    </section>

    <div class="page-spacer"></div>

    <section class="app-section page-footer">
      <button type="button" class="delete-btn" @click="showDeleteSheet = true">删除设备</button>
    </section>

    <transition name="sheet">
      <div v-if="showDeleteSheet" class="sheet-layer" @click.self="showDeleteSheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">删除设备</div>
          <div class="sheet-desc">
            确定要删除「{{ device.name }}」吗？删除后将无法继续查看该设备的实时画面与历史录像。
          </div>
          <button type="button" class="sheet-primary" @click="confirmDelete">删除设备</button>
          <button type="button" class="sheet-cancel" @click="showDeleteSheet = false">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()

const deviceId = computed(() => route.params.id)

const DEVICE_PROFILES = {
  1: {
    name: '摄像头-车间1入口', status: 'online', deviceNo: 'CAM-SH-A101',
    firmware: 'V4.2.8', sdkVersion: 'SDK 3.6.2', path: '华东区 / 上海工厂 / 生产车间 · A线'
  },
  2: {
    name: '摄像头-车间1出口', status: 'online', deviceNo: 'CAM-SH-A102',
    firmware: 'V4.2.8', sdkVersion: 'SDK 3.6.2', path: '华东区 / 上海工厂 / 生产车间 · A线'
  },
  3: {
    name: '摄像头-车间2入口', status: 'offline', deviceNo: 'CAM-SH-B201',
    firmware: 'V4.2.6', sdkVersion: 'SDK 3.5.8', path: '华东区 / 上海工厂 / 生产车间 · B线'
  },
  4: {
    name: '摄像头-仓库区域', status: 'offline', deviceNo: 'CAM-SH-W301',
    firmware: 'V4.2.6', sdkVersion: 'SDK 3.5.8', path: '华东区 / 上海工厂 / 仓库'
  },
  5: {
    name: '摄像头-办公区域', status: 'online', deviceNo: 'CAM-BJ-O101',
    firmware: 'V4.3.1', sdkVersion: 'SDK 3.7.0', path: '华北区 / 北京工厂 / 办公区域'
  },
  6: {
    name: '摄像头-停车场', status: 'online', deviceNo: 'CAM-BJ-P201',
    firmware: 'V4.3.1', sdkVersion: 'SDK 3.7.0', path: '华北区 / 北京工厂 / 停车场'
  },
  7: {
    name: '摄像头-厂区大门', status: 'online', deviceNo: 'CAM-BJ-G301',
    firmware: 'V4.3.1', sdkVersion: 'SDK 3.7.0', path: '华北区 / 北京工厂 / 厂区大门'
  },
  8: {
    name: '摄像头-生产车间', status: 'online', deviceNo: 'CAM-SZ-W101',
    firmware: 'V4.3.2', sdkVersion: 'SDK 3.7.2', path: '华南区 / 深圳工厂 / 生产车间'
  }
}

const device = computed(() => {
  return DEVICE_PROFILES[deviceId.value] || {
    name: '未知设备', status: 'offline', deviceNo: '—',
    firmware: '—', sdkVersion: '—', path: '未分配路径'
  }
})

const showDeleteSheet = ref(false)

const goBack = () => {
  router.back()
}

const goStorageSettings = () => {
  router.push(`/device-storage-settings/${deviceId.value}`)
}

const goAlarmSettings = () => {
  router.push(`/alarm-settings/${deviceId.value}`)
}

const confirmDelete = () => {
  showDeleteSheet.value = false
  Toast.success('设备已删除')
  setTimeout(() => {
    router.replace('/home')
  }, 400)
}
</script>

<style scoped>
.device-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(16px + var(--prototype-safe-bottom));
}

.page-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 14px;
}

.back-entry {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  margin-left: -2px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.back-entry:active {
  opacity: 0.6;
}

.page-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.device-info {
  padding-top: 20px;
}

.device-card {
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.device-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.device-name-row h2 {
  margin: 0;
  min-width: 0;
  font-size: 21px;
  font-weight: 700;
  color: #16171d;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-pill {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(18, 165, 148, 0.12);
  color: #12906f;
  font-size: 12px;
  font-weight: 600;
}

.status-pill i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #12a594;
}

.status-pill.is-offline {
  background: rgba(140, 150, 165, 0.14);
  color: #8c96a5;
}

.status-pill.is-offline i {
  background: #a7b0be;
}

.device-meta {
  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(28, 29, 34, 0.05);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.meta-item {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.meta-item.is-wide {
  grid-column: 1 / -1;
}

.meta-item dt {
  font-size: 11.5px;
  color: #8b90a0;
}

.meta-item dd {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  color: #1c1d22;
  word-break: break-all;
}

.section {
  padding-top: 16px;
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
  font-family: inherit;
}

.menu-item + .menu-item {
  border-top: 1px solid rgba(28, 29, 34, 0.05);
}

.menu-item:active {
  opacity: 0.6;
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

.menu-icon {
  color: #1c1d22;
}

.menu-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.menu-title {
  font-size: 17px;
  font-weight: 500;
  color: #1c1d22;
}

.menu-desc {
  font-size: 12.5px;
  color: #9a9ba3;
}

.menu-arrow {
  flex: 0 0 auto;
  color: #1c1d22;
}

.page-spacer {
  flex: 1;
  min-height: 28px;
}

.page-footer {
  padding-top: 8px;
}

.delete-btn {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  color: #e5372b;
  font-size: 19px;
  font-weight: 700;
  font-family: inherit;
  box-shadow: 0 12px 28px rgba(112, 120, 170, 0.09);
}

.delete-btn:active {
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

.sheet {
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
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  font-family: inherit;
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
  font-family: inherit;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
