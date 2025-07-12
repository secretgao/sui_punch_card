import React from "react";
import { Box, Card, Flex, Heading, Text, Badge, Separator } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiClient } from "@mysten/sui/client";
import { CONTRACT_CONFIG } from "../constants/contract";
import { CURRENT_SUI_NETWORK_URL } from "../config/environment";

// 创建 Sui 客户端
const createSuiClient = () => {
  return new SuiClient({ url: CURRENT_SUI_NETWORK_URL });
};

// NFT奖励类型定义
interface RewardNFT {
  id: string;
  type: "CopperNFT" | "SilverNFT" | "GoldNFT";
  name: string;
  description: string;
  image_url: string;
  color: string;
  display_name: string;
}

// 获取用户NFT奖励
const useUserRewards = (address?: string) => {
  return useQuery({
    queryKey: ["userRewards", address],
    queryFn: async (): Promise<RewardNFT[]> => {
      console.log("🔍 开始获取用户NFT奖励...");
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
        
        const rewards: RewardNFT[] = [];
        
        // 遍历所有对象，查找NFT奖励
        for (const obj of objects.data) {
          if (obj.data?.content?.dataType === "moveObject") {
            const content = obj.data.content as any;
            const type = content.type;
            
            // 检查是否是我们的NFT奖励，并且来自新合约
            if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
              // 检查是否来自新合约
              const packageId = type.split("::")[0];
              if (packageId !== CONTRACT_CONFIG.PACKAGE_ID) {
                console.log(`⚠️ 跳过旧合约NFT: ${type} (Package: ${packageId})`);
                continue;
              }
              
              console.log(`✅ 找到新合约NFT: ${type}`);
              
              let rewardType: "CopperNFT" | "SilverNFT" | "GoldNFT";
              let displayName: string;
              let color: string;
              
              if (type.includes("CopperNFT")) {
                rewardType = "CopperNFT";
                displayName = "铜牌打卡达人";
                color = "orange";
              } else if (type.includes("SilverNFT")) {
                rewardType = "SilverNFT";
                displayName = "银牌打卡达人";
                color = "gray";
              } else if (type.includes("GoldNFT")) {
                rewardType = "GoldNFT";
                displayName = "金牌打卡达人";
                color = "gold";
              } else {
                continue;
              }
              
              // 获取NFT的元数据
              const name = content.fields?.name || displayName;
              const description = content.fields?.description || "打卡奖励NFT";
              const image_url = content.fields?.image_url || "https://via.placeholder.com/150";
              
              const reward: RewardNFT = {
                id: obj.data.objectId,
                type: rewardType,
                name: name,
                description: description,
                image_url: image_url,
                color,
                display_name: displayName,
              };
              
              console.log("🏆 找到NFT奖励:", reward);
              rewards.push(reward);
            }
          }
        }
        
        console.log("✅ 用户NFT奖励总数:", rewards.length);
        return rewards;
      } catch (error: any) {
        console.error("❌ 获取用户NFT奖励时出错:", error);
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

export function RewardHistory() {
  const account = useCurrentAccount();
  const { data: rewards, isLoading, error } = useUserRewards(account?.address);

  if (!account) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">我的NFT奖励</Heading>
          <Text color="gray">请先连接钱包</Text>
        </Flex>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">我的NFT奖励</Heading>
          <Text>加载中...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">我的NFT奖励</Heading>
          <Text color="red">加载失败</Text>
        </Flex>
      </Card>
    );
  }

  const getRewardIcon = (type: string) => {
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

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">我的NFT奖励</Heading>
          <Text size="1" color="gray">真正的NFT，包含元数据</Text>
        </Flex>
        
        {rewards && rewards.length > 0 ? (
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              共获得 {rewards.length} 个NFT奖励
            </Text>
            
            <Separator />
            
            {rewards.map((reward, index) => (
              <Box key={reward.id}>
                <Flex gap="3" align="start">
                  {/* NFT图片 */}
                  <Box style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid var(--gray-a5)"
                      }}
                      onError={(e) => {
                        // 图片加载失败时显示图标
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: var(--gray-a3); border-radius: 8px; font-size: 24px;">${getRewardIcon(reward.type)}</div>`;
                        }
                      }}
                    />
                  </Box>
                  
                  {/* NFT信息 */}
                  <Flex direction="column" gap="2" style={{ flex: 1 }}>
                    <Flex justify="between" align="center">
                      <Text weight="bold" size="3">{reward.name}</Text>
                      <Badge color={reward.color as any}>
                        {reward.type.replace("NFT", "")}
                      </Badge>
                    </Flex>
                    
                    <Text size="2" color="gray" style={{ lineHeight: "1.4" }}>
                      {reward.description}
                    </Text>
                    
                    <Text size="1" color="gray">
                      ID: {reward.id.slice(0, 8)}...{reward.id.slice(-6)}
                    </Text>
                  </Flex>
                </Flex>
                
                {index < rewards.length - 1 && <Separator my="3" />}
              </Box>
            ))}
            
            <Separator />
            
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">NFT说明：</Text>
              <Text size="1" color="gray">• 铜牌：连续打卡2次自动获得</Text>
              <Text size="1" color="gray">• 银牌：连续打卡3次自动获得</Text>
              <Text size="1" color="gray">• 金牌：连续打卡4次自动获得</Text>
              <Text size="1" color="gray">• 这些都是真正的NFT，包含名称、描述和图片</Text>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="column" gap="3" align="center">
            <Text size="4">🎯</Text>
            <Text color="gray">还没有获得任何NFT奖励</Text>
            <Text size="1" color="gray">
              继续打卡，达到门槛后会自动获得真正的NFT！
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
} 