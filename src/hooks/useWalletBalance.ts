import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

export const useWalletBalance = () => {
  const account = useCurrentAccount();
  
  const { data, isLoading, error } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address as string,
      coinType: "0x2::sui::SUI",
    },
    {
      enabled: !!account?.address,
    }
  );

  return {
    balance: data?.totalBalance || "0",
    isLoading,
    error,
  };
}; 