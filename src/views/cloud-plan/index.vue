<template>
  <div class="plan-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="24" />
      </button>
      <h1 class="page-title">云存储套餐</h1>
    </header>

    <main class="plan-body">
      <section class="placeholder-card">
        <span class="placeholder-tag">待定</span>
        <h2>套餐购买页设计中</h2>
        <p>云存储套餐的展示与购买流程尚未确定，页面方案确认后会在这里补充。</p>
      </section>

      <button type="button" class="back-btn" @click="goBack">返回存储设置</button>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import LiveIcon from '../../components/LiveIcon.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.plan-page {
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

.plan-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 0;
}

.placeholder-card {
  padding: 26px 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
  text-align: center;
}

.placeholder-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(74, 92, 255, 0.1);
  color: #4a5cff;
  font-size: 12px;
  font-weight: 600;
}

.placeholder-card h2 {
  margin: 14px 0 0;
  font-size: 19px;
  font-weight: 700;
  color: #1c1d22;
}

.placeholder-card p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.65;
  color: #9a9ba3;
}

.back-btn {
  width: 100%;
  height: 54px;
  margin-top: 18px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 12px 24px rgba(61, 67, 242, 0.24);
}

.back-btn:active {
  filter: brightness(0.94);
}
</style>
