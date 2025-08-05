# Irys MCP Server

Irys L1 메인넷 및 테스트넷과 연동하는 Model Context Protocol (MCP) 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Irys L1 개인키 (64자 hex 형식)
IRYS_PRIVATE_KEY=your-private-key-here

# Irys L1 네트워크 타입 (mainnet 또는 testnet)
IRYS_NETWORK=mainnet

# Irys L1 RPC URL (선택사항 - 네트워크 타입에 따라 자동 설정됨)
# 메인넷: https://uploader.irys.xyz
# 테스트넷: https://testnet-rpc.irys.xyz/v1
IRYS_GATEWAY_URL=https://uploader.irys.xyz
```

### 3. 서버 실행

```bash
npm start
```

## 🔧 개발

### 빌드

```bash
npm run build
```

### 개발 모드

```bash
npm run dev
```

### 테스트

```bash
# 메인넷 테스트
npm test tests/real-irys.test.ts

# 테스트넷 테스트
npm test tests/real-irys-testnet.test.ts

# 모든 테스트
npm test
```

## 📚 사용법

### 기본 기능

- **파일 업로드**: Irys L1에 파일 업로드
- **파일 다운로드**: Irys L1에서 파일 다운로드
- **파일 검색**: 태그와 메타데이터로 파일 검색
- **통계 조회**: 업로드된 파일들의 통계 정보

### 고급 기능

- **배치 업로드**: 여러 파일을 한 번에 업로드
- **버전 관리**: 파일 버전 생성 및 관리
- **공유 설정**: 파일 공유 권한 관리
- **카테고리 관리**: 파일 카테고리 생성 및 관리
- **태그 관리**: 파일 태그 생성 및 관리
- **성능 모니터링**: 업로드/다운로드 성능 추적

## 🌐 네트워크 정보

### 메인넷
- **네트워크**: Irys L1 메인넷
- **RPC URL**: https://uploader.irys.xyz
- **토큰**: IRYS
- **소수점**: 18
- **서비스 클래스**: `IrysService`

### 테스트넷
- **네트워크**: Irys L1 테스트넷
- **RPC URL**: https://testnet-rpc.irys.xyz/v1
- **Chain ID**: 1270
- **토큰**: IRYS (mIRYS)
- **소수점**: 18
- **서비스 클래스**: `IrysTestnetService`

## 🔄 네트워크 전환

환경 변수 `IRYS_NETWORK`를 변경하여 메인넷과 테스트넷 간 전환이 가능합니다:

```bash
# 메인넷 사용
export IRYS_NETWORK=mainnet

# 테스트넷 사용
export IRYS_NETWORK=testnet
```

## 🏗️ 아키텍처

### 서비스 클래스

#### IrysService (메인넷)
- 메인넷 전용 서비스 클래스
- 모든 기능이 실제 Irys L1 메인넷과 연동
- `src/services/IrysService.ts`

#### IrysTestnetService (테스트넷)
- 테스트넷 전용 서비스 클래스
- 메인넷과 동일한 기능을 테스트넷에서 제공
- 호환성 문제 해결을 위해 메인넷 URL을 사용하여 SDK 초기화
- `src/services/IrysTestnetService.ts`

### 테스트 파일

#### 메인넷 테스트
- `tests/real-irys.test.ts`
- 메인넷의 모든 기능을 실제로 테스트

#### 테스트넷 테스트
- `tests/real-irys-testnet.test.ts`
- 테스트넷의 모든 기능을 실제로 테스트

## 📝 라이선스

MIT License 