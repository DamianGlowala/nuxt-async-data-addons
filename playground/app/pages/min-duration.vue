<template>
  <div>
    <NuxtLink to="/">
      Back
    </NuxtLink>

    <h1>Minimum duration</h1>

    <button @click="refreshAll">
      Refresh
    </button>

    <p>
      useAsyncData without addon: {{ plain.status.value }} ({{ plain.data.value }})
    </p>

    <p>
      minDurationUseAsyncDataAddon (1000ms): {{ asyncData.status.value }} ({{ asyncData.data.value }})
    </p>

    <p>
      minDurationUseFetchAddon (1000ms): {{ fetched.status.value }} ({{ fetched.data.value }})
    </p>
  </div>
</template>

<script setup lang="ts">
const plain = await useAsyncData('plain', () => $fetch('/api/time'))

const asyncData = await useMinDurationAsyncData(
  'min-duration',
  () => $fetch('/api/time'),
  { minDuration: 1000 },
)

const fetched = await useMinDurationFetch(
  '/api/time',
  { minDuration: 1000 },
)

function refreshAll() {
  plain.refresh()
  asyncData.refresh()
  fetched.refresh()
}
</script>
