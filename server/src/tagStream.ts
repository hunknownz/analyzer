import { ethers } from 'ethers'

export class TagStream {
  private provider: ethers.Provider
  private signer?: ethers.Signer
  private contract: ethers.Contract

  private static abi = [
    'function giveUnitsToRepoContributors(string calldata repoId, string[] calldata developerId, uint128[] calldata units) external',
    'function flowDistributeToRepo(string calldata repoId, uint256 amount, uint256 duration) external',
    'function owner() external view returns (address)',
    'function acceptedToken() external view returns (address)',
    'function underlyingToken() external view returns (address)',
    'function getDeveloperRepos(string calldata developerId) external view returns (string[] memory)',
    'function getReceiverContract(string memory developerId) public view returns (address)',
    'function repoPools(string calldata repoId) external view returns (address)',
  ]

  private static erc20Abi = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
  ]

  private static address = '0xC67471Ba6D2e1f9237C28ee64F280179A0559E2c'

  private static receiverAbi = [
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

  constructor(privateKeyOrProvider?: string) {
    if (typeof privateKeyOrProvider === 'string' && privateKeyOrProvider.length > 0) {
      // Server-side with private key
      this.provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io')
      this.signer = new ethers.Wallet(privateKeyOrProvider, this.provider)
      this.contract = new ethers.Contract(TagStream.address, TagStream.abi, this.signer)
    }
    else {
      // Browser provider
      this.provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io')
      this.contract = new ethers.Contract(TagStream.address, TagStream.abi, this.provider)
    }
  }

  async connectWallet() {
    throw new Error('Please install MetaMask!')
  }

  async getWalletAddress() {
    if (!this.signer)
      await this.connectWallet()
    return await this.signer!.getAddress()
  }

  async giveUnitsToRepoContributors(
    repoId: string,
    developerIds: string[],
    units: number[],
  ) {
    if (!this.signer)
      await this.connectWallet()
    return this.contract.giveUnitsToRepoContributors(repoId, developerIds, units)
  }

  async flowDistributeToRepo(
    repoId: string,
    amount: string, // in ETH
    durationInSeconds: number,
  ) {
    if (!this.signer)
      await this.connectWallet()

    // First get the accepted token address
    const underlyingTokenAddress = await this.contract.underlyingToken()
    const underlyingToken = new ethers.Contract(
      underlyingTokenAddress,
      TagStream.erc20Abi,
      this.signer,
    )

    // Approve spending
    const amountInWei = ethers.parseEther(amount)
    const address = await this.signer!.getAddress()
    if (await underlyingToken.allowance(address, TagStream.address) < amountInWei) {
      await underlyingToken.approve(TagStream.address, amountInWei * 10n)
    }

    // Then create the flow distribution
    return this.contract.flowDistributeToRepo(repoId, amountInWei, durationInSeconds)
  }

  async getDeveloperRepos(developerId: string): Promise<string[]> {
    try {
      return await this.contract.getDeveloperRepos(developerId)
    }
    catch (error) {
      console.error('Error fetching developer repos:', error)
      return []
    }
  }

  async getReceiverContract(developerId: string): Promise<string> {
    return await this.contract.getReceiverContract(developerId)
  }

  async repoPools(repoId: string): Promise<string> {
    return await this.contract.repoPools(repoId)
  }

  // Receiver Contract 相关方法
  async setReceiverForContract(developerId: string, receiverAddress: string) {
    if (!this.signer)
      await this.connectWallet()
    const receiverContract = await this.getReceiverContract(developerId)
    const receiver = new ethers.Contract(receiverContract, TagStream.receiverAbi, this.signer)
    return receiver.setReceiver(receiverAddress)
  }

  async connectToRepo(developerId: string, repoId: string) {
    if (!this.signer)
      await this.connectWallet()
    const receiverContract = await this.getReceiverContract(developerId)
    const receiver = new ethers.Contract(receiverContract, TagStream.receiverAbi, this.signer)
    return receiver.connectToRepo(repoId)
  }

  async claimRewards(developerId: string) {
    if (!this.signer)
      await this.connectWallet()
    const receiverContract = await this.getReceiverContract(developerId)
    const receiver = new ethers.Contract(receiverContract, TagStream.receiverAbi, this.signer)
    return receiver.claimRewards()
  }

  // Helper method to get receiver contract instance
  getReceiverContractInstance(receiverAddress: string) {
    const provider = this.signer || this.provider
    return new ethers.Contract(receiverAddress, TagStream.receiverAbi, provider)
  }
}

export const tagStream = new TagStream()
