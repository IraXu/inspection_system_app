<template>
  <div v-if="visible" class="photo-viewer" @click="close">
    <img :src="url" class="photo-viewer-image" alt="" @click.stop />
    <button type="button" class="photo-viewer-close" @click.stop="close">
      <t-icon name="close" />
    </button>
    <div v-if="caption" class="photo-viewer-caption">{{ caption }}</div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  url: { type: String, default: '' },
  caption: { type: String, default: '' }
})

const emit = defineEmits(['update:visible'])

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.photo-viewer {
  position: fixed;
  inset: 0;
  z-index: 1900;
  background: rgba(9, 16, 28, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* 画布模式（无手机壳）下 fixed 相对视口，需要对齐到画布区域 */
:global(body.prototype-preview-canvas .photo-viewer) {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.photo-viewer-image {
  width: 100%;
  max-height: 72%;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.42);
}

.photo-viewer-close {
  position: absolute;
  top: calc(var(--prototype-safe-top) + 6px);
  right: 18px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.photo-viewer-caption {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: calc(var(--prototype-safe-bottom) + 20px);
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.5;
}
</style>
