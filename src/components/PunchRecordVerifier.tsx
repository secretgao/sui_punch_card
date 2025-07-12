import React from "react";
import { Card, Flex, Heading, Text, Button, Box, Badge } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { CONTRACT_CONFIG } from "../constants/contract";

export function PunchRecordVerifier() {
  const account = useCurrentAccount();
  const [verificationData, setVerificationData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const verifyPunchRecord = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
      
      console.log("🔍 开始获取打卡记录...");
      console.log("👤 当前钱包地址:", account.address);
      console.log("📋 表格ID:", CONTRACT_CONFIG.TABLE_ID);
      
      // 获取表格对象
      const tableObject = await client.getObject({
        id: CONTRACT_CONFIG.TABLE_ID,
        options: { showContent: true },
      });
      
      // 获取 table 字段的 id
      const tableContent = tableObject.data?.content as any;
      const tableId = tableContent?.fields?.table?.fields?.id?.id;
      
      console.log("📋 table 字段ID:", tableId);
      
      if (!tableId) {
        console.log("❌ 无法获取 table 字段ID");
        setVerificationData({
          error: "无法获取表格数据",
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      // 获取 table 字段的动态字段
      const tableDynamicFields = await client.getDynamicFields({
        parentId: tableId,
        cursor: null,
        limit: 1000,
      });
      
      console.log("📊 动态字段总数:", tableDynamicFields.data.length);
      console.log("📋 所有字段名:", tableDynamicFields.data.map((f: any) => f.name.value));
      
      // 查找当前用户的记录
      const userField = tableDynamicFields.data.find(
        (field: any) => field.name.value.toLowerCase() === account.address.toLowerCase()
      );
      
      console.log("🔍 查找用户记录:", userField ? "找到" : "未找到");
      
      let userRecordData = null;
      if (userField) {
        console.log("📄 获取用户记录详情...");
        const recordData = await client.getObject({
          id: userField.objectId,
          options: { showContent: true },
        });
        
        console.log("📄 用户记录详情:", recordData);
        
        if (recordData.data?.content?.dataType === "moveObject") {
          const content = recordData.data.content as any;
          console.log("📋 用户记录内容:", content);
          
          // 正确解析用户打卡信息
          const value = content.fields.value.fields;
          const rewards_claimed = parseInt(value.rewards_claimed);
          const lastPunchEpoch = parseInt(value.last_punch_time);
          
          console.log("📊 解析的打卡数据:", {
            owner: value.owner,
            count: value.count,
            last_punch_time: value.last_punch_time,
            rewards_claimed: value.rewards_claimed,
            parsed_rewards_claimed: rewards_claimed,
            parsed_last_punch_epoch: lastPunchEpoch
          });
          
          userRecordData = {
            user_address: value.owner,
            punch_count: parseInt(value.count),
            last_punch_time: parseInt(value.last_punch_time) * 1000, // 转换为毫秒，和排行榜一致
            last_punch_time_formatted: new Date(parseInt(value.last_punch_time) * 1000).toLocaleString('zh-CN'),
            rewards_claimed: rewards_claimed,
            bronze_rewarded: (rewards_claimed & 1) !== 0,
            silver_rewarded: (rewards_claimed & 2) !== 0,
            gold_rewarded: (rewards_claimed & 4) !== 0,
            object_id: userField.objectId,
            field_name: userField.name.value,
          };
          
          console.log("✅ 解析后的用户记录:", userRecordData);
        } else {
          console.log("❌ 用户记录不是 moveObject 类型");
        }
      } else {
        console.log("❌ 未找到当前用户的记录");
        console.log("📋 可用的字段名:", tableDynamicFields.data.map((f: any) => f.name.value));
      }
      
      setVerificationData({
        userAddress: account.address,
        userRecordData: userRecordData,
        totalFields: tableDynamicFields.data.length,
        availableFields: tableDynamicFields.data.map((f: any) => f.name.value),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ 获取打卡记录失败:", error);
      setVerificationData({ 
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
        <Heading size="4">我的打卡记录</Heading>
        <Text size="2" color="gray">
          查看当前钱包的打卡记录信息
        </Text>
        <Button size="2" onClick={verifyPunchRecord} disabled={isLoading}>
          {isLoading ? "加载中..." : "刷新打卡记录"}
        </Button>
        
        {verificationData && (
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="bold">查询时间:</Text>
              <Text size="1" color="gray">{verificationData.timestamp}</Text>
            </Box>
            
            {verificationData.userRecordData ? (
              <Box>
                <Text size="2" weight="bold">✅ 打卡记录信息:</Text>
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Text size="2" color="gray">用户地址</Text>
                    <Text size="1" color="gray">{verificationData.userRecordData.user_address}</Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text size="2" color="gray">打卡次数</Text>
                    <Text size="4" weight="bold">{verificationData.userRecordData.punch_count}</Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text size="2" color="gray">最后打卡时间</Text>
                    <Text size="2">
                      {verificationData.userRecordData.last_punch_time_formatted}
                    </Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <Text size="2" color="gray">奖励状态:</Text>
                    {verificationData.userRecordData.bronze_rewarded && <Badge color="orange">铜牌</Badge>}
                    {verificationData.userRecordData.silver_rewarded && <Badge color="gray">银牌</Badge>}
                    {verificationData.userRecordData.gold_rewarded && <Badge color="yellow">金牌</Badge>}
                    {!verificationData.userRecordData.bronze_rewarded && !verificationData.userRecordData.silver_rewarded && !verificationData.userRecordData.gold_rewarded && (
                      <Text size="1" color="gray">暂无奖励</Text>
                    )}
                  </Flex>
                </Flex>
              </Box>
            ) : (
              <Box>
                <Text size="2" weight="bold" color="gray">❌ 暂无打卡记录</Text>
                <Text size="1" color="gray">您还没有进行过打卡，请先完成一次打卡</Text>
                {verificationData.totalFields && (
                  <Text size="1" color="gray">
                    表格中共有 {verificationData.totalFields} 个用户记录
                  </Text>
                )}
                {verificationData.availableFields && verificationData.availableFields.length > 0 && (
                  <Text size="1" color="gray">
                    可用的用户地址: {verificationData.availableFields.slice(0, 3).join(", ")}
                    {verificationData.availableFields.length > 3 && "..."}
                  </Text>
                )}
              </Box>
            )}
            
            {verificationData.error && (
              <Box>
                <Text size="2" weight="bold" color="red">错误信息:</Text>
                <Text size="1" color="red">{verificationData.error}</Text>
                {verificationData.stack && (
                  <Text size="1" color="red">{verificationData.stack}</Text>
                )}
              </Box>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
} 