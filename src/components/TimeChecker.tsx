import React from "react";
import { Card, Flex, Heading, Text, Button, Box } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { CONTRACT_CONFIG } from "../constants/contract";

export function TimeChecker() {
  const account = useCurrentAccount();
  const [timeData, setTimeData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const checkTimeStatus = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      console.log("⏰ 开始检查时间状态...");
      
      const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
      
      // 1. 获取当前epoch
      console.log("📅 获取当前epoch...");
      const latestCheckpoint = await client.getCheckpoint({ id: "latest" });
      const currentEpoch = latestCheckpoint.epoch;
      
      console.log("📅 当前epoch:", currentEpoch);
      
      // 2. 获取配置信息
      console.log("⚙️ 获取配置信息...");
      const configObject = await client.getObject({
        id: CONTRACT_CONFIG.CONFIG_ID,
        options: { showContent: true },
      });
      
      let timeInterval = 1; // 默认值
      if (configObject.data?.content?.dataType === "moveObject") {
        const content = configObject.data.content as any;
        timeInterval = parseInt(content.fields.time_interval);
      }
      
      console.log("⚙️ 时间间隔:", timeInterval, "epoch");
      
      // 3. 获取用户记录
      console.log("👤 获取用户记录...");
      const dynamicFields = await client.getDynamicFields({
        parentId: CONTRACT_CONFIG.TABLE_ID,
        cursor: null,
        limit: 1000,
      });
      
      const userRecord = dynamicFields.data.find(
        (field: any) => field.name.value === account.address
      );
      
      let userRecordData = null;
      let lastPunchTime = 0;
      let punchCount = 0;
      
      if (userRecord) {
        const recordData = await client.getObject({
          id: userRecord.objectId,
          options: { showContent: true },
        });
        
        if (recordData.data?.content?.dataType === "moveObject") {
          const content = recordData.data.content as any;
          lastPunchTime = parseInt(content.fields.last_punch_time);
          punchCount = parseInt(content.fields.count);
          userRecordData = recordData.data;
        }
      }
      
      console.log("👤 用户记录:", {
        lastPunchTime,
        punchCount,
        hasRecord: !!userRecord
      });
      
      // 4. 计算时间状态
      const nextAllowedTime = lastPunchTime + timeInterval;
      const canPunch = Number(currentEpoch) >= nextAllowedTime;
      const timeRemaining = nextAllowedTime > Number(currentEpoch) ? nextAllowedTime - Number(currentEpoch) : 0;
      
      console.log("⏰ 时间计算:", {
        currentEpoch,
        lastPunchTime,
        timeInterval,
        nextAllowedTime,
        canPunch,
        timeRemaining
      });
      
      setTimeData({
        currentEpoch,
        timeInterval,
        lastPunchTime,
        punchCount,
        nextAllowedTime,
        canPunch,
        timeRemaining,
        hasRecord: !!userRecord,
        userRecordData,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      console.error("❌ 时间检查失败:", error);
      setTimeData({ 
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!account) return null;
  
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Heading size="4">时间状态检查</Heading>
        <Text size="2" color="gray">
          检查当前epoch、打卡时间间隔和下次可打卡时间
        </Text>
        <Button size="2" onClick={checkTimeStatus} disabled={isLoading}>
          {isLoading ? "检查中..." : "检查时间状态"}
        </Button>
        
        {timeData && (
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="bold">检查时间:</Text>
              <Text size="1" color="gray">{timeData.timestamp}</Text>
            </Box>
            
            <Box>
              <Text size="2" weight="bold">当前状态:</Text>
              <Text size="1" color="gray">当前Epoch: {timeData.currentEpoch}</Text>
              <Text size="1" color="gray">时间间隔: {timeData.timeInterval} epoch</Text>
              <Text size="1" color="gray">打卡次数: {timeData.punchCount}</Text>
              <Text size="1" color="gray">有记录: {timeData.hasRecord ? "是" : "否"}</Text>
            </Box>
            
            {timeData.hasRecord && (
              <Box>
                <Text size="2" weight="bold">打卡时间:</Text>
                <Text size="1" color="gray">上次打卡: Epoch {timeData.lastPunchTime}</Text>
                <Text size="1" color="gray">下次可打卡: Epoch {timeData.nextAllowedTime}</Text>
                <Text size="1" color="gray">
                  状态: {timeData.canPunch ? 
                    <Text color="green">可以打卡</Text> : 
                    <Text color="red">还需等待 {timeData.timeRemaining} epoch</Text>
                  }
                </Text>
              </Box>
            )}
            
            {!timeData.hasRecord && (
              <Box>
                <Text size="2" weight="bold" color="green">新用户</Text>
                <Text size="1" color="gray">首次打卡，可以立即打卡</Text>
              </Box>
            )}
            
            {timeData.error && (
              <Box>
                <Text size="2" weight="bold" color="red">错误信息:</Text>
                <Text size="1" color="red">{timeData.error}</Text>
                {timeData.stack && (
                  <Text size="1" color="red">{timeData.stack}</Text>
                )}
              </Box>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
} 