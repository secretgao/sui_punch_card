import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { PunchCardConfig, PunchCardRecord, PunchCardLeaderboard } from "../types/punchCard";

// 模拟配置数据
const mockConfig: PunchCardConfig = {
  bronze_threshold: 10,
  silver_threshold: 50,
  gold_threshold: 100,
  punch_interval_hours: 1,
};

// 模拟用户记录
const mockUserRecord: PunchCardRecord = {
  user_address: "0x1234567890abcdef1234567890abcdef12345678",
  punch_count: 25,
  last_punch_time: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
  bronze_rewarded: true,
  silver_rewarded: false,
  gold_rewarded: false,
};

// 模拟排行榜数据
const mockLeaderboard: PunchCardLeaderboard[] = [
  { user_address: "0x1234567890abcdef1234567890abcdef12345678", punch_count: 25, rank: 1 },
  { user_address: "0xabcdef1234567890abcdef1234567890abcdef12", punch_count: 20, rank: 2 },
  { user_address: "0x567890abcdef1234567890abcdef1234567890ab", punch_count: 15, rank: 3 },
  { user_address: "0xdef1234567890abcdef1234567890abcdef1234", punch_count: 12, rank: 4 },
  { user_address: "0x890abcdef1234567890abcdef1234567890abcd", punch_count: 10, rank: 5 },
];

// 模拟打卡功能
export const usePunchMock = () => {
  const [isPending, setIsPending] = React.useState(false);
  
  const mutate = React.useCallback(async () => {
    setIsPending(true);
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPending(false);
    // 这里可以添加成功提示
    alert("打卡成功！");
  }, []);
  
  return { mutate, isPending };
};

// 模拟完整的打卡状态
export const usePunchCardStateMock = () => {
  const account = useCurrentAccount();
  
  const canPunch = React.useMemo(() => {
    if (!mockUserRecord) return false;
    
    const now = Date.now();
    const lastPunch = mockUserRecord.last_punch_time;
    const intervalMs = mockConfig.punch_interval_hours * 60 * 60 * 1000;
    
    return now - lastPunch >= intervalMs;
  }, []);
  
  const nextPunchTime = React.useMemo(() => {
    if (!mockUserRecord) return 0;
    
    const lastPunch = mockUserRecord.last_punch_time;
    const intervalMs = mockConfig.punch_interval_hours * 60 * 60 * 1000;
    
    return lastPunch + intervalMs;
  }, []);
  
  return {
    config: mockConfig,
    userRecord: account ? mockUserRecord : null,
    leaderboard: mockLeaderboard,
    canPunch,
    nextPunchTime,
    isLoading: false,
    error: null,
  };
}; 