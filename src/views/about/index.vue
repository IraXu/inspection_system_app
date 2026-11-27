<template>
  <div class="about-page">
    <button type="button" class="back-entry" aria-label="返回" @click="goBack">
      <t-icon name="chevron-left" />
    </button>

    <main class="about-main">
      <svg class="app-icon" viewBox="0 0 1024 1024" role="img" aria-label="鹤梦之家应用图标">
        <defs>
          <linearGradient id="about-icon-bg" x1="120" y1="0" x2="904" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#3f9dff" />
            <stop offset="0.55" stop-color="#2a89fa" />
            <stop offset="1" stop-color="#1c70ee" />
          </linearGradient>
          <radialGradient id="about-icon-glow" cx="0.3" cy="0.18" r="0.8">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.2" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1024" height="1024" fill="url(#about-icon-bg)" />
        <rect width="1024" height="1024" fill="url(#about-icon-glow)" />
        <path
          fill="#ffffff"
          fill-opacity="0.45"
          d="M345 250C300 302 262 372 252 448C242 522 266 592 316 634C362 672 440 686 520 662C468 656 410 636 366 600C316 560 296 496 300 428C305 358 326 294 345 250Z"
        />
        <path
          fill="#ffffff"
          d="M228 545C236 640 300 720 402 762C492 799 592 794 670 754C748 714 786 620 790 438C770 556 720 642 640 692C560 742 460 746 380 706C310 670 260 610 228 545Z"
        />
        <path
          fill="#ffffff"
          d="M470 560C500 470 550 370 605 315C640 282 695 258 735 280C775 302 790 355 775 405C758 462 715 505 665 535C700 480 705 430 685 400C662 366 620 372 592 410C550 468 505 520 470 560Z"
        />
        <ellipse cx="650" cy="298" rx="20" ry="11" transform="rotate(-20 650 298)" fill="#a9d9ff" />
      </svg>

      <h1 class="app-name">鹤梦之家</h1>
      <p class="app-slogan">让每一次巡检都更智能、更高效</p>
    </main>

    <div class="about-bottom">
      <span class="app-version">版本 1.0.0</span>
      <a class="app-site" :href="officialSite" target="_blank" rel="noopener">{{ officialSite }}</a>
      <footer class="about-footer">© 2017-2026 Hemeng Technology Co., Ltd. All rights reserved.</footer>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const officialSite = 'https://www.grushome.com/'

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.about-page {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: calc(var(--prototype-safe-top) + 8px) 24px calc(20px + var(--prototype-safe-bottom));
  background:
    radial-gradient(64% 36% at 50% 32%, rgba(91, 168, 255, 0.16) 0%, rgba(91, 168, 255, 0) 72%),
    linear-gradient(180deg, #f8fbff 0%, #eff5fd 100%);
}

.back-entry {
  position: absolute;
  top: calc(var(--prototype-safe-top) + 4px);
  left: 14px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #1b2430;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.back-entry:active {
  background: rgba(27, 36, 48, 0.06);
}

.about-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding-top: 92px;
}

.app-icon {
  display: block;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  box-shadow: 0 20px 44px rgba(31, 116, 239, 0.26);
}

.app-name {
  margin: 24px 0 0;
  font-size: 22px;
  line-height: 1.3;
  font-weight: 600;
  color: #1b2430;
  letter-spacing: 0.08em;
}

.app-slogan {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #6d7b8d;
  letter-spacing: 0.02em;
}

.app-version {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #6f7b8b;
}

.about-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.app-site {
  padding-bottom: 2px;
  font-size: 12.5px;
  color: #3b82f6;
  text-decoration: none;
}

.app-site:active {
  opacity: 0.6;
}

.about-footer {
  margin: 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: #98a5b6;
}
</style>
