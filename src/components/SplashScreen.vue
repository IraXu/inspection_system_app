<template>
  <div class="splash-screen" role="status" aria-label="鹤梦之家正在启动">
    <span class="splash-orb splash-orb--blue" aria-hidden="true"></span>
    <span class="splash-orb splash-orb--teal" aria-hidden="true"></span>
    <span class="splash-grid" aria-hidden="true"></span>

    <div class="splash-main">
      <div class="splash-logo-stage">
        <span class="splash-ring splash-ring--outer" aria-hidden="true"></span>
        <span class="splash-ring splash-ring--inner" aria-hidden="true"></span>
        <div class="splash-logo">
          <AppLogoMark :size="52" />
        </div>
      </div>

      <h1 class="splash-title">鹤梦之家</h1>
      <p class="splash-slogan">让每一次巡检都更智能、更高效</p>
    </div>

    <div class="splash-footer">
      <div class="splash-loader" aria-hidden="true"><span></span></div>
      <p class="splash-company">
        <svg class="splash-brand-icon" viewBox="0 0 2284 2688" aria-hidden="true">
          <path
            fill="currentColor"
            d="M2214 1414 1852 1793 1954 2026 2283 1697Z M2130 1014 1698 1455 1813 1697 2199 1303Z M1313 0 0 1343 1313 2687 1896 2089 1588 1423 2105 895 2021 530 797 1794 1211 2454 173 1383 510 1381 748 1735 935 1544 658 1119 360 1117 1312 129 1817 645 1881 582Z"
          />
        </svg>
        <span>鹤梦云生态软件</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import AppLogoMark from './AppLogoMark.vue'
</script>

<style scoped>
.splash-screen {
  position: absolute;
  inset: 0;
  /* 高于 Tabbar(60)：淡出过程中不会让 Tabbar 压在过渡页上方 */
  z-index: 70;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(120% 62% at 84% 6%, rgba(88, 166, 255, 0.22) 0%, rgba(88, 166, 255, 0) 62%),
    radial-gradient(110% 58% at 4% 98%, rgba(86, 206, 186, 0.16) 0%, rgba(86, 206, 186, 0) 60%),
    linear-gradient(170deg, #eef5ff 0%, #f9fcff 46%, #e8f2ff 100%);
  color: #1b2430;
}

.splash-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.splash-orb--blue {
  top: -110px;
  right: -96px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.32) 0%, rgba(88, 166, 255, 0) 68%);
}

.splash-orb--teal {
  bottom: -120px;
  left: -104px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(86, 206, 186, 0.24) 0%, rgba(86, 206, 186, 0) 68%);
}

.splash-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(61, 78, 245, 0.08) 1px, transparent 1px);
  background-size: 18px 18px;
  opacity: 0.45;
  -webkit-mask-image: radial-gradient(circle at 50% 36%, #000 0%, transparent 68%);
  mask-image: radial-gradient(circle at 50% 36%, #000 0%, transparent 68%);
  pointer-events: none;
}

.splash-main {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 42px;
}

.splash-logo-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
}

.splash-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(61, 78, 245, 0.14);
  animation: splash-ring-pulse 3.6s ease-out infinite;
}

.splash-ring--outer {
  width: 142px;
  height: 142px;
  border-color: rgba(61, 78, 245, 0.09);
  animation-delay: 0.6s;
}

.splash-ring--inner {
  width: 120px;
  height: 120px;
}

.splash-logo {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 26px;
  background: linear-gradient(145deg, #5aa9ff 0%, #2f86f9 55%, #1c70ee 100%);
  color: #ffffff;
  box-shadow:
    0 18px 38px rgba(28, 112, 238, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  animation: splash-float 3.2s ease-in-out infinite;
}

.splash-title {
  margin: 26px 0 0;
  font-size: 23px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #16203a;
}

.splash-slogan {
  margin: 9px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.02em;
  color: #6f7d92;
}

.splash-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(34px + env(safe-area-inset-bottom, 0px));
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.splash-loader {
  width: 104px;
  height: 4px;
  border-radius: 999px;
  background: rgba(61, 78, 245, 0.15);
  overflow: hidden;
}

.splash-loader span {
  display: block;
  width: 42%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(61, 78, 245, 0) 0%, #4a7dff 45%, #2f62f5 100%);
  animation: splash-loading 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.splash-company {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: #8d99ab;
}

.splash-brand-icon {
  flex-shrink: 0;
  width: 13.6px;
  height: 16px;
  color: #5c697c;
}

@keyframes splash-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

@keyframes splash-ring-pulse {
  0% {
    transform: scale(0.94);
    opacity: 0.7;
  }

  75%,
  100% {
    transform: scale(1.08);
    opacity: 0;
  }
}

@keyframes splash-loading {
  0% {
    transform: translateX(-120%);
  }

  60% {
    transform: translateX(150%);
  }

  100% {
    transform: translateX(260%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-logo,
  .splash-ring,
  .splash-loader span {
    animation: none;
  }
}
</style>
