import { hasPrivacyConsent } from './privacy-consent'

let initialized = false

export const isSdkInitialized = () => initialized

/**
 * 第三方 SDK 统一初始化入口。
 * 必须等用户同意《隐私政策》后才能调用，未同意前不初始化任何会采集设备信息的 SDK。
 */
export const initThirdPartySdks = () => {
  if (initialized || !hasPrivacyConsent()) return

  initialized = true

  // 实际接入第三方 SDK 后，在这里初始化，例如：
  // - 统计与埋点
  // - 消息推送
  // - 崩溃上报
  // - 地图 / 视频云服务
}
