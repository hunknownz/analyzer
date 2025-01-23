import { ethers } from "ethers";

const abi = [
  "function giveUnitsToRepoContributors(string calldata repoId, string[] calldata developerId, uint128[] calldata units) external",
  "function flowDistributeToRepo(string calldata repoId, uint256 amount, uint256 duration) external",
  "function owner() external view returns (address)",
  "function acceptedToken() external view returns (address)",
  "function underlyingToken() external view returns (address)",
  "function getDeveloperRepos(string calldata developerId) external view returns (string[] memory)",
];

const erc20Abi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

// Replace with your deployed contract address
const tagStreamAddress = "0xAA5026f06ed70737b3aBa5843C84f191f4def354";
const provider = new ethers.JsonRpcProvider(
  "https://https://sepolia.optimism.io"
);

async function getWalletProvider() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      if (window.ethereum.chainId !== "0xAA37DC") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA37DC" }],
        });
      }
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await walletProvider.getSigner();
      return { provider: walletProvider, signer };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }
  throw new Error("Please install MetaMask!");
}

export async function giveUnitsToRepoContributors(
  repoId: string,
  developerIds: string[],
  units: number[]
) {
  const { signer } = await getWalletProvider();
  const tagStream = new ethers.Contract(tagStreamAddress, abi, signer);

  // Convert numbers to uint128 compatible format
  const unitsFormatted = units.map((unit) => ethers.getBigInt(unit));

  return tagStream.giveUnitsToRepoContributors(
    repoId,
    developerIds,
    unitsFormatted,
    {
      gasLimit: 2000000,
    }
  );
}

export async function flowDistributeToRepo(
  repoId: string,
  amount: string, // in ETH
  durationInSeconds: number
) {
  const { signer } = await getWalletProvider();
  const tagStream = new ethers.Contract(tagStreamAddress, abi, signer);

  // First get the accepted token address
  const underlyingTokenAddress = await tagStream.underlyingToken();
  const underlyingToken = new ethers.Contract(
    underlyingTokenAddress,
    erc20Abi,
    signer
  );

  // Approve spending
  const amountInWei = ethers.parseEther(amount);
  // await underlyingToken.approve(tagStreamAddress, amountInWei * 1000n);

  // Then create the flow distribution
  return tagStream.flowDistributeToRepo(repoId, amountInWei, durationInSeconds);
}

export async function getDeveloperRepos(
  developerId: string
): Promise<string[]> {
  const tagStream = new ethers.Contract(tagStreamAddress, abi, provider);
  try {
    return await tagStream.getDeveloperRepos(developerId);
  } catch (error) {
    console.error("Error fetching developer repos:", error);
    return [];
  }
}
