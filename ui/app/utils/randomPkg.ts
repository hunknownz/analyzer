export function randomPkg(count: number) {
  const pkgs = [
    'youbet-sdk',
    'web3-core',
    'ethers',
    '@rainbow-me/rainbowkit',
    'wagmi',
    'viem',
  ]

  return pkgs.sort(() => Math.random() - 0.5).slice(0, count)
}
