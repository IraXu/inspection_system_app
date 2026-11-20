export const DETECTION_TYPE_OPTIONS = [
  { value: 'person', label: '人形' },
  { value: 'vehicle', label: '车辆' },
  { value: 'cat', label: '猫' },
  { value: 'dog', label: '狗' }
]

const DEFAULT_SUPPORTED_TYPES = ['person', 'cat', 'dog']

export const DEVICE_SUPPORTED_DETECTION_TYPES = {
  1: ['person', 'vehicle'],
  2: ['person', 'vehicle'],
  3: ['person', 'vehicle'],
  4: ['person', 'cat'],
  5: ['person'],
  6: ['person', 'vehicle'],
  7: ['person', 'vehicle'],
  8: ['person']
}

export const getSupportedDetectionTypes = (deviceId) => {
  const supported = DEVICE_SUPPORTED_DETECTION_TYPES[String(deviceId)] || DEFAULT_SUPPORTED_TYPES
  return DETECTION_TYPE_OPTIONS.filter((option) => supported.includes(option.value))
}

export const getDefaultDetectionTypes = (deviceId) =>
  getSupportedDetectionTypes(deviceId).map((option) => option.value)
