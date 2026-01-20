<template>
  <div />
</template>
<script setup lang="ts">
// Redirect to dashboard by default
const route = useRoute()

definePageMeta({
  layout: false,
})

// Redirect if at exact /m/ path
if (route.path === `/events/${route.params.id}/m` || route.path === `/events/${route.params.id}/m/`) {
  navigateTo(`/events/${route.params.id}/m/dashboard`)
}
</script>