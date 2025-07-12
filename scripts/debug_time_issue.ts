import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function debugTimeIssue() {
  console.log("🔍 调试时间间隔问题...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 1. 获取当前epoch
    console.log("\n📅 获取当前epoch...");
    const latestCheckpoint = await client.getCheckpoint({ id: "latest" });
    const currentEpoch = latestCheckpoint.epoch;
    console.log("📅 当前epoch:", currentEpoch);
    
    // 2. 检查配置
    console.log("\n⚙️ 检查配置...");
    const configObject = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    if (configObject.data?.content?.dataType === "moveObject") {
      const content = configObject.data.content as any;
      console.log("📋 配置信息:", {
        copper_requirement: content.fields.copper_requirement,
        silver_requirement: content.fields.silver_requirement,
        gold_requirement: content.fields.gold_requirement,
        time_interval: content.fields.time_interval,
      });
    }
    
    // 3. 检查用户记录
    console.log("\n👤 检查用户记录...");
    const dynamicFields = await client.getDynamicFields({
      parentId: CONTRACT_CONFIG.TABLE_ID,
      cursor: null,
      limit: 1000,
    });
    
    console.log("📊 动态字段数量:", dynamicFields.data.length);
    
    if (dynamicFields.data.length > 0) {
      // 获取第一个用户记录作为示例
      const firstUserField = dynamicFields.data[0];
      console.log("👤 第一个用户字段:", firstUserField);
      
      const userRecord = await client.getObject({
        id: firstUserField.objectId,
        options: { showContent: true },
      });
      
      if (userRecord.data?.content?.dataType === "moveObject") {
        const content = userRecord.data.content as any;
        const value = content.fields.value.fields;
        
        console.log("📋 用户记录:", {
          owner: value.owner,
          count: value.count,
          last_punch_time: value.last_punch_time,
          rewards_claimed: value.rewards_claimed,
        });
        
        const lastPunchEpoch = parseInt(value.last_punch_time);
        const timeInterval = 1; // 从配置获取
        const nextAllowedEpoch = lastPunchEpoch + timeInterval;
        
        console.log("⏰ 时间分析:");
        console.log("  上次打卡epoch:", lastPunchEpoch);
        console.log("  当前epoch:", currentEpoch);
        console.log("  时间间隔:", timeInterval);
        console.log("  下次允许打卡epoch:", nextAllowedEpoch);
        console.log("  是否可以打卡:", parseInt(currentEpoch) >= nextAllowedEpoch);
        console.log("  还需要等待:", Math.max(0, nextAllowedEpoch - parseInt(currentEpoch)), "个epoch");
      }
    } else {
      console.log("📝 没有用户记录，可以首次打卡");
    }
    
    // 4. 提供解决方案
    console.log("\n💡 解决方案:");
    console.log("1. 如果用户记录存在且时间间隔未到，需要等待");
    console.log("2. 如果想立即测试，可以更新配置为无时间限制:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} 2 3 4 0 --gas-budget 1000000`);
    
    console.log("\n3. 或者等待1个epoch后再次尝试");
    
  } catch (error) {
    console.error("❌ 调试过程中出错:", error);
  }
}

debugTimeIssue(); 