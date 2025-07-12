import { SuiClient } from '@mysten/sui/client';

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x1975bc3918b36f2ecbd5935d8dfc8b46308d5f1c337884118bcb569f91638928",
  CONFIG_ID: "0xa71885cbc39259de79777210dca5fc888a51be5c14e7fbf75e879942c043cce1",
  TABLE_ID: "0xf534f012776489e208cea01700fc5402a1c10ee49219dd0cb71c3b0ed537e442",
  MODULE_NAME: "punch_card",
};

// 从环境变量获取网络URL
const getNetworkUrl = () => {
  const network = process.env.SUI_NETWORK || "testnet";
  const urls = {
    devnet: "https://fullnode.devnet.sui.io:443",
    testnet: "https://fullnode.testnet.sui.io:443",
    mainnet: "https://fullnode.mainnet.sui.io:443",
  };
  return urls[network as keyof typeof urls] || urls.testnet;
};

// 创建 Sui 客户端
const createSuiClient = () => {
  return new SuiClient({ url: getNetworkUrl() });
};

// 测试奖励逻辑
async function testRewardLogic(userAddress: string) {
  try {
    console.log("🔍 开始测试奖励逻辑...");
    console.log("用户地址:", userAddress);
    
    const client = createSuiClient();
    console.log("✅ Sui 客户端创建成功");
    
    // 获取配置
    console.log("📋 获取配置...");
    const configResult = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    if (configResult.data?.content?.dataType === "moveObject") {
      const content = configResult.data.content as any;
      const config = {
        bronze_threshold: parseInt(content.fields.copper_requirement),
        silver_threshold: parseInt(content.fields.silver_requirement),
        gold_threshold: parseInt(content.fields.gold_requirement),
      };
      
      console.log("📋 配置:", config);
      
      // 获取用户记录
      console.log("📊 获取用户记录...");
      const tableResult = await client.getObject({
        id: CONTRACT_CONFIG.TABLE_ID,
        options: { showContent: true },
      });
      
      if (tableResult.data?.content?.dataType === "moveObject") {
        const content = tableResult.data.content as any;
        const tableId = content?.fields?.table?.fields?.id?.id;
        
        if (tableId) {
          const dynamicFields = await client.getDynamicFields({
            parentId: tableId,
            cursor: null,
            limit: 1000,
          });
          
          const userRecord = dynamicFields.data.find(
            (field: any) => field.name.value === userAddress
          );
          
          if (userRecord) {
            const recordData = await client.getObject({
              id: userRecord.objectId,
              options: { showContent: true },
            });
            
            if (recordData.data?.content?.dataType === "moveObject") {
              const recordContent = recordData.data.content as any;
              const userRecord = {
                punch_count: parseInt(recordContent.fields.count),
                bronze_rewarded: (parseInt(recordContent.fields.rewards_claimed) & 1) !== 0,
                silver_rewarded: (parseInt(recordContent.fields.rewards_claimed) & 2) !== 0,
                gold_rewarded: (parseInt(recordContent.fields.rewards_claimed) & 4) !== 0,
              };
              
              console.log("📄 用户记录:", userRecord);
              
              // 测试奖励逻辑
              console.log("\n🏆 奖励逻辑测试:");
              
              // 检查铜牌
              const canClaimBronze = userRecord.punch_count >= config.bronze_threshold && !userRecord.bronze_rewarded;
              console.log(`铜牌: ${userRecord.punch_count}/${config.bronze_threshold} - ${canClaimBronze ? "可领取" : "不可领取"} (已领取: ${userRecord.bronze_rewarded})`);
              
              // 检查银牌
              const canClaimSilver = userRecord.punch_count >= config.silver_threshold && !userRecord.silver_rewarded;
              console.log(`银牌: ${userRecord.punch_count}/${config.silver_threshold} - ${canClaimSilver ? "可领取" : "不可领取"} (已领取: ${userRecord.silver_rewarded})`);
              
              // 检查金牌
              const canClaimGold = userRecord.punch_count >= config.gold_threshold && !userRecord.gold_rewarded;
              console.log(`金牌: ${userRecord.punch_count}/${config.gold_threshold} - ${canClaimGold ? "可领取" : "不可领取"} (已领取: ${userRecord.gold_rewarded})`);
              
              // 总结
              const canClaimAny = canClaimBronze || canClaimSilver || canClaimGold;
              console.log(`\n总结: ${canClaimAny ? "有奖励可领取" : "无奖励可领取"}`);
              
              if (canClaimAny) {
                const availableRewards: string[] = [];
                if (canClaimBronze) availableRewards.push("铜牌");
                if (canClaimSilver) availableRewards.push("银牌");
                if (canClaimGold) availableRewards.push("金牌");
                console.log(`可领取的奖励: ${availableRewards.join(", ")}`);
              }
            }
          } else {
            console.log("❌ 未找到用户记录");
          }
        }
      }
    }
    
  } catch (error: any) {
    console.error("❌ 测试奖励逻辑时出错:", error);
    console.error("错误详情:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
  }
}

// 运行脚本
if (require.main === module) {
  const userAddress = process.argv[2];
  if (!userAddress) {
    console.log("请提供用户地址作为参数");
    console.log("使用方法: ts-node test_reward_logic.ts <用户地址>");
    process.exit(1);
  }
  
  testRewardLogic(userAddress);
} 