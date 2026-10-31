<template>
  <p>This page doesn't render when the awaited request fails.</p>
</template>

<script setup lang="ts">
const route = useRoute()

if (route.query.addon === 'fetch') {
  await useThrowOnErrorFetch('/api/fail', { throwOnError: true })
}
else {
  await useThrowOnErrorAsyncData('throw-on-error-await', () => $fetch('/api/fail'), { throwOnError: true })
}
</script>
