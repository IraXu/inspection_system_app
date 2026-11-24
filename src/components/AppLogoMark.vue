<template>
  <svg
    class="app-logo-mark"
    :width="size"
    :height="size"
    viewBox="208 230 602 584"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-opacity="0.45"
      d="M345 250C300 302 262 372 252 448C242 522 266 592 316 634C362 672 440 686 520 662C468 656 410 636 366 600C316 560 296 496 300 428C305 358 326 294 345 250Z"
    />
    <path
      fill="currentColor"
      d="M228 545C236 640 300 720 402 762C492 799 592 794 670 754C748 714 786 620 790 438C770 556 720 642 640 692C560 742 460 746 380 706C310 670 260 610 228 545Z"
    />
    <path
      fill="currentColor"
      d="M470 560C500 470 550 370 605 315C640 282 695 258 735 280C775 302 790 355 775 405C758 462 715 505 665 535C700 480 705 430 685 400C662 366 620 372 592 410C550 468 505 520 470 560Z"
    />
    <ellipse
      cx="650"
      cy="298"
      rx="20"
      ry="11"
      transform="rotate(-20 650 298)"
      fill="currentColor"
      fill-opacity="0.5"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 40
  }
})
</script>

<style scoped>
.app-logo-mark {
  display: block;
}
</style>
