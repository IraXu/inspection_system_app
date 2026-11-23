<template>
  <transition name="sheet">
    <div v-if="visible" class="option-layer" @click.self="close">
      <div class="option-sheet">
        <span class="option-handle"></span>

        <div class="option-head">
          <h3 class="option-title">{{ title }}</h3>
          <button v-if="multiple" type="button" class="option-clear" @click="clearDraft">清空</button>
        </div>

        <div class="option-list">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="option-item"
            :class="{ 'is-active': isSelected(option.value) }"
            @click="selectOption(option.value)"
          >
            <span class="option-copy">
              <span class="option-label">{{ option.label }}</span>
              <span v-if="option.desc" class="option-desc">{{ option.desc }}</span>
            </span>
            <t-icon v-if="isSelected(option.value)" name="check" size="20" class="option-check" />
          </button>

          <p v-if="!options.length" class="option-empty">暂无可选项</p>
        </div>

        <div class="option-actions">
          <button type="button" class="option-btn option-btn--ghost" @click="close">取消</button>
          <button v-if="multiple" type="button" class="option-btn option-btn--primary" @click="confirmDraft">
            确定{{ draft.length ? `（${draft.length}）` : '' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '请选择' },
  options: { type: Array, default: () => [] },
  modelValue: { type: [Array, String], default: '' },
  multiple: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'update:modelValue'])

const draft = ref([])

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    draft.value = props.multiple ? [...(props.modelValue || [])] : []
  }
)

const isSelected = (value) => {
  if (props.multiple) return draft.value.includes(value)
  return props.modelValue === value
}

const close = () => {
  emit('update:visible', false)
}

const selectOption = (value) => {
  if (props.multiple) {
    draft.value = draft.value.includes(value)
      ? draft.value.filter((item) => item !== value)
      : [...draft.value, value]
    return
  }

  emit('update:modelValue', value)
  close()
}

const clearDraft = () => {
  draft.value = []
}

const confirmDraft = () => {
  emit('update:modelValue', [...draft.value])
  close()
}
</script>

<style scoped>
.option-layer {
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

/* 画布模式下把弹层限制在预览画布内 */
:global(body.prototype-preview-canvas) .option-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.option-sheet {
  width: 100%;
  max-height: 78%;
  display: flex;
  flex-direction: column;
  padding: 10px 18px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
}

.option-handle {
  width: 42px;
  height: 5px;
  flex: 0 0 auto;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #e5e5e8;
}

.option-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px 12px;
}

.option-title {
  min-width: 0;
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.option-clear {
  flex: 0 0 auto;
  border: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f3f4f8;
  color: #6b6e7a;
  font-size: 12.5px;
  font-weight: 600;
}

.option-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding: 2px;
  scrollbar-width: none;
}

.option-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.option-item {
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

.option-item.is-active {
  background: #eaf1ff;
  border-color: rgba(61, 108, 245, 0.32);
}

.option-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.option-label {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  color: #23242b;
}

.option-item.is-active .option-label {
  color: #2f5fe0;
}

.option-desc {
  font-size: 12px;
  line-height: 1.4;
  color: #9497a2;
}

.option-check {
  flex: 0 0 auto;
  color: #3d6cf5;
}

.option-empty {
  padding: 28px 0;
  text-align: center;
  font-size: 13.5px;
  color: #9a9da8;
}

.option-actions {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 14px;
}

.option-btn {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.option-btn--ghost {
  background: #ececee;
  color: #16171d;
}

.option-btn--primary {
  background: #2f7dfa;
  color: #fff;
}

.option-btn--primary:active {
  background: #1f6ceb;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.26s ease;
}

.sheet-enter-active .option-sheet,
.sheet-leave-active .option-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .option-sheet,
.sheet-leave-to .option-sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
