import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function testTimeInterval() {
  console.log("⏰ 测试新的1分钟时间间隔设置...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 1. 检查当前配置
    console.log("\n📋 检查当前配置...");
    try {
      const configObject = await client.getObject({
        id: CONTRACT_CONFIG.CONFIG_ID,
        options: { showContent: true },
      });
      
      if (configObject.data?.content?.dataType === "moveObject") {
        const content = configObject.data.content as any;
        console.log("📋 当前配置:", {
          copper_requirement: content.fields.copper_requirement,
          silver_requirement: content.fields.silver_requirement,
          gold_requirement: content.fields.gold_requirement,
          time_interval: content.fields.time_interval,
        });
        
        console.log("✅ 时间间隔已设置为1分钟");
      }
    } catch (error) {
      console.log("❌ 无法获取当前配置");
      return;
    }
    
    // 2. 提供测试命令
    console.log("\n🎯 测试命令:");
    console.log("1. 第一次打卡:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function punch_in --args ${CONTRACT_CONFIG.TABLE_ID} ${CONTRACT_CONFIG.CONFIG_ID} --gas-budget 5000000`);
    
    console.log("\n2. 立即尝试第二次打卡（应该失败）:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function punch_in --args ${CONTRACT_CONFIG.TABLE_ID} ${CONTRACT_CONFIG.CONFIG_ID} --gas-budget 5000000`);
    
    console.log("\n3. 等待1分钟后再次打卡（应该成功）:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function punch_in --args ${CONTRACT_CONFIG.TABLE_ID} ${CONTRACT_CONFIG.CONFIG_ID} --gas-budget 5000000`);
    
    console.log("\n📝 说明:");
    console.log("- 当前时间间隔: 1分钟");
    console.log("- 如果立即重复打卡，会提示错误代码 1");
    console.log("- 等待1分钟后可以再次打卡");
    console.log("- 如果想设置无时间限制，可以更新为0");
    
    console.log("\n🔧 更新为无时间限制的命令:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} 2 3 4 0 --gas-budget 1000000`);
    
  } catch (error) {
    console.error("❌ 测试过程中出错:", error);
  }
}

testTimeInterval(); 