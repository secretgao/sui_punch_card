import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "../constants/contract";

export const useSimplePunch = () => {
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      
      try {
        console.log("🧪 开始简化打卡测试...");
        console.log("用户地址:", account.address);
        console.log("合约地址:", CONTRACT_CONFIG.PACKAGE_ID);
        console.log("表格ID:", CONTRACT_CONFIG.TABLE_ID);
        console.log("配置ID:", CONTRACT_CONFIG.CONFIG_ID);
        
        // 创建交易块
        const tx = new Transaction();
        
        // 调用打卡函数
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::punch_in`,
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
        
        console.log("打卡交易结果:", result);
        return result;
      } catch (error: any) {
        console.error("打卡过程中出错:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      console.log("✅ 打卡成功！");
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ["userRecord"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error) => {
      console.error("❌ 打卡失败:", error);
    },
  });
}; 