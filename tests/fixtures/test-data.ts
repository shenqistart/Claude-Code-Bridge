// 测试数据和辅助函数
export const mockProviders = {
  'Anthropic': {
    name: 'Anthropic',
    apiKey: 'sk-ant-test-key'
  },
  'Moonshot AI': {
    name: 'Moonshot AI',
    baseUrl: 'https://api.moonshot.cn/anthropic/',
    apiKey: 'mk-test-key'
  },
  'Custom Provider': {
    name: 'Custom Provider',
    baseUrl: 'https://custom.example.com',
    apiKey: 'custom-test-key'
  }
};

export const mockProvidersConfig = {
  'Moonshot AI': {
    base_url: 'https://api.moonshot.cn/anthropic/',
    api_key: 'mk-test-key'
  },
  'Custom Provider': {
    base_url: 'https://custom.example.com',
    api_key: 'custom-test-key'
  }
};

export const mockSystemInfo = {
  validNode: { isValid: true, version: 'v20.0.0' },
  invalidNode: { isValid: false, version: 'v16.0.0' },
  missingNode: { isValid: false, version: null },
  npmVersion: '10.0.0'
};

export const createMockProcess = (stdout: string = '', stderr: string = '', exitCode: number = 0) => ({
  stdout: {
    on: jest.fn((event, callback) => {
      if (event === 'data') callback(stdout);
    })
  },
  stderr: {
    on: jest.fn((event, callback) => {
      if (event === 'data') callback(stderr);
    })
  },
  on: jest.fn((event, callback) => {
    if (event === 'close') callback(exitCode);
  })
});

export const suppressConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};