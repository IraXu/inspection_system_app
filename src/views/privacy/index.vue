<template>
  <div class="legal-page app-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="page-title">用户隐私</h1>
    </header>

    <section class="app-section legal-section">
      <div class="legal-meta">{{ LEGAL_EFFECTIVE_DATE }}</div>

      <div class="legal-card">
        <p class="legal-lead">{{ privacyLead }}</p>

        <div v-for="section in privacySections" :key="section.title" class="legal-block">
          <h2 class="legal-block-title">{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { LEGAL_EFFECTIVE_DATE, privacyLead, privacySections } from '../../data/legal'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.legal-page {
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

.legal-section {
  padding-top: 18px;
}

.legal-meta {
  margin: 0 0 12px 4px;
  font-size: 12px;
  color: #9d9ea7;
}

.legal-card {
  padding: 20px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.legal-lead {
  font-size: 13.5px;
  line-height: 1.9;
  color: #4d4e58;
}

.legal-block {
  margin-top: 20px;
}

.legal-block-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: #17181d;
}

.legal-block p {
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #5b5c66;
}
</style>
