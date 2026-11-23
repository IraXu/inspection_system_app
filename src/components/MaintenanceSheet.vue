<template>
  <transition name="sheet">
    <div v-if="visible" class="maintenance-layer" @click.self="close">
      <div class="maintenance-sheet">
        <span class="maintenance-handle"></span>

        <div class="maintenance-head">
          <div class="maintenance-heading">
            <h3 class="maintenance-title">{{ title }}</h3>
            <p v-if="subtitle" class="maintenance-sub">{{ subtitle }}</p>
          </div>
          <button type="button" class="maintenance-close" aria-label="关闭" @click="close">
            <t-icon name="close" size="18" />
          </button>
        </div>

        <div class="maintenance-list">
          <button
            v-for="item in items"
            :key="item.key"
            type="button"
            class="maintenance-item"
            @click="selectItem(item)"
          >
            <span class="maintenance-icon" :class="`is-${item.tone}`">
              <t-icon :name="item.icon" />
            </span>
            <span class="maintenance-copy">
              <span class="maintenance-item-title">{{ item.title }}</span>
              <span class="maintenance-item-desc">{{ item.desc }}</span>
            </span>
            <t-icon name="chevron-right" size="18" class="maintenance-arrow" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '维护管理' },
  subtitle: { type: String, default: '' },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'select'])

const close = () => {
  emit('update:visible', false)
}

const selectItem = (item) => {
  emit('update:visible', false)
  emit('select', item)
}
</script>

<style scoped>
.maintenance-layer {
  position: fixed;
  inset: 0;
  z-index: 1700;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:global(body.prototype-preview-canvas) .maintenance-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.maintenance-sheet {
  width: 100%;
  padding: 10px 20px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
}

.maintenance-handle {
  display: block;
  width: 42px;
  height: 5px;
  margin: 0 auto 26px;
  border-radius: 999px;
  background: #e5e5e8;
}

.maintenance-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px 14px;
}

.maintenance-heading {
  min-width: 0;
}

.maintenance-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.maintenance-sub {
  margin: 5px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #92959f;
}

.maintenance-close {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #f3f4f8;
  color: #7d818d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.maintenance-list {
  display: grid;
  gap: 8px;
}

.maintenance-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border: 1px solid #eef0f5;
  border-radius: 14px;
  background: #f8f9fc;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.maintenance-item:active {
  background: #f1f4fa;
  border-color: #e3e8f2;
}

.maintenance-icon {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.maintenance-icon.is-indigo {
  background: #eaf1ff;
  color: #4a6cf0;
}

.maintenance-icon.is-mint {
  background: #e2f8ee;
  color: #2fb695;
}

.maintenance-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.maintenance-item-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  color: #23242b;
}

.maintenance-item-desc {
  font-size: 12px;
  line-height: 1.4;
  color: #8b92a4;
}

.maintenance-arrow {
  flex: 0 0 auto;
  color: #b3b6c1;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.26s ease;
}

.sheet-enter-active .maintenance-sheet,
.sheet-leave-active .maintenance-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .maintenance-sheet,
.sheet-leave-to .maintenance-sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
