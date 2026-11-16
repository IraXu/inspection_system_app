<template>
  <div class="legal-page app-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="page-title">用户协议</h1>
    </header>

    <section class="app-section legal-section">
      <div class="legal-meta">生效日期：2026 年 1 月 1 日</div>

      <div class="legal-card">
        <p class="legal-lead">
          欢迎使用「智慧巡检」。本协议是你与鹤梦科技有限公司之间，关于使用智慧巡检 App
          及相关服务所订立的协议。请在使用前仔细阅读并充分理解本协议内容。
        </p>

        <div v-for="section in sections" :key="section.title" class="legal-block">
          <h2 class="legal-block-title">{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const sections = [
  {
    title: '一、服务内容',
    paragraphs: [
      '智慧巡检为你提供巡检任务管理、线下巡检、整改处理与审核、视频查看、企业信息管理等服务。我们可能根据业务发展对服务内容进行更新或调整，并通过 App 内公告等方式告知。'
    ]
  },
  {
    title: '二、账号注册与使用',
    paragraphs: [
      '你应使用真实、准确的信息注册账号，并妥善保管账号与密码。账号仅限本人使用，不得出借或转让。因账号保管不当造成的损失，由你自行承担。'
    ]
  },
  {
    title: '三、使用规范',
    paragraphs: [
      '你承诺依法使用本服务，不得从事以下行为：发布违法违规信息；干扰或破坏服务正常运行；未经授权采集、传播他人信息；以任何方式规避平台的安全管理措施。'
    ]
  },
  {
    title: '四、巡检数据',
    paragraphs: [
      '你在使用过程中提交的巡检记录、照片、视频等数据，其权利归你或你所属企业所有。你授权我们在提供服务所必需的范围内存储、处理上述数据。'
    ]
  },
  {
    title: '五、服务变更与终止',
    paragraphs: [
      '你可以随时停止使用本服务。若你严重违反本协议，我们有权暂停或终止向你提供服务，并保留追究相应责任的权利。'
    ]
  },
  {
    title: '六、免责声明',
    paragraphs: [
      '因不可抗力、网络故障、设备异常等原因导致服务中断或数据延迟的，我们将尽力协助处理，但在法律允许的范围内不承担由此产生的间接损失。'
    ]
  },
  {
    title: '七、协议更新与联系',
    paragraphs: [
      '我们可能适时修订本协议，修订后的协议将在 App 内公布，公布后即生效。如你对本协议有任何疑问，可通过 support@hemeng.com 与我们联系。'
    ]
  }
]
</script>

<style scoped>
.legal-page {
  min-height: 100%;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(28px + var(--prototype-safe-bottom));
}

.page-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 14px;
}

.back-entry {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  margin-left: -2px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.back-entry:active {
  opacity: 0.6;
}

.page-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.legal-section {
  padding-top: 18px;
}

.legal-meta {
  margin: 0 0 12px 4px;
  font-size: 12px;
  color: #9d9ea7;
}

.legal-card {
  padding: 20px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.legal-lead {
  font-size: 13.5px;
  line-height: 1.9;
  color: #4d4e58;
}

.legal-block {
  margin-top: 20px;
}

.legal-block-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: #17181d;
}

.legal-block p {
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #5b5c66;
}
</style>
