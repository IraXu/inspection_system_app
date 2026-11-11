<template>
  <div class="auth-field" :class="{ 'is-focused': focused }" @click="focusInput">
    <t-icon :name="icon" class="auth-field-icon" />
    <input
      ref="inputRef"
      class="auth-field-input"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <button
      v-if="clearable && modelValue"
      type="button"
      class="auth-field-clear"
      aria-label="清空"
      @click.prevent="clear"
    >
      <t-icon name="close-circle-filled" />
    </button>
    <button
      v-if="revealable"
      type="button"
      class="auth-field-eye"
      :aria-label="visible ? '隐藏密码' : '显示密码'"
      @click.prevent="visible = !visible"
    >
      <t-icon :name="visible ? 'browse-off' : 'browse'" />
    </button>
    <slot name="suffix"></slot>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  icon: { type: String, default: 'user' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  inputmode: { type: String, default: undefined },
  maxlength: { type: Number, default: undefined },
  autocomplete: { type: String, default: 'off' },
  clearable: { type: Boolean, default: false },
  revealable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const focused = ref(false)
const visible = ref(false)

const inputType = computed(() => {
  if (props.revealable) return visible.value ? 'text' : 'password'
  return props.type
})

const clear = () => {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

const focusInput = (event) => {
  if (event.target.closest('button')) return
  inputRef.value?.focus()
}
</script>
