# Claude Code Bridge (CCB)

一个现代化的 Node.js CLI 工具，用于管理 Claude Code 的安装、配置和多个 Anthropic 兼容 API 提供商。该工具采用类似 nvm 的扁平化命令设计，提供了比原始 shell 脚本更好的开发者体验。

## 特性

- 🚀 **nvm风格设计**: 采用扁平化命令结构，简单直观
- 🔧 **一步到位**: 安装Claude Code并配置提供商
- 🔄 **轻松切换**: 在不同API提供商间快速切换
- 📝 **交互式界面**: 友好的命令行界面和选择菜单
- 🛡️ **安全存储**: API密钥的安全存储和管理
- 📊 **状态检查**: 实时显示系统状态和当前配置
- 🌐 **跨平台**: 支持 macOS、Linux 和 Windows

## 系统要求

- **Node.js** 18 或更高版本
- **npm** (通常与 Node.js 一起安装)
- 互联网连接

## 安装

### 全局安装

```bash
npm install -g claude-code-bridge
```

### 从源代码安装

```bash
git clone <repository-url>
cd claude-code-bridge
npm install
npm run build
npm link
```

## 使用方法

### 快速开始

1. **安装并配置提供商**:
   ```bash
   ccb install
   ```
   启动交互式安装流程，引导完成设置。

2. **查看当前状态**:
   ```bash
   ccb current
   ccb status
   ```

### 核心命令 (nvm风格)

#### `ccb install [provider] [api-key] [options]`
安装 Claude Code 并配置 API 提供商。

**选项**:
- `-u, --base-url <url>`: 自定义提供商的基础 URL
- `-f, --force`: 强制重新安装

**示例**:
```bash
# 交互式安装
ccb install

# 直接安装 Anthropic
ccb install Anthropic your-api-key

# 安装 Moonshot AI (Kimi 模型)
ccb install "Moonshot AI" your-api-key

# 自定义提供商
ccb install "Custom Provider" your-api-key -u https://api.example.com/
```

#### `ccb use [provider]`
切换到指定的 API 提供商（模仿 `nvm use`）。

**示例**:
```bash
# 显示选择菜单
ccb use

# 直接切换
ccb use "Moonshot AI"
ccb use Anthropic
```

#### `ccb ls` / `ccb list`
列出所有已配置的提供商（模仿 `nvm ls`）。

#### `ccb current`
显示当前激活的提供商（模仿 `nvm current`）。

### 提供商管理命令

#### `ccb add <name> <api-key> [options]`
添加新的 API 提供商配置。

**选项**:
- `-u, --base-url <url>`: 提供商的基础 URL

**示例**:
```bash
ccb add "My Provider" your-api-key -u https://api.example.com/
```

#### `ccb remove <provider>` / `ccb rm <provider>`
删除指定的提供商配置。

**示例**:
```bash
ccb remove "My Provider"
ccb rm "Custom Provider"
```

### 系统命令

#### `ccb status`
检查系统状态、安装情况和当前配置。

#### `ccb update`
更新 Claude Code 到最新版本。

#### `ccb uninstall [options]`
卸载 Claude Code 并删除所有配置。

**选项**:
- `-f, --force`: 强制卸载，无需确认

## 命令对比

### 与原shell脚本对比

| 功能 | 原shell脚本 | CCB (新) |
|------|------------|----------|
| 安装配置 | `./cct.sh install` | `ccb install` |
| 添加提供商 | `./cct.sh add-provider` | `ccb add` |
| 切换提供商 | `./cct.sh switch` | `ccb use` |
| 列出提供商 | `./cct.sh list-providers` | `ccb ls` |
| 查看状态 | `./cct.sh check` | `ccb status` |
| 当前提供商 | - | `ccb current` |

### 与nvm对比

| nvm | ccb | 功能 |
|-----|-----|------|
| `nvm install 18` | `ccb install Anthropic key` | 安装并配置 |
| `nvm use 18` | `ccb use Anthropic` | 切换版本/提供商 |
| `nvm ls` | `ccb ls` | 列出已安装项目 |
| `nvm current` | `ccb current` | 显示当前激活项目 |
| `nvm uninstall 16` | `ccb remove Provider` | 删除版本/提供商 |

## 支持的提供商

### 内置提供商

1. **Anthropic**: 官方 Claude API
   - 使用默认的 Anthropic 端点
   - 需要官方 Anthropic API 密钥

2. **Moonshot AI**: 兼容 API，支持最新 Kimi 模型
   - 预配置 Moonshot 端点 (`https://api.moonshot.cn/anthropic/`)
   - 支持最新的 Kimi 模型 (`kimi-k2-0711-preview`)
   - 需要 Moonshot AI API 密钥

### 自定义提供商

支持任何实现 Anthropic 兼容端点的 API 提供商。

## 配置文件

### 文件位置

- **配置目录**: `~/.claude/`
- **提供商配置**: `~/.claude/providers.json`
- **Claude 配置**: `~/.claude.json`
- **日志文件**: `~/.claude/ccb.log`

### 环境变量

工具会自动管理以下环境变量:
- `ANTHROPIC_API_KEY`: 当前提供商的 API 密钥
- `ANTHROPIC_BASE_URL`: 自定义提供商的基础 URL

## 用户体验

### nvm风格的交互体验

```bash
# 类似 nvm，无参数时显示智能提示
$ ccb use
? 选择要切换到的提供商: (Use arrow keys)
❯ Anthropic
  Moonshot AI
  Custom Provider

# 类似 nvm ls 的列表显示
$ ccb ls
可用提供商:

→ Anthropic (官方 API)
  Moonshot AI - https://api.moonshot.cn/anthropic/
  Custom Provider - https://api.example.com/

当前提供商: Anthropic (using official API defaults)
```

### 直观的状态信息

```bash
$ ccb status
系统状态检查:

✓ Node.js v20.0.0
✓ npm 10.0.0
✓ Claude Code 已安装

✓ 所有组件都已正确安装

当前提供商: Anthropic (using official API defaults)
配置的提供商数量: 3

✓ Claude Code 已就绪
```

## 故障排除

### 常见问题

#### Node.js 版本问题
```bash
# 检查版本
node -v
ccb status

# 需要 Node.js 18+
```

#### 权限问题 (macOS/Linux)
```bash
# 配置 npm 全局安装目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 查看详细日志
```bash
# 查看日志
cat ~/.claude/ccb.log
```

### 调试模式

```bash
# 启用调试模式
export DEBUG=1
ccb <command>
```

## 开发

### 本地开发和测试

```bash
# 克隆项目
git clone <repository-url>
cd claude-code-bridge

# 安装依赖
npm install

# 构建项目
npm run build

# 本地链接测试
npm link

# 现在可以使用 ccb 命令测试
ccb --help
```

### 项目结构

```
src/
├── commands/          # 命令实现 (nvm风格)
│   ├── install.ts     # ccb install
│   ├── use.ts         # ccb use (类似 nvm use)
│   ├── ls.ts          # ccb ls (类似 nvm ls)
│   ├── current.ts     # ccb current (类似 nvm current)
│   ├── add.ts         # ccb add
│   ├── remove.ts      # ccb remove
│   ├── status.ts      # ccb status
│   ├── update.ts      # ccb update
│   └── uninstall.ts   # ccb uninstall
├── config/            # 配置管理
│   └── manager.ts
├── utils/             # 工具函数
│   ├── logger.ts
│   ├── file-logger.ts
│   ├── system.ts
│   └── errors.ts
├── types.ts           # 类型定义
└── index.ts           # 主入口 (扁平化命令)
```

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 致谢

本项目受到以下项目的启发：
- [nvm](https://github.com/nvm-sh/nvm) - 命令设计和用户体验
- [LLM-Red-Team/kimi-cc](https://github.com/LLM-Red-Team/kimi-cc) - Kimi模型集成
- 原始 Claude Code Toolkit shell 脚本 - 功能需求

---

如果您遇到问题或有功能建议，请提交 issue 或 pull request。