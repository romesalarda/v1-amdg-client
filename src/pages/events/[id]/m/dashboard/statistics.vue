<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)

await navigateTo(`/events/${id.value}/m/dashboard#statistics`, { replace: true })
</script>
