import { SuiClient, TransactionBlock } from "@mysten/sui/client";

const PACKAGE_ID = "0x1de259084c5e5734412359e8537f1e79a96353b698d4de8caa19fca4ae0d0a52";

async function initContract() {
  const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
  
  console.log("🚀 开始初始化打卡合约...");
  
  try {
    // 创建配置对象
    console.log("📋 创建配置对象...");
    const configTx = new TransactionBlock();
    
    configTx.moveCall({
      target: `${PACKAGE_ID}::punch_card::init_config`,
      arguments: [],
    });
    
    // 创建表格对象
    console.log("📊 创建表格对象...");
    const tableTx = new TransactionBlock();
    
    tableTx.moveCall({
      target: `${PACKAGE_ID}::punch_card::init_table`,
      arguments: [],
    });
    
    console.log("✅ 初始化脚本已创建");
    console.log("请手动执行以下命令：");
    console.log("");
    console.log("1. 创建配置对象：");
    console.log(`sui client call --package ${PACKAGE_ID} --module punch_card --function init_config --gas-budget 10000000`);
    console.log("");
    console.log("2. 创建表格对象：");
    console.log(`sui client call --package ${PACKAGE_ID} --module punch_card --function init_table --gas-budget 10000000`);
    console.log("");
    console.log("3. 获取创建的对象 ID 后，更新前端配置");
    
  } catch (error) {
    console.error("❌ 初始化失败:", error);
  }
}

// 运行初始化
if (require.main === module) {
  initContract().catch(console.error);
}

export { initContract }; 