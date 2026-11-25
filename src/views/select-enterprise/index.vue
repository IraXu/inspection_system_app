<template>
  <div class="auth-page enterprise-page">
    <div class="auth-skyline" aria-hidden="true">
      <span class="auth-tower tower-a"></span>
      <span class="auth-tower tower-b"></span>
      <span class="auth-tower tower-c"></span>
      <span class="auth-tower tower-d"></span>
    </div>

    <div class="auth-body">
      <div class="ent-head">
        <div class="auth-heading">
          <button type="button" class="auth-back" aria-label="返回" @click="goBack">
            <t-icon name="chevron-left" />
          </button>
          <div class="auth-heading-copy">
            <h1 class="auth-title">请选择</h1>
            <p class="auth-subtitle">您需要进入的企业</p>
          </div>
        </div>
        <div class="demo-switch">
          <button
            type="button"
            class="demo-switch-item"
            :class="{ 'is-active': !hasEnterprise }"
            @click="hasEnterprise = false"
          >
            无企业
          </button>
          <button
            type="button"
            class="demo-switch-item"
            :class="{ 'is-active': hasEnterprise }"
            @click="hasEnterprise = true"
          >
            有企业
          </button>
        </div>
      </div>

      <div v-if="!hasEnterprise" class="ent-empty">
        <span class="ent-empty-art">
          <t-icon name="city" />
        </span>
        <span class="ent-empty-text">当前账号暂未加入任何企业</span>
      </div>

      <div v-else class="ent-list">
        <button
          v-for="enterprise in enterprises"
          :key="enterprise.id"
          type="button"
          class="ent-card"
          @click="selectEnterprise(enterprise)"
        >
          <span v-if="enterprise.status === 'active'" class="ent-badge">当前</span>
          <span v-else-if="enterprise.status === 'pending'" class="ent-badge ent-badge--pending">
            待审核
          </span>
          <span
            class="ent-logo"
            :class="enterprise.status === 'active' ? 'is-blue' : 'is-gray'"
          >
            <t-icon name="building" />
          </span>
          <span class="ent-main">
            <span class="ent-name">{{ enterprise.name }}</span>
            <span class="ent-role" :class="{ 'is-active': enterprise.status === 'active' }">
              {{ enterprise.role }}
            </span>
          </span>
          <t-icon name="arrow-right" class="ent-arrow" />
        </button>
      </div>

      <div class="ent-join">
        <div class="ent-join-title">
          <img class="ent-join-icon" :src="joinIcon" alt="" />
          <span>加入新企业</span>
        </div>
        <p class="ent-join-desc">输入企业管理员提供的企业码</p>

        <div class="ent-join-card">
          <label class="ent-code">
            <img class="ent-code-icon" :src="joinIcon" alt="" />
            <input
              v-model="enterpriseCode"
              type="text"
              placeholder="请输入企业码"
              autocomplete="off"
            />
          </label>

          <button type="button" class="auth-submit ent-submit" @click="joinEnterprise">
            <span>申请加入企业</span>
            <t-icon name="arrow-right" />
          </button>

          <p class="ent-tip">提交申请后将进入企业审核流程，审核通过后可切换为当前企业</p>
        </div>
      </div>
    </div>

    <transition name="ent-sheet">
      <div v-if="pendingEnterprise" class="auth-sheet-layer" @click.self="closeSheet">
        <div class="ent-sheet">
          <div class="ent-sheet-handle"></div>
          <span class="ent-sheet-art">
            <t-icon name="building" />
          </span>
          <div class="ent-sheet-title">
            切换到
            <br />
            {{ pendingEnterprise.name }}？
          </div>
          <p class="ent-sheet-desc">切换后，工作数据将同步切换为该企业下的内容。</p>
          <div class="ent-sheet-meta">{{ pendingEnterprise.role }} · 当前工作企业切换</div>

          <button type="button" class="auth-submit ent-sheet-confirm" @click="confirmSwitch">
            <span>确定切换</span>
            <t-icon name="arrow-right" />
          </button>
          <button type="button" class="ent-sheet-cancel" @click="closeSheet">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import joinIcon from '../../assets/images/enterprise-join-icon.svg'

const router = useRouter()

const enterpriseCode = ref('')
const pendingEnterprise = ref(null)

// 原型演示开关：默认展示已加入企业的列表状态
const hasEnterprise = ref(true)

const enterprises = ref([
  {
    id: 1,
    name: '南京鹤梦科技有限公司',
    role: '巡检专员',
    status: 'active'
  },
  {
    id: 2,
    name: '南京科技有限公司',
    role: '巡检主管',
    status: 'normal'
  },
  {
    id: 3,
    name: '南京科技有限公司',
    role: '员工',
    status: 'pending'
  }
])

const selectEnterprise = (enterprise) => {
  if (enterprise.status === 'pending') {
    Toast.info('企业加入申请审核中')
    return
  }

  pendingEnterprise.value = enterprise
}

const closeSheet = () => {
  pendingEnterprise.value = null
}

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/login')
  }
}

const confirmSwitch = () => {
  if (!pendingEnterprise.value) return

  const target = pendingEnterprise.value
  pendingEnterprise.value = null
  Toast.success(`已切换到${target.name}`)
  router.push('/workbench')
}

const joinEnterprise = () => {
  if (!enterpriseCode.value) {
    Toast.warning('请输入企业码')
    return
  }

  Toast.success('申请已提交，等待审核')
  enterpriseCode.value = ''
}
</script>

<style scoped>
.ent-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ent-head .auth-heading {
  flex: 1;
  min-width: 0;
}

.demo-switch {
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 8px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.48);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.demo-switch-item {
  height: 24px;
  padding: 0 9px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #7b8794;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.demo-switch-item.is-active {
  background: #ffffff;
  color: var(--auth-primary);
  box-shadow: 0 3px 8px rgba(61, 78, 245, 0.12);
}

/* 无企业空态 */
.ent-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
  padding: 22px 20px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(31, 45, 90, 0.06);
}

.ent-empty-art {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 20px;
  background: linear-gradient(150deg, #f0f5ff 0%, #dce7ff 100%);
  color: #8fb2f5;
  font-size: 32px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.ent-empty-text {
  color: var(--auth-ink);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

/* 企业列表 */
.ent-list {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.ent-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 20px;
  border: 0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(31, 45, 90, 0.06);
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.ent-card:active {
  transform: scale(0.99);
  box-shadow: 0 6px 18px rgba(31, 45, 90, 0.08);
}

.ent-badge {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 13px;
  border-radius: 0 18px 0 14px;
  background: var(--auth-primary-soft);
  color: var(--auth-primary);
  font-size: 12px;
  font-weight: 600;
}

.ent-badge--pending {
  background: #fff2e8;
  color: #f08a2c;
}

.ent-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border-radius: 16px;
  font-size: 28px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 8px 18px rgba(48, 72, 140, 0.08);
}

.ent-logo.is-blue {
  background: linear-gradient(150deg, #eef3ff 0%, #cfdbff 55%, #b6c7f8 100%);
  color: var(--auth-primary);
}

.ent-logo.is-gray {
  background: linear-gradient(150deg, #f7f8fb 0%, #e6e9f0 58%, #d6dbe6 100%);
  color: #98a1b4;
}

.ent-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ent-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--auth-ink);
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ent-role {
  margin-top: 7px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f4f5f9;
  color: #7a8496;
  font-size: 11px;
  font-weight: 500;
  line-height: 17px;
}

.ent-role.is-active {
  background: var(--auth-primary-soft);
  color: #5468f0;
}

.ent-arrow {
  flex-shrink: 0;
  color: #5f6675;
  font-size: 20px;
}

/* 加入新企业 */
.ent-join {
  margin-top: 26px;
}

.ent-join-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--auth-ink);
  font-size: 17px;
  font-weight: 700;
  line-height: 25px;
}

.ent-join-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  display: block;
}

.ent-join-desc {
  margin-top: 8px;
  color: var(--auth-sub);
  font-size: 13px;
  line-height: 19px;
}

.ent-join-card {
  margin-top: 14px;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(31, 45, 90, 0.06);
}

.ent-code {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  background: #f4f5fa;
}

.ent-code-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: block;
}

.ent-code input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--auth-ink);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.ent-code input::placeholder {
  color: var(--auth-placeholder);
}

.ent-code:focus-within {
  box-shadow: inset 0 0 0 1px rgba(61, 78, 245, 0.35);
}

.ent-submit {
  margin-top: 16px;
}

.ent-tip {
  margin-top: 14px;
  text-align: center;
  color: #9aa2b5;
  font-size: 11px;
  line-height: 18px;
}

/* 切换企业确认弹层 */
.ent-sheet {
  width: 100%;
  padding: 10px 24px calc(20px + env(safe-area-inset-bottom, 0px));
  border-radius: 28px 28px 0 0;
  background: #ffffff;
  box-shadow: 0 -12px 40px rgba(23, 34, 68, 0.14);
  text-align: center;
}

.ent-sheet-handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 6px;
  border-radius: 999px;
  background: rgba(148, 158, 178, 0.42);
}

.ent-sheet-art {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  margin: 4px auto 0;
  border-radius: 22px;
  background: linear-gradient(150deg, #dbe6ff 0%, #aec2ff 58%, #8ea6f6 100%);
  color: #2f3fd6;
  font-size: 38px;
  box-shadow:
    0 14px 26px rgba(61, 78, 245, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.ent-sheet-title {
  margin-top: 6px;
  color: var(--auth-ink);
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
}

.ent-sheet-desc {
  margin-top: 12px;
  color: var(--auth-sub);
  font-size: 13px;
  line-height: 20px;
}

.ent-sheet-meta {
  display: inline-flex;
  align-items: center;
  margin-top: 16px;
  padding: 8px 14px;
  border-radius: 10px;
  background: #f0eeff;
  color: #5b54d6;
  font-size: 12px;
  line-height: 18px;
}

.ent-sheet-confirm {
  margin-top: 22px;
  height: 54px;
  font-size: 17px;
}

.ent-sheet-cancel {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--auth-primary);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
}

.ent-sheet-cancel:active {
  opacity: 0.7;
}

.ent-sheet-enter-active,
.ent-sheet-leave-active {
  transition: opacity 0.24s ease;
}

.ent-sheet-enter-active .ent-sheet,
.ent-sheet-leave-active .ent-sheet {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.ent-sheet-enter-from,
.ent-sheet-leave-to {
  opacity: 0;
}

.ent-sheet-enter-from .ent-sheet,
.ent-sheet-leave-to .ent-sheet {
  transform: translate3d(0, 24px, 0);
}
</style>
