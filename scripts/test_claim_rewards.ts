import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const NEW_CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function testClaimRewards() {
  console.log("🧪 测试新合约的 claim_rewards 函数...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 1. 检查新配置对象
    console.log("\n⚙️ 检查新配置对象...");
    try {
      const configObject = await client.getObject({
        id: NEW_CONTRACT_CONFIG.CONFIG_ID,
        options: { showContent: true },
      });
      
      if (configObject.data?.content?.dataType === "moveObject") {
        const content = configObject.data.content as any;
        console.log("✅ 新配置对象存在");
        console.log("📋 配置信息:", {
          copper_requirement: content.fields.copper_requirement,
          silver_requirement: content.fields.silver_requirement,
          gold_requirement: content.fields.gold_requirement,
          time_interval: content.fields.time_interval,
        });
      }
    } catch (error) {
      console.log("❌ 新配置对象不存在或无法访问");
      return;
    }
    
    // 2. 检查新表格对象
    console.log("\n📋 检查新表格对象...");
    try {
      const tableObject = await client.getObject({
        id: NEW_CONTRACT_CONFIG.TABLE_ID,
        options: { showContent: true },
      });
      
      if (tableObject.data?.content?.dataType === "moveObject") {
        const content = tableObject.data.content as any;
        console.log("✅ 新表格对象存在");
        console.log("📋 表格信息:", {
          total_users: content.fields.total_users,
          rankings_size: content.fields.rankings?.fields?.contents?.length || 0,
        });
      }
    } catch (error) {
      console.log("❌ 新表格对象不存在或无法访问");
      return;
    }
    
    // 3. 提供测试命令
    console.log("\n🎯 测试命令:");
    console.log("1. 先打卡几次（达到奖励条件）:");
    console.log(`sui client call --package ${NEW_CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function punch_in --args ${NEW_CONTRACT_CONFIG.TABLE_ID} ${NEW_CONTRACT_CONFIG.CONFIG_ID} --gas-budget 1000000`);
    
    console.log("\n2. 然后尝试领取奖励:");
    console.log(`sui client call --package ${NEW_CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function claim_rewards --args ${NEW_CONTRACT_CONFIG.TABLE_ID} ${NEW_CONTRACT_CONFIG.CONFIG_ID} --gas-budget 1000000`);
    
    console.log("\n📝 说明:");
    console.log("- 铜牌需要 2 次打卡");
    console.log("- 银牌需要 3 次打卡");
    console.log("- 金牌需要 4 次打卡");
    console.log("- 如果函数不存在，会提示 'Function not found'");
    console.log("- 如果函数存在但条件不满足，会正常执行但不发放奖励");
    
  } catch (error) {
    console.error("❌ 测试过程中出错:", error);
  }
}

testClaimRewards(); 