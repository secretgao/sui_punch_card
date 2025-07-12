import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function updateTimeInterval() {
  console.log("⏰ 更新打卡时间间隔为1分钟...");
  
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
      }
    } catch (error) {
      console.log("❌ 无法获取当前配置");
      return;
    }
    
    // 2. 提供更新命令
    console.log("\n🔧 更新命令:");
    console.log("将时间间隔从1改为1（1分钟）:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} 2 3 4 1 --gas-budget 1000000`);
    
    console.log("\n📝 说明:");
    console.log("- 参数顺序: 配置对象ID, 铜牌要求, 银牌要求, 金牌要求, 时间间隔");
    console.log("- 时间间隔: 1 = 约1分钟（1个epoch）");
    console.log("- 如果你想设置更短的时间间隔，可以改为0（无限制）");
    
    console.log("\n🎯 可选的时间间隔:");
    console.log("- 0: 无时间限制（可以连续打卡）");
    console.log("- 1: 约1分钟（1个epoch）");
    console.log("- 2: 约2分钟（2个epoch）");
    console.log("- 5: 约5分钟（5个epoch）");
    
  } catch (error) {
    console.error("❌ 更新过程中出错:", error);
  }
}

updateTimeInterval(); 