# Irys MCP 테스트 가이드

이 문서는 Irys MCP 프로젝트의 테스트 실행 방법과 테스트 구조에 대해 설명합니다.

## 📋 목차

1. [테스트 환경 설정](#테스트-환경-설정)
2. [테스트 실행 방법](#테스트-실행-방법)
3. [테스트 종류](#테스트-종류)
4. [테스트 결과 해석](#테스트-결과-해석)
5. [문제 해결](#문제-해결)

## 🛠️ 테스트 환경 설정

### 1. 환경변수 설정

테스트를 실행하기 전에 `.env` 파일을 생성하고 필요한 환경변수를 설정해야 합니다:

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에 다음 내용을 추가하세요:

```env
# 필수 설정
IRYS_PRIVATE_KEY=your-private-key-here

# 선택적 설정
IRYS_GATEWAY_URL=https://node2.irys.xyz
LOG_LEVEL=info
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=text/plain,image/png,image/jpeg,application/pdf
CONNECTION_TIMEOUT=30000
UPLOAD_TIMEOUT=120000

# 테스트 설정
SUPPRESS_LOGS=false
```

### 2. 의존성 설치

```bash
npm install
```

### 3. TypeScript 컴파일

```bash
npm run build
```

## 🚀 테스트 실행 방법

### 전체 테스트 실행

```bash
npm test
```

### 특정 테스트 실행

#### 단위 테스트만 실행
```bash
npm run test:unit
```

#### 통합 테스트만 실행
```bash
npm run test:integration
```

#### 성능 테스트만 실행
```bash
npm run test:performance
```

### 추가 테스트 옵션

#### 테스트 감시 모드 (파일 변경 시 자동 재실행)
```bash
npm run test:watch
```

#### 테스트 커버리지 확인
```bash
npm run test:coverage
```

#### 특정 테스트 파일 실행
```bash
npx jest tests/unit.test.ts
npx jest tests/integration.test.ts
npx jest tests/performance.test.ts
```

#### 특정 테스트 그룹 실행
```bash
npx jest --testNamePattern="연결 테스트"
npx jest --testNamePattern="파일 업로드"
```

## 📊 테스트 종류

### 1. 단위 테스트 (`tests/unit.test.ts`)

**목적**: 개별 컴포넌트의 독립적인 기능 검증

**테스트 범위**:
- `IrysService` 클래스 인스턴스 생성
- `IrysMCPServer` 클래스 인스턴스 생성
- 등록된 도구 목록 확인
- 도구 스키마 구조 검증
- 핸들러 함수 시그니처 검증
- 도구 설명 검증

**실행 시간**: ~30초

### 2. 통합 테스트 (`tests/integration.test.ts`)

**목적**: 실제 Irys 네트워크와의 통합 기능 검증

**테스트 범위**:
- Irys 네트워크 연결 확인
- 파일 업로드/다운로드
- 파일 검색
- 배치 업로드
- 버전 관리
- 공유 설정
- 통계 조회
- 에러 처리

**실행 시간**: ~5-10분

### 3. 성능 테스트 (`tests/performance.test.ts`)

**목적**: 시스템 성능 및 응답 시간 측정

**테스트 범위**:
- 연결 응답 시간 측정
- 파일 업로드 성능 (1KB, 100KB, 1MB)
- 파일 다운로드 성능
- 검색 응답 시간
- 배치 업로드 성능
- 동시 요청 처리
- 메모리 사용량 측정
- 에러 처리 성능

**실행 시간**: ~10-15분

## 📈 테스트 결과 해석

### 성공적인 테스트 결과

```
✅ 모든 테스트 통과
PASS  tests/unit.test.ts
PASS  tests/integration.test.ts
PASS  tests/performance.test.ts

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        45.234 s
```

### 테스트 커버리지 결과

```bash
npm run test:coverage
```

결과 예시:
```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.71 |    76.92 |   88.89 |   85.71 |
 src/     |   85.71 |    76.92 |   88.89 |   85.71 |
  server/ |   90.00 |    80.00 |   90.00 |   90.00 |
  types/  |   80.00 |    75.00 |   85.71 |   80.00 |
----------|---------|----------|---------|---------|-------------------
```

### 성능 테스트 결과

성능 테스트는 콘솔에 상세한 성능 지표를 출력합니다:

```
🔗 연결 확인 응답 시간: 1250ms
💰 잔액 조회 응답 시간: 890ms
📤 1KB 파일 업로드 시간: 4500ms
📤 100KB 파일 업로드 시간: 12000ms
📥 파일 다운로드 시간: 3200ms
🔍 파일 검색 시간: 2100ms
📦 5개 파일 배치 업로드 시간: 45000ms
⚡ 5개 동시 연결 확인 시간: 3500ms
🧠 메모리 사용량 증가: 2.45MB
📊 최종 메모리 사용량: 45.67MB
❌ 에러 응답 시간: 1200ms
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 환경변수 오류

**오류 메시지**:
```
❌ IRYS_PRIVATE_KEY 환경변수가 설정되지 않았습니다.
```

**해결 방법**:
```bash
# .env 파일 확인
cat .env

# 환경변수 설정
export IRYS_PRIVATE_KEY=your-private-key-here
```

#### 2. 네트워크 연결 실패

**오류 메시지**:
```
❌ Irys 네트워크 연결에 실패했습니다.
```

**해결 방법**:
- 인터넷 연결 확인
- 방화벽 설정 확인
- `IRYS_GATEWAY_URL` 환경변수 확인

#### 3. 타임아웃 오류

**오류 메시지**:
```
Timeout - Async callback was not invoked within the 60000ms timeout
```

**해결 방법**:
- 네트워크 상태 확인
- Irys 네트워크 상태 확인
- 타임아웃 설정 증가

#### 4. 메모리 부족 오류

**오류 메시지**:
```
JavaScript heap out of memory
```

**해결 방법**:
```bash
# Node.js 메모리 제한 증가
node --max-old-space-size=4096 node_modules/.bin/jest
```

### 테스트 디버깅

#### 상세 로그 활성화

```bash
# 환경변수 설정
export SUPPRESS_LOGS=false

# 테스트 실행
npm test
```

#### 특정 테스트 디버깅

```bash
# 특정 테스트만 실행
npx jest --testNamePattern="파일 업로드" --verbose

# 디버그 모드로 실행
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### 테스트 파일 정리

테스트 실행 후 남은 파일들을 정리하려면:

```bash
# tests 디렉토리의 임시 파일들 삭제
find tests/ -name "*.txt" -delete
find tests/ -name "test-*" -delete
```

## 📝 테스트 작성 가이드

### 새로운 테스트 추가

1. **테스트 파일 생성**:
```bash
touch tests/new-feature.test.ts
```

2. **테스트 구조**:
```typescript
import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { config } from 'dotenv';

config();

describe('새로운 기능 테스트', () => {
  let server: IrysMCPServer;

  beforeAll(() => {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    server = new IrysMCPServer(privateKey);
  });

  test('기능 테스트', async () => {
    // 테스트 로직
    expect(result).toBe(expected);
  });
});
```

### 테스트 모범 사례

1. **명확한 테스트 이름 사용**
2. **적절한 타임아웃 설정**
3. **테스트 후 정리 작업 수행**
4. **에러 케이스도 테스트**
5. **성능 지표 기록**

## 🎯 테스트 목표

- **단위 테스트**: 90% 이상 커버리지
- **통합 테스트**: 모든 주요 기능 검증
- **성능 테스트**: 응답 시간 기준 충족
- **에러 처리**: 모든 에러 케이스 검증

이 가이드를 따라 테스트를 실행하면 Irys MCP의 안정성과 성능을 확실히 검증할 수 있습니다. 