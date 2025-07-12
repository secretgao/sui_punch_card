// 环境变量配置
export const ENVIRONMENT = {
  // Sui网络配置
  SUI_NETWORK: import.meta.env.VITE_SUI_NETWORK || "testnet",
  
  // 应用配置
  APP_NAME: import.meta.env.VITE_APP_NAME || "打卡系统",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  
  // 合约配置
  CONTRACT_PACKAGE_ID: import.meta.env.VITE_CONTRACT_PACKAGE_ID || "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONTRACT_CONFIG_ID: import.meta.env.VITE_CONTRACT_CONFIG_ID || "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  CONTRACT_TABLE_ID: import.meta.env.VITE_CONTRACT_TABLE_ID || "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
  
  // 开发模式
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Sui网络URL映射
export const SUI_NETWORK_URLS = {
  devnet: "https://fullnode.devnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
} as const;

// 获取当前网络URL
export const getSuiNetworkUrl = () => {
  const network = ENVIRONMENT.SUI_NETWORK;
  return SUI_NETWORK_URLS[network as keyof typeof SUI_NETWORK_URLS] || SUI_NETWORK_URLS.testnet;
};

// 导出当前网络URL
export const CURRENT_SUI_NETWORK_URL = getSuiNetworkUrl(); 