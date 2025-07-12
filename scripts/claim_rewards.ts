import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

async function claimRewards() {
  console.log("🏆 开始领取NFT奖励...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    console.log("📋 合约配置:");
    console.log("  - 包ID:", CONTRACT_CONFIG.PACKAGE_ID);
    console.log("  - 表格ID:", CONTRACT_CONFIG.TABLE_ID);
    console.log("  - 配置ID:", CONTRACT_CONFIG.CONFIG_ID);
    
    // 创建交易
    const tx = new Transaction();
    
    // 调用 claim_rewards 函数
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::punch_card::claim_rewards`,
      arguments: [
        tx.object(CONTRACT_CONFIG.TABLE_ID),   // 表格对象
        tx.object(CONTRACT_CONFIG.CONFIG_ID),  // 配置对象
      ],
    });
    
    console.log("✅ 交易构建完成");
    console.log("📋 调用参数:");
    console.log("  - 表格对象ID:", CONTRACT_CONFIG.TABLE_ID);
    console.log("  - 配置对象ID:", CONTRACT_CONFIG.CONFIG_ID);
    
    console.log("\n🚀 请使用以下命令执行交易:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function claim_rewards --args ${CONTRACT_CONFIG.TABLE_ID} ${CONTRACT_CONFIG.CONFIG_ID} --gas-budget 1000000`);
    
    console.log("\n📝 说明:");
    console.log("  - 此函数会检查你的打卡次数是否满足奖励条件");
    console.log("  - 如果满足条件且未领取，会自动发放对应的NFT");
    console.log("  - 铜牌：2次，银牌：3次，金牌：4次");
    
  } catch (error) {
    console.error("❌ 领取奖励失败:", error);
  }
}

claimRewards(); 