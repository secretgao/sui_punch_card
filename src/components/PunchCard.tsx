import React, { useState } from "react";
import { Box, Button, Card, Flex, Heading, Text, Badge, Separator } from "@radix-ui/themes";
import { usePunchCardState, usePunch, useClaimRewards } from "../hooks/usePunchCard";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { Confetti } from "./Confetti";
import { NetworkStatus } from "./NetworkStatus";
import { NetworkChecker } from "./NetworkChecker";
import { TestButtons } from "./TestButtons";
import { RefreshButton } from "./RefreshButton";

import { PunchRecordVerifier } from "./PunchRecordVerifier";

import { TimeChecker } from "./TimeChecker";
import { RewardHistory } from "./RewardHistory";
import { RewardStatus } from "./RewardStatus";

export function PunchCard() {
  const account = useCurrentAccount();
  const { config, userRecord, leaderboard, canPunch, nextPunchTime, isLoading, error } = usePunchCardState();
  const punchMutation = usePunch();
  const claimRewardsMutation = useClaimRewards();
  const { balance, isLoading: balanceLoading } = useWalletBalance();
  const [showConfetti, setShowConfetti] = useState(false);

  if (!account) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">打卡系统</Heading>
          <Text color="gray">请先连接钱包</Text>
        </Flex>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">打卡系统</Heading>
          <Text>加载中...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">打卡系统</Heading>
          <Text color="red">加载失败</Text>
        </Flex>
      </Card>
    );
  }

  const handlePunch = () => {
    punchMutation.mutate(undefined, {
      onSuccess: () => {
        setShowConfetti(true);
        console.log("触发撒花特效！");
      },
    });
  };

  const handleClaimRewards = () => {
    claimRewardsMutation.mutate(undefined, {
      onSuccess: () => {
        setShowConfetti(true);
        console.log("触发撒花特效！");
      },
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRewardStatus = () => {
    if (!userRecord) return [];
    
    const rewards = [];
    if (userRecord.bronze_rewarded) rewards.push("铜牌");
    if (userRecord.silver_rewarded) rewards.push("银牌");
    if (userRecord.gold_rewarded) rewards.push("金牌");
    
    return rewards;
  };

  // 检查是否可以领取奖励
  const canClaimRewards = () => {
    if (!userRecord || !config) return false;
    
    const { punch_count } = userRecord;
    const { bronze_threshold, silver_threshold, gold_threshold } = config;
    
    // 检查是否达到任何奖励门槛且未领取
    return (
      (punch_count >= bronze_threshold && !userRecord.bronze_rewarded) ||
      (punch_count >= silver_threshold && !userRecord.silver_rewarded) ||
      (punch_count >= gold_threshold && !userRecord.gold_rewarded)
    );
  };

  // 获取可领取的奖励信息
  const getAvailableRewards = () => {
    if (!userRecord || !config) return [];
    
    const { punch_count } = userRecord;
    const { bronze_threshold, silver_threshold, gold_threshold } = config;
    
    const rewards = [];
    
    if (punch_count >= bronze_threshold && !userRecord.bronze_rewarded) {
      rewards.push("铜牌");
    }
    if (punch_count >= silver_threshold && !userRecord.silver_rewarded) {
      rewards.push("银牌");
    }
    if (punch_count >= gold_threshold && !userRecord.gold_rewarded) {
      rewards.push("金牌");
    }
    
    return rewards;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  const getTimeUntilNextPunch = () => {
    if (!nextPunchTime) return "现在可以打卡";
    
    const now = Date.now();
    const diff = nextPunchTime - now;
    
    if (diff <= 0) return "现在可以打卡";
    
    // 修改：使用秒计算
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒后`;
    } else {
      return `${seconds}秒后`;
    }
  };

  return (
    <Flex direction="column" gap="4">
      {/* 撒花特效 */}
      <Confetti 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* 网络诊断 */}
      <NetworkChecker />
      
      {/* 测试工具 */}
      <TestButtons />
      
      {/* 数据刷新 */}
      <RefreshButton />
      

      
      {/* 我的打卡记录 */}
      <PunchRecordVerifier />
      

      
      {/* 时间状态检查 */}
      <TimeChecker />
      
      {/* 我的奖励记录 */}
      <RewardHistory />
      
      {/* 奖励状态 */}
      <RewardStatus />
      
      {/* 钱包信息 */}
      <NetworkStatus />
      
      {/* 钱包余额 */}
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">钱包余额</Heading>
          <Flex justify="between" align="center">
            <Text>SUI 余额</Text>
            <Text weight="bold" size="5">
              {balanceLoading ? "加载中..." : `${(parseInt(balance) / 1000000000).toFixed(4)} SUI`}
            </Text>
          </Flex>
        </Flex>
      </Card>

      {/* 配置信息 */}
      {config && (
        <Card size="2">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">奖励配置</Heading>
              <Text size="1" color="gray">实时从区块链获取</Text>
            </Flex>
            <Flex gap="4">
              <Box>
                <Text size="2" color="gray">铜牌门槛</Text>
                <Text weight="bold">{config.bronze_threshold} 次</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">银牌门槛</Text>
                <Text weight="bold">{config.silver_threshold} 次</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">金牌门槛</Text>
                <Text weight="bold">{config.gold_threshold} 次</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">打卡间隔</Text>
                <Text weight="bold">
                  {config.time_interval === 0 ? "无限制" : `${config.time_interval} 秒`}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* 用户打卡信息 */}
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">我的打卡</Heading>
          
          {userRecord ? (
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text>打卡次数</Text>
                <Text weight="bold" size="5">{userRecord.punch_count}</Text>
              </Flex>
              
              <Flex justify="between" align="center">
                <Text>最后打卡</Text>
                <Text>{formatTime(userRecord.last_punch_time)}</Text>
              </Flex>
              
              {getRewardStatus().length > 0 && (
                <Flex gap="2">
                  <Text size="2" color="gray">已获得奖励:</Text>
                  {getRewardStatus().map((reward) => (
                    <Badge key={reward} color="gold">{reward}</Badge>
                  ))}
                </Flex>
              )}
              
              {/* 奖励进度显示 */}
              {config && userRecord && (
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray">奖励进度:</Text>
                  <Flex gap="2" wrap="wrap">
                    <Badge color={userRecord.punch_count >= config.bronze_threshold ? "orange" : "gray"}>
                      铜牌: {userRecord.punch_count}/{config.bronze_threshold}
                    </Badge>
                    <Badge color={userRecord.punch_count >= config.silver_threshold ? "gray" : "gray"}>
                      银牌: {userRecord.punch_count}/{config.silver_threshold}
                    </Badge>
                    <Badge color={userRecord.punch_count >= config.gold_threshold ? "gold" : "gray"}>
                      金牌: {userRecord.punch_count}/{config.gold_threshold}
                    </Badge>
                  </Flex>
                </Flex>
              )}
              
              <Separator />
              
              <Flex justify="between" align="center">
                <Text>下次可打卡</Text>
                <Text>
                  {canPunch ? (
                    <Badge color="green">现在可以打卡</Badge>
                  ) : (
                    getTimeUntilNextPunch()
                  )}
                </Text>
              </Flex>
              
              <Flex gap="2">
                <Button 
                  size="3" 
                  disabled={!canPunch || punchMutation.isPending}
                  onClick={handlePunch}
                >
                  {punchMutation.isPending ? "打卡中..." : "打卡"}
                </Button>
                
                <Button 
                  size="3" 
                  variant="outline"
                  disabled={!canClaimRewards() || claimRewardsMutation.isPending}
                  onClick={handleClaimRewards}
                >
                  {claimRewardsMutation.isPending ? "领取中..." : 
                   canClaimRewards() ? `领取奖励 (${getAvailableRewards().join(", ")})` : "暂无奖励可领取"}
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="3">
              <Text>还没有打卡记录</Text>
              <Flex gap="2">
                <Button 
                  size="3" 
                  disabled={punchMutation.isPending}
                  onClick={handlePunch}
                >
                  {punchMutation.isPending ? "开始打卡" : "开始打卡"}
                </Button>
                
                <Button 
                  size="3" 
                  variant="outline"
                  disabled={true}
                >
                  暂无奖励可领取
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Card>

      {/* 排行榜 */}
      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">排行榜</Heading>
          
          {leaderboard.length > 0 ? (
            <Flex direction="column" gap="2">
              {leaderboard.slice(0, 10).map((item) => (
                <Flex key={item.user_address} justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Badge color={item.rank <= 3 ? "gold" : "gray"}>
                      #{item.rank}
                    </Badge>
                    <Text>{formatAddress(item.user_address)}</Text>
                  </Flex>
                  <Text weight="bold">{item.punch_count} 次</Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Text color="gray">暂无排行榜数据</Text>
          )}
        </Flex>
      </Card>
    </Flex>
  );
} 