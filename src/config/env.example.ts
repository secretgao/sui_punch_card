// 环境变量示例配置
// 复制此文件为 .env 并修改相应的值

export const ENV_EXAMPLE = {
  // Sui网络配置
  // 可选值: devnet, testnet, mainnet
  VITE_SUI_NETWORK: "testnet",
  
  // 应用配置
  VITE_APP_NAME: "打卡系统",
  VITE_APP_VERSION: "1.0.0",
  
  // 开发模式配置
  VITE_DEBUG_MODE: "true",
} as const;

// 使用说明：
// 1. 在项目根目录创建 .env 文件
// 2. 复制以下内容到 .env 文件：
/*
VITE_SUI_NETWORK=testnet
VITE_APP_NAME=打卡系统
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
*/ 