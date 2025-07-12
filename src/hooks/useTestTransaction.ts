import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

export const useTestTransaction = () => {
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  
  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      
      console.log("🧪 开始测试交易...");
      console.log("用户地址:", account.address);
      
      // 创建一个简单的测试交易
      const tx = new Transaction();
      
      // 这里可以添加一个简单的 moveCall 或者只是测试钱包连接
      console.log("交易构建完成");
      
      // 执行交易
      const result = await signAndExecute.mutateAsync({
        transaction: tx,
      });
      
      console.log("测试交易结果:", result);
      return result;
    },
    onSuccess: () => {
      console.log("✅ 测试交易成功！钱包连接正常");
    },
    onError: (error) => {
      console.error("❌ 测试交易失败:", error);
    },
  });
}; 