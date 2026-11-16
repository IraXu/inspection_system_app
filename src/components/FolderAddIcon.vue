<template>
  <svg
    class="folder-add-icon"
    :width="size"
    :height="size"
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="folderTabFill" x1="36" y1="18" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#6ba2ff" />
        <stop offset="0.42" stop-color="#2b73ff" />
        <stop offset="1" stop-color="#0b4fe8" />
      </linearGradient>
      <linearGradient id="folderGlassFill" x1="24" y1="26" x2="50" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.92" />
        <stop offset="0.42" stop-color="#f7fbff" stop-opacity="0.86" />
        <stop offset="1" stop-color="#d9e7ff" stop-opacity="0.94" />
      </linearGradient>
      <linearGradient id="folderBleedFill" x1="36" y1="27" x2="36" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3b7dff" stop-opacity="0.45" />
        <stop offset="0.5" stop-color="#8fb6ff" stop-opacity="0.18" />
        <stop offset="1" stop-color="#d6e3ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="folderPlusFill" x1="36" y1="38" x2="36" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3f86ff" />
        <stop offset="1" stop-color="#0a58ef" />
      </linearGradient>
      <filter id="folderSoftShadow" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="2.4" stdDeviation="3" flood-color="#2f62d8" flood-opacity="0.22" />
      </filter>
      <filter id="folderBleedBlur" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <clipPath id="folderFrontClip">
        <path
          d="M18 27.5c7.2 0 11 2.8 18 2.8s10.8-2.8 18-2.8c5 0 9 3.6 9 9v20.7c0 5.4-4 9-9 9H18c-5 0-9-3.6-9-9V36.5c0-5.4 4-9 9-9Z"
        />
      </clipPath>
    </defs>

    <!-- 后层蓝色背板（只露出一条窄边） -->
    <rect x="20" y="18" width="32" height="18" rx="6.5" fill="url(#folderTabFill)" />

    <!-- 磨砂玻璃前板 -->
    <g filter="url(#folderSoftShadow)">
      <path
        d="M18 27.5c7.2 0 11 2.8 18 2.8s10.8-2.8 18-2.8c5 0 9 3.6 9 9v20.7c0 5.4-4 9-9 9H18c-5 0-9-3.6-9-9V36.5c0-5.4 4-9 9-9Z"
        fill="url(#folderGlassFill)"
      />
      <!-- 背板透过磨砂玻璃的蓝色晕染 -->
      <g clip-path="url(#folderFrontClip)">
        <rect
          x="19"
          y="27"
          width="34"
          height="14"
          rx="7"
          fill="url(#folderBleedFill)"
          filter="url(#folderBleedBlur)"
        />
      </g>
      <!-- 顶部磨砂高光接缝 -->
      <path
        d="M18 27.5c7.2 0 11 2.8 18 2.8s10.8-2.8 18-2.8"
        stroke="#ffffff"
        stroke-opacity="0.9"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        d="M18 27.5c7.2 0 11 2.8 18 2.8s10.8-2.8 18-2.8c5 0 9 3.6 9 9v20.7c0 5.4-4 9-9 9H18c-5 0-9-3.6-9-9V36.5c0-5.4 4-9 9-9Z"
        stroke="#ffffff"
        stroke-opacity="0.85"
        stroke-width="1.6"
      />
    </g>

    <!-- 加号 -->
    <path d="M36 38.5v17" stroke="url(#folderPlusFill)" stroke-width="5.2" stroke-linecap="round" />
    <path d="M27.5 47h17" stroke="url(#folderPlusFill)" stroke-width="5.2" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 56 }
})
</script>

<style scoped>
.folder-add-icon {
  display: block;
}
</style>
