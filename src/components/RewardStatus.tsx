import React from "react";
import { Box, Card, Flex, Heading, Text, Badge } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiClient } from "@mysten/sui/client";
import { CONTRACT_CONFIG } from "../constants/contract";

import { CURRENT_SUI_NETWORK_URL } from "../config/environment";

// 创建 Sui 客户端
const createSuiClient = () => {
  return new SuiClient({ url: CURRENT_SUI_NETWORK_URL });
};

// 获取用户奖励状态
const useRewardStatus = (address?: string) => {
  return useQuery({
    queryKey: ["rewardStatus", address],
    queryFn: async (): Promise<{ bronze: boolean; silver: boolean; gold: boolean }> => {
      console.log("🔍 开始获取用户奖励状态...");
      console.log("用户地址:", address);
      
      if (!address) {
        console.log("❌ 用户地址为空");
        return { bronze: false, silver: false, gold: false };
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
          },
        });
        
        console.log("📋 用户对象总数:", objects.data.length);
        
        let bronze = false;
        let silver = false;
        let gold = false;
        
        // 遍历所有对象，查找NFT奖励
        for (const obj of objects.data) {
          if (obj.data?.content?.dataType === "moveObject") {
            const content = obj.data.content as any;
            const type = content.type;
            
            console.log("📄 检查对象:", type);
            
            // 检查是否是我们的NFT奖励，并且来自新合约
            if (type.includes("CopperNFT") || type.includes("SilverNFT") || type.includes("GoldNFT")) {
              // 检查是否来自新合约
              const packageId = type.split("::")[0];
              if (packageId !== CONTRACT_CONFIG.PACKAGE_ID) {
                console.log(`⚠️ 跳过旧合约NFT: ${type} (Package: ${packageId})`);
                continue;
              }
              
              console.log(`✅ 找到新合约NFT: ${type}`);
              
              if (type.includes("CopperNFT")) {
                bronze = true;
                console.log("🥉 找到铜牌NFT");
              } else if (type.includes("SilverNFT")) {
                silver = true;
                console.log("🥈 找到银牌NFT");
              } else if (type.includes("GoldNFT")) {
                gold = true;
                console.log("🥇 找到金牌NFT");
              }
            }
          }
        }
        
        const status = { bronze, silver, gold };
        console.log("✅ 奖励状态:", status);
        return status;
      } catch (error: any) {
        console.error("❌ 获取奖励状态时出错:", error);
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

export function RewardStatus() {
  const account = useCurrentAccount();
  const { data: rewardStatus, isLoading, error } = useRewardStatus(account?.address);

  if (!account) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">奖励状态</Heading>
          <Text color="gray">请先连接钱包</Text>
        </Flex>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">奖励状态</Heading>
          <Text>加载中...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">奖励状态</Heading>
          <Text color="red">加载失败</Text>
        </Flex>
      </Card>
    );
  }

  const totalRewards = (rewardStatus?.bronze ? 1 : 0) + 
                      (rewardStatus?.silver ? 1 : 0) + 
                      (rewardStatus?.gold ? 1 : 0);

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">奖励状态</Heading>
          <Text size="1" color="gray">实时从区块链获取</Text>
        </Flex>
        
        <Flex gap="3" justify="center">
          <Box>
            <Flex direction="column" align="center" gap="1">
              <Text size="4">🥉</Text>
              <Text size="1" color="gray">铜牌</Text>
              <Badge color={rewardStatus?.bronze ? "orange" : "gray"}>
                {rewardStatus?.bronze ? "已获得" : "未获得"}
              </Badge>
            </Flex>
          </Box>
          
          <Box>
            <Flex direction="column" align="center" gap="1">
              <Text size="4">🥈</Text>
              <Text size="1" color="gray">银牌</Text>
              <Badge color={rewardStatus?.silver ? "gray" : "gray"}>
                {rewardStatus?.silver ? "已获得" : "未获得"}
              </Badge>
            </Flex>
          </Box>
          
          <Box>
            <Flex direction="column" align="center" gap="1">
              <Text size="4">🥇</Text>
              <Text size="1" color="gray">金牌</Text>
              <Badge color={rewardStatus?.gold ? "gold" : "gray"}>
                {rewardStatus?.gold ? "已获得" : "未获得"}
              </Badge>
            </Flex>
          </Box>
        </Flex>
        
        <Flex justify="center">
          <Text size="2" color="gray">
            共获得 {totalRewards} 个奖励
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
} 