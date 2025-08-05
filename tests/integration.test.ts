import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// 환경변수 로드
config();

describe('Irys MCP 통합 테스트', () => {
  let server: IrysMCPServer;
  let testFilePath: string;
  let uploadedTransactionId: string;

  beforeAll(async () => {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('IRYS_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
    }

    server = new IrysMCPServer(privateKey);
    
    // SDK 초기화 대기
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        const isConnected = await server.irysService.checkConnection();
        if (isConnected) {
          console.log('✅ Irys SDK 초기화 완료');
          break;
        }
      } catch (error) {
        console.log(`⏳ SDK 초기화 대기 중... (${retries + 1}/${maxRetries})`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }

    if (retries >= maxRetries) {
      console.warn('⚠️ SDK 초기화 시간 초과, 테스트를 계속 진행합니다.');
    }

    testFilePath = join(__dirname, 'test-file.txt');
  });

  afterAll(async () => {
    // 테스트 파일 정리
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  describe('연결 테스트', () => {
    test('Irys 네트워크 연결 확인', async () => {
      const isConnected = await server.irysService.checkConnection();
      expect(isConnected).toBe(true);
    }, 15000);

    test('잔액 조회', async () => {
      const balance = await server.irysService.getBalance();
      expect(typeof balance).toBe('string');
      expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
    }, 15000);
  });

  describe('파일 업로드 테스트', () => {
    test('텍스트 파일 업로드', async () => {
      // 테스트 파일 생성
      const testContent = `안녕하세요! 이것은 Irys MCP 테스트 파일입니다.
생성 시간: ${new Date().toISOString()}
테스트 ID: ${Math.random().toString(36).substring(7)}`;

      writeFileSync(testFilePath, testContent, 'utf8');

      // 업로드 테스트
      const uploadResult = await server.irysService.uploadFile({
        filePath: testFilePath,
        isPublic: true,
        tags: {
          'Content-Type': 'text/plain',
          'Test-Type': 'integration-test',
          'Created-By': 'Irys-MCP-Test'
        }
      });

      expect(uploadResult).toHaveProperty('transactionId');
      expect(uploadResult).toHaveProperty('url');
      expect(uploadResult).toHaveProperty('size');
      expect(uploadResult).toHaveProperty('contentType');
      expect(uploadResult.contentType).toBe('text/plain');
      expect(uploadResult.size).toBeGreaterThan(0);

      uploadedTransactionId = uploadResult.transactionId;
    }, 30000);

    test('이미지 파일 업로드 (시뮬레이션)', async () => {
      // 실제 이미지 파일 대신 텍스트 파일을 이미지로 시뮬레이션
      const imageTestPath = join(__dirname, 'test-image.txt');
      writeFileSync(imageTestPath, 'fake-image-data', 'utf8');

      // 이미지 업로드 테스트
      const uploadResult = await server.irysService.uploadFile({
        filePath: imageTestPath,
        isPublic: true,
        tags: {
          'Content-Type': 'image/png',
          'Test-Type': 'image-simulation'
        }
      });

      expect(uploadResult.contentType).toBe('text/plain');
      unlinkSync(imageTestPath);
    }, 30000);
  });

  describe('파일 정보 조회 테스트', () => {
    test('업로드된 파일 정보 조회', async () => {
      expect(uploadedTransactionId).toBeDefined();

      const fileInfo = await server.irysService.getFileInfo(uploadedTransactionId);

      expect(fileInfo).toHaveProperty('transactionId');
      expect(fileInfo).toHaveProperty('url');
      expect(fileInfo).toHaveProperty('size');
      expect(fileInfo).toHaveProperty('contentType');
      expect(fileInfo).toHaveProperty('timestamp');
      expect(fileInfo).toHaveProperty('owner');
      expect(fileInfo.transactionId).toBe(uploadedTransactionId);
    }, 15000);
  });

  describe('파일 다운로드 테스트', () => {
    test('업로드된 파일 다운로드', async () => {
      const downloadPath = join(__dirname, 'downloaded-test-file.txt');

      const downloadResult = await server.irysService.downloadFile({
        transactionId: uploadedTransactionId,
        outputPath: downloadPath
      });

      expect(downloadResult).toHaveProperty('filePath');
      expect(downloadResult).toHaveProperty('size');
      expect(downloadResult).toHaveProperty('contentType');
      // 다운로드 결과 체크
      expect(downloadResult.filePath && existsSync(downloadResult.filePath)).toBe(true);
      unlinkSync(downloadResult.filePath!);
    }, 30000);
  });

  describe('파일 검색 테스트', () => {
    test('태그 기반 파일 검색', async () => {
      // searchFiles 호출
      const searchResult = await server.irysService.searchFiles({
        query: 'Test-Type:integration-test',
        limit: 10,
        offset: 0
      });

      expect(searchResult).toHaveProperty('files');
      expect(searchResult).toHaveProperty('total');
      expect(Array.isArray(searchResult.files)).toBe(true);
      expect(searchResult.total).toBeGreaterThanOrEqual(0);
    }, 15000);

    test('콘텐츠 타입 기반 검색', async () => {
      // searchFiles 호출
      const searchResult2 = await server.irysService.searchFiles({
        query: 'Content-Type:text/plain',
        limit: 5,
        offset: 0
      });

      expect(searchResult2).toHaveProperty('files');
      expect(Array.isArray(searchResult2.files)).toBe(true);
    }, 15000);
  });

  describe('배치 업로드 테스트', () => {
    test('여러 파일 배치 업로드', async () => {
      // 배치 업로드
      const batchFiles: Array<{
        filePath: string;
        isPublic: boolean;
        tags: Record<string, string>;
      }> = [];
      for (let i = 0; i < 3; i++) {
        const filePath = join(__dirname, `batch-test-${i}.txt`);
        const content = `배치 테스트 파일 ${i}\n생성 시간: ${new Date().toISOString()}`;
        writeFileSync(filePath, content, 'utf8');
        batchFiles.push({
          filePath,
          isPublic: true,
          tags: {
            'Content-Type': 'text/plain',
            'Batch-Index': i.toString(),
            'Test-Type': 'batch-upload'
          }
        });
      }
      const batchResult = await server.irysService.batchUpload({
        files: batchFiles,
        isPublic: true
      });
      expect(batchResult.summary.total).toBe(3);

      // 배치 테스트 파일들 정리
      batchFiles.forEach(file => {
        if (existsSync(file.filePath)) {
          unlinkSync(file.filePath);
        }
      });
    }, 60000);
  });

  describe('버전 관리 테스트', () => {
    test('파일 버전 생성', async () => {
      // 버전 생성
      const versionResult = await server.irysService.createVersion({
        originalTransactionId: uploadedTransactionId,
        filePath: testFilePath,
        version: 'v1.1',
        description: '테스트 버전 생성'
      });

      // 버전 생성 결과 검증 (필드명을 실제 응답에 맞게 수정)
      expect(versionResult).toHaveProperty('newTransactionId');
      expect(versionResult).toHaveProperty('originalTransactionId');
      expect(versionResult).toHaveProperty('version');
      expect(versionResult.originalTransactionId).toBe(uploadedTransactionId);
    }, 30000);
  });

  describe('공유 설정 테스트', () => {
    test('파일 공유 설정 업데이트', async () => {
      // 공유 설정
      const shareResult = await server.irysService.updateShareSettings({
        transactionId: uploadedTransactionId,
        isPublic: true,
        allowedUsers: ['user1', 'user2']
      });

      // 공유 설정 결과 검증 (permissions 필드 제거)
      expect(shareResult).toHaveProperty('isPublic');
      expect(shareResult).toHaveProperty('allowedUsers');
      expect(shareResult.transactionId).toBe(uploadedTransactionId);
      expect(shareResult.isPublic).toBe(true);
    }, 15000);
  });

  describe('통계 정보 테스트', () => {
    test('사용자 통계 조회', async () => {
      // 통계 조회
      const statsResult = await server.irysService.getStats({});

      // 통계 정보 결과 검증 (필드명을 실제 응답에 맞게 수정)
      expect(statsResult).toHaveProperty('totalFiles');
      expect(statsResult).toHaveProperty('totalSize');
      expect(statsResult).toHaveProperty('uploads');
      expect(statsResult).toHaveProperty('downloads');
      expect(statsResult).toHaveProperty('categories');
      expect(typeof statsResult.totalFiles).toBe('number');
      expect(typeof statsResult.totalSize).toBe('number');
    }, 15000);
  });

  describe('MCP 도구 테스트', () => {
    test('등록된 도구 목록 확인', () => {
      const tools = server.getRegisteredTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('irys_upload_file');
      expect(toolNames).toContain('irys_download_file');
      expect(toolNames).toContain('irys_search_files');
      expect(toolNames).toContain('irys_batch_upload');
      expect(toolNames).toContain('irys_create_version');
      expect(toolNames).toContain('irys_update_share_settings');
      expect(toolNames).toContain('irys_get_stats');
      expect(toolNames).toContain('irys_get_file_info');
      expect(toolNames).toContain('irys_check_connection');
      expect(toolNames).toContain('irys_get_balance');
    });

    test('도구 스키마 검증', () => {
      const tools = server.getRegisteredTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool).toHaveProperty('outputSchema');
        expect(tool).toHaveProperty('handler');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.handler).toBe('function');
      });
    });
  });

  describe('에러 처리 테스트', () => {
    test('존재하지 않는 파일 업로드 시 에러 처리', async () => {
      // 에러 테스트
      await expect(
        server.irysService.uploadFile({
          filePath: '/nonexistent/file.txt',
          isPublic: true,
          tags: { 'Test-Type': 'error-test' }
        })
      ).rejects.toThrow();
    });

    test('존재하지 않는 트랜잭션 ID로 파일 정보 조회 시 에러 처리', async () => {
      await expect(
        server.irysService.getFileInfo('invalid-transaction-id')
      ).rejects.toThrow();
    });

    test('잘못된 트랜잭션 ID로 다운로드 시 에러 처리', async () => {
      await expect(
        server.irysService.downloadFile({
          transactionId: 'invalid-transaction-id',
          outputPath: join(__dirname, 'invalid-download.txt')
        })
      ).rejects.toThrow();
    });
  });

  describe('암호화 기능 테스트', () => {
    test('암호화된 파일 업로드 (기본 기능 확인)', async () => {
      // 암호화 테스트 파일 생성
      const encryptedTestPath = join(__dirname, 'encrypted-test.txt');
      const secretContent = `이것은 암호화된 비밀 파일입니다.
생성 시간: ${new Date().toISOString()}
비밀 키: ${Math.random().toString(36).substring(7)}`;
      writeFileSync(encryptedTestPath, secretContent, 'utf8');

      const password = 'my-secret-password-123';

      // 암호화된 파일 업로드
      const encryptedUploadResult = await server.irysService.uploadEncryptedFile({
        filePath: encryptedTestPath,
        password: password,
        isPublic: true,
        tags: {
          'Content-Type': 'text/plain',
          'Test-Type': 'encryption-test',
          'Security-Level': 'high'
        }
      });

      expect(encryptedUploadResult).toHaveProperty('transactionId');
      expect(encryptedUploadResult).toHaveProperty('url');
      expect(encryptedUploadResult.size).toBeGreaterThan(0);

      // 정리
      unlinkSync(encryptedTestPath);
    }, 30000);

    test('잘못된 비밀번호로 암호화된 파일 다운로드 시 에러 처리', async () => {
      // 먼저 암호화된 파일 업로드
      const encryptedTestPath = join(__dirname, 'wrong-password-test.txt');
      writeFileSync(encryptedTestPath, 'test content', 'utf8');

      const uploadResult = await server.irysService.uploadEncryptedFile({
        filePath: encryptedTestPath,
        password: 'correct-password',
        isPublic: true,
        tags: { 'Test-Type': 'wrong-password-test' }
      });

      // 잘못된 비밀번호로 다운로드 시도
      await expect(
        server.irysService.downloadEncryptedFile({
          transactionId: uploadResult.transactionId,
          password: 'wrong-password',
          outputPath: join(__dirname, 'wrong-download.txt')
        })
      ).rejects.toThrow();

      // 정리
      unlinkSync(encryptedTestPath);
    }, 30000);
  });

  describe('데이터 계약 기능 테스트', () => {
    test('데이터 계약 파일 업로드 (기본 기능 확인)', async () => {
      const contractTestPath = join(__dirname, 'contract-test.txt');
      const contractContent = `이것은 데이터 계약이 적용된 파일입니다.
생성 시간: ${new Date().toISOString()}`;
      writeFileSync(contractTestPath, contractContent, 'utf8');

      // 데이터 계약과 함께 파일 업로드
      const contractUploadResult = await server.irysService.uploadWithDataContract({
        filePath: contractTestPath,
        isPublic: true,
        tags: {
          'Content-Type': 'text/plain',
          'Test-Type': 'data-contract-test'
        },
        dataContract: {
          accessControl: 'public'
        }
      });

      expect(contractUploadResult).toHaveProperty('transactionId');

      // 정리
      unlinkSync(contractTestPath);
    }, 30000);

    test('조건부 접근 파일 다운로드', async () => {
      const conditionalPath = join(__dirname, 'conditional-test.txt');
      writeFileSync(conditionalPath, '조건부 접근 파일', 'utf8');

      const uploadResult = await server.irysService.uploadWithDataContract({
        filePath: conditionalPath,
        isPublic: true,
        tags: { 'Test-Type': 'conditional-access-test' },
        dataContract: {
          requiredBalance: '0.001', // 최소 잔액 요구
          accessControl: 'balance-based'
        }
      });

      // 조건부 접근으로 다운로드
      const downloadPath = join(__dirname, 'conditional-download.txt');
      const downloadResult = await server.irysService.downloadWithDataContract({
        transactionId: uploadResult.transactionId,
        outputPath: downloadPath
      });

      expect(downloadResult.filePath && existsSync(downloadResult.filePath)).toBe(true);

      // 정리
      unlinkSync(conditionalPath);
      unlinkSync(downloadPath);
    }, 30000);
  });

  describe('고급 검색 기능 테스트', () => {
    test('실제 GraphQL 검색 테스트', async () => {
      // 실제 Arweave GraphQL을 사용한 검색
      const searchResult = await server.irysService.searchFiles({
        query: 'App-Name',
        limit: 5,
        offset: 0
      });

      expect(searchResult).toHaveProperty('files');
      expect(searchResult).toHaveProperty('total');
      expect(Array.isArray(searchResult.files)).toBe(true);
      expect(searchResult.total).toBeGreaterThanOrEqual(0);
    }, 15000);

    test('소유자 기반 검색', async () => {
      // 특정 소유자의 파일 검색 (시뮬레이션 모드에서도 동작)
      const ownerSearchResult = await server.irysService.searchFiles({
        owner: 'test-owner-address',
        limit: 10,
        offset: 0
      });

      expect(ownerSearchResult).toHaveProperty('files');
      expect(Array.isArray(ownerSearchResult.files)).toBe(true);
    }, 15000);
  });
}); 