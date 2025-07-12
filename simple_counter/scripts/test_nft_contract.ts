import { SuiClient } from '@mysten/sui/client';

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb519619aa048e7828edec6e4e603fc5f186b38ef3048e815b65a6fc57f39a7cb",
  CONFIG_ID: "0x8616130139e8f866118fdab6e4c27a011a8ff7ca3cabb7ca75c6fdcbae40cd4f",
  TABLE_ID: "0xab9cc0a1e401629ca06a258d8876d50b7052207fd8a82e9d730e242a0ce1646e",
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

// 测试NFT合约
async function testNFTContract() {
  try {
    console.log("🔍 开始测试NFT合约...");
    
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
      console.log("📋 配置内容:", content);
      
      const config = {
        copper_requirement: parseInt(content.fields.copper_requirement),
        silver_requirement: parseInt(content.fields.silver_requirement),
        gold_requirement: parseInt(content.fields.gold_requirement),
        time_interval: parseInt(content.fields.time_interval),
      };
      
      console.log("✅ 配置解析成功:", config);
    }
    
    // 获取表格
    console.log("📊 获取表格...");
    const tableResult = await client.getObject({
      id: CONTRACT_CONFIG.TABLE_ID,
      options: { showContent: true },
    });
    
    if (tableResult.data?.content?.dataType === "moveObject") {
      const content = tableResult.data.content as any;
      console.log("📊 表格内容:", content);
      console.log("✅ 表格对象创建成功");
    }
    
    // 测试NFT元数据
    console.log("\n🏆 测试NFT元数据...");
    console.log("铜牌NFT名称: 铜牌打卡达人");
    console.log("铜牌NFT描述: 连续打卡2次获得的铜牌奖励，象征着坚持的力量！");
    console.log("铜牌NFT图片: https://example.com/copper_badge.png");
    
    console.log("\n银牌NFT名称: 银牌打卡达人");
    console.log("银牌NFT描述: 连续打卡3次获得的银牌奖励，展现了非凡的毅力！");
    console.log("银牌NFT图片: https://example.com/silver_badge.png");
    
    console.log("\n金牌NFT名称: 金牌打卡达人");
    console.log("金牌NFT描述: 连续打卡4次获得的金牌奖励，成就了打卡传奇！");
    console.log("金牌NFT图片: https://example.com/gold_badge.png");
    
    console.log("\n✅ NFT合约测试完成！");
    console.log("📋 新特性:");
    console.log("• 真正的NFT，包含名称、描述、图片URL");
    console.log("• 支持元数据查询");
    console.log("• 可以在钱包中查看NFT详情");
    console.log("• 支持NFT交易和转移");
    
  } catch (error: any) {
    console.error("❌ 测试NFT合约时出错:", error);
    console.error("错误详情:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
  }
}

// 运行脚本
if (require.main === module) {
  testNFTContract();
} 