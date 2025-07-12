import { ENVIRONMENT } from "../config/environment";

// 合约配置常量
export const CONTRACT_CONFIG = {
  // 最新部署的NFT合约 ID（支持真正的NFT，包含元数据）
  PACKAGE_ID: ENVIRONMENT.CONTRACT_PACKAGE_ID,
  CONFIG_ID: ENVIRONMENT.CONTRACT_CONFIG_ID,
  TABLE_ID: ENVIRONMENT.CONTRACT_TABLE_ID,
  
  // 模块名称
  MODULE_NAME: "punch_card",
  
  // 函数名称
  FUNCTIONS: {
    PUNCH: "punch_in",
    CLAIM_REWARDS: "claim_rewards",
    GET_CONFIG: "get_config",
    GET_USER_RECORD: "get_user_record",
    GET_LEADERBOARD: "get_leaderboard",
    INIT_CONFIG: "init_config",
  },
} as const;

// 网络配置
export const NETWORK_CONFIG = {
  DEVNET: "devnet",
  TESTNET: "testnet", 
  MAINNET: "mainnet",
} as const;

// 奖励类型
export const REWARD_TYPES = {
  BRONZE: "bronze",
  SILVER: "silver", 
  GOLD: "gold",
} as const; 