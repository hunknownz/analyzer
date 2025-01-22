<script setup lang="ts">
import type { Donation } from '@/utils/contract'
import { claimDonation, getDonations } from '@/utils/contract'

const config = useRuntimeConfig()
const GITHUB_CLIENT_ID = config.public.GITHUB_CLIENT_ID
const GITHUB_CALLBACK_URL = config.public.GITHUB_CALLBACK_URL

const githubHandle = ref('')
const loading = ref(false)
const donations = ref<Donation[]>([])
const toast = useToast()

onMounted(() => {
  fetchGithubUser()
})

async function fetchGithubUser() {
  try {
    const username = localStorage.getItem('username')
    githubHandle.value = username
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
      <h2 class="text-2xl font-semibold">
        Claim Your Reward
      </h2>

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
    </div>
  </div>
</template>
