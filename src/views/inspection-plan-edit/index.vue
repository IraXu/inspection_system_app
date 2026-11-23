<template>
  <div class="plan-edit-page app-page">
    <header class="edit-top">
      <button type="button" class="edit-back" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" size="20" />
      </button>
      <div class="edit-top-copy">
        <span class="edit-kicker">巡检管理</span>
        <h1 class="edit-title">{{ isEdit ? '编辑巡检计划' : '新增巡检计划' }}</h1>
      </div>
    </header>

    <div class="app-section edit-intro">
      <div class="intro-card">
        <span class="intro-icon"><t-icon name="calendar" size="18" /></span>
        <p>计划保存后，系统会按执行设置自动生成巡检任务并推送给巡检人。</p>
      </div>
    </div>

    <section class="app-section form-section">
      <div class="form-card">
        <div class="form-card-head">
          <span class="step-badge">1</span>
          <h2 class="form-card-title">基础信息</h2>
        </div>

        <label class="field">
          <span class="field-label">计划名称<em>*</em></span>
          <input v-model="form.name" class="field-input" maxlength="40" placeholder="请输入计划名称" />
        </label>

        <div class="field">
          <span class="field-label">巡检方式<em>*</em></span>
          <div class="segmented">
            <button
              type="button"
              class="segmented-item"
              :class="{ 'is-active': form.mode === 'online' }"
              @click="form.mode = 'online'"
            >
              在线巡检
            </button>
            <button
              type="button"
              class="segmented-item"
              :class="{ 'is-active': form.mode === 'offline' }"
              @click="form.mode = 'offline'"
            >
              线下巡检
            </button>
          </div>
        </div>

        <label class="field">
          <span class="field-label">计划说明</span>
          <textarea
            v-model="form.description"
            class="field-textarea"
            rows="3"
            maxlength="120"
            placeholder="请输入计划说明（选填）"
          ></textarea>
        </label>
      </div>
    </section>

    <section class="app-section form-section">
      <div class="form-card">
        <div class="form-card-head">
          <span class="step-badge">2</span>
          <h2 class="form-card-title">执行设置</h2>
        </div>

        <div class="field">
          <span class="field-label">循环方式<em>*</em></span>
          <div class="segmented">
            <button
              type="button"
              class="segmented-item"
              :class="{ 'is-active': form.cycleMode === 'once' }"
              @click="form.cycleMode = 'once'"
            >
              单次任务
            </button>
            <button
              type="button"
              class="segmented-item"
              :class="{ 'is-active': form.cycleMode === 'cycle' }"
              @click="form.cycleMode = 'cycle'"
            >
              循环任务
            </button>
          </div>
        </div>

        <template v-if="form.cycleMode === 'once'">
          <div class="field">
            <span class="field-label">任务生成时间<em>*</em></span>
            <div class="inline-fields">
              <button
                type="button"
                class="value-field"
                :class="{ 'is-empty': !form.onceDate }"
                @click="openDateSheet('onceDate')"
              >
                <t-icon name="calendar" size="15" class="value-icon" />
                <span class="value-text">{{ form.onceDate ? formatDateText(form.onceDate) : '选择日期' }}</span>
              </button>
              <button
                type="button"
                class="value-field"
                :class="{ 'is-empty': !form.onceTime }"
                @click="openTimeSheet('onceTime')"
              >
                <t-icon name="time" size="15" class="value-icon" />
                <span class="value-text">{{ form.onceTime || '选择时间' }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <span class="field-label">执行时限<em>*</em></span>
            <div class="suffix-field">
              <input v-model="form.onceDuration" class="field-input" type="number" min="1" max="720" placeholder="小时数" />
              <span class="suffix-text">小时</span>
            </div>
            <p class="field-hint">任务截止时间 = 生成时间 + 执行时限，巡检人需在截止时间前完成</p>
          </div>
        </template>

        <template v-else>
          <div class="field">
            <span class="field-label">生成频率<em>*</em></span>
            <div class="segmented segmented--three">
              <button
                v-for="option in cycleTypeOptions"
                :key="option.value"
                type="button"
                class="segmented-item"
                :class="{ 'is-active': form.cycleType === option.value }"
                @click="form.cycleType = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="form.cycleType === 'weekly'" class="field">
            <span class="field-label">执行日<em>*</em></span>
            <div class="day-grid">
              <button
                v-for="day in weekOptions"
                :key="day.value"
                type="button"
                class="day-chip"
                :class="{ 'is-active': form.cycleWeekDays.includes(day.value) }"
                @click="toggleWeekDay(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
          </div>

          <div v-if="form.cycleType === 'monthly'" class="field">
            <span class="field-label">执行日<em>*</em></span>
            <div class="month-grid">
              <button
                v-for="day in 31"
                :key="day"
                type="button"
                class="month-chip"
                :class="{ 'is-active': form.cycleMonthDays.includes(day) }"
                @click="toggleMonthDay(day)"
              >
                {{ day }}
              </button>
            </div>
          </div>

          <div class="field">
            <span class="field-label">具体时间<em>*</em></span>
            <button
              type="button"
              class="value-field"
              :class="{ 'is-empty': !form.cycleTime }"
              @click="openTimeSheet('cycleTime')"
            >
              <t-icon name="time" size="16" class="value-icon" />
              <span class="value-text">{{ form.cycleTime || '选择具体时间' }}</span>
              <t-icon name="chevron-down" size="14" class="value-arrow" />
            </button>
          </div>

          <div class="field">
            <span class="field-label">计划周期<em>*</em></span>
            <div class="inline-fields inline-fields--range">
              <button
                type="button"
                class="value-field"
                :class="{ 'is-empty': !form.validFrom }"
                @click="openDateSheet('validFrom')"
              >
                <t-icon name="calendar" size="15" class="value-icon" />
                <span class="value-text">{{ form.validFrom ? formatDateText(form.validFrom) : '开始日期' }}</span>
              </button>
              <span class="range-sep">至</span>
              <button
                type="button"
                class="value-field"
                :class="{ 'is-empty': !form.validUntil }"
                @click="openDateSheet('validUntil')"
              >
                <t-icon name="calendar" size="15" class="value-icon" />
                <span class="value-text">{{ form.validUntil ? formatDateText(form.validUntil) : '结束日期' }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <span class="field-label">执行时限<em>*</em></span>
            <div class="suffix-field">
              <input
                v-model="form.cycleDuration"
                class="field-input"
                type="number"
                min="1"
                max="720"
                placeholder="小时数"
              />
              <span class="suffix-text">小时</span>
            </div>
            <p class="field-hint">每条任务截止时间 = 该期生成时间 + 执行时限</p>
          </div>
        </template>
      </div>
    </section>

    <section class="app-section form-section">
      <div class="form-card">
        <div class="form-card-head">
          <span class="step-badge">3</span>
          <h2 class="form-card-title">巡检门店配置</h2>
        </div>
        <p class="form-desc">每个门店可单独配置巡检人与巡检模板，支持添加多条配置。</p>

        <div class="store-row-list">
          <div v-for="(row, index) in form.storeRows" :key="row.key" class="store-row">
            <div class="store-row-head">
              <span class="store-row-title">配置 {{ index + 1 }}</span>
              <button type="button" class="store-row-del" aria-label="删除该配置" @click="removeRow(row.key)">
                <t-icon name="delete" size="15" />
              </button>
            </div>

            <button type="button" class="select-field" @click="openStoreSheet(row.key)">
              <span class="select-label">门店<em>*</em></span>
              <span class="select-value" :class="{ 'is-placeholder': !row.storeName }">
                {{ row.storeName || '请选择门店' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>

            <button type="button" class="select-field" @click="openPicker('personnel', row.key)">
              <span class="select-label">巡检人<em>*</em></span>
              <span class="select-value" :class="{ 'is-placeholder': !row.personnelNames.length }">
                {{ row.personnelNames.join('、') || '请选择巡检人' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>

            <button type="button" class="select-field" @click="openPicker('template', row.key)">
              <span class="select-label">巡检模板<em>*</em></span>
              <span class="select-value" :class="{ 'is-placeholder': !row.templateName }">
                {{ row.templateName || '请选择巡检模板' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
          </div>
        </div>

        <button type="button" class="add-row-btn" @click="addRow">
          <t-icon name="add" size="16" />
          添加门店配置
        </button>
      </div>
    </section>

    <section class="app-section form-section">
      <div class="form-card">
        <div class="form-card-head">
          <span class="step-badge">4</span>
          <h2 class="form-card-title">问题流转</h2>
        </div>

        <button type="button" class="select-field" @click="openPicker('assignee')">
          <span class="select-label">问题指派人<em>*</em></span>
          <span class="select-value" :class="{ 'is-placeholder': !form.assigneeNames.length }">
            {{ form.assigneeNames.join('、') || '请选择问题指派人' }}
          </span>
          <t-icon name="chevron-right" size="16" class="select-arrow" />
        </button>
        <p class="field-hint">巡检发现不合格项时，生成的整改工单默认指派给以上人员</p>

        <button type="button" class="select-field" @click="openPicker('reviewer')">
          <span class="select-label">问题审核人<em>*</em></span>
          <span class="select-value" :class="{ 'is-placeholder': !form.reviewerNames.length }">
            {{ form.reviewerNames.join('、') || '请选择问题审核人' }}
          </span>
          <t-icon name="chevron-right" size="16" class="select-arrow" />
        </button>
        <p class="field-hint">整改完成后，问题将指派给以上人员进行审核确认</p>
      </div>
    </section>

    <div class="edit-spacer"></div>

    <div class="form-footer">
      <button type="button" class="footer-btn footer-btn--ghost" @click="goBack">取消</button>
      <button type="button" class="footer-btn footer-btn--primary" @click="handleSave">保存计划</button>
    </div>

    <OptionSheet
      v-model:visible="pickerVisible"
      :title="pickerConfig.title"
      :options="pickerConfig.options"
      :model-value="pickerModel"
      :multiple="pickerConfig.multiple"
      :searchable="pickerConfig.searchable"
      :search-placeholder="pickerConfig.searchPlaceholder || '搜索'"
      @update:model-value="onPickerUpdate"
    />

    <RegionTreeSheet
      v-model:visible="storeSheetVisible"
      title="选择门店"
      description="巡检计划需配置到门店级，区域与厂区仅支持展开查看"
      :tree="planStoreTree"
      :model-value="storeSheetValue"
      unit="家"
      :show-root="false"
      empty-path-label="未选择门店"
      leaf-hint="可配置巡检"
      :selectable-level="3"
      require-selection
      :confirm-label="storeConfirmLabel"
      @confirm="onStoreConfirm"
    />

    <DateTimeWheelSheet
      v-model:visible="dtVisible"
      :mode="dtMode"
      :model-value="dtValue"
      @update:model-value="onDateTimeConfirm"
    />
  </div>
</template>

<script setup>
import { computed, onDeactivated, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useInspectionStore } from '../../stores/inspection'
import { planStoreTree, planPersonnelList, planTemplateList } from '../../data/inspection'
import OptionSheet from '../../components/OptionSheet.vue'
import RegionTreeSheet from '../../components/RegionTreeSheet.vue'
import DateTimeWheelSheet from '../../components/DateTimeWheelSheet.vue'

const route = useRoute()
const router = useRouter()
const store = useInspectionStore()

const isEdit = computed(() => Boolean(route.params.id))
const editingPlan = computed(() => (isEdit.value ? store.getPlan(route.params.id) : null))

const cycleTypeOptions = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' }
]

const weekOptions = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

const createRow = () => ({
  key: `row-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  storeName: '',
  personnelNames: [],
  templateName: ''
})

const form = reactive({
  name: '',
  mode: 'online',
  description: '',
  cycleMode: 'cycle',
  onceDate: '',
  onceTime: '',
  onceDuration: '',
  cycleType: 'daily',
  cycleWeekDays: [],
  cycleMonthDays: [],
  cycleTime: '',
  validFrom: '',
  validUntil: '',
  cycleDuration: '',
  storeRows: [createRow()],
  assigneeNames: [],
  reviewerNames: []
})

const resetForm = () => {
  form.name = ''
  form.mode = 'online'
  form.description = ''
  form.cycleMode = 'cycle'
  form.onceDate = ''
  form.onceTime = ''
  form.onceDuration = ''
  form.cycleType = 'daily'
  form.cycleWeekDays = []
  form.cycleMonthDays = []
  form.cycleTime = ''
  form.validFrom = ''
  form.validUntil = ''
  form.cycleDuration = ''
  form.storeRows = [createRow()]
  form.assigneeNames = []
  form.reviewerNames = []
}

const loadPlan = (plan) => {
  form.name = plan.name
  form.mode = plan.inspectionMode
  form.description = plan.description || ''
  form.cycleMode = plan.cycleMode

  if (plan.cycleMode === 'once') {
    const [date = '', time = ''] = (plan.executionTime || '').split(' ')
    form.onceDate = date
    form.onceTime = time.slice(0, 5)
    form.onceDuration = plan.duration ? String(parseInt(plan.duration, 10) || '') : ''
  } else {
    form.cycleType = plan.cycleType || 'daily'
    form.cycleTime = plan.executionTime || ''
    form.validFrom = plan.validFrom || ''
    form.validUntil = plan.validUntil || ''
    form.cycleWeekDays = plan.cycleType === 'weekly' ? [...(plan.cycleDays || [])] : []
    form.cycleMonthDays = plan.cycleType === 'monthly' ? [...(plan.cycleDays || [])] : []
    form.cycleDuration = plan.duration ? String(parseInt(plan.duration, 10) || '') : ''
  }

  form.storeRows = plan.storesPersonnelTemplates?.length
    ? plan.storesPersonnelTemplates.map((row) => ({
        key: row.key || createRow().key,
        storeName: row.storeName,
        personnelNames: [...(row.personnelNames || [])],
        templateName: row.templateName
      }))
    : [createRow()]

  form.assigneeNames = [...(plan.assigneeNames || [])]
  form.reviewerNames = [...(plan.reviewerNames || [])]
}

watch(
  () => route.fullPath,
  () => {
    resetForm()
    if (!isEdit.value) return
    if (!editingPlan.value) {
      Toast.error('巡检计划不存在')
      router.replace('/inspection/plans')
      return
    }
    loadPlan(editingPlan.value)
  },
  { immediate: true }
)

const goBack = () => {
  router.back()
}

const addRow = () => {
  form.storeRows.push(createRow())
}

const removeRow = (rowKey) => {
  if (form.storeRows.length <= 1) {
    Toast.warning('至少保留一条配置记录')
    return
  }
  form.storeRows = form.storeRows.filter((row) => row.key !== rowKey)
}

const toggleWeekDay = (day) => {
  form.cycleWeekDays = form.cycleWeekDays.includes(day)
    ? form.cycleWeekDays.filter((item) => item !== day)
    : [...form.cycleWeekDays, day].sort((a, b) => a - b)
}

const toggleMonthDay = (day) => {
  form.cycleMonthDays = form.cycleMonthDays.includes(day)
    ? form.cycleMonthDays.filter((item) => item !== day)
    : [...form.cycleMonthDays, day].sort((a, b) => a - b)
}

const pickerVisible = ref(false)
const pickerModel = ref('')
const pickerConfig = ref({ title: '', options: [], multiple: false, kind: '', rowKey: '' })

const storeSheetVisible = ref(false)
const storeSheetRowKey = ref('')

const storeSheetRow = computed(() => form.storeRows.find((row) => row.key === storeSheetRowKey.value) || null)
const storeSheetValue = computed(() => storeSheetRow.value?.storeName || '')

const storeConfirmLabel = (node) => (node ? '确定选择该门店' : '请先选择门店')

const openStoreSheet = (rowKey) => {
  storeSheetRowKey.value = rowKey
  storeSheetVisible.value = true
}

const onStoreConfirm = ({ value }) => {
  if (storeSheetRow.value) storeSheetRow.value.storeName = value
}

const personnelOptions = planPersonnelList.map((item) => ({
  value: item.name,
  label: item.name,
  avatar: item.name.slice(0, 1),
  desc: item.dept
}))

const templateOptions = planTemplateList.map((item) => ({
  value: item.name,
  label: item.name,
  desc: item.desc
}))

const openPicker = (kind, rowKey = '') => {
  const row = rowKey ? form.storeRows.find((item) => item.key === rowKey) : null

  if (kind === 'personnel') {
    pickerConfig.value = {
      title: '选择巡检人',
      options: personnelOptions,
      multiple: true,
      searchable: true,
      searchPlaceholder: '搜索姓名或部门',
      kind,
      rowKey
    }
    pickerModel.value = [...(row?.personnelNames || [])]
  } else if (kind === 'template') {
    pickerConfig.value = {
      title: '选择巡检模板',
      options: templateOptions,
      multiple: false,
      searchable: true,
      searchPlaceholder: '搜索模板名称',
      kind,
      rowKey
    }
    pickerModel.value = row?.templateName || ''
  } else if (kind === 'assignee') {
    pickerConfig.value = {
      title: '选择问题指派人',
      options: personnelOptions,
      multiple: true,
      searchable: true,
      searchPlaceholder: '搜索姓名或部门',
      kind,
      rowKey: ''
    }
    pickerModel.value = [...form.assigneeNames]
  } else if (kind === 'reviewer') {
    pickerConfig.value = {
      title: '选择问题审核人',
      options: personnelOptions,
      multiple: true,
      searchable: true,
      searchPlaceholder: '搜索姓名或部门',
      kind,
      rowKey: ''
    }
    pickerModel.value = [...form.reviewerNames]
  }

  pickerVisible.value = true
}

const onPickerUpdate = (value) => {
  pickerModel.value = value
  const { kind, rowKey } = pickerConfig.value

  if (kind === 'assignee') {
    form.assigneeNames = Array.isArray(value) ? value : []
    return
  }
  if (kind === 'reviewer') {
    form.reviewerNames = Array.isArray(value) ? value : []
    return
  }

  const row = form.storeRows.find((item) => item.key === rowKey)
  if (!row) return

  if (kind === 'store') row.storeName = value
  if (kind === 'personnel') row.personnelNames = Array.isArray(value) ? value : []
  if (kind === 'template') row.templateName = value
}

const dtVisible = ref(false)
const dtMode = ref('date')
const dtTarget = ref('')
const dtValue = ref('')

const formatDateText = (value) => {
  const [year, month, day] = String(value).split('-')
  if (!year || !month || !day) return value
  return `${Number(month)}月${Number(day)}日`
}

const openDateSheet = (field) => {
  dtMode.value = 'date'
  dtTarget.value = field
  dtValue.value = form[field] || ''
  dtVisible.value = true
}

const openTimeSheet = (field) => {
  dtMode.value = 'time'
  dtTarget.value = field
  dtValue.value = form[field] || ''
  dtVisible.value = true
}

const onDateTimeConfirm = (value) => {
  if (!dtTarget.value) return
  form[dtTarget.value] = value
}

const validate = () => {
  if (!form.name.trim()) return '请输入计划名称'
  if (form.storeRows.some((row) => !row.storeName || !row.personnelNames.length || !row.templateName)) {
    return '每条配置的门店、巡检人、巡检模板均为必填'
  }
  if (form.cycleMode === 'once') {
    if (!form.onceDate || !form.onceTime) return '请选择任务生成时间'
    if (!form.onceDuration || Number(form.onceDuration) <= 0) return '请输入有效的执行时限'
  } else {
    if (!form.cycleTime) return '请选择具体时间'
    if (form.cycleType === 'weekly' && !form.cycleWeekDays.length) return '请至少勾选一个执行日'
    if (form.cycleType === 'monthly' && !form.cycleMonthDays.length) return '请至少勾选一个执行日'
    if (!form.validFrom || !form.validUntil) return '请选择计划周期'
    if (!form.cycleDuration || Number(form.cycleDuration) <= 0) return '请输入有效的执行时限'
  }
  if (!form.assigneeNames.length) return '请选择问题指派人'
  if (!form.reviewerNames.length) return '请选择问题审核人'
  return ''
}

const buildPayload = () => {
  const payload = {
    name: form.name.trim(),
    inspectionMode: form.mode,
    description: form.description.trim(),
    cycleMode: form.cycleMode,
    storesPersonnelTemplates: form.storeRows.map((row) => ({
      key: row.key,
      storeName: row.storeName,
      personnelNames: [...row.personnelNames],
      templateName: row.templateName
    })),
    assigneeNames: [...form.assigneeNames],
    reviewerNames: [...form.reviewerNames]
  }

  if (form.cycleMode === 'once') {
    payload.executionTime = `${form.onceDate} ${form.onceTime}`
    payload.duration = `${Number(form.onceDuration)}小时`
    payload.cycleType = ''
    payload.cycleDays = []
    payload.validFrom = ''
    payload.validUntil = ''
  } else {
    payload.cycleType = form.cycleType
    payload.executionTime = form.cycleTime
    payload.validFrom = form.validFrom
    payload.validUntil = form.validUntil
    payload.cycleDays =
      form.cycleType === 'weekly'
        ? [...form.cycleWeekDays]
        : form.cycleType === 'monthly'
          ? [...form.cycleMonthDays]
          : []
    payload.duration = `${Number(form.cycleDuration)}小时`
  }

  return payload
}

const handleSave = () => {
  const error = validate()
  if (error) {
    Toast.warning(error)
    return
  }

  const payload = buildPayload()

  if (isEdit.value && editingPlan.value) {
    store.updatePlan(editingPlan.value.id, payload)
    Toast.success('巡检计划更新成功')
  } else {
    store.createPlan(payload)
    Toast.success('巡检计划创建成功')
  }

  router.back()
}

onDeactivated(() => {
  pickerVisible.value = false
  storeSheetVisible.value = false
  dtVisible.value = false
})
</script>

<style scoped>
.plan-edit-page {
  padding-top: calc(var(--prototype-safe-top) + 8px);
  padding-bottom: calc(104px + var(--prototype-safe-bottom));
  background: linear-gradient(180deg, #f0f3fb 0%, #f7f9fc 30%, #ffffff 70%);
}

.edit-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 var(--prototype-page-padding-x);
}

.edit-back {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  margin-left: -9px;
  border: 0;
  background: transparent;
  color: #1b1d24;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-back:active {
  opacity: 0.55;
}

.edit-top-copy {
  min-width: 0;
}

.edit-kicker {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6c7ba8;
}

.edit-title {
  margin: 4px 0 0;
  font-size: 23px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #16181f;
}

.edit-intro {
  padding-top: 14px;
}

.intro-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eaf1ff 0%, #f3f7ff 100%);
  border: 1px solid rgba(61, 108, 245, 0.14);
}

.intro-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: #ffffff;
  color: #3d6cf5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.intro-card p {
  margin: 2px 0 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: #5b6b92;
}

.form-section {
  padding-top: 12px;
}

.form-card {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 30px rgba(74, 92, 145, 0.07);
}

.form-card-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
}

.step-badge {
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d8bff 0%, #3d6cf5 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 12px rgba(61, 108, 245, 0.24);
}

.form-card-title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  color: #1c1d24;
}

.form-desc {
  margin: -4px 0 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #9699a4;
}

.field {
  display: block;
}

.field + .field {
  margin-top: 14px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #4a4c56;
}

.field-label em,
.select-label em {
  margin-left: 2px;
  font-style: normal;
  color: #f0443f;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #f8f9fc;
  font-family: inherit;
  font-size: 14.5px;
  line-height: 1.4;
  color: #23242b;
  outline: none;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.field-input:focus,
.field-textarea:focus {
  border-color: rgba(61, 108, 245, 0.4);
  background: #ffffff;
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: #adb1bd;
}

.field-textarea {
  resize: none;
  line-height: 1.55;
}

.inline-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.value-field {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 12px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #f8f9fc;
  color: #23242b;
  font-family: inherit;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.value-field:active {
  border-color: rgba(61, 108, 245, 0.4);
  background: #ffffff;
}

.value-field.is-empty .value-text {
  color: #adb1bd;
}

.value-icon {
  flex: 0 0 auto;
  color: #4a6cf0;
}

.value-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.value-arrow {
  flex: 0 0 auto;
  color: #a9afbd;
}

.inline-fields--range {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
}

.range-sep {
  font-size: 12.5px;
  color: #9a9da8;
}

.suffix-field {
  position: relative;
}

.suffix-field .field-input {
  padding-right: 50px;
}

.suffix-text {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  font-size: 13px;
  color: #8f93a0;
  pointer-events: none;
}

.field-hint {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #9a9da8;
}

.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #f2f4f8;
}

.segmented-item {
  flex: 1;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #6f7280;
  font-size: 13.5px;
  font-weight: 600;
}

.segmented-item.is-active {
  background: #ffffff;
  color: #2f5fe0;
  box-shadow: 0 4px 12px rgba(61, 108, 245, 0.14);
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.day-chip {
  height: 36px;
  border: 1px solid #eef0f5;
  border-radius: 10px;
  background: #f8f9fc;
  color: #5c5f6b;
  font-size: 12.5px;
  font-weight: 600;
}

.day-chip.is-active {
  border-color: rgba(61, 108, 245, 0.3);
  background: #eaf1ff;
  color: #2f5fe0;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.month-chip {
  height: 34px;
  border: 1px solid #eef0f5;
  border-radius: 9px;
  background: #f8f9fc;
  color: #5c5f6b;
  font-size: 12px;
  font-weight: 600;
}

.month-chip.is-active {
  border-color: rgba(61, 108, 245, 0.3);
  background: #eaf1ff;
  color: #2f5fe0;
}

.store-row-list {
  display: grid;
  gap: 10px;
}

.store-row {
  padding: 12px;
  border-radius: 16px;
  background: #f8f9fc;
  border: 1px solid #eef0f5;
}

.store-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 8px;
}

.store-row-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #6f7280;
}

.store-row-del {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: #fff0f0;
  color: #e5484d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.select-field {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #ffffff;
  text-align: left;
}

.store-row .select-field + .select-field {
  margin-top: 8px;
}

.form-card > .select-field + .select-field {
  margin-top: 10px;
}

.select-label {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
  color: #4a4c56;
}

.select-value {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  line-height: 1.4;
  color: #23242b;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.is-placeholder {
  color: #adb1bd;
}

.select-arrow {
  flex: 0 0 auto;
  color: #b3b6c1;
}

.add-row-btn {
  width: 100%;
  height: 44px;
  margin-top: 12px;
  border: 1px dashed rgba(61, 108, 245, 0.36);
  border-radius: 12px;
  background: #f7f9ff;
  color: #3d6cf5;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.edit-spacer {
  height: 12px;
}

.form-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 10px;
  padding: 12px var(--prototype-page-padding-x) calc(12px + var(--prototype-safe-bottom));
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(238, 240, 245, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

:global(body.prototype-preview-canvas) .form-footer {
  left: var(--preview-overlay-left, 0px);
  right: auto;
  width: var(--preview-overlay-width, 100vw);
}

.footer-btn {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.footer-btn--ghost {
  background: #f0f1f5;
  color: #3b3d46;
}

.footer-btn--primary {
  background: linear-gradient(135deg, #5c7cf8 0%, #3f5ef0 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(63, 94, 240, 0.24);
}

.footer-btn--primary:active {
  transform: scale(0.98);
}
</style>
