<template>
  <div class="privacy-gate" role="dialog" aria-modal="true" aria-labelledby="privacy-gate-title">
    <div class="privacy-card">
      <h2 id="privacy-gate-title" class="privacy-card__title">
        {{ step === 'welcome' ? '欢迎使用鹤梦之家' : '温馨提示' }}
      </h2>

      <div v-if="step === 'welcome'" class="privacy-card__body">
        <p>
          我们非常重视您的个人信息和隐私保护。依据最新法律要求，我们更新了<button
            type="button"
            class="privacy-doc-link"
            @click="openDoc('privacy')"
          >《隐私政策》</button>和<button
            type="button"
            class="privacy-doc-link"
            @click="openDoc('agreement')"
          >《用户协议》</button>。请您务必谨慎阅读、充分理解各条款，包括但不限于：
        </p>
        <p>1、我们会根据您的具体功能需要，收集必要的用户信息（包括手机号、设备信息、位置信息等）或取得必要的授权（相机、相册、文件读写权限等）。</p>
        <p>2、您拒绝或撤回授权同意，将导致您无法使用相应的特定功能，但不影响您使用鹤梦之家的其他功能。</p>
        <p>3、未经您的同意，我们不会从第三方获取、共享或对外提供您的信息。</p>
        <p>
          您可以阅读完整版的<button
            type="button"
            class="privacy-doc-link"
            @click="openDoc('privacy')"
          >《隐私政策》</button>和<button
            type="button"
            class="privacy-doc-link"
            @click="openDoc('agreement')"
          >《用户协议》</button>了解详细信息，如您同意，请点击下方按钮继续。
        </p>
      </div>

      <div v-else class="privacy-card__body">
        <p>您的信息仅用于为您提供服务，鹤梦之家会坚决保障您的隐私信息安全。</p>
        <p>如果您仍不同意本隐私协议，很遗憾我们将无法继续为您提供服务。</p>
        <div class="privacy-doc-lines">
          <button type="button" class="privacy-doc-link" @click="openDoc('agreement')">
            点击查看《用户协议》
          </button>
          <button type="button" class="privacy-doc-link" @click="openDoc('privacy')">
            点击查看《隐私政策》
          </button>
        </div>
      </div>

      <div class="privacy-card__actions">
        <button type="button" class="privacy-submit" @click="emit('agree')">同意并继续</button>
        <button
          v-if="step === 'welcome'"
          type="button"
          class="privacy-text-btn"
          @click="step = 'reminder'"
        >
          不同意
        </button>
        <button v-else type="button" class="privacy-text-btn" @click="exitApp">
          不同意并退出
        </button>
      </div>
    </div>

    <transition name="privacy-fade">
      <div v-if="activeDoc" class="privacy-reader">
        <header class="privacy-reader__top">
          <button type="button" class="privacy-reader__back" aria-label="返回" @click="activeDoc = null">
            <t-icon name="chevron-left" />
          </button>
          <h3>{{ activeDoc === 'privacy' ? '隐私政策' : '用户协议' }}</h3>
        </header>

        <div class="privacy-reader__scroll">
          <p class="privacy-reader__meta">{{ LEGAL_EFFECTIVE_DATE }}</p>
          <p class="privacy-reader__lead">{{ activeDoc === 'privacy' ? privacyLead : agreementLead }}</p>
          <div v-for="section in activeSections" :key="section.title" class="privacy-reader__block">
            <h4>{{ section.title }}</h4>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </div>
        </div>

        <footer class="privacy-reader__footer">
          <button type="button" class="privacy-submit" @click="activeDoc = null">我已阅读</button>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  LEGAL_EFFECTIVE_DATE,
  agreementLead,
  agreementSections,
  privacyLead,
  privacySections
} from '../data/legal'

const emit = defineEmits(['agree'])

// welcome：首次说明；reminder：拒绝后的再次提示
const step = ref('welcome')
const activeDoc = ref(null)

const activeSections = computed(() =>
  activeDoc.value === 'privacy' ? privacySections : agreementSections
)

const openDoc = (doc) => {
  activeDoc.value = doc
}

// 不同意并退出：直接退出应用，不再弹出二次确认
const exitApp = () => {
  window.close()
}
</script>

<style scoped>
.privacy-gate {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
  background: rgba(24, 30, 44, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.privacy-card {
  width: 100%;
  max-width: 330px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px 22px 16px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 20px 46px rgba(18, 30, 58, 0.18);
}

.privacy-card__title {
  margin: 0;
  text-align: center;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 700;
  color: #1a1d26;
  letter-spacing: 0.01em;
}

.privacy-card__body {
  flex: 1;
  min-height: 0;
  margin-top: 18px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.85;
  color: #3f4452;
}

.privacy-card__body::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.privacy-card__body p {
  margin: 0 0 10px;
}

.privacy-card__body p:last-child {
  margin-bottom: 0;
}

.privacy-doc-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
}

.privacy-doc-link {
  display: inline;
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  line-height: inherit;
  color: #3d6cf5;
}

.privacy-doc-link:active {
  opacity: 0.65;
}

.privacy-card__actions {
  flex: 0 0 auto;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.privacy-submit {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #5c6cf8 0%, #4058ef 100%);
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 24px rgba(74, 92, 238, 0.26);
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.privacy-submit:active {
  transform: translateY(1px);
  opacity: 0.9;
}

.privacy-text-btn {
  height: 40px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: #7d8496;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
}

.privacy-text-btn:active {
  opacity: 0.6;
}

.privacy-reader {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: #f5f8fc;
}

.privacy-reader__top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 10px;
  background: #ffffff;
  border-bottom: 1px solid #eef1f6;
}

.privacy-reader__back {
  width: 32px;
  height: 32px;
  margin-left: -4px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.privacy-reader__top h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #16171d;
}

.privacy-reader__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 24px;
}

.privacy-reader__meta {
  margin: 0 0 10px;
  font-size: 12px;
  color: #9d9ea7;
}

.privacy-reader__lead {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #4d4e58;
}

.privacy-reader__block {
  margin-top: 18px;
}

.privacy-reader__block h4 {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: #17181d;
}

.privacy-reader__block p {
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #5b5c66;
}

.privacy-reader__footer {
  padding: 10px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #eef1f6;
}

.privacy-fade-enter-active,
.privacy-fade-leave-active {
  transition: opacity 0.18s ease;
}

.privacy-fade-enter-from,
.privacy-fade-leave-to {
  opacity: 0;
}
</style>
