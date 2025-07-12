import React from "react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CURRENT_SUI_NETWORK_URL } from "./config/environment";
import { PunchCard } from "./components/PunchCard";
import { RewardHistory } from "./components/RewardHistory";
import { NFTGallery } from "./components/NFTGallery";
import { NetworkStatus } from "./components/NetworkStatus";
import { ConnectButton } from "@mysten/dapp-kit";

// 创建查询客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      gcTime: 1000 * 60 * 10, // 10分钟
    },
  },
});

function App() {
  const clearCache = () => {
    queryClient.clear();
    console.log("🧹 已清除所有缓存");
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Theme>
          <div style={{ 
            minHeight: "100vh", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px"
          }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "20px",
                background: "rgba(255, 255, 255, 0.1)",
                padding: "20px",
                borderRadius: "12px",
                backdropFilter: "blur(10px)"
              }}>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    color: "white", 
                    fontSize: "2rem",
                    fontWeight: "bold"
                  }}>
                    🏆 打卡系统
                  </h1>
                  <p style={{ 
                    margin: "8px 0 0 0", 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.9rem"
                  }}>
                    基于Sui区块链的NFT打卡奖励系统
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={clearCache}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9rem"
                    }}
                  >
                    🧹 清除缓存
                  </button>
                  <ConnectButton />
                </div>
              </div>

              <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
                <PunchCard />
                <NetworkStatus />
              </div>
              
              <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr", marginTop: "20px" }}>
                <RewardHistory />
                <NFTGallery />
              </div>
            </div>
          </div>
        </Theme>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
