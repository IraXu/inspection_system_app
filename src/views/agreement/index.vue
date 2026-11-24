<template>
  <LegalPage title="用户协议" :lead="agreementLead" :sections="agreementSections" />
</template>

<script setup>
import LegalPage from '../../components/LegalPage.vue'
import { agreementLead, agreementSections } from '../../data/legal'
</script>
