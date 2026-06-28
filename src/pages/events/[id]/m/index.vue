<template>
  <div />
</template>
<script setup lang="ts">
// Redirect to dashboard by default
const route = useRoute()

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'GENERAL',
    action: 'read',
    deniedRedirect: '/403',
  },
})

// Redirect if at exact /m/ path
if (route.path === `/events/${route.params.id}/m` || route.path === `/events/${route.params.id}/m/`) {
  navigateTo(`/events/${route.params.id}/m/dashboard`)
}
</script>