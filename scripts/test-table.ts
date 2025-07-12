import { SuiClient } from "@mysten/sui/client";

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

async function testTableData() {
  console.log("🔍 开始测试表格数据...");
  
  try {
    // 创建 Sui 客户端
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    console.log("✅ Sui 客户端创建成功");
    
    // 1. 获取表格对象
    console.log("\n📋 获取表格对象...");
    const tableObject = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    console.log("📋 表格对象:", JSON.stringify(tableObject, null, 2));
    
    // 2. 获取表格的动态字段
    console.log("\n📊 获取表格动态字段...");
    const dynamicFields = await client.getDynamicFields({
      parentId: CONTRACT_CONFIG.TABLE_ID,
      cursor: null,
      limit: 1000,
    });
    
    console.log("📊 动态字段总数:", dynamicFields.data.length);
    console.log("📊 动态字段列表:", JSON.stringify(dynamicFields.data, null, 2));
    
    // 尝试从表格的 table 字段获取动态字段
    console.log("\n📊 尝试从表格的 table 字段获取动态字段...");
    const tableContent = tableObject.data?.content as any;
    const tableId = tableContent?.fields?.table?.fields?.id?.id;
    console.log("📋 表格的 table 字段ID:", tableId);
    
    if (tableId) {
      const tableDynamicFields = await client.getDynamicFields({
        parentId: tableId,
        cursor: null,
        limit: 1000,
      });
      
      console.log("📊 table 字段动态字段总数:", tableDynamicFields.data.length);
      console.log("📊 table 字段动态字段列表:", JSON.stringify(tableDynamicFields.data, null, 2));
      
      // 使用 table 字段的动态字段
      if (tableDynamicFields.data.length > 0) {
        console.log("\n📄 获取所有用户记录详情 (从 table 字段)...");
        const allUserRecords: any[] = [];
        
        for (const field of tableDynamicFields.data) {
          console.log(`\n🔍 处理字段: ${field.name.value}`);
          
          try {
            const recordData = await client.getObject({
              id: field.objectId,
              options: { showContent: true },
            });
            
            console.log(`📄 记录数据:`, JSON.stringify(recordData, null, 2));
            
            if (recordData.data?.content?.dataType === "moveObject") {
              const content = recordData.data.content as any;
              console.log(`📋 记录内容:`, JSON.stringify(content, null, 2));
              // 修正：从 value.fields 读取打卡信息
              const value = content.fields.value.fields;
              const rewards_claimed = parseInt(value.rewards_claimed);
              const userRecord = {
                user_address: value.owner,
                punch_count: parseInt(value.count),
                last_punch_time: parseInt(value.last_punch_time),
                last_punch_time_formatted: new Date(parseInt(value.last_punch_time) * 1000).toLocaleString('zh-CN'),
                rewards_claimed: rewards_claimed,
                bronze_rewarded: (rewards_claimed & 1) !== 0,
                silver_rewarded: (rewards_claimed & 2) !== 0,
                gold_rewarded: (rewards_claimed & 4) !== 0,
                object_id: field.objectId,
                field_name: field.name.value,
              };
              
              allUserRecords.push(userRecord);
              console.log(`✅ 解析后的用户记录:`, JSON.stringify(userRecord, null, 2));
            } else {
              console.log(`❌ 记录不是 moveObject 类型`);
            }
          } catch (error) {
            console.error(`❌ 获取记录失败:`, error);
          }
        }
        
        // 生成汇总报告
        console.log("\n📊 ========== 汇总报告 (从 table 字段) ==========");
        console.log(`📋 表格ID: ${CONTRACT_CONFIG.TABLE_ID}`);
        console.log(`📋 table 字段ID: ${tableId}`);
        console.log(`📊 动态字段总数: ${tableDynamicFields.data.length}`);
        console.log(`👥 用户记录总数: ${allUserRecords.length}`);
        
        if (allUserRecords.length > 0) {
          console.log("\n👥 所有用户记录:");
          allUserRecords.forEach((record, index) => {
            console.log(`\n${index + 1}. 用户: ${record.user_address}`);
            console.log(`   打卡次数: ${record.punch_count}`);
            console.log(`   最后打卡时间: ${record.last_punch_time_formatted}`);
            console.log(`   奖励状态: 铜牌(${record.bronze_rewarded ? '是' : '否'}) 银牌(${record.silver_rewarded ? '是' : '否'}) 金牌(${record.gold_rewarded ? '是' : '否'})`);
            console.log(`   对象ID: ${record.object_id}`);
          });
          
          // 按打卡次数排序
          const sortedRecords = allUserRecords.sort((a, b) => b.punch_count - a.punch_count);
          console.log("\n🏆 排行榜 (按打卡次数排序):");
          sortedRecords.forEach((record, index) => {
            console.log(`${index + 1}. ${record.user_address} - ${record.punch_count}次`);
          });
          
          // 检查特定用户地址
          const testAddress = "0x7bb8f8b7bb38ad37de7cdd4d9897245c8c85b886aed673b2962363433033908a";
          console.log(`\n🔍 检查特定用户地址: ${testAddress}`);
          const specificUser = allUserRecords.find(record => record.user_address === testAddress);
          
          if (specificUser) {
            console.log("✅ 找到用户记录:");
            console.log(JSON.stringify(specificUser, null, 2));
          } else {
            console.log("❌ 未找到该用户的记录");
            console.log("📋 所有用户地址:");
            allUserRecords.forEach((record, index) => {
              console.log(`${index + 1}. ${record.user_address}`);
            });
          }
        } else {
          console.log("❌ 没有找到任何用户记录");
        }
      }
    }
    
    // 4. 获取配置对象
    console.log("\n⚙️ 获取配置对象...");
    const configObject = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    console.log("⚙️ 配置对象:", JSON.stringify(configObject, null, 2));
    
    // 5. 生成汇总报告
    console.log("\n📊 ========== 汇总报告 ==========");
    console.log(`📋 表格ID: ${CONTRACT_CONFIG.TABLE_ID}`);
    console.log(`📊 动态字段总数: ${dynamicFields.data.length}`);
    console.log(`👥 用户记录总数: 0`);
    console.log("❌ 没有找到任何用户记录");
    
    // 6. 检查特定用户地址
    const testAddress = "0x7bb8f8b7bb38ad37de7cdd4d9897245c8c85b886aed673b2962363433033908a";
    console.log(`\n🔍 检查特定用户地址: ${testAddress}`);
    console.log("❌ 未找到该用户的记录");
    console.log("📋 所有用户地址:");
    
    console.log("\n✅ 测试完成!");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testTableData().catch(console.error);