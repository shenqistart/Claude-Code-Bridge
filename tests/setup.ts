// Jest测试设置文件
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 创建临时测试目录
const testTempDir = path.join(os.tmpdir(), 'ccb-test');
process.env.CCB_TEST_DIR = testTempDir;

// 在每个测试前清理临时目录
beforeEach(async () => {
  if (await fs.pathExists(testTempDir)) {
    await fs.remove(testTempDir);
  }
  await fs.ensureDir(testTempDir);
});

// 在所有测试结束后清理
afterAll(async () => {
  if (await fs.pathExists(testTempDir)) {
    await fs.remove(testTempDir);
  }
});