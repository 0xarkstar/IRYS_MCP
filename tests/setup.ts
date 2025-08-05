import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// 환경 변수 로드
dotenv.config();

// 테스트용 개인키 생성 함수
function generateTestPrivateKey(): string {
  return randomBytes(32).toString('hex');
}

// 환경 변수가 설정되지 않은 경우 테스트용 값으로 설정
if (!process.env.IRYS_PRIVATE_KEY) {
  process.env.IRYS_PRIVATE_KEY = generateTestPrivateKey();
  console.log('🔑 테스트용 개인키 생성됨:', process.env.IRYS_PRIVATE_KEY);
}

if (!process.env.IRYS_NETWORK) {
  process.env.IRYS_NETWORK = 'mainnet';
  console.log('🌍 IRYS_NETWORK 설정됨: mainnet');
}

if (!process.env.IRYS_GATEWAY_URL) {
  process.env.IRYS_GATEWAY_URL = 'https://uploader.irys.xyz';
  console.log('🌐 IRYS_GATEWAY_URL 설정됨: https://uploader.irys.xyz');
}

// Jest 설정
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// 전역 테스트 설정
beforeAll(() => {
  console.log('🧪 테스트 환경 설정 완료');
  console.log(`🔑 개인키: ${process.env.IRYS_PRIVATE_KEY ? '설정됨' : '설정되지 않음'}`);
  console.log(`🌍 네트워크: ${process.env.IRYS_NETWORK}`);
  console.log(`🌐 Gateway URL: ${process.env.IRYS_GATEWAY_URL}`);
});

afterAll(() => {
  console.log('🧹 테스트 환경 정리 완료');
});

// 각 테스트 후 정리
afterEach(() => {
  // 테스트 간 격리를 위한 정리 작업
  jest.clearAllMocks();
});

// 테스트 환경 변수 검증
beforeAll(() => {
  const requiredEnvVars = ['IRYS_PRIVATE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  다음 환경변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    console.warn('   일부 테스트가 실패할 수 있습니다.');
  }
});

// 테스트 파일 정리 함수
export const cleanupTestFiles = (filePaths: string[]) => {
  const fs = require('fs');
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // 파일 삭제 실패는 무시
    }
  });
};

// 테스트 데이터 생성 함수
export const createTestFile = (filePath: string, content: string = 'test content') => {
  const fs = require('fs');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};

// 랜덤 테스트 ID 생성
export const generateTestId = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}; 