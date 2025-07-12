import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

export const useMinimalTest = () => {
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  
  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      
      console.log("🧪 开始最小化测试...");
      console.log("用户地址:", account.address);
      
      try {
        // 创建一个空的交易块（不包含任何 moveCall）
        const tx = new Transaction();
        
        console.log("空交易构建完成");
        
        // 执行交易
        const result = await signAndExecute.mutateAsync({
          transaction: tx,
        });
        
        console.log("最小化测试结果:", result);
        return result;
      } catch (error: any) {
        console.error("最小化测试失败:", error);
        console.error("错误详情:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log("✅ 最小化测试成功！钱包连接正常");
    },
    onError: (error) => {
      console.error("❌ 最小化测试失败:", error);
    },
  });
}; 