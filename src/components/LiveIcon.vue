<template>
  <svg
    class="live-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <g
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <template v-if="name === 'back'">
        <path d="M14.8 5.2 8 12l6.8 6.8" />
      </template>

      <template v-else-if="name === 'sound'">
        <g transform="translate(0.75 0)">
          <path d="M3.4 9.8h2.9l3.5-3.1c.6-.5 1.5-.1 1.5.7v9.2c0 .8-.9 1.2-1.5.7l-3.5-3.1H3.4A1.3 1.3 0 0 1 2.1 13v-1.9a1.3 1.3 0 0 1 1.3-1.3Z" stroke="#26282c" />
          <path d="M15.2 9.2a4.4 4.4 0 0 1 0 5.6" stroke="#26282c" />
          <path d="M18 6.9a7.7 7.7 0 0 1 0 10.2" stroke="#26282c" />
        </g>
      </template>

      <template v-else-if="name === 'sound-mute'">
        <g transform="translate(0.75 0)">
          <path d="M3.4 9.8h2.9l3.5-3.1c.6-.5 1.5-.1 1.5.7v9.2c0 .8-.9 1.2-1.5.7l-3.5-3.1H3.4A1.3 1.3 0 0 1 2.1 13v-1.9a1.3 1.3 0 0 1 1.3-1.3Z" stroke="#26282c" />
          <path d="m15.4 9.8 4.3 4.4M19.7 9.8l-4.3 4.4" stroke="#26282c" />
        </g>
      </template>

      <template v-else-if="name === 'record'">
        <g transform="translate(-0.15 0)">
          <rect x="3.2" y="7.6" width="12" height="8.8" rx="2.6" stroke="#26282c" />
          <path d="M15.2 11.5 19.9 8.9c.6-.3 1.2.1 1.2.7v4.8c0 .6-.6 1-1.2.7l-4.7-2.6" stroke="#26282c" />
          <path d="M7.9 9.8v4.4l3.8-2.2-3.8-2.2Z" fill="#2a5bff" stroke="none" />
        </g>
      </template>

      <template v-else-if="name === 'camera'">
        <g transform="translate(0.15 0.1)">
          <path d="M8.3 7.4 9.1 5.7A2.1 2.1 0 0 1 11 4.5h2a2.1 2.1 0 0 1 1.9 1.2l.8 1.7h1.8a2.3 2.3 0 0 1 2.3 2.3v7.2a2.3 2.3 0 0 1-2.3 2.3H6.5a2.3 2.3 0 0 1-2.3-2.3V9.7a2.3 2.3 0 0 1 2.3-2.3h1.8Z" stroke="#26282c" stroke-width="2.1" />
          <circle cx="12" cy="13.1" r="3.4" stroke="#2a5bff" stroke-width="2.1" />
          <circle cx="17.2" cy="9.7" r=".95" fill="#2a5bff" stroke="none" />
        </g>
      </template>

      <template v-else-if="name === 'bulb'">
        <g transform="translate(0 0.5)">
          <path d="M12 3.2a5.9 5.9 0 0 0-3.3 10.8c.5.4.8.9.9 1.5l.1.7h4.6l.1-.7c.1-.6.4-1.1.9-1.5A5.9 5.9 0 0 0 12 3.2Z" stroke="#26282c" stroke-width="2.1" />
          <path d="M9.7 16.2h4.6M10 18.9h4" stroke="#26282c" stroke-width="2.1" />
          <path d="M12 1.1v2M5.1 3.9l1.4 1.4M18.9 3.9l-1.4 1.4M1.4 11.3h2M20.6 11.3h2M4 18.8l1.4-1.4M20 18.8l-1.4-1.4M12 20.7v1.2" stroke="#2a5bff" stroke-width="2.1" />
        </g>
      </template>

      <template v-else-if="name === 'bulb-filled'">
        <g transform="translate(0 0.5)">
          <path d="M12 3.2a5.9 5.9 0 0 0-3.3 10.8c.5.4.8.9.9 1.5l.1.7h4.6l.1-.7c.1-.6.4-1.1.9-1.5A5.9 5.9 0 0 0 12 3.2Z" fill="#26282c" stroke="#26282c" stroke-width="2.1" />
          <path d="M9.7 16.2h4.6M10 18.9h4" stroke="#26282c" stroke-width="2.1" />
          <path d="M12 1.1v2M5.1 3.9l1.4 1.4M18.9 3.9l-1.4 1.4M1.4 11.3h2M20.6 11.3h2M4 18.8l1.4-1.4M20 18.8l-1.4-1.4M12 20.7v1.2" stroke="#2a5bff" stroke-width="2.1" />
        </g>
      </template>

      <template v-else-if="name === 'rotate'">
        <rect x="8.4" y="3.6" width="7.4" height="12.6" rx="2" />
        <path d="M6 18a9 9 0 0 1-2.4-6.8" />
        <path d="M2.2 9.4 6 11.2 3.8 14Z" fill="currentColor" stroke="none" />
      </template>

      <template v-else-if="name === 'landscape'">
        <path d="M9.4 3.4H5.7a2.1 2.1 0 0 0-2.1 2.1v3.7" stroke="#2a5bff" stroke-width="2.2" />
        <path d="M14.6 20.6h3.7a2.1 2.1 0 0 0 2.1-2.1v-3.7" stroke="#2a5bff" stroke-width="2.2" />
      </template>

      <template v-else-if="name === 'caret-up'">
        <path d="M12 6.6 18.2 15.6H5.8L12 6.6Z" fill="currentColor" stroke="currentColor" stroke-width="2" />
      </template>

      <template v-else-if="name === 'caret-down'">
        <path d="M12 17.4 5.8 8.4h12.4L12 17.4Z" fill="currentColor" stroke="currentColor" stroke-width="2" />
      </template>

      <template v-else-if="name === 'caret-left'">
        <path d="M6.6 12 15.6 5.8v12.4L6.6 12Z" fill="currentColor" stroke="currentColor" stroke-width="2" />
      </template>

      <template v-else-if="name === 'caret-right'">
        <path d="M17.4 12 8.4 18.2V5.8L17.4 12Z" fill="currentColor" stroke="currentColor" stroke-width="2" />
      </template>

      <template v-else-if="name === 'ptz'">
        <circle cx="12" cy="12" r="2.5" fill="#2a5bff" stroke="none" />
        <path d="M12 2.4 14.7 6.3H9.3L12 2.4Z" fill="#26282c" stroke="none" />
        <path d="M12 21.6 9.3 17.7h5.4L12 21.6Z" fill="#26282c" stroke="none" />
        <path d="M2.4 12 6.3 9.3v5.4L2.4 12Z" fill="#26282c" stroke="none" />
        <path d="M21.6 12 17.7 14.7V9.3L21.6 12Z" fill="#26282c" stroke="none" />
      </template>

      <template v-else-if="name === 'mic'">
        <g transform="translate(0 0.5)">
          <path d="M9.2 9.4H14.8V10.5A2.8 2.8 0 0 1 9.2 10.5Z" fill="#2a5bff" stroke="none" />
          <rect x="9.2" y="2.9" width="5.6" height="10.4" rx="2.8" stroke="#26282c" stroke-width="2.1" />
          <path d="M6.2 10.9a5.8 5.8 0 0 0 11.6 0" stroke="#26282c" stroke-width="2.1" />
          <path d="M12 16.7v3.1M9.3 20h5.4" stroke="#26282c" stroke-width="2.1" />
        </g>
      </template>

      <template v-else-if="name === 'playback'">
        <g transform="translate(-0.2 0)">
          <path d="M19.6 12.6A8.1 8.1 0 1 1 17.2 6" stroke="#26282c" />
          <path d="M20.5 3.4v3.3h-3.3" stroke="#26282c" />
          <path d="M10.2 8.5 15 12l-4.8 3.5V8.5Z" fill="#2a5bff" stroke="none" />
        </g>
      </template>

      <template v-else-if="name === 'play-circle'">
        <circle cx="12" cy="12" r="8.4" />
        <path d="M10.4 8.8 15.2 12l-4.8 3.2V8.8Z" fill="currentColor" stroke="none" />
      </template>

      <template v-else-if="name === 'chevron-right'">
        <path d="m9.8 6.6 5.4 5.4-5.4 5.4" />
      </template>

      <template v-else-if="name === 'chevron-left'">
        <path d="M14.2 6.6 8.8 12l5.4 5.4" />
      </template>

      <template v-else-if="name === 'download'">
        <path d="M12 3.8v10.4" />
        <path d="m7.6 10.2 4.4 4.4 4.4-4.4" />
        <path d="M4.8 19.6h14.4" />
      </template>

      <template v-else-if="name === 'expand'">
        <path d="M9.2 3.8H3.8v5.4M14.8 3.8h5.4v5.4M20.2 14.8v5.4h-5.4M3.8 14.8v5.4h5.4" />
      </template>

      <template v-else-if="name === 'skip-prev'">
        <path d="M6.4 5.8v12.4" />
        <path d="M18.4 6.6 10 12l8.4 5.4V6.6Z" fill="currentColor" stroke="none" />
      </template>

      <template v-else-if="name === 'skip-next'">
        <path d="M17.6 5.8v12.4" />
        <path d="M5.6 6.6 14 12l-8.4 5.4V6.6Z" fill="currentColor" stroke="none" />
      </template>

      <template v-else-if="name === 'check'">
        <path d="m5.2 12.6 4.3 4.2L18.9 7.4" />
      </template>

      <template v-else-if="name === 'clock'">
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.4V12l3.2 1.9" />
      </template>

      <template v-else-if="name === 'walk'">
        <circle cx="12.2" cy="5" r="1.9" />
        <path d="M12 7.8v5.2" />
        <path d="M12 9.4 8.9 11.6M12 9.2l3 1.4" />
        <path d="M12 13 9.6 18.4M12 13l2.6 5.2" />
      </template>

      <template v-else-if="name === 'bell'">
        <path d="M12 3.8a5 5 0 0 0-5 5c0 4.4-1.4 5.8-1.4 5.8h12.8S17 13.2 17 8.8a5 5 0 0 0-5-5Z" />
        <path d="M10 17.4a2.1 2.1 0 0 0 4 0" />
      </template>

      <template v-else-if="name === 'close'">
        <path d="m7.2 7.2 9.6 9.6M16.8 7.2l-9.6 9.6" />
      </template>

      <template v-else-if="name === 'setting'">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </template>

      <template v-else-if="name === 'person'">
        <circle cx="12" cy="7" r="3" />
        <path d="M6.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
      </template>

      <template v-else-if="name === 'baby'">
        <circle cx="12" cy="12" r="7" />
        <circle cx="9.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        <path d="M9.5 15c.8 1 3.2 1 4 0" />
      </template>

      <template v-else-if="name === 'scene-change'">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M5 16l4-4 3 3 3-3 4 4" />
        <path d="M16 4v2.5M14.5 5.25h3" />
      </template>

      <template v-else-if="name === 'pet'">
        <path d="M5 8.5 7 6M19 8.5 17 6" />
        <circle cx="12" cy="13.5" r="5.5" />
        <circle cx="10" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="14" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
        <path d="M10.5 15.5c.6.7 2.4.7 3 0" />
      </template>

      <template v-else-if="name === 'video-call'">
        <path d="M6.5 5h3l1.8 4.5-2.2 1.3a9 9 0 0 0 4.1 4.1L14.5 12.7 19 14.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 7a2 2 0 0 1 2-2Z" />
        <path d="M14.5 5.5 19 4v5l-4.5-1.5v-2Z" fill="currentColor" stroke="none" />
      </template>

      <template v-else-if="name === 'fence'">
        <path d="M4 7v13M8 5v15M12 7v13M16 5v15M20 7v13" />
        <path d="M3 11h18M3 16h18" />
      </template>

      <template v-else-if="name === 'fence-leave'">
        <path d="M4 7v13M8 5v15M12 7v13M16 5v15" />
        <path d="M3 11h14M3 16h14" />
        <path d="m19 9.5 3 2.5-3 2.5M22 12h-5" />
      </template>

      <template v-else-if="name === 'fire'">
        <path d="M12 3.5c1.6 3 4.2 4.6 4.2 8.2a4.2 4.2 0 0 1-8.4 0c0-1.3.6-2.3 1.4-3.2.2 1.1 1.1 1.9 2.2 2.1-.6-2.7-.2-5.4.6-7.1Z" />
      </template>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: [Number, String], default: 2 }
})
</script>

<style scoped>
.live-icon {
  display: block;
  flex: 0 0 auto;
}
</style>
