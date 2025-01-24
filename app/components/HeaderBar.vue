<script setup lang="ts">
const { isOpen } = storeToRefs(useSlide())
const { status } = storeToRefs(useWebcontainerStore())

const username = ref('')

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
})

const handleLogout = () => {
  localStorage.removeItem('username')
  localStorage.removeItem('jwt')
  username.value = ''
}

// 修改下拉菜单项配置
const dropdownItems = [
  [
    {
      label: 'Logout',
      icon: 'i-heroicons:arrow-left-on-rectangle',
      click: handleLogout
    }
  ]
]
</script>

<template>
  <header class="bg-background/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800">
    <div class="mx-auto px-4 sm:px-6 flex items-center justify-between font-bold gap-3 h-14">
      <UButton
        v-show="status === 'finish'" icon="i-heroicons:bars-3-20-solid" aria-label="Menu" color="gray"
        variant="ghost" class="md:hidden" @click="isOpen = !isOpen"
      />

      <nuxt-link to="/" class="text-xl font-bold text-gray-900 dark:text-gray-100">
        DeepFlow
      </nuxt-link>

      <div>
        <nuxt-link to="/claim">
          <UButton icon="i-mdi:gift" color="gray" variant="ghost" aria-label="领取奖励" class="animate-shine" />
        </nuxt-link>

        <nuxt-link to="https://github.com/hunknownz/analyzer" target="_blank">
          <UButton icon="i-mdi:github" color="gray" variant="ghost" aria-label="GitHub" />
        </nuxt-link>

        <DarkToggle />
        
        <UDropdown v-if="username" :items="dropdownItems">
          <UButton
            color="gray"
            variant="ghost"
            :icon="'i-mdi:account'"
            :label="username"
          />
        </UDropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-shine {
  animation: shine 3.5s infinite;
}

@keyframes shine {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.4;
    transform: scale(1.35);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.4;
    transform: scale(1.35);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
