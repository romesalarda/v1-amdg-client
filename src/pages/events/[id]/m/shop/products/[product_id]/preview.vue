<template>
</template> 
<script setup lang="ts">

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})
</script>