import { SuiClient } from "@mysten/sui/client";

// 最新部署的合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

// 测试用户地址（请替换为你的地址）
const TEST_USER_ADDRESS = "0x7bb8f8b7bb38ad37de7cdd4d9897245c8c85b886aed673b2962363433033908a";

async function checkUserNFTs() {
  console.log("🔍 检查用户NFT...");
  console.log("用户地址:", TEST_USER_ADDRESS);
  
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    console.log("✅ Sui 客户端创建成功");
    
    // 获取用户拥有的所有对象
    console.log("\n📋 获取用户对象...");
    const objects = await client.getOwnedObjects({
      owner: TEST_USER_ADDRESS,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    console.log("📋 用户对象总数:", objects.data.length);
    
    const nfts: any[] = [];
    const otherObjects: any[] = [];
    
    // 遍历所有对象
    for (const obj of objects.data) {
      if (obj.data?.content?.dataType === "moveObject") {
        const content = obj.data.content as any;
        const type = content.type;
        
        console.log(`📄 对象类型: ${type}`);
        console.log(`📄 对象ID: ${obj.data.objectId}`);
        
        // 检查是否是NFT
        if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
          console.log("🏆 找到NFT!");
          
          let nftType = "Unknown";
          if (type.includes("CopperNFT")) nftType = "CopperNFT";
          else if (type.includes("SilverNFT")) nftType = "SilverNFT";
          else if (type.includes("GoldNFT")) nftType = "GoldNFT";
          
          const nft = {
            id: obj.data.objectId,
            type: nftType,
            package_id: type.split("::")[0],
            name: content.fields?.name || "Unknown",
            description: content.fields?.description || "Unknown",
            image_url: content.fields?.image_url || "Unknown",
            background_color: content.fields?.background_color || "Unknown",
            punch_time: content.fields?.punch_time || "Unknown",
          };
          
          nfts.push(nft);
          console.log("🏆 NFT详情:", nft);
        } else {
          otherObjects.push({
            id: obj.data.objectId,
            type: type,
          });
        }
      }
    }
    
    // 输出结果
    console.log("\n📊 ========== 检查结果 ==========");
    console.log(`👤 用户地址: ${TEST_USER_ADDRESS}`);
    console.log(`📋 总对象数: ${objects.data.length}`);
    console.log(`🏆 NFT数量: ${nfts.length}`);
    console.log(`📦 其他对象数: ${otherObjects.length}`);
    
    if (nfts.length > 0) {
      console.log("\n🏆 用户拥有的NFT:");
      nfts.forEach((nft, index) => {
        console.log(`\n${index + 1}. ${nft.type}`);
        console.log(`   ID: ${nft.id}`);
        console.log(`   Package: ${nft.package_id}`);
        console.log(`   名称: ${nft.name}`);
        console.log(`   描述: ${nft.description}`);
        console.log(`   图片URL: ${nft.image_url}`);
        console.log(`   背景色: ${nft.background_color}`);
        console.log(`   打卡时间: ${nft.punch_time}`);
      });
    } else {
      console.log("\n❌ 用户没有NFT");
    }
    
    if (otherObjects.length > 0) {
      console.log("\n📦 其他对象:");
      otherObjects.forEach((obj, index) => {
        console.log(`${index + 1}. ${obj.type} (${obj.id})`);
      });
    }
    
    // 检查是否来自新合约
    const newContractNFTs = nfts.filter(nft => 
      nft.package_id === CONTRACT_CONFIG.PACKAGE_ID
    );
    
    const oldContractNFTs = nfts.filter(nft => 
      nft.package_id !== CONTRACT_CONFIG.PACKAGE_ID
    );
    
    console.log("\n📋 合约分析:");
    console.log(`✅ 新合约NFT: ${newContractNFTs.length}个`);
    console.log(`⚠️ 旧合约NFT: ${oldContractNFTs.length}个`);
    
    if (oldContractNFTs.length > 0) {
      console.log("\n⚠️ 旧合约NFT详情:");
      oldContractNFTs.forEach((nft, index) => {
        console.log(`${index + 1}. ${nft.type} (Package: ${nft.package_id})`);
      });
    }
    
  } catch (error) {
    console.error("❌ 检查失败:", error);
  }
}

// 运行检查
checkUserNFTs().catch(console.error); 