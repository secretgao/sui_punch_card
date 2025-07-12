import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function checkUserTime() {
  console.log("🔍 检查用户打卡时间...");
  
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
    
    let timeInterval = 1;
    if (configObject.data?.content?.dataType === "moveObject") {
      const content = configObject.data.content as any;
      timeInterval = parseInt(content.fields.time_interval);
      console.log("📋 配置信息:", {
        copper_requirement: content.fields.copper_requirement,
        silver_requirement: content.fields.silver_requirement,
        gold_requirement: content.fields.gold_requirement,
        time_interval: content.fields.time_interval,
      });
    }
    
    // 3. 检查所有用户记录
    console.log("\n👤 检查用户记录...");
    const dynamicFields = await client.getDynamicFields({
      parentId: CONTRACT_CONFIG.TABLE_ID,
      cursor: null,
      limit: 1000,
    });
    
    console.log("📊 用户数量:", dynamicFields.data.length);
    
    for (const field of dynamicFields.data) {
      const userRecord = await client.getObject({
        id: field.objectId,
        options: { showContent: true },
      });
      
      if (userRecord.data?.content?.dataType === "moveObject") {
        const content = userRecord.data.content as any;
        const value = content.fields.value.fields;
        
        const lastPunchEpoch = parseInt(value.last_punch_time);
        const nextAllowedEpoch = lastPunchEpoch + timeInterval;
        const canPunch = parseInt(currentEpoch) >= nextAllowedEpoch;
        const waitEpochs = Math.max(0, nextAllowedEpoch - parseInt(currentEpoch));
        
        console.log("👤 用户:", value.owner);
        console.log("  📊 打卡次数:", value.count);
        console.log("  ⏰ 上次打卡epoch:", lastPunchEpoch);
        console.log("  📅 当前epoch:", currentEpoch);
        console.log("  ⏱️ 时间间隔:", timeInterval);
        console.log("  🎯 下次允许epoch:", nextAllowedEpoch);
        console.log("  ✅ 是否可以打卡:", canPunch);
        console.log("  ⏳ 需要等待:", waitEpochs, "个epoch");
        
        if (!canPunch) {
          console.log("  ⚠️ 需要等待约", waitEpochs, "分钟");
        }
      }
    }
    
  } catch (error) {
    console.error("❌ 检查过程中出错:", error);
  }
}

checkUserTime(); 