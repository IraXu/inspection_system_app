<template>
  <div class="about-page app-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="page-title">关于我们</h1>
    </header>

    <section class="app-section about-section">
      <div class="about-hero">
        <div class="about-logo">
          <t-icon name="secured" />
        </div>
        <div class="about-name">智慧巡检</div>
        <div class="about-version">版本 1.0.0</div>
      </div>
    </section>

    <section class="app-section about-section">
      <div class="about-card">
        <p class="about-intro">
          智慧巡检是一款面向企业现场巡检场景的移动应用，覆盖任务下发、现场打卡、隐患上报、整改审核与数据看板，帮助团队高效完成日常巡检工作。
        </p>
      </div>
    </section>

    <section class="app-section about-section">
      <h2 class="section-title">核心能力</h2>
      <div class="about-card about-card--list">
        <div v-for="item in features" :key="item.title" class="about-row">
          <span class="row-icon">
            <t-icon :name="item.icon" />
          </span>
          <div class="row-copy">
            <div class="row-title">{{ item.title }}</div>
            <div class="row-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section about-section">
      <h2 class="section-title">联系我们</h2>
      <div class="about-card about-card--list">
        <div v-for="item in contacts" :key="item.label" class="about-row">
          <span class="row-icon">
            <t-icon :name="item.icon" />
          </span>
          <span class="row-title row-title--plain">{{ item.label }}</span>
          <span class="row-value">{{ item.value }}</span>
        </div>
      </div>
    </section>

    <p class="copyright">© 2026 鹤梦科技有限公司 · 保留所有权利</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const features = [
  {
    icon: 'task',
    title: '智能巡检',
    desc: '任务下发、扫码点位、现场拍照留痕'
  },
  {
    icon: 'video',
    title: '视频巡查',
    desc: '实时视频与多画面轮巡，异常快速定位'
  },
  {
    icon: 'check-circle',
    title: '整改闭环',
    desc: '隐患上报、整改跟踪、复核归档全流程'
  }
]

const contacts = [
  { label: '客服电话', value: '400-666-6666', icon: 'call' },
  { label: '联系邮箱', value: 'support@hemeng.com', icon: 'mail' },
  { label: '官方网站', value: 'www.hemeng.com', icon: 'internet' }
]
</script>

<style scoped>
.about-page {
  min-height: 100%;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(28px + var(--prototype-safe-bottom));
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

.about-section {
  padding-top: 18px;
}

.about-hero {
  position: relative;
  overflow: hidden;
  padding: 24px 18px 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 249, 255, 0.88) 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.08);
  text-align: center;
}

.about-hero::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -34px;
  width: 150px;
  height: 150px;
  border-radius: 30px;
  transform: rotate(14deg);
  background:
    linear-gradient(118deg, rgba(140, 176, 255, 0.2) 0 24%, rgba(140, 176, 255, 0) 24% 44%, rgba(170, 200, 255, 0.18) 44% 70%, rgba(170, 200, 255, 0) 70%);
  pointer-events: none;
}

.about-logo {
  position: relative;
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #7ea6ff 0%, #3f6cf5 100%);
  color: #fff;
  font-size: 38px;
  box-shadow: 0 12px 26px rgba(63, 108, 245, 0.26);
}

.about-name {
  position: relative;
  margin-top: 14px;
  font-size: 20px;
  font-weight: 700;
  color: #17181d;
}

.about-version {
  position: relative;
  margin-top: 6px;
  font-size: 13px;
  color: #9c9da6;
}

.about-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.about-card--list {
  padding: 4px 18px;
}

.about-intro {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #4d4e58;
}

.section-title {
  margin: 0 0 12px 4px;
  font-size: 19px;
  line-height: 1.3;
  font-weight: 700;
  color: #17181d;
}

.about-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
}

.row-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 10px;
  background: #eaf1ff;
  color: #3f6cf5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.row-copy {
  min-width: 0;
}

.row-title {
  font-size: 15px;
  font-weight: 600;
  color: #1c1d22;
}

.row-title--plain {
  flex: 1;
  min-width: 0;
  font-weight: 500;
  font-size: 16px;
}

.row-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #a2a3ac;
}

.row-value {
  flex: 0 0 auto;
  font-size: 13px;
  color: #9c9da6;
}

.copyright {
  margin: 26px 0 0;
  text-align: center;
  font-size: 12px;
  color: #9d9ea7;
}
</style>
