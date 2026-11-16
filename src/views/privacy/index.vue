<template>
  <div class="legal-page app-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="page-title">用户隐私</h1>
    </header>

    <section class="app-section legal-section">
      <div class="legal-meta">生效日期：2026 年 1 月 1 日</div>

      <div class="legal-card">
        <p class="legal-lead">
          我们深知个人信息对你的重要性，并会尽力保护你的个人信息安全。本政策说明我们如何收集、使用、存储和保护你的信息，以及你享有的相关权利。
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
    title: '一、我们收集的信息',
    paragraphs: [
      '账号信息：手机号、姓名、所属企业及角色，用于账号登录与权限识别。',
      '巡检信息：巡检任务记录、现场照片、视频及位置信息，用于确认巡检点位与留存巡检凭证。',
      '设备信息：设备型号、操作系统版本、应用版本，用于故障排查与体验优化。'
    ]
  },
  {
    title: '二、信息的使用',
    paragraphs: [
      '我们仅在以下情形使用你的信息：提供并维护巡检服务；完成身份识别与权限校验；处理你的反馈与申诉；保障账号与服务安全；遵守法律法规的要求。'
    ]
  },
  {
    title: '三、信息的存储与保护',
    paragraphs: [
      '你的信息存储于中华人民共和国境内。我们采用加密传输、访问权限控制等措施保护数据安全，并在超出必要保存期限后删除或匿名化处理。'
    ]
  },
  {
    title: '四、信息的共享与披露',
    paragraphs: [
      '除取得你的同意或法律法规另有规定外，我们不会向第三方共享、转让你的个人信息。如涉及企业合并、分立等情形，我们将要求承接方继续履行本政策。'
    ]
  },
  {
    title: '五、你的权利',
    paragraphs: [
      '你有权查询、更正、删除你的个人信息，也可以撤回授权或注销账号。你可通过 App 内「设置」或联系客服行使上述权利。'
    ]
  },
  {
    title: '六、第三方服务',
    paragraphs: [
      '本服务可能包含第三方提供的功能（如地图、视频云服务）。第三方对信息的处理适用其自身的隐私政策，建议你一并阅读。'
    ]
  },
  {
    title: '七、未成年人保护',
    paragraphs: [
      '本服务面向企业巡检场景，不面向未成年人。如我们发现收集了未成年人的个人信息，将尽快删除相关数据。'
    ]
  },
  {
    title: '八、政策更新与联系',
    paragraphs: [
      '本政策更新后将在 App 内公布。如你对个人信息保护有任何疑问，可通过 privacy@hemeng.com 与我们联系。'
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
