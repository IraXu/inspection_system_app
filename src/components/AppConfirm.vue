<template>
  <transition name="confirm">
    <div v-if="visible" class="confirm-layer" @click.self="cancel">
      <div class="confirm-dialog">
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-content">{{ content }}</p>
        <div class="confirm-actions">
          <button type="button" class="confirm-btn confirm-btn--ghost" @click="cancel">
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="confirm-btn confirm-btn--primary"
            :class="{ 'is-danger': danger }"
            @click="confirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '提示' },
  content: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const cancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const confirm = () => {
  emit('update:visible', false)
  emit('confirm')
}
</script>

<style scoped>
.confirm-layer {
  position: fixed;
  inset: 0;
  z-index: 1650;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:global(body.prototype-preview-canvas) .confirm-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.confirm-dialog {
  width: 100%;
  max-width: 312px;
  padding: 24px 20px 18px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 24px 48px rgba(30, 40, 80, 0.16);
  text-align: center;
}

.confirm-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.confirm-content {
  margin: 12px 0 0;
  font-size: 14.5px;
  line-height: 1.55;
  color: #4a4c56;
}

.confirm-actions {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-btn {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.confirm-btn--ghost {
  background: #ececee;
  color: #16171d;
}

.confirm-btn--primary {
  background: #2f7dfa;
  color: #fff;
}

.confirm-btn--primary.is-danger {
  background: #f0443f;
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
  transition: transform 0.22s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

.confirm-enter-from .confirm-dialog,
.confirm-leave-to .confirm-dialog {
  transform: scale(0.94);
}
</style>
