import { SuiClient } from "@mysten/sui/client";

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

async function diagnoseClaim() {
  console.log("🔍 开始诊断领取奖励问题...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 1. 检查合约包是否存在
    console.log("\n📦 检查合约包...");
    try {
      const packageObject = await client.getObject({
        id: CONTRACT_CONFIG.PACKAGE_ID,
        options: { showContent: true },
      });
      console.log("✅ 合约包存在");
      console.log("📋 包信息:", packageObject.data?.content);
    } catch (error) {
      console.log("❌ 合约包不存在或无法访问");
      return;
    }
    
    // 2. 检查配置对象
    console.log("\n⚙️ 检查配置对象...");
    try {
      const configObject = await client.getObject({
        id: CONTRACT_CONFIG.CONFIG_ID,
        options: { showContent: true },
      });
      
      if (configObject.data?.content?.dataType === "moveObject") {
        const content = configObject.data.content as any;
        console.log("✅ 配置对象存在");
        console.log("📋 配置信息:", {
          copper_requirement: content.fields.copper_requirement,
          silver_requirement: content.fields.silver_requirement,
          gold_requirement: content.fields.gold_requirement,
          time_interval: content.fields.time_interval,
        });
      }
    } catch (error) {
      console.log("❌ 配置对象不存在或无法访问");
      return;
    }
    
    // 3. 检查表格对象
    console.log("\n📋 检查表格对象...");
    try {
      const tableObject = await client.getObject({
        id: CONTRACT_CONFIG.TABLE_ID,
        options: { showContent: true },
      });
      
      if (tableObject.data?.content?.dataType === "moveObject") {
        const content = tableObject.data.content as any;
        console.log("✅ 表格对象存在");
        console.log("📋 表格信息:", {
          total_users: content.fields.total_users,
          rankings_size: content.fields.rankings?.fields?.contents?.length || 0,
        });
      }
    } catch (error) {
      console.log("❌ 表格对象不存在或无法访问");
      return;
    }
    
    // 4. 检查合约模块中的函数
    console.log("\n🔧 检查合约函数...");
    try {
      const moduleObject = await client.getObject({
        id: CONTRACT_CONFIG.PACKAGE_ID,
        options: { showContent: true },
      });
      
      if (moduleObject.data?.content?.dataType === "package") {
        const content = moduleObject.data.content as any;
        console.log("✅ 合约包模块信息:");
        console.log("📋 模块列表:", Object.keys(content.modules));
        
        const punchCardModule = content.modules.find((m: any) => m.name === "punch_card");
        if (punchCardModule) {
          console.log("✅ punch_card 模块存在");
          console.log("📋 函数列表:", punchCardModule.functions?.map((f: any) => f.name) || []);
          
          const hasClaimRewards = punchCardModule.functions?.some((f: any) => f.name === "claim_rewards");
          console.log("🔍 claim_rewards 函数存在:", hasClaimRewards);
        } else {
          console.log("❌ punch_card 模块不存在");
        }
      }
    } catch (error) {
      console.log("❌ 无法获取合约模块信息");
    }
    
    // 5. 检查用户记录（需要提供用户地址）
    console.log("\n👤 检查用户记录...");
    console.log("📝 请提供要检查的用户地址:");
    console.log("   例如: 0x1234567890abcdef...");
    console.log("   或者运行: node diagnose_claim.js <用户地址>");
    
    // 6. 提供解决方案
    console.log("\n💡 可能的解决方案:");
    console.log("1. 如果合约包不存在，需要重新部署合约");
    console.log("2. 如果 claim_rewards 函数不存在，需要重新部署合约");
    console.log("3. 如果用户记录不存在，需要先打卡");
    console.log("4. 如果用户未达到奖励条件，需要继续打卡");
    
    console.log("\n🔧 重新部署命令:");
    console.log("cd simple_counter && sui client publish --gas-budget 10000000");
    
    console.log("\n🎯 手动领取命令:");
    console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function claim_rewards --args ${CONTRACT_CONFIG.TABLE_ID} ${CONTRACT_CONFIG.CONFIG_ID} --gas-budget 1000000`);
    
  } catch (error) {
    console.error("❌ 诊断过程中出错:", error);
  }
}

// 如果提供了用户地址参数
const userAddress = process.argv[2];
if (userAddress) {
  console.log(`👤 检查用户地址: ${userAddress}`);
  // 这里可以添加用户记录检查逻辑
}

diagnoseClaim(); 