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

    <p>
      useAsyncData with minDuration: 0: {{ asyncDataOff.status.value }} ({{ asyncDataOff.data.value }})
    </p>

    <p>
      useFetch with minDuration: 0: {{ fetchedOff.status.value }} ({{ fetchedOff.data.value }})
    </p>
  </div>
</template>

<script setup lang="ts">
const plain = await useAsyncData('plain', () => $fetch('/api/time'))

const asyncData = await useMinDurationAsyncData('min-duration', () => $fetch('/api/time'))

const fetched = await useMinDurationFetch('/api/time')

const asyncDataOff = await useMinDurationAsyncData(
  'min-duration-off',
  () => $fetch('/api/time'),
  { minDuration: 0 },
)

const fetchedOff = await useMinDurationFetch(
  '/api/time',
  { key: 'min-duration-fetch-off', minDuration: 0 },
)

function refreshAll() {
  plain.refresh()
  asyncData.refresh()
  fetched.refresh()
  asyncDataOff.refresh()
  fetchedOff.refresh()
}
</script>
