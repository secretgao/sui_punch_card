#!/bin/bash

# 打卡合约部署和测试脚本
# 使用方法: ./scripts/deploy_and_test.sh

echo "🚀 开始部署打卡合约..."

# 1. 编译合约
echo "📦 编译合约..."
sui move build

# 2. 部署合约
echo "🚀 部署合约到测试网..."
sui client publish --gas-budget 10000000

# 获取部署的包ID和对象ID
PACKAGE_ID=$(sui client objects | grep "simple_counter" | head -1 | awk '{print $1}')
echo "📦 包ID: $PACKAGE_ID"

# 3. 初始化全局表
echo "🔧 初始化全局表..."
sui client call --package $PACKAGE_ID --module punch_card --function init --gas-budget 1000000

# 获取全局表对象ID
TABLE_ID=$(sui client objects | grep "PunchCardTable" | head -1 | awk '{print $1}')
echo "📊 全局表ID: $TABLE_ID"

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 使用说明："
echo "1. 打卡命令："
echo "   sui client call --package $PACKAGE_ID --module punch_card --function punch_in --args $TABLE_ID --gas-budget 1000000"
echo ""
echo "2. 查询用户打卡次数："
echo "   sui client call --package $PACKAGE_ID --module punch_card --function get_count --args $TABLE_ID <用户地址>"
echo ""
echo "3. 查询用户信息："
echo "   sui client call --package $PACKAGE_ID --module punch_card --function get_user_info --args $TABLE_ID <用户地址>"
echo ""
echo "4. 查询排行榜用户数："
echo "   sui client call --package $PACKAGE_ID --module punch_card --function get_ranking_count --args $TABLE_ID"
echo ""
echo "5. 运行测试："
echo "   sui move test" 