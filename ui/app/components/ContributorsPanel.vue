<script setup lang="ts">
const isOpen = ref(false)
const contributors = ref([])
const loading = ref(false)
const currentRepo = ref('')

// 接收 githubUrl 的更新
const updateContributors = async (githubUrl: string) => {
  if (!githubUrl) return
  
  loading.value = true
  currentRepo.value = githubUrl.split('/').slice(-2).join('/')
  
  try {
    const hostname = window.location.hostname
    const response = await fetch(`http://${hostname}:5099/api/github/contributors?githubUrl=${encodeURIComponent(githubUrl)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const { success, data } = await response.json()
    if (success) {
      contributors.value = data
    }
  } catch (error) {
    console.error('Failed to fetch contributors:', error)
    contributors.value = []
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  updateContributors,
})
</script>

<template>
  <div class="relative">
    <!-- 悬浮按钮 -->
    <UButton
      :icon="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-user-group'"
      color="gray"
      variant="soft"
      class="fixed right-4 top-20 z-40"
      @click="isOpen = !isOpen"
    />

    <!-- 侧边栏 -->
    <div
      class="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 z-30"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="p-4 h-full overflow-auto mt-16">
        <div v-if="currentRepo" class="mb-4">
          <h3 class="text-lg font-semibold">
            {{ currentRepo }}
          </h3>
          <p class="text-sm text-gray-500">
            Top Contributors
          </p>
        </div>

        <div v-if="loading" class="flex justify-center items-center h-32">
          <UIcon name="i-eos-icons:loading" class="w-8 h-8 text-gray" />
        </div>

        <div v-else-if="contributors.length" class="space-y-4">
          <div
            v-for="(contributor, index) in contributors"
            :key="contributor.login"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <span class="text-lg font-semibold text-gray-500 w-6">
              #{{ index + 1 }}
            </span>
            <img
              :src="contributor.avatar_url"
              :alt="contributor.login"
              class="w-10 h-10 rounded-full"
            >
            <div>
              <a
                :href="`https://github.com/${contributor.login}`"
                target="_blank"
                class="text-sm font-medium hover:text-primary"
              >
                {{ contributor.login }}
              </a>
              <p class="text-xs text-gray-500">
                rating: {{ contributor.contributions }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 mt-8">
          No contributors found
        </div>
      </div>
    </div>
  </div>
</template> 