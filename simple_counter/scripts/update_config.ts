import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

// 合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x367c847e8494687e7f7b0fd91c07821e7a534865725070870873792fd2f75610",
  CONFIG_ID: "0x3fccede9fbf279e67e66574e8348ce8f078903317ab59c59ed98753c57115828",
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

// 从环境变量获取私钥
const getPrivateKey = () => {
  const privateKeyBase64 = process.env.PRIVATE_KEY;
  if (!privateKeyBase64) {
    throw new Error("请设置 PRIVATE_KEY 环境变量");
  }
  
  const privateKeyBytes = fromB64(privateKeyBase64);
  return Ed25519Keypair.fromSecretKey(privateKeyBytes);
};

async function updateConfig() {
  try {
    console.log("🔧 开始更新合约配置...");
    
    const client = createSuiClient();
    const keypair = getPrivateKey();
    
    console.log("✅ Sui 客户端创建成功");
    console.log("✅ 密钥对创建成功");
    
    // 新的配置参数
    const newConfig = {
      copper_requirement: 2,    // 铜NFT所需打卡次数
      silver_requirement: 3,    // 银NFT所需打卡次数
      gold_requirement: 4,      // 金NFT所需打卡次数
      time_interval: 60,        // 打卡时间间隔（60秒 = 1分钟）
    };
    
    console.log("📋 新配置:", newConfig);
    
    // 创建交易
    const tx = new Transaction();
    
    // 调用更新配置函数
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::update_config`,
      arguments: [
        tx.object(CONTRACT_CONFIG.CONFIG_ID),  // 配置对象
        tx.pure.u64(newConfig.copper_requirement),
        tx.pure.u64(newConfig.silver_requirement),
        tx.pure.u64(newConfig.gold_requirement),
        tx.pure.u64(newConfig.time_interval),
      ],
    });
    
    console.log("📝 交易构建完成，准备执行...");
    
    // 执行交易
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    console.log("✅ 配置更新成功！");
    console.log("📋 交易结果:", {
      digest: result.digest,
      effects: result.effects,
      objectChanges: result.objectChanges,
    });
    
    // 验证更新
    console.log("🔍 验证配置更新...");
    const configObject = await client.getObject({
      id: CONTRACT_CONFIG.CONFIG_ID,
      options: { showContent: true },
    });
    
    if (configObject.data?.content?.dataType === "moveObject") {
      const content = configObject.data.content as any;
      console.log("📋 更新后的配置:", {
        copper_requirement: content.fields.copper_requirement,
        silver_requirement: content.fields.silver_requirement,
        gold_requirement: content.fields.gold_requirement,
        time_interval: content.fields.time_interval,
      });
    }
    
  } catch (error: any) {
    console.error("❌ 更新配置失败:", error);
    console.error("错误详情:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
  }
}

// 运行脚本
if (require.main === module) {
  updateConfig();
} 