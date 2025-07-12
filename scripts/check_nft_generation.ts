import { SuiClient } from "@mysten/sui/client";

// 最新部署的合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

// 测试用户地址
const TEST_USER_ADDRESS = "0x7bb8f8b7bb38ad37de7cdd4d9897245c8c85b886aed673b2962363433033908a";

async function checkNFTGeneration() {
  console.log("🔍 检查NFT生成情况...");
  console.log("用户地址:", TEST_USER_ADDRESS);
  console.log("新合约Package ID:", CONTRACT_CONFIG.PACKAGE_ID);
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    console.log("✅ Sui 客户端创建成功");
    
    // 1. 检查用户打卡记录
    console.log("\n📊 检查用户打卡记录...");
    const tableObject = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    let punchCount = 0;
    let rewardsClaimed = 0;
    
    const tableContent = tableObject.data?.content as any;
    const tableId = tableContent?.fields?.table?.fields?.id?.id;
    
    if (tableId) {
      const tableDynamicFields = await client.getDynamicFields({
        parentId: tableId,
        cursor: null,
        limit: 1000,
      });
      
      const userField = tableDynamicFields.data.find(
        (field: any) => field.name.value === TEST_USER_ADDRESS
      );
      
      if (userField) {
        const recordData = await client.getObject({
          id: userField.objectId,
          options: { showContent: true },
        });
        
        if (recordData.data?.content?.dataType === "moveObject") {
          const content = recordData.data.content as any;
          const value = content.fields.value.fields;
          punchCount = parseInt(value.count);
          rewardsClaimed = parseInt(value.rewards_claimed);
          
          console.log("📊 用户打卡记录:");
          console.log(`  打卡次数: ${punchCount}`);
          console.log(`  奖励状态: ${rewardsClaimed}`);
          console.log(`  铜牌奖励: ${(rewardsClaimed & 1) !== 0 ? '是' : '否'}`);
          console.log(`  银牌奖励: ${(rewardsClaimed & 2) !== 0 ? '是' : '否'}`);
          console.log(`  金牌奖励: ${(rewardsClaimed & 4) !== 0 ? '是' : '否'}`);
        }
      }
    }
    
    // 2. 检查用户拥有的新合约NFT
    console.log("\n🏆 检查用户拥有的新合约NFT...");
    const objects = await client.getOwnedObjects({
      owner: TEST_USER_ADDRESS,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    const newContractNFTs = objects.data.filter(obj => {
      if (obj.data?.content?.dataType === "moveObject") {
        const content = obj.data.content as any;
        const type = content.type;
        const packageId = type.split("::")[0];
        
        return (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) &&
               packageId === CONTRACT_CONFIG.PACKAGE_ID;
      }
      return false;
    });
    
    console.log(`📊 新合约NFT数量: ${newContractNFTs.length}`);
    
    newContractNFTs.forEach((obj, index) => {
      const content = obj.data.content as any;
      const type = content.type;
      console.log(`${index + 1}. ${type}`);
      console.log(`   ID: ${obj.data.objectId}`);
      console.log(`   名称: ${content.fields?.name || 'Unknown'}`);
      console.log(`   描述: ${content.fields?.description || 'Unknown'}`);
      console.log(`   图片URL: ${content.fields?.image_url ? '存在' : '不存在'}`);
      console.log(`   背景色: ${content.fields?.background_color || 'Unknown'}`);
      console.log(`   打卡时间: ${content.fields?.punch_time || 'Unknown'}`);
    });
    
    // 3. 检查配置
    console.log("\n⚙️ 检查合约配置...");
    const configObject = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    let silverThreshold = 3; // 默认值
    
    if (configObject.data?.content?.dataType === "moveObject") {
      const content = configObject.data.content as any;
      silverThreshold = parseInt(content.fields.silver_requirement);
      console.log("📋 配置信息:");
      console.log(`  铜牌门槛: ${content.fields.copper_requirement}`);
      console.log(`  银牌门槛: ${content.fields.silver_requirement}`);
      console.log(`  金牌门槛: ${content.fields.gold_requirement}`);
      console.log(`  时间间隔: ${content.fields.time_interval}`);
    }
    
    // 4. 分析问题
    console.log("\n🔍 问题分析:");
    
    if (punchCount >= silverThreshold) {
      console.log(`✅ 打卡次数(${punchCount}) >= 银牌门槛(${silverThreshold})`);
      
      const silverNFT = newContractNFTs.find(obj => {
        const content = obj.data.content as any;
        return content.type.includes("SilverNFT");
      });
      
      if (silverNFT) {
        console.log("✅ 新合约银牌NFT已生成");
      } else {
        console.log("❌ 新合约银牌NFT未生成");
        console.log("可能的原因:");
        console.log("1. NFT生成失败");
        console.log("2. 合约逻辑问题");
        console.log("3. 需要重新打卡触发");
      }
    } else {
      console.log(`❌ 打卡次数(${punchCount}) < 银牌门槛(${silverThreshold})`);
    }
    
  } catch (error) {
    console.error("❌ 检查失败:", error);
  }
}

// 运行检查
checkNFTGeneration().catch(console.error); 