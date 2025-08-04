import { config } from 'dotenv';
import { join } from 'path';

// 환경변수 로드
config({ path: join(__dirname, '..', '.env') });

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// 글로벌 테스트 타임아웃 설정
jest.setTimeout(60000);

// 콘솔 로그 억제 (테스트 중 불필요한 로그 방지)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // 테스트 시작 시 로그 억제
  if (process.env.SUPPRESS_LOGS === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // 테스트 종료 시 로그 복원
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
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