import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Flex, Heading, Text, Badge } from "@radix-ui/themes";
import { NetworkUtils } from "../utils/network";

export function NetworkStatus() {
  const account = useCurrentAccount();
  
  if (!account) {
    return null;
  }
  
  const currentNetwork = NetworkUtils.getCurrentNetwork();
  const networkDisplayName = NetworkUtils.getNetworkDisplayName(currentNetwork);
  const networkColor = NetworkUtils.getNetworkColor(currentNetwork);
  
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Heading size="4">钱包信息</Heading>
        <Flex justify="between" align="center">
          <Text>钱包地址</Text>
          <Text size="2" color="gray">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </Text>
        </Flex>
        <Flex justify="between" align="center">
          <Text>连接状态</Text>
          <Badge color="green">已连接</Badge>
        </Flex>
        <Flex justify="between" align="center">
          <Text>当前网络</Text>
          <Badge color={networkColor as any}>{networkDisplayName}</Badge>
        </Flex>
        <Flex justify="between" align="center">
          <Text>网络类型</Text>
          <Text size="2" color="gray">{currentNetwork}</Text>
        </Flex>
      </Flex>
    </Card>
  );
} 