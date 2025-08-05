# Irys L1 연결 설정 가이드

## 1. Node.js 환경 설정

### 1.1 Node.js 설치
```bash
# Windows
# https://nodejs.org/에서 LTS 버전 다운로드

# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.2 Irys SDK 설치
```bash
npm install @irys/sdk
```

## 2. Irys L1 지갑 설정

### 2.1 개인키 생성/가져오기
```bash
# Irys L1은 독립적인 L1 블록체인입니다
# 개인키는 32바이트 hex 문자열 형식이어야 합니다
# 예시: 64자리 hex 문자열
```

### 2.2 환경변수 설정
```bash
# .env 파일 생성
IRYS_PRIVATE_KEY="your-64-character-hex-private-key"
IRYS_GATEWAY_URL="https://uploader.irys.xyz"
```

## 3. TypeScript 코드 예시

### 3.1 Irys L1 연결 예시
```typescript
import Irys from '@irys/sdk';

class IrysL1Service {
  private irys: Irys;
  
  constructor(privateKey: string) {
    // 32바이트 hex 문자열을 Uint8Array로 변환
    const key = new Uint8Array(Buffer.from(privateKey, 'hex'));
    
          this.irys = new Irys({
        url: 'https://uploader.irys.xyz',
        token: 'ethereum', // Irys L1에서 지원하는 토큰
        key: key,
      });
  }
  
  async uploadFile(filePath: string, tags: any[] = []) {
    const receipt = await this.irys.uploadFile(filePath, { tags });
    return {
      success: true,
      transactionId: receipt.id,
      url: receipt.url,
      size: receipt.size
    };
  }
  
  async getBalance() {
    return await this.irys.getLoadedBalance();
  }
}
```

### 3.2 MCP 서버에 통합
```typescript
// src/server/IrysMCPServer.ts 수정
import { IrysService } from '../services/IrysService';

export class IrysMCPServer extends FastMCP {
  private irysService: IrysService;
  
  constructor() {
    super();
    const privateKey = process.env.IRYS_PRIVATE_KEY || '';
    this.irysService = new IrysService(privateKey);
  }
  
  async uploadFile(request: UploadRequest): Promise<UploadResponse> {
    try {
      const result = await this.irysService.uploadFile(request);
      return result;
    } catch (error) {
      console.error('Irys L1 업로드 실패:', error);
      throw error;
    }
  }
}
```

## 4. Irys L1 특성 이해

### 4.1 Irys L1 vs Arweave
- **Irys L1**: 독립적인 Layer 1 블록체인 (datachain)
- **목적**: 저렴한 온체인 데이터 저장
- **토큰**: 자체 토큰 시스템 사용
- **GraphQL**: `https://uploader.irys.xyz/graphql` 엔드포인트
- **게이트웨이**: `https://uploader.irys.xyz`

### 4.2 주요 차이점
```typescript
// Irys L1 설정
const irys = new Irys({
  url: 'https://uploader.irys.xyz',  // Irys L1 게이트웨이
  token: 'ethereum',                  // 지원되는 토큰 타입
  key: privateKeyUint8Array,          // 32바이트 Uint8Array
});

// Arweave 설정 (참고용 - Irys L1과의 차이점 비교)
const arweave = new Arweave({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});
```

## 5. 테스트 및 검증

### 5.1 연결 테스트
```typescript
async function testIrysConnection() {
  const privateKey = process.env.IRYS_PRIVATE_KEY || '';
  const irysService = new IrysService(privateKey);
  
  // 작은 테스트 파일 생성
  const fs = require('fs');
  const testFile = 'test_upload.txt';
  fs.writeFileSync(testFile, 'Irys L1 연결 테스트');
  
  try {
    const result = await irysService.uploadFile({
      filePath: testFile,
      tags: [{ name: 'type', value: 'test' }],
      contentType: 'text/plain',
      description: '연결 테스트'
    });
    
    console.log('업로드 성공:', result);
    console.log('파일 URL:', result.url);
    
  } catch (error) {
    console.error('연결 실패:', error);
  } finally {
    fs.unlinkSync(testFile);
  }
}
```

### 5.2 에러 처리 개선
```typescript
class IrysError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IrysError';
  }
}

class NetworkError extends IrysError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class AuthenticationError extends IrysError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// 에러 처리 예시
try {
  const result = await irysService.uploadFile(request);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('네트워크 에러:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('인증 에러:', error.message);
  } else {
    console.error('알 수 없는 에러:', error);
  }
}
```
    raise NetworkError("업로드 시간 초과")
except json.JSONDecodeError:
    raise NetworkError("응답 파싱 오류")
except Exception as e:
    if "authentication" in str(e).lower():
        raise AuthenticationError("인증 실패")
    else:
        raise IrysError(f"업로드 실패: {e}")
```

## 5. 성능 최적화

### 5.1 연결 풀링
```python
class IrysConnectionPool:
    def __init__(self, max_connections=5):
        self.max_connections = max_connections
        self.active_connections = 0
        self.semaphore = asyncio.Semaphore(max_connections)
    
    async def execute_upload(self, file_path: str, tags: dict):
        async with self.semaphore:
            self.active_connections += 1
            try:
                return await self._upload_file(file_path, tags)
            finally:
                self.active_connections -= 1
```

### 5.2 캐싱
```python
import hashlib
from functools import lru_cache

class IrysCache:
    def __init__(self):
        self.file_cache = {}
    
    def get_file_hash(self, file_path: str) -> str:
        """파일 해시 계산"""
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    @lru_cache(maxsize=100)
    def get_cached_transaction(self, file_hash: str):
        """캐시된 트랜잭션 조회"""
        return self.file_cache.get(file_hash)
```

## 6. 보안 고려사항

### 6.1 개인키 보안
```python
import keyring

class SecureKeyManager:
    def __init__(self):
        self.service_name = "irys-mcp"
    
    def store_key(self, key: str):
        """개인키를 시스템 키체인에 저장"""
        keyring.set_password(self.service_name, "private_key", key)
    
    def get_key(self) -> str:
        """시스템 키체인에서 개인키 조회"""
        return keyring.get_password(self.service_name, "private_key")
    
    def delete_key(self):
        """개인키 삭제"""
        keyring.delete_password(self.service_name, "private_key")
```

### 6.2 파일 검증
```python
import mimetypes
import magic

class FileValidator:
    def __init__(self):
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_types = ['text/plain', 'image/jpeg', 'image/png', 'application/pdf']
    
    def validate_file(self, file_path: str):
        """파일 유효성 검사"""
        file_size = Path(file_path).stat().st_size
        
        if file_size > self.max_file_size:
            raise ValueError(f"파일 크기 초과: {file_size} bytes")
        
        mime_type = magic.from_file(file_path, mime=True)
        if mime_type not in self.allowed_types:
            raise ValueError(f"지원하지 않는 파일 타입: {mime_type}")
```

## 7. 배포 및 운영

### 7.1 Docker 컨테이너화
```dockerfile
FROM python:3.9-slim

# Node.js 설치
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs

# Python 의존성 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# Irys SDK 설치
RUN npm install @irys/sdk

# 애플리케이션 복사
COPY . /app
WORKDIR /app

# 실행
CMD ["python", "-m", "src.irys_mcp.server"]
```

### 7.2 모니터링
```python
import time
import logging

class IrysMonitor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.metrics = {
            'uploads': 0,
            'downloads': 0,
            'errors': 0,
            'total_size': 0
        }
    
    def log_upload(self, file_size: int, duration: float):
        self.metrics['uploads'] += 1
        self.metrics['total_size'] += file_size
        self.logger.info(f"업로드 완료: {file_size} bytes, {duration:.2f}s")
    
    def log_error(self, error: str):
        self.metrics['errors'] += 1
        self.logger.error(f"Irys 에러: {error}")
```

## 8. 다음 단계

1. **Node.js 환경 설정**
2. **Irys SDK 설치**
3. **개인키 설정**
4. **실제 연결 테스트**
5. **에러 처리 구현**
6. **성능 최적화**
7. **보안 강화**
8. **모니터링 추가**

이 단계들을 순서대로 진행하면 실제 Irys 네트워크와 연결된 MCP 서버를 구축할 수 있습니다. 