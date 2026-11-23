<template>
  <transition name="sheet">
    <div v-if="visible" class="option-layer" @click.self="close">
      <div class="option-sheet">
        <span class="option-handle"></span>

        <div class="option-head">
          <h3 class="option-title">{{ title }}</h3>
          <button type="button" class="option-close" aria-label="关闭" @click="close">
            <t-icon name="close" size="17" />
          </button>
        </div>

        <div v-if="searchable" class="option-search">
          <t-icon name="search" size="16" class="option-search-icon" />
          <input
            v-model="keyword"
            class="option-search-input"
            type="text"
            :placeholder="searchPlaceholder"
          />
          <button v-if="keyword" type="button" class="option-search-clear" aria-label="清空搜索" @click="keyword = ''">
            <t-icon name="close-circle-filled" size="16" />
          </button>
        </div>

        <div v-if="multiple && draft.length" class="option-selected">
          <div class="option-selected-head">
            <span class="option-selected-label">已选 {{ draft.length }} 项</span>
            <button type="button" class="option-selected-clear" @click="clearDraft">清空</button>
          </div>
          <div class="option-chips">
            <button
              v-for="item in draftLabels"
              :key="item.value"
              type="button"
              class="option-chip"
              @click="removeDraft(item.value)"
            >
              {{ item.label }}
              <t-icon name="close" size="11" />
            </button>
          </div>
        </div>

        <div class="option-list">
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            class="option-item"
            :class="{ 'is-active': isSelected(option.value) }"
            @click="selectOption(option.value)"
          >
            <span v-if="option.avatar" class="option-avatar">{{ option.avatar }}</span>
            <span class="option-copy">
              <span class="option-label">{{ option.label }}</span>
              <span v-if="option.desc" class="option-desc">{{ option.desc }}</span>
            </span>
            <span class="option-mark" :class="{ 'is-checked': isSelected(option.value) }">
              <t-icon v-if="isSelected(option.value)" name="check" size="13" />
            </span>
          </button>

          <p v-if="!filteredOptions.length" class="option-empty">
            {{ keyword ? '未找到相关结果' : '暂无可选项' }}
          </p>
        </div>

        <div v-if="multiple" class="option-actions">
          <button type="button" class="option-btn option-btn--primary" @click="confirmDraft">
            确定{{ draft.length ? `（${draft.length}）` : '' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '请选择' },
  options: { type: Array, default: () => [] },
  modelValue: { type: [Array, String], default: '' },
  multiple: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: '搜索' }
})

const emit = defineEmits(['update:visible', 'update:modelValue'])

const draft = ref([])
const keyword = ref('')

const filteredOptions = computed(() => {
  const text = keyword.value.trim()
  if (!text) return props.options
  return props.options.filter((option) => `${option.label}${option.desc || ''}`.includes(text))
})

const draftLabels = computed(() =>
  draft.value.map((value) => {
    const option = props.options.find((item) => item.value === value)
    return { value, label: option?.label || value }
  })
)

const removeDraft = (value) => {
  draft.value = draft.value.filter((item) => item !== value)
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    keyword.value = ''
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

.option-close {
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

.option-search {
  flex: 0 0 auto;
  height: 42px;
  margin-bottom: 10px;
  padding: 0 12px;
  border-radius: 12px;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-search-icon {
  flex: 0 0 auto;
  color: #9aa0ae;
}

.option-search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #23242b;
  outline: none;
}

.option-search-input::placeholder {
  color: #adb1bd;
}

.option-search-clear {
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b6bac4;
  display: inline-flex;
  align-items: center;
}

.option-selected {
  flex: 0 0 auto;
  padding: 0 2px 10px;
}

.option-selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.option-selected-label {
  font-size: 12px;
  font-weight: 600;
  color: #8b92a4;
}

.option-selected-clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: #4a6cf0;
  font-size: 12px;
  font-weight: 600;
}

.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px 5px 10px;
  border: 0;
  border-radius: 999px;
  background: #eef3ff;
  color: #3f55f0;
  font-size: 12.5px;
  font-weight: 600;
}

.option-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 2px;
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
  gap: 10px;
  padding: 11px 8px;
  border: 0;
  border-bottom: 1px solid #f1f3f9;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  transition: background 0.18s ease;
}

.option-item:last-of-type {
  border-bottom: 0;
}

.option-item.is-active {
  background: #f5f8ff;
}

.option-avatar {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(145deg, #eaf0ff 0%, #dfe8ff 100%);
  color: #3d6cf5;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.option-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.option-label {
  font-size: 14.5px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-mark {
  flex: 0 0 21px;
  width: 21px;
  height: 21px;
  border: 1.5px solid #d5d9e4;
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.option-mark.is-checked {
  border-color: #3d6cf5;
  background: #3d6cf5;
}

.option-empty {
  padding: 28px 0;
  text-align: center;
  font-size: 13.5px;
  color: #9a9da8;
}

.option-actions {
  flex: 0 0 auto;
  padding-top: 14px;
}

.option-btn {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 27px;
  font-size: 16.5px;
  font-weight: 600;
}

.option-btn--primary {
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(74, 92, 255, 0.22);
}

.option-btn--primary:active {
  background: linear-gradient(135deg, #4d5ef0 0%, #3848e6 100%);
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
