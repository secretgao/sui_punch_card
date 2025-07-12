import { SuiClient } from "@mysten/sui/client";

// 最新部署的合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

async function testNewContract() {
  console.log("🔍 测试最新部署的合约...");
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    console.log("✅ Sui 客户端创建成功");
    
    // 1. 检查包是否存在
    console.log("\n📦 检查包...");
    const packageInfo = await client.getObject({
      id: CONTRACT_CONFIG.PACKAGE_ID,
      options: { showContent: true },
    });
    
    if (packageInfo.data) {
      console.log(`✅ 包存在: ${packageInfo.data.objectId}`);
      console.log(`   类型: ${packageInfo.data.content?.dataType}`);
    } else {
      console.log(`❌ 包不存在: ${CONTRACT_CONFIG.PACKAGE_ID}`);
      return;
    }
    
    // 2. 检查配置对象
    console.log("\n📋 检查配置对象...");
    const configInfo = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    if (configInfo.data) {
      console.log(`✅ 配置对象存在: ${configInfo.data.objectId}`);
      if (configInfo.data.content?.dataType === "moveObject") {
        const content = configInfo.data.content as any;
        console.log("📋 配置内容:", {
          copper_requirement: content.fields.copper_requirement,
          silver_requirement: content.fields.silver_requirement,
          gold_requirement: content.fields.gold_requirement,
          time_interval: content.fields.time_interval,
        });
      }
    } else {
      console.log(`❌ 配置对象不存在: ${CONTRACT_CONFIG.CONFIG_ID}`);
    }
    
    // 3. 检查表格对象
    console.log("\n📊 检查表格对象...");
    const tableInfo = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    if (tableInfo.data) {
      console.log(`✅ 表格对象存在: ${tableInfo.data.objectId}`);
      if (tableInfo.data.content?.dataType === "moveObject") {
        const content = tableInfo.data.content as any;
        console.log("📊 表格内容:", {
          total_users: content.fields.total_users,
          table: content.fields.table ? "存在" : "不存在",
          rankings: content.fields.rankings ? "存在" : "不存在",
        });
      }
    } else {
      console.log(`❌ 表格对象不存在: ${CONTRACT_CONFIG.TABLE_ID}`);
    }
    
    // 4. 检查表格的动态字段
    console.log("\n📊 检查表格动态字段...");
    const dynamicFields = await client.getDynamicFields({
      parentId: CONTRACT_CONFIG.TABLE_ID,
      cursor: null,
      limit: 1000,
    });
    
    console.log(`📊 动态字段总数: ${dynamicFields.data.length}`);
    
    // 5. 尝试从表格的 table 字段获取动态字段
    if (tableInfo.data?.content?.dataType === "moveObject") {
      const tableContent = tableInfo.data.content as any;
      const tableId = tableContent?.fields?.table?.fields?.id?.id;
      
      if (tableId) {
        console.log(`\n📋 表格的 table 字段ID: ${tableId}`);
        const tableDynamicFields = await client.getDynamicFields({
          parentId: tableId,
          cursor: null,
          limit: 1000,
        });
        
        console.log(`📊 table 字段动态字段总数: ${tableDynamicFields.data.length}`);
        
        if (tableDynamicFields.data.length > 0) {
          console.log("\n👥 用户记录:");
          for (const field of tableDynamicFields.data) {
            console.log(`  - ${field.name.value} (${field.objectId})`);
          }
        }
      }
    }
    
    console.log("\n✅ 合约测试完成!");
    console.log("\n📋 合约信息汇总:");
    console.log(`  - Package ID: ${CONTRACT_CONFIG.PACKAGE_ID}`);
    console.log(`  - Config ID: ${CONTRACT_CONFIG.CONFIG_ID}`);
    console.log(`  - Table ID: ${CONTRACT_CONFIG.TABLE_ID}`);
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testNewContract().catch(console.error); 