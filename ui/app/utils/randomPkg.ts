export function randomPkg(count: number) {
  const pkgs = [
    "youbet-sdk",
    "ethers",
    "wagmi",
    "viem",
    "@elizaos/core",
  ];

  return pkgs.sort(() => Math.random() - 0.5).slice(0, count);
}
