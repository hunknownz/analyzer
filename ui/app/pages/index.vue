<script setup lang="ts">
const pkg = ref('')

const randomPkgs = useState('randomPkgs', () => randomPkg(5))

interface Project {
  repo_name: string
  current_period_growth: number
  past_period_growth: number
  growth_pop: number
  total: number
  current_period_rank: number
  past_period_rank: number
}

const projects = ref<Project[]>([])
const loading = ref(false)

async function fetchTopProjects() {
  loading.value = true
  try {
    const response = await fetch('https://api.ossinsight.io/v1/collections/10031/ranking_by_stars')
    const data = await response.json()
    projects.value = data.data.rows.slice(0, 10)
  }
  catch (error) {
    console.error('Failed to fetch projects:', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTopProjects()
})

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if (pkg.value) {
        navigateTo(`/${pkg.value}`)
      }
    },
  },
})

useHead({
  title: 'Analyzer3 | Visualize the dependency graph of web3 opensource projects.',
})
</script>

<template>
  <div>
    <h2 class="font-bold text-xl text-center pt-7 pb-2">
      Visualize the dependency graph of <span class="font-bold">web3 opensource projects</span>.
    </h2>

    <div class="w-[22rem] sm:w-[26rem] gap-2 mx-auto mt-[1rem] flex flex-col items-center">
      <div class="flex w-full gap-2">
        <UInput
          v-model="pkg"
          icon="i-mdi:npm-variant-outline"
          size="lg"
          autofocus
          placeholder="projects name"
          class="flex-1"
        />

        <UButton
          :disabled="!pkg"
          :to="`/${pkg}`"
          aria-label="search"
          icon="i-heroicons-magnifying-glass"
        />
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-2 mt-[.8rem] mx-auto w-[22rem] sm:w-[26rem]">
      <UButton
        v-for="pkg in randomPkgs"
        :key="pkg"
        :to="`/${pkg}`"
        color="gray"
        :label="pkg"
        size="xs"
      />
    </div>

    <div class="mt-8 max-w-4xl mx-auto">
      <h2 class="font-bold text-xl text-center pb-4">
        Web3 Projects Trending in the last 30 days
      </h2>

      <UTable
        :loading="loading"
        :rows="projects"
        :columns="[
          {
            key: 'repo_name',
            label: 'Name',
          },
          {
            key: 'current_period_growth',
            label: 'Current Growth',
          },
          {
            key: 'growth_pop',
            label: 'Growth %',
          },
          {
            key: 'total',
            label: 'Total Stars',
          },
          {
            key: 'rank',
            label: 'Rank Change',
          },
        ]"
      >
        <template #repo_name-data="{ row }">
          <a
            :href="`https://github.com/${row.repo_name}`"
            target="_blank"
            class="text-blue-500 hover:text-blue-700"
          >
            {{ row.repo_name.split('/')[1] }}
          </a>
        </template>

        <template #current_period_growth-data="{ row }">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-star" class="text-yellow-500" />
            {{ row.current_period_growth.toLocaleString() }}
          </div>
        </template>

        <template #growth_pop-data="{ row }">
          <div :class="row.growth_pop > 0 ? 'text-green-500' : 'text-red-500'">
            {{ row.growth_pop > 0 ? '+' : '' }}{{ row.growth_pop }}%
          </div>
        </template>

        <template #total-data="{ row }">
          {{ row.total.toLocaleString() }}
        </template>

        <template #rank-data="{ row }">
          <div
            :class="row.rank_pop > 0 ? 'text-red-500' : row.rank_pop < 0 ? 'text-green-500' : 'text-gray-500'"
          >
            {{ row.rank_pop > 0 ? '↓' : row.rank_pop < 0 ? '↑' : '=' }}
            {{ Math.abs(row.rank_pop) || '-' }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <UButton
            :to="`/${row.repo_name.split('/')[1]}`"
            size="xs"
            color="gray"
            variant="soft"
          >
            Analyze
          </UButton>
        </template>
      </UTable>
    </div>
  </div>
</template>
