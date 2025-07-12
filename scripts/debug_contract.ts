import { SuiClient } from "@mysten/sui/client";

const PACKAGE_ID = "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699";
const CONFIG_ID = "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e";
const TABLE_ID = "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774";

async function debugContract() {
  console.log("🔍 调试合约状态...");
  
  // 测试不同的网络
  const networks = [
    { name: "测试网络", url: "https://fullnode.testnet.sui.io:443" },
    { name: "开发网络", url: "https://fullnode.devnet.sui.io:443" },
  ];
  
  for (const network of networks) {
    console.log(`\n📡 检查 ${network.name}...`);
    const client = new SuiClient({ url: network.url });
    
    try {
      // 1. 检查包是否存在
      console.log("📦 检查包...");
      const packageInfo = await client.getObject({
        id: PACKAGE_ID,
        options: { showContent: true },
      });
      
      if (packageInfo.data) {
        console.log(`✅ 包存在: ${packageInfo.data.objectId}`);
        console.log(`   类型: ${packageInfo.data.content?.dataType}`);
      } else {
        console.log(`❌ 包不存在: ${PACKAGE_ID}`);
        continue;
      }
      
      // 2. 检查配置对象
      console.log("📋 检查配置对象...");
      const configInfo = await client.getObject({
        id: CONFIG_ID,
        options: { showContent: true },
      });
      
      if (configInfo.data) {
        console.log(`✅ 配置对象存在: ${configInfo.data.objectId}`);
        if (configInfo.data.content?.dataType === "moveObject") {
          const content = configInfo.data.content as any;
          console.log("配置内容:", {
            copper_requirement: content.fields.copper_requirement,
            silver_requirement: content.fields.silver_requirement,
            gold_requirement: content.fields.gold_requirement,
            time_interval: content.fields.time_interval,
          });
        }
      } else {
        console.log(`❌ 配置对象不存在: ${CONFIG_ID}`);
      }
      
      // 3. 检查表格对象
      console.log("📊 检查表格对象...");
      const tableInfo = await client.getObject({
        id: TABLE_ID,
        options: { showContent: true },
      });
      
      if (tableInfo.data) {
        console.log(`✅ 表格对象存在: ${tableInfo.data.objectId}`);
        
        // 检查表格中的动态字段
        const dynamicFields = await client.getDynamicFields({
          parentId: TABLE_ID,
          cursor: null,
          limit: 10,
        });
        console.log("表格中的用户数量:", dynamicFields.data.length);
      } else {
        console.log(`❌ 表格对象不存在: ${TABLE_ID}`);
      }
      
      console.log(`✅ ${network.name} 检查完成`);
      
    } catch (error) {
      console.error(`❌ ${network.name} 检查失败:`, error);
    }
  }
  
  console.log("\n🎯 调试完成！");
}

debugContract().catch(console.error); 