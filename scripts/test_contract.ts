import { SuiClient } from "@mysten/sui/client";

const PACKAGE_ID = "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699";
const CONFIG_ID = "0x8e0c8ce84be858c2bee59e871f4aa01159ab66ab6f3c0545c6e157958e091416";
const TABLE_ID = "0x26b8976ca6783e7324631aab3a9a2c297289604bf43226cb0ee008652f14dc6b";

async function testContract() {
  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
  
  console.log("🔍 测试合约状态...");
  
  try {
    // 1. 检查包是否存在
    console.log("📦 检查包...");
    const packageInfo = await client.getObject({
      id: PACKAGE_ID,
      options: { showContent: true },
    });
    console.log("✅ 包存在:", packageInfo.data?.objectId);
    
    // 2. 检查配置对象
    console.log("📋 检查配置对象...");
    const configInfo = await client.getObject({
      id: CONFIG_ID,
      options: { showContent: true },
    });
    console.log("✅ 配置对象存在:", configInfo.data?.objectId);
    if (configInfo.data?.content?.dataType === "moveObject") {
      const content = configInfo.data.content as any;
      console.log("配置内容:", {
        copper_requirement: content.fields.copper_requirement,
        silver_requirement: content.fields.silver_requirement,
        gold_requirement: content.fields.gold_requirement,
        time_interval: content.fields.time_interval,
      });
    }
    
    // 3. 检查表格对象
    console.log("📊 检查表格对象...");
    const tableInfo = await client.getObject({
      id: TABLE_ID,
      options: { showContent: true },
    });
    console.log("✅ 表格对象存在:", tableInfo.data?.objectId);
    
    // 4. 检查表格中的动态字段
    console.log("🔍 检查表格内容...");
    const dynamicFields = await client.getDynamicFields({
      parentId: TABLE_ID,
      cursor: null,
      limit: 10,
    });
    console.log("表格中的用户数量:", dynamicFields.data.length);
    
    console.log("✅ 合约测试完成！");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testContract().catch(console.error);

export { testContract }; 