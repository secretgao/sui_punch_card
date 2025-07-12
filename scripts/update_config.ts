import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

async function updateConfig() {
  console.log("🔧 开始更新合约配置...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 新的配置参数
    const newConfig = {
      copper_requirement: 2,   // 铜牌：2次
      silver_requirement: 3,   // 银牌：3次
      gold_requirement: 4,     // 金牌：4次
      time_interval: 1,        // 时间间隔：1个epoch
    };
    
    console.log("📋 新配置:", newConfig);
    
    // 创建交易
    const tx = new Transaction();
    
    // 调用 update_config 函数
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::punch_card::update_config`,
      arguments: [
        tx.object(CONTRACT_CONFIG.CONFIG_ID),  // 配置对象
        tx.pure.u64(newConfig.copper_requirement), // 铜牌门槛
        tx.pure.u64(newConfig.silver_requirement), // 银牌门槛
        tx.pure.u64(newConfig.gold_requirement),   // 金牌门槛
        tx.pure.u64(newConfig.time_interval),      // 时间间隔
      ],
    });
    
    console.log("✅ 交易构建完成");
    console.log("📋 调用参数:");
    console.log("  - 配置对象ID:", CONTRACT_CONFIG.CONFIG_ID);
    console.log("  - 铜牌门槛:", newConfig.copper_requirement);
    console.log("  - 银牌门槛:", newConfig.silver_requirement);
    console.log("  - 金牌门槛:", newConfig.gold_requirement);
    console.log("  - 时间间隔:", newConfig.time_interval);
    
    console.log("\n🚀 请使用以下命令执行交易:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} ${newConfig.copper_requirement} ${newConfig.silver_requirement} ${newConfig.gold_requirement} ${newConfig.time_interval} --gas-budget 1000000`);
    
  } catch (error) {
    console.error("❌ 更新配置失败:", error);
  }
}

updateConfig(); 