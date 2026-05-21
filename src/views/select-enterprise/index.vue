<template>
  <div class="select-enterprise-page app-page app-page--navbar">
    <t-navbar title="选择企业" left-arrow @left-click="goBack" class="page-navbar" />

    <section class="hero-section">
      <div class="hero-card">
        <div class="hero-user">
          <t-avatar size="56px" icon="user" />
          <div>
            <div class="hero-name">{{ userInfo.name }}</div>
            <div class="hero-phone">{{ userInfo.phone }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <div class="section-title">企业列表</div>
        <div class="section-note">点击可切换当前工作企业</div>
      </div>

      <div class="enterprise-list">
        <button
          v-for="enterprise in enterprises"
          :key="enterprise.id"
          type="button"
          class="enterprise-item"
          @click="selectEnterprise(enterprise)"
        >
          <div class="enterprise-item-left">
            <div class="enterprise-logo">{{ enterprise.logo }}</div>
            <div class="enterprise-copy">
              <div class="enterprise-name-row">
                <span class="enterprise-name">{{ enterprise.name }}</span>
                <t-tag v-if="enterprise.status === 'active'" theme="success" size="small">当前</t-tag>
                <t-tag v-else-if="enterprise.status === 'pending'" theme="warning" size="small">待审核</t-tag>
              </div>
              <div class="enterprise-role">{{ enterprise.role }}</div>
            </div>
          </div>
          <t-icon name="chevron-right" class="enterprise-arrow" />
        </button>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <div class="section-title">加入新企业</div>
        <div class="section-note">输入企业管理员提供的企业码</div>
      </div>

      <div class="join-card">
        <t-input
          v-model="enterpriseCode"
          placeholder="请输入企业码"
          clearable
          borderless
        >
          <template #prefixIcon>
            <t-icon name="shop" />
          </template>
        </t-input>
        <t-button block theme="primary" size="large" @click="joinEnterprise">
          申请加入企业
        </t-button>

        <div class="join-tip">
          <t-icon name="info-circle" />
          <span>提交申请后将进入企业审核流程，审核通过后可切换为当前企业。</span>
        </div>
      </div>
    </section>

    <transition name="enterprise-dialog">
      <div v-if="pendingEnterprise" class="enterprise-dialog-layer" @click.self="closeEnterpriseDialog">
        <div class="enterprise-dialog">
          <div class="enterprise-dialog-logo">{{ pendingEnterprise.logo }}</div>
          <div class="enterprise-dialog-title">切换到 {{ pendingEnterprise.name }}？</div>
          <div class="enterprise-dialog-desc">切换后，工作数据将同步切换为该企业下的内容。</div>
          <div class="enterprise-dialog-meta">
            <span>{{ pendingEnterprise.role }}</span>
            <span class="enterprise-dialog-meta-divider"></span>
            <span>当前工作企业切换</span>
          </div>
          <div class="enterprise-dialog-actions">
            <button type="button" class="dialog-btn dialog-btn--ghost" @click="closeEnterpriseDialog">取消</button>
            <button type="button" class="dialog-btn dialog-btn--primary" @click="confirmEnterpriseSwitch">确认切换</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()
const pendingEnterprise = ref(null)

const userInfo = ref({
  name: '张三',
  phone: '138****8888'
})

const enterpriseCode = ref('')

const enterprises = ref([
  {
    id: 1,
    name: 'XX科技有限公司',
    logo: 'XX',
    role: '巡检员',
    status: 'active'
  },
  {
    id: 2,
    name: 'YY制造有限公司',
    logo: 'YY',
    role: '管理员',
    status: 'normal'
  }
])

const goBack = () => {
  router.back()
}

const selectEnterprise = (enterprise) => {
  if (enterprise.status === 'pending') {
    Toast.info('企业加入申请审核中')
    return
  }

  pendingEnterprise.value = enterprise
}

const closeEnterpriseDialog = () => {
  pendingEnterprise.value = null
}

const confirmEnterpriseSwitch = () => {
  if (!pendingEnterprise.value) return
  pendingEnterprise.value = null
  Toast.success('切换成功')
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
.select-enterprise-page {
  background:
    radial-gradient(circle at top left, rgba(var(--theme-primary-rgb), 0.18), transparent 28%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #f7f9fc 24%, #f4f7fa 100%);
}

.page-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92) !important;
  border-bottom: 1px solid rgba(228, 235, 244, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.page-navbar :deep(.t-navbar__content),
.page-navbar :deep(.t-navbar__title),
.page-navbar :deep(.t-navbar__left),
.page-navbar :deep(.t-navbar__right) {
  color: #101828;
}

.hero-section,
.content-section {
  padding: 16px 16px 0;
}

.hero-card {
  padding: 18px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.64), transparent 34%),
    linear-gradient(145deg, var(--theme-glass-3) 0%, var(--theme-glass-4) 58%, var(--theme-primary) 100%);
  color: #173153;
  box-shadow: 0 18px 34px rgba(var(--theme-primary-rgb), 0.14);
}

.hero-user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-user :deep(.t-avatar) {
  background: rgba(255, 255, 255, 0.34);
  color: var(--theme-primary-ink);
  border: 2px solid rgba(255, 255, 255, 0.42);
}

.hero-name {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
}

.hero-phone {
  margin-top: 4px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(23, 49, 83, 0.7);
}

.section-head {
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  color: #1f2937;
}

.section-note {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #7b8794;
}

.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enterprise-item {
  width: 100%;
  padding: 16px;
  border: 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.64);
  box-shadow: 0 12px 28px rgba(73, 114, 145, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.enterprise-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.enterprise-logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(145deg, var(--theme-glass-4) 0%, var(--theme-primary) 100%);
  color: #173153;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.enterprise-copy {
  min-width: 0;
  text-align: left;
}

.enterprise-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.enterprise-name {
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  color: #1f2937;
}

.enterprise-role {
  margin-top: 4px;
  font-size: 13px;
  line-height: 20px;
  color: #64748b;
}

.enterprise-arrow {
  color: #c3cfdf;
  flex-shrink: 0;
}

.join-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.64);
  box-shadow: 0 12px 28px rgba(73, 114, 145, 0.08);
}

.join-card :deep(.t-input) {
  margin-bottom: 14px;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(241, 247, 252, 0.98) 100%);
  border: 1px solid rgba(216, 231, 243, 0.88);
  border-radius: 14px;
  padding: 14px 16px;
}

.join-tip {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  line-height: 18px;
  color: #7b8794;
}

.enterprise-dialog-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(13, 23, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.enterprise-dialog {
  width: 100%;
  padding: 22px 18px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 44px rgba(64, 104, 135, 0.16);
  text-align: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.enterprise-dialog-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--theme-glass-4) 0%, var(--theme-primary) 100%);
  color: #173153;
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(var(--theme-primary-rgb), 0.24);
}

.enterprise-dialog-title {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.enterprise-dialog-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #7c889c;
}

.enterprise-dialog-meta {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(241, 246, 255, 0.96);
  color: #5a6f8e;
  font-size: 12px;
}

.enterprise-dialog-meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #b6c3d7;
}

.enterprise-dialog-actions {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.dialog-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 0;
  font-size: 15px;
  font-weight: 600;
}

.dialog-btn--ghost {
  background: rgba(241, 245, 251, 0.96);
  color: #52637c;
}

.dialog-btn--primary {
  background: linear-gradient(145deg, var(--theme-glass-4) 0%, var(--theme-primary) 100%);
  color: #fff;
  box-shadow: 0 12px 22px rgba(var(--theme-primary-rgb), 0.18);
}

.enterprise-dialog-enter-active,
.enterprise-dialog-leave-active {
  transition: opacity 0.24s ease;
}

.enterprise-dialog-enter-active .enterprise-dialog,
.enterprise-dialog-leave-active .enterprise-dialog {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease;
}

.enterprise-dialog-enter-from,
.enterprise-dialog-leave-to {
  opacity: 0;
}

.enterprise-dialog-enter-from .enterprise-dialog,
.enterprise-dialog-leave-to .enterprise-dialog {
  transform: translate3d(0, 18px, 0);
  opacity: 0.9;
}
</style>
