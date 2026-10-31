<template>
  <div>
    <NuxtLink to="/">
      Back
    </NuxtLink>

    <h1>Throw on error</h1>

    <section
      v-for="addon in addons"
      :key="addon.name"
    >
      <h2>{{ addon.name }}</h2>

      <button @click="execute(addon)">
        execute()
      </button>

      <button @click="execute(addon, { throwOnError: false })">
        execute({ throwOnError: false })
      </button>

      <p>{{ addon.name }} outcome: {{ outcomes[addon.name] }}</p>
    </section>

    <NuxtLink to="/throw-on-error/await">
      Await a failing request
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const addons = [
  {
    name: 'throwOnErrorUseAsyncDataAddon',
    ...useThrowOnErrorAsyncData('throw-on-error', () => $fetch('/api/fail'), {
      immediate: false,
      throwOnError: true,
    }),
  },
  {
    name: 'throwOnErrorUseFetchAddon',
    ...useThrowOnErrorFetch('/api/fail', {
      immediate: false,
      throwOnError: true,
    }),
  },
]

const outcomes = ref<Record<string, string>>({})

async function execute(addon: typeof addons[number], options?: { throwOnError: boolean }) {
  try {
    await addon.execute(options)

    outcomes.value[addon.name] = `resolved, status ${addon.status.value}`
  }
  catch {
    outcomes.value[addon.name] = `rejected, status ${addon.status.value}`
  }
}
</script>
