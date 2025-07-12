import React from "react";
import { Box, Card, Flex, Heading, Text, Badge, Separator, Button } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiClient } from "@mysten/sui/client";
import { CURRENT_SUI_NETWORK_URL } from "../config/environment";
import { CONTRACT_CONFIG } from "../constants/contract";

// 创建 Sui 客户端
const createSuiClient = () => {
  return new SuiClient({ url: CURRENT_SUI_NETWORK_URL });
};

// NFT类型定义
interface NFT {
  id: string;
  type: "CopperNFT" | "SilverNFT" | "GoldNFT";
  name: string;
  description: string;
  image_url: string;
  color: string;
  display_name: string;
  rarity: string;
  level: number;
}

// 获取用户NFT
const useUserNFTs = (address?: string) => {
  return useQuery({
    queryKey: ["userNFTs", address],
    queryFn: async (): Promise<NFT[]> => {
      console.log("🔍 开始获取用户NFT...");
      console.log("用户地址:", address);
      
      if (!address) {
        console.log("❌ 用户地址为空");
        return [];
      }
      
      try {
        const client = createSuiClient();
        console.log("✅ Sui 客户端创建成功");
        
        // 获取用户拥有的所有对象
        console.log("📋 获取用户对象...");
        const objects = await client.getOwnedObjects({
          owner: address,
          options: {
            showContent: true,
            showDisplay: true,
          },
        });
        
        console.log("📋 用户对象总数:", objects.data.length);
        
        const nfts: NFT[] = [];
        
        // 遍历所有对象，查找NFT
        for (const obj of objects.data) {
          if (obj.data?.content?.dataType === "moveObject") {
            const content = obj.data.content as any;
            const type = content.type;
            
            // 检查是否是我们的NFT（包括新旧合约）
            if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
              const packageId = type.split("::")[0];
              const isNewContract = packageId === CONTRACT_CONFIG.PACKAGE_ID;
              
              if (isNewContract) {
                console.log(`✅ 找到新合约NFT: ${type}`);
              } else {
                console.log(`✅ 找到旧合约NFT: ${type} (Package: ${packageId})`);
              }
              
              console.log(`✅ 找到新合约NFT: ${type}`);
              
              let nftType: "CopperNFT" | "SilverNFT" | "GoldNFT";
              let displayName: string;
              let color: string;
              let rarity: string;
              let level: number;
              
              if (type.includes("CopperNFT")) {
                nftType = "CopperNFT";
                displayName = "铜牌打卡达人";
                color = "orange";
                rarity = "普通";
                level = 1;
              } else if (type.includes("SilverNFT")) {
                nftType = "SilverNFT";
                displayName = "银牌打卡达人";
                color = "gray";
                rarity = "稀有";
                level = 2;
              } else if (type.includes("GoldNFT")) {
                nftType = "GoldNFT";
                displayName = "金牌打卡达人";
                color = "gold";
                rarity = "史诗";
                level = 3;
              } else {
                continue;
              }
              
              // 获取NFT的元数据
              const name = content.fields?.name || displayName;
              const description = content.fields?.description || "打卡奖励NFT";
              const image_url = content.fields?.image_url || "https://via.placeholder.com/150";
              
              const nft: NFT = {
                id: obj.data.objectId,
                type: nftType,
                name: isNewContract ? name : `${name} (旧合约)`,
                description: isNewContract ? description : `${description} - 来自旧合约版本`,
                image_url: image_url,
                color,
                display_name: isNewContract ? displayName : `${displayName} (旧合约)`,
                rarity,
                level,
              };
              
              console.log("🏆 找到NFT:", nft);
              nfts.push(nft);
            }
          }
        }
        
        // 按等级排序
        nfts.sort((a, b) => b.level - a.level);
        
        console.log("✅ 用户NFT总数:", nfts.length);
        return nfts;
      } catch (error: any) {
        console.error("❌ 获取用户NFT时出错:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    enabled: !!address,
  });
};

// 获取NFT图标
const getNFTIcon = (type: string) => {
  switch (type) {
    case "CopperNFT":
      return "🥉";
    case "SilverNFT":
      return "🥈";
    case "GoldNFT":
      return "🥇";
    default:
      return "🏆";
  }
};

// 获取稀有度颜色
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "普通":
      return "gray";
    case "稀有":
      return "blue";
    case "史诗":
      return "purple";
    default:
      return "gray";
  }
};

export function NFTGallery() {
  const account = useCurrentAccount();
  const { data: nfts, isLoading, error } = useUserNFTs(account?.address);

  if (!account) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">NFT画廊</Heading>
          <Text color="gray">请先连接钱包</Text>
        </Flex>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">NFT画廊</Heading>
          <Text>加载中...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">NFT画廊</Heading>
          <Text color="red">加载失败</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">NFT画廊</Heading>
          <Text size="1" color="gray">真正的NFT收藏品</Text>
        </Flex>
        
        {nfts && nfts.length > 0 ? (
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              共拥有 {nfts.length} 个NFT
            </Text>
            
            <Separator />
            
            <Flex wrap="wrap" gap="3">
              {nfts.map((nft) => (
                <Card key={nft.id} size="2" style={{ width: "280px" }}>
                  <Flex direction="column" gap="3">
                    {/* NFT图片 */}
                    <Box style={{ width: "100%", height: "200px", position: "relative" }}>
                      <img
                        src={nft.image_url}
                        alt={nft.name}
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: var(--gray-a3); border-radius: 8px; font-size: 48px;">${getNFTIcon(nft.type)}</div>`;
                          }
                        }}
                      />
                      
                      {/* 等级徽章 */}
                      <Box style={{ 
                        position: "absolute", 
                        top: "8px", 
                        right: "8px",
                        background: "var(--gray-a12)",
                        color: "white",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {nft.level}
                      </Box>
                    </Box>
                    
                    {/* NFT信息 */}
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text weight="bold" size="3">{nft.name}</Text>
                        <Badge color={getRarityColor(nft.rarity) as any}>
                          {nft.rarity}
                        </Badge>
                      </Flex>
                      
                      <Text size="2" color="gray" style={{ lineHeight: "1.4" }}>
                        {nft.description}
                      </Text>
                      
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">
                          {nft.type.replace("NFT", "")}
                        </Text>
                        <Text size="1" color="gray">
                          ID: {nft.id.slice(0, 6)}...{nft.id.slice(-4)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
            
            <Separator />
            
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">NFT说明：</Text>
              <Text size="1" color="gray">• 这些都是真正的NFT，包含完整的元数据</Text>
              <Text size="1" color="gray">• 可以在钱包中查看和交易</Text>
              <Text size="1" color="gray">• 支持转移给其他用户</Text>
              <Text size="1" color="gray">• 每个NFT都有独特的ID和属性</Text>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="column" gap="3" align="center">
            <Text size="4">🎨</Text>
            <Text color="gray">还没有任何NFT</Text>
            <Text size="1" color="gray">
              继续打卡，获得真正的NFT收藏品！
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
} 