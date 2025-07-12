import React from "react";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useMinimalTest } from "../hooks/useMinimalTest";
import { useSimplePunch } from "../hooks/useSimplePunch";

export function TestButtons() {
  const minimalTest = useMinimalTest();
  const simplePunch = useSimplePunch();
  
  const handleMinimalTest = () => {
    minimalTest.mutate();
  };
  
  const handleSimplePunch = () => {
    simplePunch.mutate();
  };
  
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Heading size="4">测试工具</Heading>
        
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">步骤1: 测试钱包连接</Text>
          <Button 
            size="2" 
            disabled={minimalTest.isPending}
            onClick={handleMinimalTest}
          >
            {minimalTest.isPending ? "测试中..." : "测试钱包连接"}
          </Button>
          {minimalTest.isError && (
            <Text color="red" size="2">
              钱包连接测试失败
            </Text>
          )}
          {minimalTest.isSuccess && (
            <Text color="green" size="2">
              钱包连接正常
            </Text>
          )}
        </Flex>
        
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">步骤2: 测试打卡交易</Text>
          <Button 
            size="2" 
            disabled={simplePunch.isPending || minimalTest.isError}
            onClick={handleSimplePunch}
          >
            {simplePunch.isPending ? "测试中..." : "测试打卡交易"}
          </Button>
          {simplePunch.isError && (
            <Text color="red" size="2">
              打卡交易测试失败
            </Text>
          )}
          {simplePunch.isSuccess && (
            <Text color="green" size="2">
              打卡交易成功
            </Text>
          )}
        </Flex>
        
        <Text size="1" color="gray">
          请按顺序测试，先测试钱包连接，再测试打卡交易
        </Text>
      </Flex>
    </Card>
  );
} 