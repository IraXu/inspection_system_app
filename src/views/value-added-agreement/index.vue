<template>
  <LegalPage title="增值服务协议" :lead="valueAddedLead" :sections="valueAddedSections" />
</template>

<script setup>
import LegalPage from '../../components/LegalPage.vue'
import { valueAddedLead, valueAddedSections } from '../../data/legal'
</script>
