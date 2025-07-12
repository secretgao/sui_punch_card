# 打卡应用 (Punch Card App)

基于 Sui 区块链的打卡应用，支持连续打卡获得 NFT 奖励。

## 🚀 功能特性

### 核心功能
- **智能打卡**: 基于时间间隔的智能打卡系统
- **NFT 奖励**: 连续打卡获得铜牌、银牌、金牌 NFT
- **实时状态**: 实时显示打卡记录和奖励状态
- **排行榜**: 显示用户打卡排行榜
- **历史记录**: 查看详细的打卡历史记录

### NFT 系统
- **铜牌 NFT**: 连续打卡 2 次获得
- **银牌 NFT**: 连续打卡 3 次获得  
- **金牌 NFT**: 连续打卡 4 次获得
- **真实 NFT**: 所有 NFT 都是真正的区块链资产，可转移和交易

### 技术特性
- **多合约支持**: 支持新旧合约 NFT 同时显示
- **实时同步**: 与区块链实时同步数据
- **钱包集成**: 支持 Sui 钱包连接
- **响应式设计**: 适配各种设备屏幕

## 📋 项目结构

```
punch_card/
├── src/
│   ├── components/          # React 组件
│   │   ├── NFTGallery.tsx      # NFT 画廊组件
│   │   ├── PunchCard.tsx       # 打卡主组件
│   │   ├── RewardStatus.tsx    # 奖励状态组件
│   │   ├── RewardHistory.tsx   # 奖励历史组件
│   │   ├── Leaderboard.tsx     # 排行榜组件
│   │   └── ...
│   ├── config/             # 配置文件
│   ├── constants/          # 常量定义
│   ├── hooks/             # 自定义 Hooks
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript 类型定义
├── simple_counter/        # 合约部分
├── scripts/               # 调试和测试脚本
│   ├── test-table.ts          # 表格数据测试
│   ├── check_user_nfts.ts     # 用户 NFT 检查
│   └── check_nft_generation.ts # NFT 生成检查
└── contracts/             # 智能合约
```

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Radix UI** - 现代化 UI 组件库
- **TanStack Query** - 数据获取和缓存
- **Mysten DApp Kit** - Sui 区块链集成

### 区块链
- **Sui 区块链** - 高性能 Layer 1 区块链
- **Move 语言** - 智能合约开发
- **Sui SDK** - 区块链交互

### 开发工具
- **Vite** - 快速构建工具
- **ESLint** + **Prettier** - 代码规范
- **TypeScript** - 类型安全

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Sui CLI

### 部署合约
```bash
cd simple_counter 
sui move build 
sui client publish --gas-budget 90000000

```
### 拿到部署合约之后的信息 写入到env 文件中
* PACKAGE_ID	
* CONFIG_ID	
* TABLE_ID		
### 安装依赖
```bash
npm install
```

### 配置环境
1. 复制环境配置文件：
```bash
cp .env.example .env
```

2. 配置环境变量：
```env
VITE_SUI_NETWORK=testnet
VITE_CONTRACT_PACKAGE_ID= 
VITE_CONTRACT_CONFIG_ID= 
VITE_CONTRACT_TABLE_ID= 
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看应用

## 📱 使用指南

### 1. 连接钱包
- 点击"连接钱包"按钮
- 选择 Sui 钱包（如 Sui Wallet）
- 授权连接

### 2. 开始打卡
- 查看当前打卡状态
- 点击"打卡"按钮
- 确认交易并等待完成

### 3. 查看奖励
- 在"奖励状态"中查看当前进度
- 在"NFT 画廊"中查看获得的 NFT
- 在"奖励历史"中查看详细记录

### 4. 查看排行榜
- 在"排行榜"中查看所有用户排名
- 按打卡次数排序

## 🏆 NFT 奖励系统

### 奖励规则
- **铜牌**: 连续打卡 2 次
- **银牌**: 连续打卡 3 次
- **金牌**: 连续打卡 4 次

### NFT 特性
- **真实资产**: 所有 NFT 都是真正的区块链资产
- **可转移**: 支持转移给其他用户
- **可交易**: 可以在 NFT 市场交易
- **元数据完整**: 包含名称、描述、图片等完整信息

### 多合约支持
应用支持显示新旧合约的 NFT：
- **新合约 NFT**: 最新版本的 NFT，功能更完善
- **旧合约 NFT**: 历史版本的 NFT，仍可正常显示和使用

## 🔧 开发脚本

### 数据检查脚本
```bash
# 检查表格数据
npx tsx scripts/test-table.ts

# 检查用户 NFT
npx tsx scripts/check_user_nfts.ts

# 检查 NFT 生成情况
npx tsx scripts/check_nft_generation.ts
```

### 合约部署
```bash
# 部署合约
sui client publish --gas-budget 100000000

# 初始化配置
npx tsx scripts/deploy.ts
```

## 📊 合约配置

### 当前配置
- **Package ID**: ``
- **Config ID**: ``
- **Table ID**: ``

### 奖励门槛
- **铜牌**: 2 次
- **银牌**: 3 次
- **金牌**: 4 次
- **时间间隔**: 60 秒

## 🐛 故障排除

### 常见问题

1. **钱包连接失败**
   - 确保安装了 Sui 钱包
   - 检查网络连接
   - 尝试刷新页面

2. **打卡失败**
   - 检查钱包余额
   - 确认网络连接
   - 查看控制台错误信息

3. **NFT 不显示**
   - 检查合约配置
   - 确认钱包地址正确
   - 尝试刷新页面

4. **数据不同步**
   - 点击刷新按钮
   - 检查网络状态
   - 等待区块链确认

### 调试工具
- 使用浏览器开发者工具查看控制台
- 运行调试脚本检查数据
- 查看网络请求和响应

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

**注意**: 这是一个演示项目，请在生产环境中谨慎使用，并确保充分测试所有功能。
