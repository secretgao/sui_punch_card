# 环境配置说明

## 概述

本项目支持通过环境变量配置Sui网络URL，避免硬编码网络地址。

## 环境变量配置

### 前端环境变量

在项目根目录创建 `.env` 文件：

```bash
# Sui网络配置
# 可选值: devnet, testnet, mainnet
VITE_SUI_NETWORK=testnet

# 应用配置
VITE_APP_NAME=打卡系统
VITE_APP_VERSION=1.0.0

# 开发模式配置
VITE_DEBUG_MODE=true
```

### 后端脚本环境变量

对于Node.js脚本，可以设置以下环境变量：

```bash
# Sui网络配置
export SUI_NETWORK=testnet

# 私钥配置（用于脚本执行）
export PRIVATE_KEY=your_private_key_here
```

## 支持的网络

| 网络名称 | 环境变量值 | URL |
|---------|-----------|-----|
| 开发网络 | devnet | https://fullnode.devnet.sui.io:443 |
| 测试网络 | testnet | https://fullnode.testnet.sui.io:443 |
| 主网络 | mainnet | https://fullnode.mainnet.sui.io:443 |

## 使用方法

### 前端使用

```typescript
import { CURRENT_SUI_NETWORK_URL, ENVIRONMENT } from './src/config/environment';

// 获取当前网络URL
const networkUrl = CURRENT_SUI_NETWORK_URL;

// 获取当前网络名称
const networkName = ENVIRONMENT.SUI_NETWORK;

// 使用网络工具
import { NetworkUtils } from './src/utils/network';
NetworkUtils.logNetworkInfo();
```

### 后端脚本使用

```typescript
// 脚本会自动从环境变量读取网络配置
const client = new SuiClient({ url: getNetworkUrl() });
```

## 配置优先级

1. 环境变量 `VITE_SUI_NETWORK` (前端) 或 `SUI_NETWORK` (后端)
2. 默认值 `testnet`

## 注意事项

- 前端使用 `VITE_` 前缀的环境变量
- 后端脚本使用 `SUI_NETWORK` 环境变量
- 所有网络URL都是HTTPS安全连接
- 默认使用测试网络，生产环境请切换到主网络

## 示例

### 开发环境
```bash
VITE_SUI_NETWORK=devnet
```

### 测试环境
```bash
VITE_SUI_NETWORK=testnet
```

### 生产环境
```bash
VITE_SUI_NETWORK=mainnet
``` 