# Irys MCP 서버

FastMCP 프레임워크로 구축된 IRYS L1 체인 통합을 위한 현대적인 Model Context Protocol (MCP) 서버입니다.

## 🚀 주요 기능

### 핵심 기능
- **파일 관리**: IRYS L1 체인에 파일 업로드, 다운로드, 검색
- **배치 작업**: 여러 파일을 효율적으로 처리
- **암호화**: 안전한 파일 저장을 위한 AES-256 암호화
- **GraphQL 쿼리**: IRYS L1 체인 데이터에 직접 접근
- **멀티 토큰 지원**: Ethereum, Solana, Aptos 토큰 타입

### 고급 기능
- **세션 관리**: FastMCP를 통한 독립적인 클라이언트 세션
- **타입 안전성**: Zod 검증을 통한 완전한 TypeScript 지원
- **스트리밍 지원**: HTTP 스트리밍 및 SSE 호환성
- **진행률 모니터링**: 실시간 작업 진행률
- **에러 처리**: 포괄적인 에러 관리
- **성능 모니터링**: 내장된 성능 메트릭

## 🏗️ 아키텍처

### FastMCP 통합
이 프로젝트는 [FastMCP](https://github.com/punkpeye/fastmcp)를 활용합니다:
- **간단한 도구 정의**: 깔끔하고 타입 안전한 도구 등록
- **세션 관리**: 클라이언트별 서비스 인스턴스
- **스트리밍 지원**: 실시간 데이터 스트리밍
- **CLI 도구**: `fastmcp dev` 및 `fastmcp inspect` 지원

### 서비스 구조
```
src/
├── index.ts              # 메인 FastMCP 서버 진입점
├── services/
│   ├── IrysCoreService.ts    # 핵심 IRYS L1 체인 작업
│   ├── IrysAdvancedService.ts # 고급 GraphQL 쿼리
│   └── IrysTestnetService.ts # 테스트넷 전용 작업
└── types/
    └── index.ts          # TypeScript 타입 정의
```

## 🛠️ 설치

```bash
# 저장소 클론
git clone <repository-url>
cd irys-mcp

# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 IRYS 개인키와 네트워크 설정을 추가
```

## ⚙️ 설정

### 환경 변수
```bash
# 필수
IRYS_PRIVATE_KEY=your_private_key_here

# 선택사항
IRYS_NETWORK=mainnet|testnet
IRYS_GATEWAY_URL=https://uploader.irys.xyz
```

### 네트워크 타입
- **Mainnet**: 프로덕션 IRYS L1 네트워크 (독립적인 L1 체인)
- **Testnet**: 개발용 테스트 IRYS L1 네트워크

### 토큰 타입
- **Ethereum**: ETH 기반 트랜잭션
- **Solana**: SOL 기반 트랜잭션  
- **Aptos**: APT 기반 트랜잭션

## 🚀 사용법

### 개발 모드
```bash
# FastMCP로 개발 서버 시작
npm run dev

# 이렇게 하면 서버가 시작되고 테스트를 위한 mcp-cli가 열립니다
```

### 프로덕션 모드
```bash
# 프로젝트 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

### 검사 모드
```bash
# 웹 기반 테스트를 위한 FastMCP 검사기 사용
npm run inspect
```

## 🛠️ 사용 가능한 도구

### 파일 관리
- `irys_upload_file` - IRYS L1 체인에 파일 업로드
- `irys_download_file` - IRYS L1 체인에서 파일 다운로드
- `irys_search_files` - IRYS L1 체인에서 파일 검색
- `irys_batch_upload` - 여러 파일을 배치로 업로드

### 보안
- `irys_encrypt_upload` - AES-256으로 암호화된 파일 업로드

### 블록체인 통합
- `irys_arweave_query` - IRYS L1 체인에 직접 GraphQL 쿼리

### 관리
- `irys_get_balance` - IRYS L1 체인 잔액 확인
- `irys_check_connection` - 네트워크 연결 확인
- `irys_switch_token_type` - 토큰 타입 간 전환
- `irys_monitor_performance` - 시스템 성능 모니터링

## 📊 사용 예시

### 파일 업로드
```typescript
const result = await client.callTool({
  name: "irys_upload_file",
  arguments: {
    filePath: "./example.txt",
    tags: {
      "Content-Type": "text/plain",
      "Category": "documentation"
    }
  }
});
```

### GraphQL 쿼리 실행
```typescript
const result = await client.callTool({
  name: "irys_arweave_query",
  arguments: {
    query: `
      query {
        blocks(first: 10) {
          edges {
            node {
              height
              timestamp
            }
          }
        }
      }
    `
  }
});
```

### 잔액 확인
```typescript
const result = await client.callTool({
  name: "irys_get_balance",
  arguments: {
    tokenType: "ethereum"
  }
});
```

## 🧪 테스트

### 단위 테스트
```bash
npm run test:unit
```

### 통합 테스트
```bash
npm run test:integration
```

### 성능 테스트
```bash
npm run test:performance
```

### 수동 테스트
```bash
# 서버 시작
npm run dev

# 다른 터미널에서 테스트 클라이언트 실행
node test-fastmcp.js
```

## 🔧 개발

### 프로젝트 구조
```
├── src/
│   ├── index.ts                 # FastMCP 서버 진입점
│   ├── services/
│   │   ├── IrysCoreService.ts   # 핵심 IRYS 작업
│   │   ├── IrysAdvancedService.ts # 고급 기능
│   │   └── IrysTestnetService.ts # 테스트넷 작업
│   └── types/
│       └── index.ts             # TypeScript 정의
├── tests/                       # 테스트 파일
├── dist/                        # 컴파일된 출력
└── package.json                 # 프로젝트 설정
```

### 주요 구성 요소

#### FastMCP 서버 (`src/index.ts`)
- FastMCP 프레임워크를 사용한 메인 서버 진입점
- 세션 기반 서비스 관리
- Zod 스키마를 사용한 도구 등록
- 클라이언트 연결을 위한 이벤트 처리

#### IrysCoreService (`src/services/IrysCoreService.ts`)
- 핵심 IRYS L1 체인 작업
- 암호화를 통한 파일 업로드/다운로드
- 배치 처리 기능
- 네트워크 연결 관리

#### 타입 정의 (`src/types/index.ts`)
- 검증을 위한 포괄적인 Zod 스키마
- 모든 작업을 위한 TypeScript 인터페이스
- 에러 타입 정의
- 요청/응답 타입 매핑

## 🌟 주요 개선사항

### FastMCP의 장점
1. **타입 안전성**: 런타임 검증을 통한 완전한 TypeScript 지원
2. **세션 관리**: 독립적인 클라이언트 세션
3. **스트리밍**: 실시간 데이터 스트리밍 기능
4. **CLI 도구**: 내장된 개발 및 검사 도구
5. **에러 처리**: 포괄적인 에러 관리

### 아키텍처 개선
1. **모듈화 설계**: 전용 서비스로 관심사 분리
2. **깔끔한 코드**: 1863줄에서 관리 가능한 모듈로 복잡성 감소
3. **타입 안전성**: 적절한 스키마로 `any` 타입 제거
4. **세션 격리**: 클라이언트별 서비스 인스턴스
5. **현대적 패턴**: ES 모듈 및 현대적 JavaScript 기능

## 🔗 통합

### Claude Desktop
Claude Desktop 설정에 추가:
```json
{
  "mcpServers": {
    "irys-mcp": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/project/src/index.ts"],
      "env": {
        "IRYS_PRIVATE_KEY": "your_private_key",
        "IRYS_NETWORK": "mainnet"
      }
    }
  }
}
```

### 기타 MCP 클라이언트
이 서버는 Model Context Protocol 사양을 지원하는 모든 MCP 클라이언트와 호환됩니다.

## 📝 라이선스

MIT 라이선스 - 자세한 내용은 LICENSE 파일을 참조하세요.

## 🤝 기여

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다
3. 변경사항을 만듭니다
4. 새 기능에 대한 테스트를 추가합니다
5. 풀 리퀘스트를 제출합니다

## 📚 리소스

- [FastMCP 문서](https://github.com/punkpeye/fastmcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [IRYS 문서](https://docs.irys.xyz/)
- [IRYS L1 체인](https://irys.xyz/)

## 🆘 지원

문제와 질문에 대해:
1. [FastMCP 문서](https://github.com/punkpeye/fastmcp)를 확인하세요
2. [IRYS 문서](https://docs.irys.xyz/)를 검토하세요
3. 이 저장소에 이슈를 열어주세요

---

**참고**: 이 프로젝트는 IRYS를 Arweave와 더 이상 관련이 없는 독립적인 L1 체인으로 사용합니다. 