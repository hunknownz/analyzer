<script setup lang="ts">
import type { Donation } from '@/utils/contract'
import { tagStream } from '@/utils/tagStream'

const config = useRuntimeConfig()
const GITHUB_CLIENT_ID = config.public.GITHUB_CLIENT_ID
const GITHUB_CALLBACK_URL = config.public.GITHUB_CALLBACK_URL

const githubHandle = ref('')
const loading = ref(false)
const donations = ref<Donation[]>([])
const toast = useToast()
const activeTab = ref('streams')
const avatarUrl = ref('')
const repos = ref<string[]>([])
const receiverAddress = ref('')
const numberRef = ref(null)
let timer = null

const isZeroAddress = computed(() => {
  return !receiverAddress.value || receiverAddress.value === '0x0000000000000000000000000000000000000000'
})

onMounted(() => {
  fetchGithubUser()
  const i = 0.0621600019
  const s = 1741093025190
  const r = (0.01 * 427 / 999) / (1000 * 60 * 60 * 1000)
  timer = setInterval(() => {
    numberRef.value.textContent = (i + ((Date.now() - s) * r)).toFixed(10)
  }, 100)
  if (githubHandle.value) {
    fetchRepos(githubHandle.value)
    getReceiverContractReceiver(githubHandle.value)
  }
})

onUnmounted(() => {
  clearInterval(timer)
})

async function fetchRepos(githubHandle: string) {
  repos.value = await tagStream.getDeveloperRepos(githubHandle)
}

async function onConnect(githubHandle: string, repoId: string) {
  await tagStream.connectToRepo(githubHandle, repoId)
}

async function fetchGithubUser() {
  try {
    const username = localStorage.getItem('username')
    const storedAvatarUrl = localStorage.getItem('avatarUrl')
    githubHandle.value = username
    avatarUrl.value = storedAvatarUrl || ''
    await fetchDonations()
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to fetch GitHub user info', color: 'red' })
  }
}

function loginWithGithub() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=user:email,public_repo,read:org&response_type=token`
  window.location.href = githubAuthUrl
}

async function fetchDonations() {
  if (!githubHandle.value) {
    toast.add({ title: 'Please enter your GitHub handle', color: 'red' })
    return
  }

  loading.value = true
  try {
    donations.value = await getDonations(githubHandle.value)
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to fetch donations', color: 'red' })
  }
  finally {
    loading.value = false
  }
}

async function getReceiverContractReceiver(developerId: string) {
  const address = await tagStream.getReceiverContractReceiver(developerId)
  receiverAddress.value = address
}

async function setReceiver() {
  const jwt = localStorage.getItem('jwt')
  const receiverAddress = await tagStream.getWalletAddress()
  const response = await fetch('http://localhost:5099/api/tag-stream/setReceiver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ receiverAddress }),
  })
  // if success, set receiver address to local storage
  if (response.ok) {
    toast.add({ title: 'Successfully set receiver', color: 'green' })
  }
  else if (response.status === 401) {
    loginWithGithub()
  }
  else {
    toast.add({ title: 'Failed to set receiver', color: 'red' })
  }
}

async function claimStreams() {
  await tagStream.claimRewards(githubHandle.value)
}

async function claim(githubHandle: string, index: number) {
  loading.value = true
  try {
    await claimDonation(githubHandle, index)
    toast.add({ title: 'Successfully claimed!', color: 'green' })
    await fetchDonations()
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to claim donation', color: 'red' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center min-h-screen">
    <div class="w-full max-w-md flex flex-col items-center space-y-12 mt-8">
      <!-- Enhanced tab navigation -->
      <div class="flex rounded-xl p-1.5 w-full max-w-sm backdrop-blur-sm border dark:bg-gray-800/50 dark:border-gray-700 bg-gray-100/50 border-gray-300">
        <button
          class="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative whitespace-nowrap"
          :class="activeTab === 'streams' ? 'text-white bg-black shadow-sm' : 'text-gray-500 hover:text-gray-900'"
          @click="activeTab = 'streams'"
        >
          Claim Your Streams
        </button>
        <button
          class="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative whitespace-nowrap"
          :class="activeTab === 'rewards' ? 'text-white bg-black shadow-sm' : 'text-gray-500 hover:text-gray-900'"
          @click="activeTab = 'rewards'"
        >
          Claim Your Rewards
        </button>
      </div>

      <!-- Rewards tab content -->
      <template v-if="activeTab === 'rewards'">
        <div class="flex flex-col items-center space-y-4 mt-8 mb-2">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="githubHandle"
            class="w-20 h-20 rounded-full"
          >
        </div>

        <!-- 替换原来的输入框为登录按钮 -->
        <div v-if="!githubHandle" class="w-full">
          <UButton
            block
            variant="solid"
            color="gray"
            @click="loginWithGithub"
          >
            <template #leading>
              <UIcon name="i-mdi:github" />
            </template>
            Login with GitHub
          </UButton>
        </div>

        <!-- 显示已登录用户 -->
        <div v-else class="w-full">
          <p class="text-center mb-4">
            Logged in as: <strong>{{ githubHandle }}</strong>
          </p>

          <UButton
            :loading="loading"
            block
            variant="solid"
            @click="fetchDonations"
          >
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" />
            </template>
            Fetch Donations
          </UButton>
        </div>

        <!-- if loading  -->
        <div v-if="loading" class="w-full">
          <div class="flex items-center justify-center h-full">
            <UIcon name="i-eos-icons:loading" class="w-8 h-8 text-gray" />
          </div>
        </div>
        <div v-else-if="donations.length > 0" class="w-full">
          <UTable
            v-if="donations.length"
            :rows="donations"
            :columns="[
              {
                key: 'project',
                label: 'Project',
              },
              {
                key: 'amount',
                label: 'Amount',
              },
              {
                key: 'actions',
                label: 'Actions',
              },
            ]"
          >
            <template #actions-data="{ row }">
              <UButton
                v-if="!row.claimed"
                size="xs"
                color="green"
                @click="claim(githubHandle, row.index)"
              >
                Claim
              </UButton>
              <UButton v-else size="xs" color="gray" disabled>
                Claimed
              </UButton>
            </template>
          </UTable>
        </div>
        <div v-else class="w-full">
          <p class="text-center text-gray-500">
            No donations yet. Keep contributing to your favorite projects!
          </p>
        </div>
      </template>

      <!-- Streams tab content -->
      <template v-else>
        <div class="flex flex-col items-center space-y-4 mt-8 mb-2">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="githubHandle"
            class="w-20 h-20 rounded-full"
          >
        </div>

        <!-- 替换原来的输入框为登录按钮 -->
        <div v-if="!githubHandle" class="w-full">
          <UButton
            block
            variant="solid"
            color="gray"
            @click="loginWithGithub"
          >
            <template #leading>
              <UIcon name="i-mdi:github" />
            </template>
            Login with GitHub
          </UButton>
        </div>

        <div v-else class="w-full">
          <p class="text-center mb-4">
            Logged in as: <strong>{{ githubHandle }}</strong>
          </p>
          <UButton
            v-if="isZeroAddress"
            block
            variant="solid"
            color="green"
            @click="setReceiver"
          >
            <template #leading>
              <UIcon name="i-mdi:water-sync" class="w-5 h-5" />
            </template>
            Bind Wallet
          </UButton>
          <UButton
            v-else
            block
            variant="solid"
            color="green"
            @click="claimStreams"
          >
            Claim Streams
          </UButton>
        </div>

        <div v-if="repos.length > 0">
          <p class="text-center text-gray-500">
            Contributed to {{ repos.length }} repos
          </p>
          <UTable
            :rows="repos.map(repo => ({ repo }))"
            :columns="[
              {
                key: 'repo',
                label: 'Repo',
              },
              {
                key: 'actions',
                label: 'Stream',
              },
            ]"
          >
            <!-- <template #actions-data="{ row }">
              <UButton
                size="xs"
                color="green"
                @click="onConnect(githubHandle, row.repo)"
              >
                Connect
              </UButton>
            </template> -->
            <template #actions-data="{ row }">
              <span style="display: inline-block; min-width: 100px; text-align: right; font-family: monospace;" ref="numberRef" />
            </template>
          </UTable>
        </div>
      </template>
    </div>
  </div>
</template>
