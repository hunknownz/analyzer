import { ethers } from 'ethers'

const abi = [
  'function giveUnitsToRepoContributors(string calldata repoId, string[] calldata developerId, uint128[] calldata units) external',
  'function flowDistributeToRepo(string calldata repoId, uint256 amount, uint256 duration) external',
  'function owner() external view returns (address)',
  'function acceptedToken() external view returns (address)',
  'function underlyingToken() external view returns (address)',
  'function getDeveloperRepos(string calldata developerId) external view returns (string[] memory)',
  'function getReceiverContract(string memory developerId) public view returns (address)',
  'function repoPools(string calldata repoId) external view returns (address)',
]

const erc20Abi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
]

const receiverAbi = [
  // View functions
  'function acceptedToken() external view returns (address)',
  'function tagStream() external view returns (address)',
  'function superAdmin() external view returns (address)',
  'function receiver() external view returns (address)',

  // State modifying functions
  'function setReceiver(address _receiver) external',
  'function connectToRepo(string memory repo) external',
  'function claimRewards() external',
]

// Replace with your deployed contract address
const tagStreamAddress = '0x8a6fd8fAeae6128661351EFfD4464845f624C8A7'
const provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io')

async function getWalletProvider() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (window.ethereum.chainId !== '0xAA37DC') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xAA37DC' }],
        })
      }
      const walletProvider = new ethers.BrowserProvider(window.ethereum)
      const signer = await walletProvider.getSigner()
      return { provider: walletProvider, signer }
    }
    catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }
  throw new Error('Please install MetaMask!')
}

export async function giveUnitsToRepoContributors(
  repoId: string,
  developerIds: string[],
  units: number[],
) {
  const { signer } = await getWalletProvider()
  const tagStream = new ethers.Contract(tagStreamAddress, abi, signer)
  return tagStream.giveUnitsToRepoContributors(repoId, developerIds, units)
}

export async function flowDistributeToRepo(
  repoId: string,
  amount: string, // in ETH
  durationInSeconds: number,
) {
  const { signer } = await getWalletProvider()
  const tagStream = new ethers.Contract(tagStreamAddress, abi, signer)

  // First get the accepted token address
  const underlyingTokenAddress = await tagStream.underlyingToken()
  const underlyingToken = new ethers.Contract(
    underlyingTokenAddress,
    erc20Abi,
    signer,
  )

  // Approve spending
  const amountInWei = ethers.parseEther(amount)
  // if approved amount is less than amountInWei, approve the amountInWei
  if (await underlyingToken.allowance(signer.getAddress(), tagStreamAddress) < amountInWei) {
    await underlyingToken.approve(tagStreamAddress, amountInWei * 10n)
  }

  // Then create the flow distribution
  return tagStream.flowDistributeToRepo(repoId, amountInWei, durationInSeconds)
}

export async function getDeveloperRepos(
  developerId: string,
): Promise<string[]> {
  const tagStream = new ethers.Contract(tagStreamAddress, abi, provider)
  try {
    return await tagStream.getDeveloperRepos(developerId)
  }
  catch (error) {
    console.error('Error fetching developer repos:', error)
    return []
  }
}

export async function connectToRepo(developerId: string, repoId: string) {
  const { signer } = await getWalletProvider()
  const tagStream = new ethers.Contract(tagStreamAddress, abi, provider)
  const receiverAddress = await tagStream.getReceiverContract(developerId)
  console.log(receiverAddress)
  const receiver = new ethers.Contract(receiverAddress, receiverAbi, signer)
  return receiver.connectToRepo(repoId)
}
