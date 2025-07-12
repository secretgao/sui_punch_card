import { SuiClient } from "@mysten/sui/client";

// 新合约配置
const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x7b93707fa6cfe4264d8f7d4a0774c9594481d0474a69cf7dcd22910dcb9a4e01",
  CONFIG_ID: "0x8b3bd62cd65fc79d0cc3f78992be127091dd1a879447d69e1084fd221c6a012a",
  TABLE_ID: "0xa38b7f06b5bdd142fdd5e840fbfb2273b3a4e9d66b94aa368fd9b237100086c1",
};

async function fixTimeInterval() {
  console.log("🔧 修复时间间隔问题...");
  
  console.log("\n📝 问题分析:");
  console.log("- 错误代码 1 表示时间间隔限制");
  console.log("- 当前配置是1分钟间隔，但可能用户刚打卡过");
  console.log("- 需要等待1个epoch（约1分钟）才能再次打卡");
  
  console.log("\n💡 解决方案:");
  console.log("1. 等待1分钟后再次尝试打卡");
  console.log("2. 或者更新配置为无时间限制（推荐用于测试）");
  
  console.log("\n🔧 更新为无时间限制的命令:");
  console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} 2 3 4 0 --gas-budget 1000000`);
  
  console.log("\n📝 说明:");
  console.log("- 参数: 配置ID, 铜牌要求(2), 银牌要求(3), 金牌要求(4), 时间间隔(0=无限制)");
  console.log("- 更新后可以连续打卡，适合测试");
  console.log("- 测试完成后可以改回1分钟间隔");
  
  console.log("\n🎯 测试步骤:");
  console.log("1. 先执行上面的更新命令");
  console.log("2. 然后在前端尝试打卡");
  console.log("3. 应该可以连续打卡多次");
  console.log("4. 测试完成后，可以改回1分钟间隔:");
  console.log(`sui client call --package ${CONTRACT_CONFIG.PACKAGE_ID} --module punch_card --function update_config --args ${CONTRACT_CONFIG.CONFIG_ID} 2 3 4 1 --gas-budget 1000000`);
}

fixTimeInterval(); 