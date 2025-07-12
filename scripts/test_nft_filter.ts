import { SuiClient } from "@mysten/sui/client";

// 最新部署的合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xb9c2a83709893c93243aac7976a212bd3f1e312686d2d07eb935baa1dd118699",
  CONFIG_ID: "0x929acb833688a0e319d7f944bb1003f20c4e9e98c02561a28c26bbe573206b4e",
  TABLE_ID: "0x898cc87e9247f728cfb802b5594f7a31e06c0dfd658cbdbb8288ed8936002774",
};

// 测试用户地址
const TEST_USER_ADDRESS = "0x7bb8f8b7bb38ad37de7cdd4d9897245c8c85b886aed673b2962363433033908a";

async function testNFTFilter() {
  console.log("🔍 测试NFT过滤逻辑...");
  console.log("用户地址:", TEST_USER_ADDRESS);
  console.log("新合约Package ID:", CONTRACT_CONFIG.PACKAGE_ID);
  
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
    
    const allNFTs: any[] = [];
    const newContractNFTs: any[] = [];
    const oldContractNFTs: any[] = [];
    
    // 遍历所有对象，查找NFT
    for (const obj of objects.data) {
      if (obj.data?.content?.dataType === "moveObject") {
        const content = obj.data.content as any;
        const type = content.type;
        
        // 检查是否是NFT
        if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
          const packageId = type.split("::")[0];
          const nft = {
            id: obj.data.objectId,
            type: type,
            package_id: packageId,
            name: content.fields?.name || "Unknown",
            description: content.fields?.description || "Unknown",
            image_url: content.fields?.image_url || "Unknown",
          };
          
          allNFTs.push(nft);
          
          // 分类NFT
          if (packageId === CONTRACT_CONFIG.PACKAGE_ID) {
            newContractNFTs.push(nft);
            console.log(`✅ 新合约NFT: ${type}`);
          } else {
            oldContractNFTs.push(nft);
            console.log(`⚠️ 旧合约NFT: ${type} (Package: ${packageId})`);
          }
        }
      }
    }
    
    // 输出结果
    console.log("\n📊 ========== NFT过滤测试结果 ==========");
    console.log(`👤 用户地址: ${TEST_USER_ADDRESS}`);
    console.log(`📋 总NFT数: ${allNFTs.length}`);
    console.log(`✅ 新合约NFT: ${newContractNFTs.length}个`);
    console.log(`⚠️ 旧合约NFT: ${oldContractNFTs.length}个`);
    
    if (newContractNFTs.length > 0) {
      console.log("\n✅ 新合约NFT详情:");
      newContractNFTs.forEach((nft, index) => {
        console.log(`${index + 1}. ${nft.type}`);
        console.log(`   ID: ${nft.id}`);
        console.log(`   Package: ${nft.package_id}`);
        console.log(`   名称: ${nft.name}`);
        console.log(`   描述: ${nft.description}`);
        console.log(`   图片URL: ${nft.image_url}`);
      });
    } else {
      console.log("\n❌ 没有新合约NFT");
    }
    
    if (oldContractNFTs.length > 0) {
      console.log("\n⚠️ 旧合约NFT详情:");
      oldContractNFTs.forEach((nft, index) => {
        console.log(`${index + 1}. ${nft.type} (Package: ${nft.package_id})`);
      });
    }
    
    // 模拟前端过滤逻辑
    console.log("\n🔧 模拟前端过滤逻辑:");
    console.log("前端应该只显示新合约NFT，跳过旧合约NFT");
    
    const filteredNFTs = allNFTs.filter(nft => {
      const packageId = nft.package_id;
      if (packageId !== CONTRACT_CONFIG.PACKAGE_ID) {
        console.log(`🚫 过滤掉旧合约NFT: ${nft.type} (Package: ${packageId})`);
        return false;
      }
      console.log(`✅ 保留新合约NFT: ${nft.type}`);
      return true;
    });
    
    console.log(`\n📊 过滤后NFT数量: ${filteredNFTs.length}`);
    
    if (filteredNFTs.length === 0) {
      console.log("✅ 前端应该显示: 暂无NFT");
    } else {
      console.log("✅ 前端应该显示新合约NFT");
    }
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testNFTFilter().catch(console.error); 