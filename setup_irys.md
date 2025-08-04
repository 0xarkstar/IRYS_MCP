# 실제 Irys 연결 설정 가이드

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

## 2. Irys 지갑 설정

### 2.1 개인키 생성/가져오기
```bash
# Arweave 지갑 생성 (Irys는 Arweave 기반)
npx arweave-keygen wallet.json
```

### 2.2 환경변수 설정
```bash
# .env 파일 생성
IRYS_PRIVATE_KEY="your-private-key-here"
IRYS_GATEWAY_URL="https://node2.irys.xyz"
```

## 3. Python 코드 수정

### 3.1 실제 Irys 브리지 구현
```python
import os
import json
import subprocess
from pathlib import Path

class RealIrysBridge:
    def __init__(self):
        self.private_key = os.getenv('IRYS_PRIVATE_KEY')
        self.gateway_url = os.getenv('IRYS_GATEWAY_URL', 'https://node2.irys.xyz')
    
    async def upload_file(self, file_path: str, tags: dict = None):
        script = f"""
        const Irys = require('@irys/sdk');
        
        async function upload() {{
            const irys = new Irys({{
                url: '{self.gateway_url}',
                token: 'arweave',
                key: '{self.private_key}'
            }});
            
            const receipt = await irys.uploadFile('{file_path}', {{
                tags: {json.dumps(tags or {})}
            }});
            
            console.log(JSON.stringify({{
                success: true,
                transactionId: receipt.id,
                url: receipt.url,
                size: receipt.size
            }}));
        }}
        
        upload().catch(error => {{
            console.log(JSON.stringify({{
                success: false,
                error: error.message
            }}));
        }});
        """
        
        result = subprocess.run(
            ['node', '-e', script],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode != 0:
            raise Exception(f"Node.js 오류: {result.stderr}")
        
        response = json.loads(result.stdout.strip())
        if not response.get('success'):
            raise Exception(f"Irys 업로드 실패: {response.get('error')}")
        
        return response
```

### 3.2 MCP 서버에 통합
```python
# src/irys_mcp/server.py 수정
from .real_irys_bridge import RealIrysBridge

class IrysMCPServer(FastMCP):
    def __init__(self):
        super().__init__()
        self.irys_bridge = RealIrysBridge()
    
    async def upload_file(self, request: IrysUploadRequest) -> IrysUploadResponse:
        try:
            result = await self.irys_bridge.upload_file(
                file_path=request.file_path,
                tags=request.tags
            )
            
            return IrysUploadResponse(
                transaction_id=result['transactionId'],
                url=result['url'],
                size=result['size']
            )
        except Exception as e:
            logger.error(f"실제 Irys 업로드 실패: {e}")
            raise
```

## 4. 테스트 및 검증

### 4.1 연결 테스트
```python
async def test_irys_connection():
    bridge = RealIrysBridge()
    
    # 작은 테스트 파일 생성
    test_file = Path("test_upload.txt")
    test_file.write_text("Irys 연결 테스트")
    
    try:
        result = await bridge.upload_file(
            file_path=str(test_file),
            tags={"type": "test", "description": "연결 테스트"}
        )
        print(f"업로드 성공: {result}")
        
        # 실제 URL에서 파일 확인
        print(f"파일 URL: {result['url']}")
        
    except Exception as e:
        print(f"연결 실패: {e}")
    finally:
        test_file.unlink()

# 실행
asyncio.run(test_irys_connection())
```

### 4.2 에러 처리 개선
```python
class IrysError(Exception):
    """Irys 관련 에러"""
    pass

class NetworkError(IrysError):
    """네트워크 에러"""
    pass

class AuthenticationError(IrysError):
    """인증 에러"""
    pass

# 에러 처리 예시
try:
    result = await bridge.upload_file(file_path, tags)
except subprocess.TimeoutExpired:
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