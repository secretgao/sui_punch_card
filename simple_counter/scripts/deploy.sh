#!/bin/bash

# 设置环境变量
export PRIVATE_KEY="your_private_key_here"

echo "🚀 开始部署打卡合约..."

# 构建合约
echo "📦 构建合约..."
sui move build

# 部署合约
echo "🚀 部署合约到测试网络..."
sui client publish --gas-budget 100000000 --network testnet

echo "✅ 部署完成！"
echo "📋 请更新前端配置中的合约ID" 