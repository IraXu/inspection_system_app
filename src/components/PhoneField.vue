<template>
  <AuthField
    v-model="phoneValue"
    :placeholder="placeholder"
    type="tel"
    inputmode="tel"
    :maxlength="maxLength"
    clearable
  >
    <template #prefix>
      <button
        type="button"
        class="phone-code"
        aria-haspopup="dialog"
        aria-label="选择国际区号"
        @click="sheetVisible = true"
      >
        <span class="phone-code-dial">+{{ selectedCountry.dial }}</span>
        <t-icon name="chevron-down" class="phone-code-caret" />
      </button>
    </template>
  </AuthField>

  <OptionSheet
    v-model:visible="sheetVisible"
    title="选择国家和地区"
    searchable
    search-placeholder="搜索国家/地区或区号"
    :options="countryOptions"
    :model-value="country"
    @update:model-value="selectCountry"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import AuthField from './AuthField.vue'
import OptionSheet from './OptionSheet.vue'
import { COUNTRY_CODES } from '../data/country-codes'
import { findCountry, normalizePhone, saveCountryCode } from '../utils/phone'

const props = defineProps({
  modelValue: { type: String, default: '' },
  country: { type: String, default: 'CN' },
  placeholder: { type: String, default: '请输入手机号' }
})

const emit = defineEmits(['update:modelValue', 'update:country'])

const sheetVisible = ref(false)

const countryOptions = COUNTRY_CODES.map((item) => ({
  value: item.code,
  label: item.name,
  desc: `+${item.dial}`
}))

const selectedCountry = computed(() => findCountry(props.country))
const maxLength = computed(() => selectedCountry.value.digits || 14)

const phoneValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', normalizePhone(value, selectedCountry.value))
})

const selectCountry = (code) => {
  const next = findCountry(code)
  emit('update:country', next.code)
  saveCountryCode(next.code)
  // 切换区号后按新号码长度重新截断，避免残留超长号码
  emit('update:modelValue', normalizePhone(props.modelValue, next))
}
</script>
