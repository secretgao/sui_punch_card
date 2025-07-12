import React from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "../constants/contract";
import { PunchCardConfig, PunchCardRecord, PunchCardLeaderboard } from "../types/punchCard";
import { CURRENT_SUI_NETWORK_URL } from "../config/environment";

// 创建 Sui 客户端 - 使用环境配置的网络URL
const createSuiClient = () => {
  return new SuiClient({ url: CURRENT_SUI_NETWORK_URL });
};

// 获取配置
export const usePunchCardConfig = () => {
  return useQuery({
    queryKey: ["punchCardConfig"],
    queryFn: async (): Promise<PunchCardConfig> => {
      console.log("🔍 开始获取配置...");
      console.log("配置ID:", CONTRACT_CONFIG.CONFIG_ID);
      
      try {
        const client = createSuiClient();
        console.log("✅ Sui 客户端创建成功");
        
        console.log("📋 获取配置对象...");
        const result = await client.getObject({
          id: CONTRACT_CONFIG.CONFIG_ID,
          options: {
            showContent: true,
          },
        });
        
        console.log("📋 配置对象结果:", result);
        
        if (result.data?.content?.dataType === "moveObject") {
          const content = result.data.content as any;
          console.log("📋 配置内容:", content);
          console.log("📋 配置字段:", content.fields);
          
          const configData = {
            bronze_threshold: parseInt(content.fields.copper_requirement),
            silver_threshold: parseInt(content.fields.silver_requirement),
            gold_threshold: parseInt(content.fields.gold_requirement),
            time_interval: parseInt(content.fields.time_interval),
          };
          
          console.log("✅ 解析后的配置:", configData);
          return configData;
        }
        
        console.log("❌ 配置对象不是 moveObject 类型");
        throw new Error("Failed to get config");
      } catch (error: any) {
        console.error("❌ 获取配置时出错:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    enabled: !!CONTRACT_CONFIG.CONFIG_ID,
  });
};

// 获取用户记录
export const useUserRecord = (address?: string) => {
  return useQuery({
    queryKey: ["userRecord", address],
    queryFn: async (): Promise<PunchCardRecord | null> => {
      console.log("🔍 开始获取用户记录...");
      console.log("用户地址:", address);
      console.log("表格ID:", CONTRACT_CONFIG.TABLE_ID);
      
      if (!address) {
        console.log("❌ 用户地址为空，返回 null");
        return null;
      }
      
      try {
        const client = createSuiClient();
        console.log("✅ Sui 客户端创建成功");
        
        console.log("📊 获取表格动态字段...");
        const result = await client.getDynamicFields({
          parentId: CONTRACT_CONFIG.TABLE_ID,
          cursor: null,
          limit: 1000,
        });
        
        console.log("📋 动态字段结果:", result);
        console.log("📊 表格中的字段数量:", result.data.length);
        
        // 查找用户的记录
        console.log("🔍 查找用户记录...");
        const userRecord = result.data.find(
          (field: any) => field.name.value === address
        );
        
        console.log("👤 找到的用户记录:", userRecord);
        
        if (userRecord) {
          console.log("📄 获取用户记录详情...");
          const recordData = await client.getObject({
            id: userRecord.objectId,
            options: { showContent: true },
          });
          
          console.log("📄 用户记录详情:", recordData);
          
          if (recordData.data?.content?.dataType === "moveObject") {
            const content = recordData.data.content as any;
            console.log("📋 用户记录内容:", content);
            console.log("📋 用户记录字段:", content.fields);
            
            const rewards_claimed = parseInt(content.fields.rewards_claimed);
            console.log("🏆 奖励状态 (原始):", content.fields.rewards_claimed);
            console.log("🏆 奖励状态 (解析后):", rewards_claimed);
            
            const userRecordData = {
              user_address: content.fields.owner,
              punch_count: parseInt(content.fields.count),
              last_punch_time: parseInt(content.fields.last_punch_time) * 1000, // 转换为毫秒
              bronze_rewarded: (rewards_claimed & 1) !== 0,
              silver_rewarded: (rewards_claimed & 2) !== 0,
              gold_rewarded: (rewards_claimed & 4) !== 0,
            };
            
            console.log("✅ 解析后的用户记录:", userRecordData);
            return userRecordData;
          } else {
            console.log("❌ 用户记录不是 moveObject 类型");
          }
        } else {
          console.log("❌ 未找到用户记录");
        }
        
        console.log("❌ 返回 null");
        return null;
      } catch (error: any) {
        console.error("❌ 获取用户记录时出错:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    enabled: !!address && !!CONTRACT_CONFIG.TABLE_ID,
  });
};

// 获取排行榜
export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<PunchCardLeaderboard[]> => {
      console.log("🔍 开始获取排行榜...");
      console.log("表格ID:", CONTRACT_CONFIG.TABLE_ID);
      
      try {
        const client = createSuiClient();
        console.log("✅ Sui 客户端创建成功");
        
        // 获取表格对象
        const tableObject = await client.getObject({
          id: CONTRACT_CONFIG.TABLE_ID,
          options: { showContent: true },
        });
        
        // 获取 table 字段的 id
        const tableContent = tableObject.data?.content as any;
        const tableId = tableContent?.fields?.table?.fields?.id?.id;
        
        console.log("📋 表格的 table 字段ID:", tableId);
        
        if (!tableId) {
          console.log("❌ 无法获取 table 字段ID");
          return [];
        }
        
        // 获取 table 字段的动态字段
        const tableDynamicFields = await client.getDynamicFields({
          parentId: tableId,
          cursor: null,
          limit: 1000,
        });
        
        console.log("📊 table 字段动态字段总数:", tableDynamicFields.data.length);
        
        const records: any[] = [];
        
        // 获取所有记录
        console.log("📄 获取所有用户记录...");
        for (const field of tableDynamicFields.data) {
          console.log("📄 处理字段:", field);
          
          const recordData = await client.getObject({
            id: field.objectId,
            options: { showContent: true },
          });
          
          console.log("📄 记录数据:", recordData);
          
          if (recordData.data?.content?.dataType === "moveObject") {
            const content = recordData.data.content as any;
            console.log("📋 记录内容:", content);
            
            // 正确解析用户打卡信息
            const value = content.fields.value.fields;
            const record = {
              user_address: value.owner,
              punch_count: parseInt(value.count),
              last_punch_time: parseInt(value.last_punch_time) * 1000,
            };
            
            console.log("✅ 解析后的记录:", record);
            records.push(record);
          } else {
            console.log("❌ 记录不是 moveObject 类型");
          }
        }
        
        console.log("📊 所有记录:", records);
        
        // 按打卡次数排序并添加排名
        const sortedRecords = records
          .sort((a: any, b: any) => b.punch_count - a.punch_count)
          .map((record, index) => ({
            user_address: record.user_address,
            punch_count: record.punch_count,
            rank: index + 1,
          }));
        
        console.log("🏆 排序后的排行榜:", sortedRecords);
        return sortedRecords;
      } catch (error: any) {
        console.error("❌ 获取排行榜时出错:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    enabled: !!CONTRACT_CONFIG.TABLE_ID,
  });
};

// 打卡功能
export const usePunch = () => {
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      
      try {
        console.log("开始打卡...");
        console.log("用户地址:", account.address);
        console.log("合约地址:", CONTRACT_CONFIG.PACKAGE_ID);
        console.log("表格ID:", CONTRACT_CONFIG.TABLE_ID);
        console.log("配置ID:", CONTRACT_CONFIG.CONFIG_ID);
        
        // 创建交易块
        const tx = new Transaction();
        
        // 调用打卡函数 - 添加Clock参数
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::punch_in`,
          arguments: [
            tx.object(CONTRACT_CONFIG.TABLE_ID),   // 表格对象
            tx.object(CONTRACT_CONFIG.CONFIG_ID),  // 配置对象
            tx.object("0x6"), // Clock对象ID（Sui测试网络的Clock对象）
          ],
        });
        
        console.log("交易构建完成，准备执行...");
        
        // 执行交易
        const result = await signAndExecute.mutateAsync({
          transaction: tx,
        });
        
        console.log("打卡交易结果:", result);
        return result;
      } catch (error) {
        console.error("打卡过程中出错:", error);
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ["userRecord"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      console.log("打卡成功！");
    },
    onError: (error) => {
      console.error("打卡失败:", error);
      console.error("错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    },
  });
};

// 领取奖励功能
export const useClaimRewards = () => {
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      
      try {
        console.log("开始领取奖励...");
        console.log("用户地址:", account.address);
        console.log("合约地址:", CONTRACT_CONFIG.PACKAGE_ID);
        console.log("表格ID:", CONTRACT_CONFIG.TABLE_ID);
        console.log("配置ID:", CONTRACT_CONFIG.CONFIG_ID);
        
        // 创建交易块
        const tx = new Transaction();
        
        // 调用领取奖励函数
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::claim_rewards`,
          arguments: [
            tx.object(CONTRACT_CONFIG.TABLE_ID),   // 表格对象
            tx.object(CONTRACT_CONFIG.CONFIG_ID),  // 配置对象
          ],
        });
        
        console.log("交易构建完成，准备执行...");
        
        // 执行交易
        const result = await signAndExecute.mutateAsync({
          transaction: tx,
        });
        
        console.log("领取奖励交易结果:", result);
        return result;
      } catch (error) {
        console.error("领取奖励过程中出错:", error);
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ["userRecord"] });
      console.log("领取奖励成功！");
    },
    onError: (error) => {
      console.error("领取奖励失败:", error);
      console.error("错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    },
  });
};

// 组合 Hook：获取完整的打卡状态
export const usePunchCardState = () => {
  const account = useCurrentAccount();
  const config = usePunchCardConfig();
  const userRecord = useUserRecord(account?.address);
  const leaderboard = useLeaderboard();
  
  console.log("🔍 组合Hook状态:");
  console.log("用户地址:", account?.address);
  console.log("配置数据:", config.data);
  console.log("用户记录:", userRecord.data);
  console.log("排行榜:", leaderboard.data);
  console.log("配置加载状态:", config.isLoading);
  console.log("用户记录加载状态:", userRecord.isLoading);
  console.log("排行榜加载状态:", leaderboard.isLoading);
  console.log("配置错误:", config.error);
  console.log("用户记录错误:", userRecord.error);
  console.log("排行榜错误:", leaderboard.error);
  
  const canPunch = React.useMemo(() => {
    if (!userRecord.data || !config.data) {
      console.log("❌ 无法判断是否可以打卡 - 数据不完整");
      return false;
    }
    
    // 修改：处理无时间限制的情况
    if (config.data.time_interval === 0) {
      console.log("✅ 无时间限制，可以随时打卡");
      return true;
    }
    
    // 修改：使用时间戳计算（秒）
    const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    const lastPunch = Math.floor(userRecord.data.last_punch_time / 1000); // 上次打卡时间（秒）
    const intervalSeconds = config.data.time_interval; // 时间间隔（秒）
    const timeDiff = now - lastPunch;
    
    console.log("⏰ 时间计算:");
    console.log("当前时间(秒):", now);
    console.log("上次打卡时间(秒):", lastPunch);
    console.log("时间间隔(秒):", intervalSeconds);
    console.log("时间差(秒):", timeDiff);
    console.log("是否可以打卡:", timeDiff >= intervalSeconds);
    
    // 添加额外的缓冲时间，确保不会因为时间精度问题失败
    const bufferTime = 5; // 5秒缓冲
    const canPunchNow = timeDiff >= (intervalSeconds + bufferTime);
    
    console.log("缓冲时间(秒):", bufferTime);
    console.log("最终判断:", canPunchNow);
    
    return canPunchNow;
  }, [userRecord.data, config.data]);
  
  const nextPunchTime = React.useMemo(() => {
    if (!userRecord.data || !config.data) return 0;
    
    // 修改：处理无时间限制的情况
    if (config.data.time_interval === 0) {
      return 0; // 无时间限制，立即可以打卡
    }
    
    const lastPunch = Math.floor(userRecord.data.last_punch_time / 1000); // 上次打卡时间（秒）
    const intervalSeconds = config.data.time_interval; // 时间间隔（秒）
    const bufferTime = 5; // 5秒缓冲
    
    return (lastPunch + intervalSeconds + bufferTime) * 1000; // 转换为毫秒
  }, [userRecord.data, config.data]);
  
  const result = {
    config: config.data,
    userRecord: userRecord.data,
    leaderboard: leaderboard.data || [],
    canPunch,
    nextPunchTime,
    isLoading: config.isLoading || userRecord.isLoading || leaderboard.isLoading,
    error: config.error || userRecord.error || leaderboard.error,
  };
  
  console.log("✅ 组合Hook返回结果:", result);
  return result;
}; 