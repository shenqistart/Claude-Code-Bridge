# 测试使用指南

## 概述

本项目采用 Jest 测试框架，提供了完整的单元测试和集成测试套件，确保代码质量和功能稳定性。

## 测试结构

```
tests/
├── fixtures/           # 测试数据和辅助函数
│   └── test-data.ts    # 模拟数据和工具函数
├── integration/        # 集成测试
│   ├── current.test.ts # 当前提供商命令测试
│   ├── ls.test.ts      # 列表命令测试
│   └── status.test.ts  # 状态命令测试
├── unit/               # 单元测试
│   ├── errors.test.ts  # 错误类测试
│   ├── logger.test.ts  # 日志工具测试
│   └── system.test.ts  # 系统工具测试
└── setup.ts            # 测试环境设置
```

## 测试脚本

### 基本命令

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 CI 环境测试（不交互模式）
npm run test:ci
```

### 运行特定测试

```bash
# 运行单个测试文件
npm test -- tests/unit/logger.test.ts

# 运行特定目录的测试
npm test -- tests/unit/

# 运行匹配模式的测试
npm test -- --testNamePattern="logger"
```

## 测试覆盖率

### 当前覆盖率

| 类别 | 覆盖率 | 说明 |
|------|--------|------|
| 语句 | 19.64% | 已测试的语句百分比 |
| 分支 | 10% | 已测试的条件分支百分比 |
| 函数 | 30.76% | 已测试的函数百分比 |
| 行数 | 19.79% | 已测试的代码行百分比 |

### 模块覆盖率详情

#### 已完全测试的模块
- ✅ `src/utils/errors.ts` - 100% 覆盖率
- ✅ `src/utils/logger.ts` - 100% 覆盖率  
- ✅ `src/commands/current.ts` - 100% 覆盖率
- ✅ `src/commands/ls.ts` - 100% 覆盖率
- ✅ `src/commands/status.ts` - 100% 覆盖率

#### 部分测试的模块
- 🟡 `src/utils/system.ts` - 50% 覆盖率
- 🟡 `src/config/manager.ts` - 10.41% 覆盖率

#### 未测试的模块
- 🔴 `src/commands/add.ts` - 0% 覆盖率
- 🔴 `src/commands/install.ts` - 0% 覆盖率
- 🔴 `src/commands/use.ts` - 0% 覆盖率
- 🔴 `src/commands/remove.ts` - 0% 覆盖率
- 🔴 `src/commands/setup.ts` - 0% 覆盖率
- 🔴 `src/commands/uninstall.ts` - 0% 覆盖率
- 🔴 `src/utils/file-logger.ts` - 0% 覆盖率

### 查看详细覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看 HTML 格式的详细报告
open coverage/lcov-report/index.html
```

## 编写测试

### 测试文件命名约定

- 单元测试：`*.test.ts`
- 集成测试：`*.test.ts`
- 测试文件应放在对应的 `tests/unit/` 或 `tests/integration/` 目录中

### 测试代码结构

```typescript
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { YourModule } from '../../src/path/to/module';

// Mock 依赖项
jest.mock('../../src/path/to/dependency');

describe('YourModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', () => {
    // 安排 (Arrange)
    const input = 'test input';
    
    // 执行 (Act)
    const result = YourModule.doSomething(input);
    
    // 断言 (Assert)
    expect(result).toBe('expected output');
  });
});
```

### Mock 外部依赖

#### Mock 模块
```typescript
// Mock 整个模块
jest.mock('fs-extra');
const mockFs = require('fs-extra') as jest.Mocked<typeof import('fs-extra')>;

// 设置 mock 返回值
mockFs.readFile.mockResolvedValue('file content');
```

#### Mock 函数
```typescript
// Mock 函数
const mockFunction = jest.fn();
mockFunction.mockReturnValue('return value');
mockFunction.mockResolvedValue('async return value');
```

#### Mock console 输出
```typescript
const mockConsole = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
};

// 在测试中检查输出
expect(mockConsole.log).toHaveBeenCalledWith('expected message');
```

### 测试异步代码

```typescript
test('should handle async operations', async () => {
  // 测试 Promise
  await expect(asyncFunction()).resolves.toBe('result');
  
  // 测试异常
  await expect(asyncFunction()).rejects.toThrow('error message');
});
```

### 测试错误处理

```typescript
test('should handle errors gracefully', () => {
  expect(() => {
    functionThatThrows();
  }).toThrow('Expected error message');
});
```

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 格式：`should [期望行为] when [条件]`
- 例如：`should return user data when valid ID is provided`

### 2. 测试隔离
- 每个测试应该独立运行
- 使用 `beforeEach` 重置 mock 和状态
- 避免测试之间的依赖关系

### 3. Mock 策略
- 只 mock 外部依赖，不 mock 被测试的代码
- 使用明确的 mock 返回值
- 清理 mock 状态

### 4. 断言
- 每个测试应该有明确的断言
- 使用最具体的断言方法
- 验证行为和状态

### 5. 测试覆盖率
- 目标：80% 以上的代码覆盖率
- 优先测试核心业务逻辑
- 包含边界条件和错误情况

## 调试测试

### 运行单个测试
```bash
npm test -- --testNamePattern="specific test name"
```

### 调试模式
```bash
# 运行测试时启用调试
npm test -- --runInBand --detectOpenHandles
```

### 查看详细输出
```bash
# 显示详细测试输出
npm test -- --verbose
```

## CI/CD 集成

### GitHub Actions
项目配置了自动化测试，在每次推送和 Pull Request 时运行：

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:coverage
```

### 测试要求
- 所有测试必须通过
- 新功能必须包含相应的测试
- 维护合理的测试覆盖率

## 常见问题

### Q: 测试运行缓慢怎么办？
A: 
- 使用 `--runInBand` 运行单线程测试
- 检查是否有未关闭的异步操作
- 优化 mock 设置

### Q: Mock 不生效怎么办？
A:
- 确保 mock 在导入模块之前设置
- 使用 `jest.clearAllMocks()` 清理状态
- 检查 mock 路径是否正确

### Q: 测试覆盖率太低怎么办？
A:
- 识别未测试的关键代码路径
- 添加边界条件测试
- 测试错误处理逻辑

### Q: 如何测试交互式命令？
A:
- Mock `inquirer` 模块
- 模拟用户输入
- 验证输出结果

## 更多资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Jest Mock 指南](https://jestjs.io/docs/mock-functions)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)