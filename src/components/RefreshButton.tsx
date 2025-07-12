import React from "react";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";

export function RefreshButton() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    console.log("🔄 强制刷新数据...");
    
    // 刷新所有相关查询
    queryClient.invalidateQueries({ queryKey: ["punchCardConfig"] });
    queryClient.invalidateQueries({ queryKey: ["userRecord"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    
    console.log("✅ 数据刷新完成");
  };
  
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Heading size="4">数据刷新</Heading>
        <Text size="2" color="gray">
          如果打卡后数据没有更新，点击此按钮强制刷新
        </Text>
        <Button size="2" onClick={handleRefresh}>
          刷新数据
        </Button>
      </Flex>
    </Card>
  );
} 