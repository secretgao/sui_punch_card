// 环境配置
export const ENV_CONFIG = {
  // Sui网络配置
  SUI_NETWORKS: {
    DEVNET: "https://fullnode.devnet.sui.io:443",
    TESTNET: "https://fullnode.testnet.sui.io:443",
    MAINNET: "https://fullnode.mainnet.sui.io:443",
  },
  
  // 默认网络
  DEFAULT_NETWORK: "testnet" as const,
  
  // 获取当前网络URL
  getCurrentNetworkUrl: () => {
    const network = process.env.VITE_SUI_NETWORK || ENV_CONFIG.DEFAULT_NETWORK;
    return ENV_CONFIG.SUI_NETWORKS[network.toUpperCase() as keyof typeof ENV_CONFIG.SUI_NETWORKS] || ENV_CONFIG.SUI_NETWORKS.TESTNET;
  },
  
  // 获取网络名称
  getCurrentNetwork: () => {
    return process.env.VITE_SUI_NETWORK || ENV_CONFIG.DEFAULT_NETWORK;
  },
} as const;

// 导出网络URL
export const SUI_NETWORK_URL = ENV_CONFIG.getCurrentNetworkUrl();
export const SUI_NETWORK_NAME = ENV_CONFIG.getCurrentNetwork(); 