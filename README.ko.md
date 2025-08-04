# Irys MCP (Model Context Protocol)

TypeScript로 구축된 Irys 분산 스토리지 네트워크용 종합적인 Model Context Protocol (MCP) 구현체입니다.

## 주요 기능

### 핵심 기능
- **파일 업로드/다운로드**: Irys 네트워크에 파일 업로드 및 다운로드
- **파일 검색**: GraphQL 쿼리를 사용한 파일 검색
- **배치 작업**: 여러 파일을 효율적으로 업로드 및 다운로드
- **버전 관리**: 파일 버전 생성 및 관리
- **공유 관리**: 파일 공유 및 접근 권한 제어

### 고급 기능
- **암호화**: AES-256-CBC를 사용한 클라이언트 사이드 파일 암호화/복호화
- **데이터 계약**: 시간, 잔액, 사용자 목록 기반 조건부 접근 제어
- **다중 토큰 지원**: Ethereum, Solana, Aptos, Arweave 토큰 지원
- **디렉토리 업로드**: 전체 디렉토리 재귀적 업로드
- **카테고리 및 태그 관리**: 카테고리와 태그로 파일 구성
- **성능 모니터링**: 업로드/다운로드 성능 메트릭 추적
- **플러그인 시스템**: 확장 가능한 플러그인 아키텍처
- **고급 통계**: 상세한 분석 및 보고

### 파일 관리
- **파일 삭제**: 파일을 삭제된 것으로 표시 (Irys는 실제 삭제를 지원하지 않음)
- **파일 복구**: 이전에 삭제된 파일 복구
- **배치 다운로드**: 여러 파일 동시 다운로드
- **버전 롤백**: 이전 파일 버전으로 롤백

## 설치

```bash
npm install
```

## 설정

루트 디렉토리에 `.env` 파일을 생성하세요:

```env
IRYS_PRIVATE_KEY=your-private-key-here
IRYS_GATEWAY_URL=https://node2.irys.xyz
```

### 개인키 유형
- **Ethereum**: `0x...` 16진수 문자열
- **Solana**: Base58 인코딩된 문자열
- **Aptos**: 16진수 문자열
- **Arweave**: JSON 키 파일 내용

## 사용법

### MCP 서버 시작

```bash
npm run dev
```

### 빌드 및 실행

```bash
npm run build
npm start
```

## API 도구

MCP 서버는 AI 모델 상호작용을 위한 29개의 도구를 제공합니다:

### 파일 작업
- `irys_upload_file`: Irys 네트워크에 파일 업로드
- `irys_download_file`: Irys 네트워크에서 파일 다운로드
- `irys_search_files`: 다양한 기준으로 파일 검색
- `irys_delete_file`: 파일을 삭제된 것으로 표시
- `irys_restore_file`: 삭제된 파일 복구

### 배치 작업
- `irys_batch_upload`: 여러 파일 업로드
- `irys_batch_download`: 여러 파일 다운로드

### 버전 관리
- `irys_create_version`: 새 파일 버전 생성
- `irys_rollback_version`: 이전 버전으로 롤백

### 암호화
- `irys_encrypt_file`: 로컬 파일 암호화
- `irys_decrypt_file`: 로컬 파일 복호화
- `irys_upload_encrypted_file`: 암호화된 파일 업로드
- `irys_download_encrypted_file`: 파일 다운로드 및 복호화

### 데이터 계약
- `irys_upload_with_data_contract`: 접근 제어와 함께 업로드
- `irys_validate_data_contract`: 계약 조건 검증
- `irys_download_with_data_contract`: 계약 검증과 함께 다운로드

### 디렉토리 작업
- `irys_upload_directory`: 전체 디렉토리 업로드

### 관리
- `irys_manage_categories`: 파일 카테고리 관리
- `irys_manage_tags`: 파일 태그 관리
- `irys_monitor_performance`: 시스템 성능 모니터링
- `irys_manage_plugins`: 플러그인 관리
- `irys_get_advanced_stats`: 상세 통계 조회

### 네트워크 작업
- `irys_check_connection`: 네트워크 연결 상태 확인
- `irys_get_balance`: 지갑 잔액 조회
- `irys_get_file_info`: 파일 정보 조회
- `irys_get_stats`: 기본 통계 조회
- `irys_switch_token_type`: 토큰 유형 간 전환
- `irys_update_share_settings`: 파일 공유 설정 업데이트
- `irys_revoke_share`: 파일 공유 접근 권한 해제

## 테스트

모든 테스트 실행:
```bash
npm test
```

특정 테스트 스위트 실행:
```bash
npm run test:unit
npm run test:integration
npm run test:performance
```

## 프로젝트 구조

```
src/
├── index.ts                 # 메인 진입점
├── types/
│   └── index.ts            # TypeScript 타입 및 Zod 스키마
├── services/
│   ├── IrysService.ts      # 핵심 Irys 작업
│   └── IrysAdvancedService.ts # 고급 기능
└── server/
    ├── IrysMCPServer.ts    # 메인 MCP 서버
    └── IrysAdvancedMCPServer.ts # 고급 MCP 서버

tests/
├── unit.test.ts           # 단위 테스트
├── integration.test.ts    # 통합 테스트
├── performance.test.ts    # 성능 테스트
├── advanced.test.ts       # 고급 기능 테스트
└── comprehensive.test.ts  # 종합 테스트

examples/
└── basic-usage.ts         # 사용 예제
```

## 의존성

### 핵심 의존성
- `@irys/sdk`: Irys JavaScript SDK
- `zod`: 스키마 검증
- `dotenv`: 환경 변수 관리
- `mime-types`: MIME 타입 감지

### 고급 의존성
- `@irys/upload`: 고급 업로드 기능
- `@irys/query`: 고급 쿼리 기능
- `@irys/bundles`: 파일 번들링
- `bignumber.js`: 정밀한 숫자 처리
- `csv-parse/csv-stringify`: CSV 처리
- `async-retry`: 재시도 로직
- `base64url`: Base64 URL 인코딩

## 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요
3. 변경사항을 만드세요
4. 새 기능에 대한 테스트를 추가하세요
5. 풀 리퀘스트를 제출하세요

## 라이선스

MIT 라이선스 - 자세한 내용은 LICENSE 파일을 참조하세요.

## 지원

문제나 질문이 있으시면 GitHub에서 이슈를 열어주세요. 