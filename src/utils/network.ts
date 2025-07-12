import { ENVIRONMENT, SUI_NETWORK_URLS, getSuiNetworkUrl } from "../config/environment";

// 网络配置工具
export const NetworkUtils = {
  // 获取当前网络名称
  getCurrentNetwork: () => ENVIRONMENT.SUI_NETWORK,
  
  // 获取当前网络URL
  getCurrentNetworkUrl: () => getSuiNetworkUrl(),
  
  // 获取所有可用网络
  getAvailableNetworks: () => Object.keys(SUI_NETWORK_URLS),
  
  // 检查是否是开发网络
  isDevnet: () => ENVIRONMENT.SUI_NETWORK === "devnet",
  
  // 检查是否是测试网络
  isTestnet: () => ENVIRONMENT.SUI_NETWORK === "testnet",
  
  // 检查是否是主网络
  isMainnet: () => ENVIRONMENT.SUI_NETWORK === "mainnet",
  
  // 获取网络显示名称
  getNetworkDisplayName: (network: string) => {
    const names = {
      devnet: "开发网络",
      testnet: "测试网络",
      mainnet: "主网络",
    };
    return names[network as keyof typeof names] || network;
  },
  
  // 获取网络颜色
  getNetworkColor: (network: string) => {
    const colors = {
      devnet: "blue",
      testnet: "orange",
      mainnet: "green",
    };
    return colors[network as keyof typeof colors] || "gray";
  },
  
  // 打印网络信息
  logNetworkInfo: () => {
    console.log("🌐 网络配置信息:");
    console.log("当前网络:", ENVIRONMENT.SUI_NETWORK);
    console.log("网络URL:", getSuiNetworkUrl());
    console.log("应用名称:", ENVIRONMENT.APP_NAME);
    console.log("应用版本:", ENVIRONMENT.APP_VERSION);
    console.log("开发模式:", ENVIRONMENT.IS_DEV);
  },
} as const; 