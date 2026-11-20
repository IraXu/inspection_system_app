/*
 * 演示图片已本地化：从图片生成接口取图后压缩（640px）随包发布，避免每次打开页面都请求远程接口
 * （远程接口响应为 no-store，且生成未完成时会返回占位图）。
 * 未命中本地图片的提示词仍回退到远程接口，作为兜底。
 * 注：部分提示词接口持续返回“生成中”占位图，这些场景使用了同类型的本地近似图。
 */
import imgGalleryWarehouse from '../assets/images/gallery-warehouse.jpg'
import imgGalleryParking from '../assets/images/gallery-parking.jpg'
import imgGalleryAssembly from '../assets/images/gallery-assembly.jpg'
import imgGalleryReception from '../assets/images/gallery-reception.jpg'
import imgGalleryGateNight from '../assets/images/gallery-gate-night.jpg'
import imgHomeDeviceThumbnail from '../assets/images/home-device-thumbnail.jpg'
import imgProfileAvatar from '../assets/images/profile-avatar.jpg'
import imgProfileLogo from '../assets/images/profile-logo.jpg'
import imgVideoSceneWorkshopEntrance from '../assets/images/video-scene-workshop-entrance.jpg'
import imgAlertAlarm1001 from '../assets/images/alert-alarm-1001.jpg'
import imgAlertAlarm1002 from '../assets/images/alert-alarm-1002.jpg'
import imgAlertAlarm1003 from '../assets/images/alert-alarm-1003.jpg'
import imgAlertAlarm1004 from '../assets/images/alert-alarm-1004.jpg'
import imgAlertAlarm1005 from '../assets/images/alert-alarm-1005.jpg'
import imgAlertAlarm1006 from '../assets/images/alert-alarm-1006.jpg'
import imgAlertAlarm1007 from '../assets/images/alert-alarm-1007.jpg'
import imgAlertAlarm1008 from '../assets/images/alert-alarm-1008.jpg'
import imgAlertAlarm1009 from '../assets/images/alert-alarm-1009.jpg'
import imgAlertAlarm1010 from '../assets/images/alert-alarm-1010.jpg'
import imgAlertAlarm1011 from '../assets/images/alert-alarm-1011.jpg'
import imgAlertAlarm1012 from '../assets/images/alert-alarm-1012.jpg'
import imgStandardEnvFloor from '../assets/images/standard-env-floor.jpg'
import imgTicketSP20261028001Item1Inspect1 from '../assets/images/ticket-SP-20261028-001-item1-inspect-1.jpg'
import imgTicketSP20261028001Item2Inspect1 from '../assets/images/ticket-SP-20261028-001-item2-inspect-1.jpg'
import imgTicketSP20261028001Item3Inspect1 from '../assets/images/ticket-SP-20261028-001-item3-inspect-1.jpg'
import imgTicketSP20261028002Item1Inspect1 from '../assets/images/ticket-SP-20261028-002-item1-inspect-1.jpg'
import imgTicketSP20261028002Item1Rectify1 from '../assets/images/ticket-SP-20261028-002-item1-rectify-1.jpg'
import imgTicketSP20261028002Item2Inspect1 from '../assets/images/ticket-SP-20261028-002-item2-inspect-1.jpg'
import imgTicketSP20261028002Item2Rectify1 from '../assets/images/ticket-SP-20261028-002-item2-rectify-1.jpg'
import imgTicketSP20261027001Item1Inspect1 from '../assets/images/ticket-SP-20261027-001-item1-inspect-1.jpg'
import imgTicketSP20261027001Item1Rectify1 from '../assets/images/ticket-SP-20261027-001-item1-rectify-1.jpg'
import imgTicketSP20261027001Item2Inspect1 from '../assets/images/ticket-SP-20261027-001-item2-inspect-1.jpg'
import imgTicketSP20261027001Item2Rectify1 from '../assets/images/ticket-SP-20261027-001-item2-rectify-1.jpg'

const REMOTE_ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image'

// 提示词 -> 本地图片
const LOCAL_IMAGES = {
  "realistic CCTV surveillance still of a bright factory warehouse interior with tall steel racks and a forklift, wide angle, slightly grainy security camera footage":
    imgGalleryWarehouse,
  "realistic CCTV surveillance still of an empty underground parking garage with white pillars and bright ceiling lights, wide angle, slightly grainy security camera footage":
    imgGalleryParking,
  "realistic CCTV surveillance still of factory assembly line operating with workers in yellow vests, wide angle, slightly grainy security camera footage":
    imgGalleryAssembly,
  "realistic CCTV surveillance still of an office reception area with a front desk and warm lighting, wide angle, slightly grainy security camera footage":
    imgGalleryReception,
  "realistic CCTV surveillance still of a factory gate checkpoint with barriers and a security booth at night, wide angle, slightly grainy security camera footage":
    imgGalleryGateNight,
  "realistic CCTV surveillance still of factory workshop interior with storage racks, wide angle, slightly grainy security camera footage":
    imgGalleryWarehouse,
  "wide angle surveillance camera still of a large modern factory warehouse interior, tall steel storage racks, overhead industrial lights, workers in yellow safety vests walking on a glossy reflective floor, bright daylight, realistic CCTV footage":
    imgHomeDeviceThumbnail,
  "3D cartoon avatar portrait of a smiling young asian man with fluffy short brown hair, big friendly eyes, wearing a light gray shirt, soft clay render style, plain pale lavender background, head and shoulders, centered, mobile app profile avatar":
    imgProfileAvatar,
  "3D isometric miniature city of glossy translucent blue glass skyscrapers on a small rounded base, soft studio lighting, clean white background, mobile app enterprise logo icon":
    imgProfileLogo,
  "realistic CCTV surveillance still of a bright factory workshop entrance with metal storage racks and stacked white boxes, wide angle, slightly grainy security camera footage":
    imgVideoSceneWorkshopEntrance,
  "realistic CCTV surveillance still of a factory workshop exit corridor with industrial equipment, wide angle, slightly grainy security camera footage":
    imgVideoSceneWorkshopEntrance,
  "realistic CCTV surveillance still of a modern factory production line with machines and overhead lights, wide angle, slightly grainy security camera footage":
    imgGalleryAssembly,
  "realistic CCTV surveillance still of a factory gate checkpoint with a security booth and barriers, wide angle, slightly grainy security camera footage":
    imgGalleryGateNight,
  "realistic CCTV surveillance still of a modern production workshop with assembly lines and workers in vests, wide angle, slightly grainy security camera footage":
    imgGalleryAssembly,
  "security camera offline, dark entrance of factory workshop, CCTV still frame":
    imgAlertAlarm1001,
  "warehouse storage rack with camera equipment, CCTV still frame":
    imgAlertAlarm1002,
  "empty parking lot at night with a person walking, security camera still frame":
    imgAlertAlarm1003,
  "office area with camera view, bright and normal, CCTV still frame":
    imgAlertAlarm1004,
  "warehouse loading dock with light smoke detected, security camera still frame":
    imgAlertAlarm1005,
  "security camera lens blocked by an object, partially dark frame, CCTV still":
    imgAlertAlarm1006,
  "empty checkout counter with no cashier in electronics store, CCTV still frame":
    imgAlertAlarm1007,
  "portable battery powered security camera with low battery indicator, product photo":
    imgAlertAlarm1008,
  "video loss blue screen on security monitor, NVR interface, still frame":
    imgAlertAlarm1009,
  "security camera storage card warning screen, NVR storage management, still frame":
    imgAlertAlarm1010,
  "electrical distribution room with high temperature warning, industrial equipment, photo":
    imgAlertAlarm1011,
  "empty checkout counter in office store area, CCTV still frame":
    imgAlertAlarm1012,
  "blurry warehouse camera view, out of focus, CCTV still frame":
    imgAlertAlarm1002,
  "factory park entrance gate at night with camera offline, still frame":
    imgGalleryGateNight,
  "clean bright supermarket floor, tidy and spotless, CCTV still frame":
    imgStandardEnvFloor,
  "clean checkout counter and payment equipment in retail store, CCTV still frame":
    imgTicketSP20261028001Item3Inspect1,
  "store staff standing on duty at checkout counter, CCTV view from ceiling":
    imgHomeDeviceThumbnail,
  "store employee at checkout with hands free, no mobile phone, CCTV still frame":
    imgTicketSP20261028001Item3Inspect1,
  "grocery store shelves fully stocked and neatly arranged, CCTV still frame":
    imgGalleryWarehouse,
  "retail shelf edge price tags aligned neatly, CCTV close up still frame":
    imgTicketSP20261027001Item2Rectify1,
  "warehouse fire exit aisle completely clear and unobstructed, CCTV still frame":
    imgGalleryWarehouse,
  "fire extinguisher mounted on wall with valid inspection tag, CCTV still frame":
    imgTicketSP20261028002Item1Rectify1,
  "supermarket aisle floor with scattered trash and paper scraps, CCTV still frame":
    imgTicketSP20261028001Item1Inspect1,
  "grocery store shelf with messy products facing backwards, CCTV still frame":
    imgTicketSP20261028001Item2Inspect1,
  "empty checkout counter with no staff, CCTV still frame":
    imgTicketSP20261028001Item3Inspect1,
  "warehouse fire exit passage blocked by stacked boxes, CCTV still frame":
    imgTicketSP20261027001Item1Inspect1,
  "office fire escape passage blocked by paper boxes, CCTV still frame":
    imgTicketSP20261028002Item1Inspect1,
  "office fire escape passage completely clear after cleanup, CCTV still frame":
    imgTicketSP20261028002Item1Rectify1,
  "office pantry equipment with visible stains on surface, CCTV still frame":
    imgTicketSP20261028002Item2Inspect1,
  "office pantry counter clean and tidy after deep cleaning, CCTV still frame":
    imgTicketSP20261028002Item2Rectify1,
  "warehouse main aisle blocked by wooden pallets, CCTV still frame":
    imgTicketSP20261027001Item1Inspect1,
  "warehouse main aisle clear with yellow warning line, CCTV still frame":
    imgTicketSP20261027001Item1Rectify1,
  "warehouse staging area cartons without labels, CCTV still frame":
    imgTicketSP20261027001Item2Inspect1,
  "warehouse staging cartons with clear batch labels, CCTV still frame":
    imgTicketSP20261027001Item2Rectify1,
  "store cashier using mobile phone while customer waiting, CCTV still frame":
    imgTicketSP20261028001Item3Inspect1,
  "store cashier serving customer with hands free, CCTV still frame":
    imgTicketSP20261028001Item3Inspect1,
}

const buildRemoteUrl = (prompt, size = 'landscape_4_3') =>
  `${REMOTE_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

export const buildImageUrl = (prompt, size = 'landscape_4_3') =>
  LOCAL_IMAGES[prompt] || buildRemoteUrl(prompt, size)

// 兼容 localStorage 中旧版本保存的远程图片地址
export const normalizeImageUrl = (url) => {
  if (typeof url !== 'string' || !url.startsWith(REMOTE_ENDPOINT)) return url
  try {
    const prompt = new URL(url).searchParams.get('prompt')
    return (prompt && LOCAL_IMAGES[prompt]) || url
  } catch {
    return url
  }
}

// 整改页“拍照上报”的模拟图片
export const buildRectifySampleUrl = () => imgTicketSP20261028002Item1Rectify1
