<script setup lang="ts">
import type { PkgMeta } from '~~/types/pkg'
import { tagStream } from '@/utils/tagStream'
import { marked } from 'marked'
import { Octokit } from 'octokit'

const { meta, maxLevel } = defineProps<{
  meta: PkgMeta | undefined
  maxLevel: number
}>()

const emit = defineEmits<{
  (event: 'save-image'): void
}>()

const { name, pkg } = usePkgName()
const { webcontainerInstance } = useWebcontainerStore()
const network: Network | null = null

const visData = await webcontainerInstance?.fs.readFile('./visData.json', 'utf-8')
const parsedData = JSON.parse(visData!) as Graph

const githubUrl = computed(() => {
  if (!meta)
    // TODO: eliza has no github url
    if (name === '@elizaos/core') {
      return 'https://github.com/elizaOS/eliza'
    }
    return undefined
  if (typeof meta.repository === 'string')
    return `https://github.com/${meta.repository}`
  return meta?.repository?.url?.replace('git+https://github.com/', 'https://github.com/').replace('git://github.com', 'https://github.com')
})

const contributors = ref([])

watch(githubUrl, async (url: string) => {
  if (!url)
    return

  const hostname = window.location.hostname
  try {
    const response = await fetch(`http://${hostname}:5099/api/github/contributors?githubUrl=${encodeURIComponent(url)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const { success, data } = await response.json()
    if (success) {
      contributors.value = data
    }
  }
  catch (error) {
    console.error('Failed to fetch contributors:', error)
    contributors.value = []
  }
}, { immediate: true })

const fundings = computed(() => {
  if (!meta)
    return undefined

  if (typeof meta.funding === 'string') {
    try {
      const url = new URL(meta.funding)
      return [{ type: url.hostname.replace('www.', ''), url: meta.funding }]
    }
    catch {
      return [
        {
          type: 'funding',
          url: meta.funding,
        },
      ]
    }
  }

  if (typeof meta.funding === 'object' && !Array.isArray(meta.funding))
    return [meta.funding]

  return meta.funding
})

const author = computed(() => {
  if (!meta)
    return undefined
  if (typeof meta.author === 'string')
    return meta.author
  return meta.author?.name
})

const dependenciesCount = computed(() => Object.keys(meta?.dependencies || {}).length)

const level = defineModel<number>('level')
const { isOpen } = storeToRefs(useSlide())

const showStreamModal = ref(false)
const streamAmount = ref('0.01')
const streamHours = ref(10)

async function donation() {
  if (!contributors.value || !contributors.value.length)
    return
  tipBatch(contributors.value.slice(0, 10).map((contributor: any) => contributor.login), meta.name)
}

async function createPool() {
  if (!contributors.value || !contributors.value.length)
    return
  tagStream.giveUnitsToRepoContributors(meta.name, contributors.value.slice(0, 10).map((contributor: any) => contributor.login), contributors.value.slice(0, 10).map((contributor: any) => contributor.contributions))
}

async function startStream() {
  if (!contributors.value || !contributors.value.length)
    return
  showStreamModal.value = true
}

async function confirmStream() {
  try {
    await tagStream.flowDistributeToRepo(meta.name, streamAmount.value, streamHours.value * 3600)
    showStreamModal.value = false
  }
  catch (error) {
    console.error('Failed to start stream:', error)
  }
}

const analysisResult = ref<any>(null)
const isAnalyzing = ref(false)
const currentLineIndex = ref(0)
const analysisLines = ref<string[]>([])
const displayedText = ref<string[]>([])
const currentText = ref('')
let currentChar = 0

function displayNextChar() {
  if (!analysisLines.value.length)
    return

  const currentLine = analysisLines.value[currentLineIndex.value] || ''

  if (currentChar < currentLine.length) {
    currentText.value += currentLine[currentChar]
    currentChar++
    setTimeout(displayNextChar, 10)
  }
  else {
    displayedText.value.push(currentText.value)
    currentText.value = ''
    currentChar = 0

    if (currentLineIndex.value < analysisLines.value.length - 1) {
      currentLineIndex.value++
      setTimeout(displayNextChar, 20)
    }
  }
}

async function analyzePackage() {
  if (!githubUrl.value) {
    alert('No GitHub URL available for this package')
    return
  }

  isAnalyzing.value = true
  analysisResult.value = null

  try {
    const hostname = window.location.hostname
    const response = await fetch(`http://${hostname}:5099/api/ai/analyze?githubUrl=${encodeURIComponent(githubUrl.value)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const { success, data } = await response.json()
    if (success) {
      analysisResult.value = data
      analysisLines.value = data.split('\n').filter(line => line.trim())
      currentLineIndex.value = 0
      displayedText.value = []
      currentText.value = ''
      currentChar = 0
      displayNextChar()
    }
    else {
      throw new Error('Analysis failed')
    }
  }
  catch (error) {
    console.error('Analysis failed:', error)
    alert('Failed to analyze the package')
  }
  finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <div v-if="meta" class="flex flex-col justify-between h-[calc(100vh-6rem)] gap-4">
    <div class="flex flex-col gap-2 overflow-y-auto">
      <div class="flex justify-between w-full">
        <p class="text-xl font-bold">
          {{ meta.name.charAt(0).toUpperCase() + meta.name.slice(1) }}
        </p>

        <UButton
          color="gray" variant="ghost" aria-label="Close" size="sm" icon="i-heroicons-x-mark-20-solid"
          class="md:hidden block" @click="isOpen = false"
        />
      </div>

      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ meta.description }}
      </p>

      <div class="flex flex-wrap gap-2">
        <UButton
          :to="`https://www.npmjs.com/package/${meta.name}`" target="_blank" size="xs" color="gray"
          :ui="{ padding: { xs: 'py-1' } }"
        >
          <UIcon name="i-mdi:npm-variant-outline" />
          <span>
            v{{ meta.version }}
          </span>
        </UButton>

        <UButton
          v-if="meta.homepage" :to="meta.homepage" target="_blank" size="xs" color="gray"
          :ui="{ padding: { xs: 'py-1' } }"
        >
          <UIcon name="i-heroicons-globe-alt" />
          <span>homepage</span>
        </UButton>

        <UButton
          v-if="githubUrl" color="gray" :to="githubUrl" target="_blank" size="xs"
          :ui="{ padding: { xs: 'py-1' } }"
        >
          <UIcon name="i-mdi:github" />
          <span>GitHub</span>
        </UButton>

        <UBadge v-show="meta.license" color="gray">
          <UIcon name="i-lineicons:license" />
          <span class="ml-1">{{ meta.license }}</span>
        </UBadge>
      </div>

      <p v-show="author" class="text-xs text-gray-500 dark:text-gray-400">
        Made by <span class="font-semibold">{{ author }}</span>
      </p>

      <UDivider />

      <p v-show="meta.keywords?.length" class="text-sm font-semibold text-gray-500 dark:text-gray-400">
        Keywords ({{ meta.keywords?.length || 0 }})
      </p>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="keyword in meta.keywords" :key="keyword" :to="`https://www.npmjs.com/search?q=${keyword}`"
          target="_blank" size="xs" color="gray" class="rounded-full" :ui="{ padding: { xs: 'py-1' } }"
        >
          {{ keyword }}
        </UButton>
      </div>

      <p v-show="dependenciesCount > 0" class="text-sm font-semibold text-gray-500 dark:text-gray-400">
        Dependencies ({{ dependenciesCount }})
      </p>

      <p v-show="dependenciesCount === 0" class="text-sm font-semibold text-gray-500 dark:text-gray-400">
        🎉 Zero dependencies 🎉
      </p>

      <div class="flex flex-wrap items-start gap-2 overflow-y-auto">
        <UButton
          v-for="(_, key) in meta.dependencies" :key="key" :to="`/${key}`" size="xs" color="gray"
          :ui="{ padding: { xs: 'py-1' } }"
        >
          {{ key }}
        </UButton>
      </div>

      <div v-if="contributors.length" class="mt-4">
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">
          PMC Contributors ({{ contributors.length }})
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <UBadge
            v-for="contributor in contributors"
            :key="contributor"
            size="xs" color="gray"
            :ui="{ padding: { xs: 'py-1' } }"
          >
            {{ contributor.login }}
          </UBadge>
        </div>
      </div>

      <template v-if="fundings">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Funding ({{ fundings?.length || 0 }})
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="funding in fundings" :key="funding.url" :to="funding.url" target="_blank" size="xs"
            color="gray" :ui="{ padding: { xs: 'py-1' } }"
          >
            {{ funding.type }}
          </UButton>
        </div>
      </template>

      <div class="mt-2">
        <UButton color="purple" size="sm" target="_blank" class="w-full flex items-center justify-center" @click="createPool">
          <UIcon name="i-mdi:charity" class="mr-2" />
          Create Pool
        </UButton>
      </div>
      <div class="mt-2">
        <UButton color="green" size="sm" target="_blank" class="w-full flex items-center justify-center" @click="startStream">
          <UIcon name="i-mdi:charity" class="mr-2" />
          Start Stream
        </UButton>
      </div>
      <!-- <div class="mt-2">
        <UButton color="green" size="sm" target="_blank" class="w-full flex items-center justify-center" @click="donation">
          <UIcon name="i-mdi:charity" class="mr-2" />
          Donate
        </UButton>
      </div> -->
      <div class="mt-2 space-y-4">
        <UButton
          color="blue"
          size="sm"
          class="w-full flex items-center justify-center"
          :loading="isAnalyzing"
          :disabled="isAnalyzing"
          @click="analyzePackage"
        >
          <UIcon name="i-mdi:magic" class="mr-2" />
          {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
        </UButton>

        <!-- Analysis Results -->
        <Transition name="expand">
          <div v-if="analysisResult" class="space-y-2">
            <UDivider />
            <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Analysis Results
            </p>
            <div class="markdown-body bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              <template v-for="(line, index) in displayedText" :key="index">
                <div v-html="marked(line)" />
              </template>
              <div v-html="marked(currentText)" /><span class="animate-pulse">|</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="flex flex-col w-full gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Deep level ({{ `${level}/${maxLevel}` }})</span>
        <UTooltip text="The deepest level of dependency shown in the graph" :popper="{ placement: 'top' }">
          <UIcon name="i-radix-icons:question-mark-circled" class="text-gray-500 dark:text-gray-400" />
        </UTooltip>
      </div>

      <URange v-model="level" class="flex-1" size="sm" :min="0" :max="maxLevel" :disabled="maxLevel === 0" />

      <div class="flex justify-between">
        <UButton
          icon="i-radix-icons:image" size="sm" color="gray" variant="solid" label="Save" class="mr-3"
          :trailing="false" @click="emit('save-image')"
        />
      </div>
    </div>
  </div>

  <UModal v-model="showStreamModal">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6">
            Configure Stream
          </h3>
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Amount (MTK)">
          <UInput
            v-model="streamAmount"
            placeholder="Enter amount in ETH"
          />
        </UFormGroup>

        <UFormGroup label="Duration (Hours)">
          <UInput
            v-model="streamHours"
            type="number"
            min="1"
            placeholder="Enter duration in hours"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-4">
          <UButton
            color="gray"
            variant="soft"
            @click="showStreamModal = false"
          >
            Cancel
          </UButton>
          <UButton
            color="green"
            @click="confirmStream"
          >
            Start Stream
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>

<style>
.markdown-body {
  @apply prose dark:prose-invert max-w-none;
}
</style>
