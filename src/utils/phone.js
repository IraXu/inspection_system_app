import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../data/country-codes'

// 选择过的区号在一段时间内沿用，避免每次登录/注册都要重新选
const STORAGE_KEY = 'inspection-auth-country-code'
const DEFAULT_MAX_DIGITS = 14

export const findCountry = (code) => {
  return COUNTRY_CODES.find((item) => item.code === code) || COUNTRY_CODES[0]
}

export const getSavedCountryCode = () => {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  const matched = COUNTRY_CODES.some((item) => item.code === saved)
  return matched ? saved : DEFAULT_COUNTRY_CODE
}

export const saveCountryCode = (code) => {
  window.localStorage.setItem(STORAGE_KEY, code)
}

// 只保留数字，并按所选区号的号码长度截断
export const normalizePhone = (value, country) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.slice(0, country?.digits || DEFAULT_MAX_DIGITS)
}

// 返回空字符串表示校验通过
export const validatePhone = (country, value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return '请输入手机号'

  const target = country || findCountry(DEFAULT_COUNTRY_CODE)
  if (target.code === 'CN') {
    return /^1\d{10}$/.test(digits) ? '' : '请输入 11 位中国大陆手机号'
  }

  if (target.digits) {
    return digits.length === target.digits ? '' : `请输入 ${target.digits} 位手机号`
  }

  return digits.length >= 6 ? '' : '请输入正确的手机号'
}
