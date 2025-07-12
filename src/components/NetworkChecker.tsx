import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Flex, Heading, Text, Badge, Button } from "@radix-ui/themes";

export function NetworkChecker() {
  const account = useCurrentAccount();
  
  const checkNetwork = () => {
    console.log("🔍 检查网络配置...");
    console.log("当前钱包地址:", account?.address);
    console.log("当前网络:", window.location.hostname);
    
    // 检查是否在正确的端口
    if (window.location.port === "5173") {
      console.log("✅ 开发服务器端口正确");
    } else {
      console.log("⚠️ 开发服务器端口可能有问题");
    }
    
    // 检查钱包连接
    if (account) {
      console.log("✅ 钱包已连接");
      console.log("钱包地址:", account.address);
    } else {
      console.log("❌ 钱包未连接");
    }
  };
  
  if (!account) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">网络诊断</Heading>
          <Text color="red">钱包未连接</Text>
          <Text size="2" color="gray">
            请先连接 Sui 钱包，并确保连接到测试网络
          </Text>
        </Flex>
      </Card>
    );
  }
  
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Heading size="4">网络诊断</Heading>
        <Flex justify="between" align="center">
          <Text>钱包状态</Text>
          <Badge color="green">已连接</Badge>
        </Flex>
        <Flex justify="between" align="center">
          <Text>钱包地址</Text>
          <Text size="2" color="gray">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </Text>
        </Flex>
        <Button size="2" onClick={checkNetwork}>
          检查网络配置
        </Button>
        <Text size="2" color="gray">
          点击按钮检查网络配置，结果会显示在控制台
        </Text>
      </Flex>
    </Card>
  );
} 