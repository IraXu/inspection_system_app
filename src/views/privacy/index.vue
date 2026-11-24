<template>
  <LegalPage title="隐私政策" :lead="privacyLead" :sections="privacySections" />
</template>

<script setup>
import LegalPage from '../../components/LegalPage.vue'
import { privacyLead, privacySections } from '../../data/legal'
</script>
