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

async function checkUserRewards(userAddress: string) {
  try {
    console.log("🔍 开始检查用户奖励...");
    console.log("用户地址:", userAddress);
    
    const client = createSuiClient();
    console.log("✅ Sui 客户端创建成功");
    
    // 获取用户拥有的所有对象
    console.log("📋 获取用户对象...");
    const objects = await client.getOwnedObjects({
      owner: userAddress,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    console.log("📋 用户对象总数:", objects.data.length);
    
    const rewards: any[] = [];
    const otherObjects: any[] = [];
    
    // 遍历所有对象
    for (const obj of objects.data) {
      if (obj.data?.content?.dataType === "moveObject") {
        const content = obj.data.content as any;
        const type = content.type;
        
        console.log("📄 对象类型:", type);
        console.log("📄 对象ID:", obj.data.objectId);
        
        // 检查是否是我们的NFT奖励
        if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
          let rewardType: string;
          let name: string;
          
          if (type.includes("CopperNFT")) {
            rewardType = "CopperNFT";
            name = "铜牌NFT";
          } else if (type.includes("SilverNFT")) {
            rewardType = "SilverNFT";
            name = "银牌NFT";
          } else if (type.includes("GoldNFT")) {
            rewardType = "GoldNFT";
            name = "金牌NFT";
          } else {
            continue;
          }
          
          const reward = {
            id: obj.data.objectId,
            type: rewardType,
            name,
            content: content,
          };
          
          console.log("🏆 找到奖励:", reward);
          rewards.push(reward);
        } else {
          otherObjects.push({
            id: obj.data.objectId,
            type: type,
          });
        }
      }
    }
    
    console.log("\n📊 检查结果:");
    console.log("🏆 奖励数量:", rewards.length);
    console.log("📦 其他对象数量:", otherObjects.length);
    
    if (rewards.length > 0) {
      console.log("\n🏆 用户奖励:");
      rewards.forEach((reward, index) => {
        console.log(`${index + 1}. ${reward.name} (${reward.type})`);
        console.log(`   ID: ${reward.id}`);
        console.log(`   内容:`, reward.content);
      });
    } else {
      console.log("\n❌ 用户还没有获得任何奖励");
    }
    
    // 显示前10个其他对象
    if (otherObjects.length > 0) {
      console.log("\n📦 其他对象 (前10个):");
      otherObjects.slice(0, 10).forEach((obj, index) => {
        console.log(`${index + 1}. ${obj.type}`);
        console.log(`   ID: ${obj.id}`);
      });
    }
    
    // 检查用户打卡记录
    console.log("\n📊 检查用户打卡记录...");
    const tableResult = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    if (tableResult.data?.content?.dataType === "moveObject") {
      const content = tableResult.data.content as any;
      const tableId = content?.fields?.table?.fields?.id?.id;
      
      if (tableId) {
        console.log("📋 表格ID:", tableId);
        
        // 获取表格的动态字段
        const dynamicFields = await client.getDynamicFields({
          parentId: tableId,
          cursor: null,
          limit: 1000,
        });
        
        console.log("📊 表格中的用户记录数:", dynamicFields.data.length);
        
        // 查找用户的记录
        const userRecord = dynamicFields.data.find(
          (field: any) => field.name.value === userAddress
        );
        
        if (userRecord) {
          console.log("✅ 找到用户记录:", userRecord);
          
          // 获取用户记录详情
          const recordData = await client.getObject({
            id: userRecord.objectId,
            options: { showContent: true },
          });
          
          if (recordData.data?.content?.dataType === "moveObject") {
            const recordContent = recordData.data.content as any;
            console.log("📄 用户记录详情:", recordContent);
            
            const rewards_claimed = parseInt(recordContent.fields.rewards_claimed);
            console.log("🏆 奖励状态 (原始):", recordContent.fields.rewards_claimed);
            console.log("🏆 奖励状态 (解析后):", rewards_claimed);
            console.log("🏆 铜牌已领取:", (rewards_claimed & 1) !== 0);
            console.log("🏆 银牌已领取:", (rewards_claimed & 2) !== 0);
            console.log("🏆 金牌已领取:", (rewards_claimed & 4) !== 0);
          }
        } else {
          console.log("❌ 未找到用户记录");
        }
      }
    }
    
  } catch (error: any) {
    console.error("❌ 检查用户奖励时出错:", error);
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
    console.log("使用方法: ts-node check_rewards.ts <用户地址>");
    process.exit(1);
  }
  
  checkUserRewards(userAddress);
} 