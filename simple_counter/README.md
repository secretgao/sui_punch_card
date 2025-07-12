# 打卡合约 (Punch Card Contract)

一个基于 Sui Move 的打卡系统，支持每小时打卡一次，达到指定次数自动发放铜、银、金NFT奖励。

## 🎯 功能特性

### 打卡功能
- ✅ 每小时只能打卡一次
- ✅ 自动累计打卡次数
- ✅ 支持多用户同时使用

### NFT奖励系统
- 🥉 **铜NFT**：打卡10次自动发放
- 🥈 **银NFT**：打卡50次自动发放
- 🥇 **金NFT**：打卡100次自动发放

### 排行榜功能
- 📊 记录所有参与打卡的用户
- 📈 支持查询排行榜用户数量
- 👥 支持查询指定排名的用户

## 🚀 快速开始

### 1. 编译合约
```bash
cd simple_counter
sui move build
```

### 2. 运行测试
```bash
sui move test
```

### 3. 部署合约
```bash
# 部署到测试网
sui client publish --gas-budget 10000000

# 或者使用部署脚本
chmod +x scripts/deploy_and_test.sh
./scripts/deploy_and_test.sh
```

### 4. 初始化全局表
```bash
# 获取包ID后执行
sui client call --package <PACKAGE_ID> --module punch_card --function init --gas-budget 1000000
```

## 📋 合约函数说明

### 核心函数

#### `init(ctx: &mut TxContext): PunchCardTable`
- **功能**：初始化全局表
- **调用**：部署后只需调用一次
- **参数**：无
- **返回**：全局表对象

#### `punch_in(table: &mut PunchCardTable, ctx: &mut TxContext)`
- **功能**：用户打卡
- **限制**：每小时只能调用一次
- **奖励**：达到10/50/100次自动发放对应NFT
- **参数**：全局表对象
- **返回**：无

### 查询函数

#### `get_count(table: &PunchCardTable, user: address): u64`
- **功能**：查询用户打卡次数
- **参数**：全局表对象、用户地址
- **返回**：打卡次数

#### `get_user_info(table: &PunchCardTable, user: address): (u64, bool, bool, bool)`
- **功能**：获取用户完整信息
- **参数**：全局表对象、用户地址
- **返回**：(打卡次数, 铜NFT已领, 银NFT已领, 金NFT已领)

#### `is_copper_claimed(table: &PunchCardTable, user: address): bool`
- **功能**：查询是否已领取铜NFT
- **参数**：全局表对象、用户地址
- **返回**：是否已领取

#### `is_silver_claimed(table: &PunchCardTable, user: address): bool`
- **功能**：查询是否已领取银NFT
- **参数**：全局表对象、用户地址
- **返回**：是否已领取

#### `is_gold_claimed(table: &PunchCardTable, user: address): bool`
- **功能**：查询是否已领取金NFT
- **参数**：全局表对象、用户地址
- **返回**：是否已领取

### 排行榜函数

#### `get_ranking_count(table: &PunchCardTable): u64`
- **功能**：获取排行榜用户总数
- **参数**：全局表对象
- **返回**：用户数量

#### `get_ranking_user(table: &PunchCardTable, index: u64): address`
- **功能**：获取指定排名的用户地址
- **参数**：全局表对象、排名索引
- **返回**：用户地址

## 💡 使用示例

### 打卡操作
```bash
# 用户打卡
sui client call --package <PACKAGE_ID> --module punch_card --function punch_in --args <TABLE_ID> --gas-budget 1000000
```

### 查询操作
```bash
# 查询自己的打卡次数
sui client call --package <PACKAGE_ID> --module punch_card --function get_count --args <TABLE_ID> <YOUR_ADDRESS>

# 查询是否已领取铜NFT
sui client call --package <PACKAGE_ID> --module punch_card --function is_copper_claimed --args <TABLE_ID> <YOUR_ADDRESS>

# 获取完整用户信息
sui client call --package <PACKAGE_ID> --module punch_card --function get_user_info --args <TABLE_ID> <YOUR_ADDRESS>

# 查询排行榜用户数
sui client call --package <PACKAGE_ID> --module punch_card --function get_ranking_count --args <TABLE_ID>
```

## 🧪 测试用例

项目包含完整的测试用例：

- ✅ `test_init()` - 测试初始化功能
- ✅ `test_first_punch()` - 测试首次打卡
- ✅ `test_copper_nft_reward()` - 测试铜NFT奖励
- ✅ `test_silver_nft_reward()` - 测试银NFT奖励
- ✅ `test_gold_nft_reward()` - 测试金NFT奖励
- ✅ `test_multiple_users()` - 测试多用户场景
- ✅ `test_get_user_info()` - 测试用户信息查询

运行测试：
```bash
sui move test
```

## 📁 项目结构

```
simple_counter/
├── sources/
│   ├── punch_card.move          # 主合约文件
│   └── punch_card_tests.move    # 测试文件
├── scripts/
│   └── deploy_and_test.sh       # 部署脚本
├── Move.toml                    # 项目配置
└── README.md                    # 说明文档
```

## 🔧 技术细节

### 数据结构
- **UserPunchInfo**：用户打卡信息
- **CopperNFT/SilverNFT/GoldNFT**：奖励NFT
- **PunchCardTable**：全局表，存储所有用户信息

### 时间控制
- 使用 `tx_context::timestamp_ms()` 获取当前时间
- 每小时限制：3600_000 毫秒 = 1小时

### 奖励机制
- 自动检测：每次打卡时检查是否达到奖励条件
- 防重复：使用布尔标志防止重复领取
- 即时发放：达到条件立即发放NFT到用户钱包

