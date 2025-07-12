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

async function testConfig() {
  try {
    console.log("🔍 开始测试新合约配置...");
    
    const client = createSuiClient();
    console.log("✅ Sui 客户端创建成功");
    
    // 获取配置对象
    console.log("📋 获取配置对象...");
    const configResult = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    console.log("📋 配置对象结果:", configResult);
    
    if (configResult.data?.content?.dataType === "moveObject") {
      const content = configResult.data.content as any;
      console.log("📋 配置内容:", content);
      console.log("📋 配置字段:", content.fields);
      
      const configData = {
        copper_requirement: parseInt(content.fields.copper_requirement),
        silver_requirement: parseInt(content.fields.silver_requirement),
        gold_requirement: parseInt(content.fields.gold_requirement),
        time_interval: parseInt(content.fields.time_interval),
      };
      
      console.log("✅ 解析后的配置:", configData);
      console.log("⏰ 时间间隔:", configData.time_interval, "秒");
      
      if (configData.time_interval === 60) {
        console.log("✅ 配置正确！时间间隔设置为60秒（1分钟）");
      } else {
        console.log("❌ 配置错误！时间间隔不是60秒");
      }
    } else {
      console.log("❌ 配置对象不是 moveObject 类型");
    }
    
    // 获取表格对象
    console.log("📊 获取表格对象...");
    const tableResult = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    console.log("📊 表格对象结果:", tableResult);
    
    if (tableResult.data?.content?.dataType === "moveObject") {
      const content = tableResult.data.content as any;
      console.log("📊 表格内容:", content);
      console.log("✅ 表格对象创建成功");
    } else {
      console.log("❌ 表格对象不是 moveObject 类型");
    }
    
  } catch (error: any) {
    console.error("❌ 测试配置时出错:", error);
    console.error("错误详情:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
  }
}

// 运行脚本
if (require.main === module) {
  testConfig();
} 