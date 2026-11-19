<template>
  <div class="help-page app-page">
    <svg class="icon-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="pi-headset" viewBox="0 0 24 24">
          <path
            d="M4.6 13.4v-1.2a7.4 7.4 0 0 1 14.8 0v1.2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <rect
            x="3.4"
            y="12.7"
            width="4"
            height="6"
            rx="1.8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <rect
            x="16.6"
            y="12.7"
            width="4"
            height="6"
            rx="1.8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M18.6 18.7v.4a2 2 0 0 1-2 2h-3.2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </symbol>
        <symbol id="pi-log" viewBox="0 0 24 24">
          <path
            d="M7.1 3h6.2l5.8 5.7v10.1a2.1 2.1 0 0 1-2.1 2.1H7.1a2.1 2.1 0 0 1-2.1-2.1V5.1A2.1 2.1 0 0 1 7.1 3Z"
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
            d="M12 17.6v-4.4m0 0-2 2m2-2 2 2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
        <symbol id="pi-book" viewBox="0 0 24 24">
          <path
            d="M4.5 5.4h5.1a2.4 2.4 0 0 1 2.4 2.4v11a3 3 0 0 0-3-3H4.5V5.4Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M19.5 5.4h-5.1a2.4 2.4 0 0 0-2.4 2.4v11a3 3 0 0 1 3-3h4.5V5.4Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </symbol>
        <symbol id="pi-phone" viewBox="0 0 24 24">
          <path
            d="M7.1 3.8 9.5 8l-1.9 1.6a11 11 0 0 0 6.8 6.8L16 14.5l4.2 2.4-.5 2.3a2 2 0 0 1-2 1.6C10.2 20.4 3.6 13.8 3.6 6.3a2 2 0 0 1 1.6-2l1.9-.5Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </symbol>
      </defs>
    </svg>

    <header class="help-head">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <div class="head-copy">
        <h1 class="help-title">帮助与反馈</h1>
      </div>
    </header>

    <section class="app-section help-main">
      <div class="help-grid">
        <button
          v-for="item in entries"
          :key="item.id"
          type="button"
          class="help-tile"
          @click="handleEntry(item.id)"
        >
          <span class="tile-icon" :style="{ background: item.bg, color: item.color }">
            <svg class="ui-icon" viewBox="0 0 24 24"><use :href="`#${item.icon}`" /></svg>
          </span>
          <span class="tile-title">{{ item.title }}</span>
          <span class="tile-desc">{{ item.desc }}</span>
        </button>
      </div>
    </section>

    <section class="app-section faq-section">
      <h2 class="section-title">常见问题</h2>

      <div class="faq-card">
        <div v-for="(item, index) in faqs" :key="item.question" class="faq-item">
          <button type="button" class="faq-question" @click="toggleFaq(index)">
            <span class="faq-question-text">{{ item.question }}</span>
            <svg class="faq-chevron" :class="{ 'is-open': openFaq === index }" viewBox="0 0 24 24">
              <path
                d="m9.4 6.2 5.8 5.8-5.8 5.8"
                fill="none"
                stroke="currentColor"
                stroke-width="2.1"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <p v-if="openFaq === index" class="faq-answer">{{ item.answer }}</p>
        </div>
      </div>
    </section>

    <p class="help-footnote">
      没有找到答案？<button type="button" class="footnote-link" @click="openContactSheet">联系我们</button>
    </p>

    <transition name="sheet">
      <div v-if="contactSheetVisible" class="sheet-layer" @click.self="closeContactSheet">
        <div class="sheet-panel">
          <span class="sheet-handle"></span>
          <div class="sheet-title">联系我们</div>
          <div class="contact-info">
            <div class="contact-company">南京鹤梦信息技术有限公司</div>
            <div class="contact-email">support@smartcloudcon.com</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

// 在线客服、帮助中心为外部对接网页，替换为正式地址即可
const ONLINE_SERVICE_URL = 'https://www.smartcloudcon.com/'
const HELP_CENTER_URL = 'https://www.smartcloudcon.com/'

const contactSheetVisible = ref(false)
const openFaq = ref(0)

const faqs = [
  {
    question: '如何绑定或切换企业？',
    answer: '进入「我的 - 切换企业」，选择目标企业并确认，即可完成企业切换。'
  },
  {
    question: '为什么收不到设备告警通知？',
    answer: '请先确认系统通知权限已开启，并检查「消息通知」中的告警提醒是否被关闭。'
  },
  {
    question: '巡检任务超时未提交怎么办？',
    answer: '任务到期前会提醒您按时提交；若已超时，请联系企业管理员重新指派任务。'
  },
  {
    question: '发送日志后多久能收到回复？',
    answer: '工作日一般会在 2 小时内响应，紧急问题建议同时联系在线客服。'
  }
]

const entries = [
  {
    id: 'service',
    title: '在线客服',
    desc: '前往在线客服页面',
    icon: 'pi-headset',
    color: '#2f7dfa',
    bg: '#e8f1ff'
  },
  {
    id: 'log',
    title: '发送日志',
    desc: '打包并分享运行日志',
    icon: 'pi-log',
    color: '#5b5ef7',
    bg: '#eeecff'
  },
  {
    id: 'help-center',
    title: '帮助中心',
    desc: '前往帮助中心页面',
    icon: 'pi-book',
    color: '#12a06a',
    bg: '#e2f8f0'
  },
  {
    id: 'contact',
    title: '联系我们',
    desc: '公司信息与客服邮箱',
    icon: 'pi-phone',
    color: '#f0801a',
    bg: '#fff0e6'
  }
]

const goBack = () => {
  router.back()
}

const handleEntry = (id) => {
  if (id === 'service') {
    window.open(ONLINE_SERVICE_URL, '_blank', 'noopener,noreferrer')
    return
  }
  if (id === 'log') {
    // 原型说明：正式版本为打包日志并调用系统分享，由用户自行选择接收对象
    Toast('打包日志并调用系统分享，用户自行选择将日志发给谁', 3000)
    return
  }
  if (id === 'help-center') {
    window.open(HELP_CENTER_URL, '_blank', 'noopener,noreferrer')
    return
  }
  openContactSheet()
}

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? -1 : index
}

const openContactSheet = () => {
  contactSheetVisible.value = true
}

const closeContactSheet = () => {
  contactSheetVisible.value = false
}
</script>

<style scoped>
.help-page {
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

.help-head {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: calc(var(--prototype-safe-top) + 8px) 16px 0 12px;
}

.back-entry {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 0;
  background: transparent;
  color: #1b1c22;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
}

.back-entry:active {
  opacity: 0.5;
}

.head-copy {
  min-width: 0;
}

.help-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 600;
  color: #1b1c22;
  letter-spacing: 0.01em;
}

.help-main {
  margin-top: 22px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.help-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 15px 15px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 20px rgba(112, 128, 180, 0.05);
  text-align: left;
}

.help-tile:active {
  transform: scale(0.985);
}

.tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  margin-bottom: 2px;
}

.tile-icon .ui-icon {
  width: 23px;
  height: 23px;
}

.tile-title {
  font-size: 16.5px;
  line-height: 1.3;
  font-weight: 700;
  color: #17181d;
}

.tile-desc {
  font-size: 12.5px;
  line-height: 1.45;
  color: #a3a4ad;
}

.faq-section {
  padding-top: 26px;
}

.section-title {
  margin: 0 0 14px 2px;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  color: #17181d;
}

.faq-card {
  padding: 0 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 20px rgba(112, 120, 170, 0.05);
}

.faq-item + .faq-item {
  border-top: 1px solid rgba(22, 23, 29, 0.06);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.faq-question:active {
  opacity: 0.65;
}

.faq-question-text {
  flex: 1;
  min-width: 0;
  font-size: 15.5px;
  line-height: 1.45;
  font-weight: 500;
  color: #1c1d22;
}

.faq-chevron {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  color: #9a9ba3;
  transition: transform 0.2s ease;
}

.faq-chevron.is-open {
  transform: rotate(90deg);
  color: #3d43f2;
}

.faq-answer {
  margin: -4px 0 16px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #7c7d87;
}

.help-footnote {
  margin: 30px 0 0;
  text-align: center;
  font-size: 12.5px;
  line-height: 1.6;
  color: #9a9ba3;
}

.footnote-link {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  color: #3e6df6;
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

.sheet-panel {
  width: 100%;
  padding: 10px 22px calc(26px + var(--prototype-safe-bottom));
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

.contact-info {
  margin-top: 18px;
  padding: 20px 16px;
  border-radius: 16px;
  background: #f6f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.contact-company {
  font-size: 16px;
  line-height: 1.4;
  font-weight: 600;
  color: #1c1d22;
}

.contact-email {
  font-size: 14.5px;
  line-height: 1.4;
  color: #5b5c66;
  word-break: break-all;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}

.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translate3d(0, 100%, 0);
}
</style>
