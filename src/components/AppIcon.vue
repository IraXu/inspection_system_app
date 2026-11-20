<template>
  <svg
    class="t-icon"
    :class="[`t-icon-${name}`, sizeClass]"
    :style="sizeStyle"
    aria-hidden="true"
    focusable="false"
  >
    <use :href="`#t-icon-${name}`" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: [String, Number], default: undefined }
})

// 与 TDesign Icon 的尺寸规则保持一致：small/medium/large 走类名，其余走 fontSize
const SIZE_CLASS = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l'
}

const sizeClass = computed(() => SIZE_CLASS[props.size] || '')

const sizeStyle = computed(() => {
  if (props.size === undefined || SIZE_CLASS[props.size]) return {}
  return { fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size }
})
</script>
