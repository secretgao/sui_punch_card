import { SuiClient } from '@mysten/sui/client';

async function testPunchRecordVerifier() {
  try {
    console.log("🧪 开始测试打卡记录获取...");
    
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    
    // 合约配置
    const CONTRACT_CONFIG = {
      TABLE_ID: "0x26b8976ca6783e7324631aab3a9a2c297289604bf43226cb0ee008652f14dc6b",
    };
    
    // 1. 获取当前 epoch 信息
    console.log("📊 获取当前 epoch 信息...");
    const latestCheckpoint = await client.getLatestCheckpoint();
    const currentEpoch = parseInt(latestCheckpoint.epoch);
    const currentTimestampMs = parseInt(latestCheckpoint.timestampMs);
    
    console.log("📊 当前 epoch:", currentEpoch);
    console.log("📊 当前时间戳:", currentTimestampMs);
    
    // 2. 获取表格对象
    console.log("📋 获取表格对象...");
    const tableObject = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    console.log("📋 表格对象存在:", !!tableObject.data);
    
    // 3. 获取 table 字段的 id
    const tableContent = tableObject.data?.content;
    const tableId = tableContent?.fields?.table?.fields?.id?.id;
    
    console.log("📋 table 字段ID:", tableId);
    
    if (!tableId) {
      console.log("❌ 无法获取 table 字段ID");
      return;
    }
    
    // 4. 获取 table 字段的动态字段
    console.log("📊 获取 table 字段的动态字段...");
    const tableDynamicFields = await client.getDynamicFields({
      parentId: tableId,
      cursor: null,
      limit: 1000,
    });
    
    console.log("📊 动态字段总数:", tableDynamicFields.data.length);
    
    if (tableDynamicFields.data.length === 0) {
      console.log("❌ 没有找到任何动态字段");
      return;
    }
    
    // 5. 显示前几个字段
    console.log("📋 前5个动态字段:");
    tableDynamicFields.data.slice(0, 5).forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.name.value} -> ${field.objectId}`);
    });
    
    // 6. 获取第一个用户记录的详细信息
    if (tableDynamicFields.data.length > 0) {
      const firstField = tableDynamicFields.data[0];
      console.log("📄 获取第一个用户记录详情...");
      
      const recordData = await client.getObject({
        id: firstField.objectId,
        options: { showContent: true },
      });
      
      console.log("📄 记录数据类型:", recordData.data?.content?.dataType);
      
      if (recordData.data?.content?.dataType === "moveObject") {
        const content = recordData.data.content;
        console.log("📋 记录字段:", Object.keys(content.fields));
        
        if (content.fields.value) {
          const value = content.fields.value.fields;
          console.log("📋 value 字段:", Object.keys(value));
          
          const rewards_claimed = parseInt(value.rewards_claimed);
          const lastPunchEpoch = parseInt(value.last_punch_time);
          
          console.log("📊 解析的打卡数据:", {
            owner: value.owner,
            count: value.count,
            last_punch_time: value.last_punch_time,
            rewards_claimed: value.rewards_claimed,
            parsed_rewards_claimed: rewards_claimed,
            parsed_last_punch_epoch: lastPunchEpoch
          });
          
          // 时间转换
          const epochDiff = lastPunchEpoch - currentEpoch;
          const estimatedTime = new Date(currentTimestampMs + (epochDiff * 24 * 60 * 60 * 1000));
          
          console.log("⏰ 时间转换详情:", {
            lastPunchEpoch,
            currentEpoch,
            epochDiff,
            currentTimestampMs,
            estimatedTime: estimatedTime.toLocaleString()
          });
        }
      }
    }
    
    console.log("✅ 测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
    console.error("错误详情:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
  }
}

testPunchRecordVerifier(); 