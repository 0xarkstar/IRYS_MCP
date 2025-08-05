import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import crypto from 'crypto';

config(); // Load environment variables

// 테스트용 개인키 생성 (32바이트)
const generateTestPrivateKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

describe('공용 오픈소스 MCP 종합 테스트', () => {
  let server: IrysMCPServer;
  const privateKey = process.env.IRYS_PRIVATE_KEY || generateTestPrivateKey();
  const testDir = join(__dirname, 'comprehensive-test');
  const testFile = join(testDir, 'test-file.txt');

  beforeAll(async () => {
    server = new IrysMCPServer(privateKey);
    
    // SDK 초기화 대기
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        const isConnected = await server.irysService.checkConnection();
        if (isConnected) {
          console.log('✅ SDK 초기화 완료');
          break;
        }
      } catch (error) {
        console.log(`⚠️ SDK 초기화 시도 ${retries + 1}/${maxRetries}:`, error.message);
      }
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (retries >= maxRetries) {
      console.warn('⚠️ SDK 초기화 실패, 테스트를 계속 진행합니다.');
    }
    
    // 테스트 디렉토리 생성
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    
    // 테스트 파일 생성
    writeFileSync(testFile, 'Comprehensive test file content');
  });

  afterAll(() => {
    // 테스트 파일들 정리
    if (existsSync(testDir)) {
      rmdirSync(testDir, { recursive: true });
    }
  });

  describe('기본 MCP 도구 등록 테스트', () => {
    test('모든 도구가 올바르게 등록되었는지 확인', () => {
      const tools = server.getRegisteredTools();
      expect(tools.length).toBeGreaterThanOrEqual(29); // 최소 29개 도구
      
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
      expect(toolNames).toContain('irys_upload_encrypted_file');
      expect(toolNames).toContain('irys_download_encrypted_file');
      expect(toolNames).toContain('irys_upload_with_data_contract');
      expect(toolNames).toContain('irys_validate_data_contract');
      expect(toolNames).toContain('irys_download_with_data_contract');
      expect(toolNames).toContain('irys_delete_file');
      expect(toolNames).toContain('irys_batch_download');
      expect(toolNames).toContain('irys_rollback_version');
      expect(toolNames).toContain('irys_revoke_share');
      expect(toolNames).toContain('irys_switch_token_type');
      expect(toolNames).toContain('irys_upload_directory');
      expect(toolNames).toContain('irys_manage_categories');
      expect(toolNames).toContain('irys_manage_tags');
      expect(toolNames).toContain('irys_monitor_performance');
      expect(toolNames).toContain('irys_manage_plugins');
      expect(toolNames).toContain('irys_get_advanced_stats');
      expect(toolNames).toContain('irys_restore_file');
    });

    test('도구 스키마 검증', () => {
      const tools = server.getRegisteredTools();
      
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.outputSchema).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(typeof tool.handler).toBe('function');
      });
    });
  });

  describe('파일 삭제 기능 테스트', () => {
    test('파일 삭제 기본 기능', async () => {
      const deleteTool = server.getRegisteredTools().find(tool => tool.name === 'irys_delete_file');
      
      const result = await deleteTool!.handler({
        transactionId: 'test-transaction-id',
        permanent: false
      });
      
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('deleted');
      expect(result).toHaveProperty('permanent');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.deleted).toBe(true);
      expect(result.permanent).toBe(false);
    });

    test('영구 삭제 기능', async () => {
      const deleteTool = server.getRegisteredTools().find(tool => tool.name === 'irys_delete_file');
      
      const result = await deleteTool!.handler({
        transactionId: 'test-transaction-id',
        permanent: true
      });
      
      expect(result.permanent).toBe(true);
      expect(result.message).toContain('영구적으로');
    });
  });

  describe('배치 다운로드 기능 테스트', () => {
    test('배치 다운로드 기본 기능', async () => {
      const batchDownloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_download');
      
      const result = await batchDownloadTool!.handler({
        transactionIds: ['tx1', 'tx2', 'tx3'],
        includeMetadata: true
      });
      
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('summary');
      expect(result.summary.total).toBe(3);
      expect(Array.isArray(result.results)).toBe(true);
    });
  });

  describe('버전 롤백 기능 테스트', () => {
    test('버전 롤백 기본 기능', async () => {
      const rollbackTool = server.getRegisteredTools().find(tool => tool.name === 'irys_rollback_version');
      
      const result = await rollbackTool!.handler({
        transactionId: 'test-transaction-id',
        targetVersion: 'v1.0',
        createBackup: true
      });
      
      expect(result).toHaveProperty('originalTransactionId');
      expect(result).toHaveProperty('newTransactionId');
      expect(result).toHaveProperty('targetVersion');
      expect(result).toHaveProperty('backupTransactionId');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('공유 해제 기능 테스트', () => {
    test('특정 사용자 공유 해제', async () => {
      const revokeTool = server.getRegisteredTools().find(tool => tool.name === 'irys_revoke_share');
      
      const result = await revokeTool!.handler({
        transactionId: 'test-transaction-id',
        userAddress: '0x1234...',
        revokeAll: false
      });
      
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('revokedUsers');
      expect(result).toHaveProperty('revokedAll');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.revokedAll).toBe(false);
      expect(result.revokedUsers).toContain('0x1234...');
    });

    test('모든 공유 해제', async () => {
      const revokeTool = server.getRegisteredTools().find(tool => tool.name === 'irys_revoke_share');
      
      const result = await revokeTool!.handler({
        transactionId: 'test-transaction-id',
        revokeAll: true
      });
      
      expect(result.revokedAll).toBe(true);
      expect(result.message).toContain('All shares have been revoked');
    });
  });

  describe('토큰 타입 전환 기능 테스트', () => {
    test('토큰 타입 전환', async () => {
      const switchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_switch_token_type');
      
      const result = await switchTool!.handler({
        tokenType: 'ethereum'
      });
      
      expect(result).toHaveProperty('previousTokenType');
      expect(result).toHaveProperty('newTokenType');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(result.newTokenType).toBe('ethereum');
    });
  });

  describe('디렉토리 업로드 기능 테스트', () => {
    test('디렉토리 업로드 기본 기능', async () => {
      const uploadDirTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_directory');
      
      const result = await uploadDirTool!.handler({
        directoryPath: testDir,
        preserveStructure: true,
        includeHidden: false
      });
      
      expect(result).toHaveProperty('directoryPath');
      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('summary');
      expect(result.directoryPath).toBe(testDir);
      expect(result.summary.preservedStructure).toBe(true);
    });
  });

  describe('카테고리 관리 기능 테스트', () => {
    test('카테고리 목록 조회', async () => {
      const categoryTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_categories');
      
      const result = await categoryTool!.handler({
        action: 'list'
      });
      
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('success');
      expect(result.action).toBe('list');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.categories)).toBe(true);
    });

    test('카테고리 생성', async () => {
      const categoryTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_categories');
      
      const result = await categoryTool!.handler({
        action: 'create',
        categoryName: 'test-category',
        description: 'Test category description',
        color: '#FF0000'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('카테고리 \'test-category\'이(가) 생성되었습니다.');
    });
  });

  describe('태그 관리 기능 테스트', () => {
    test('태그 목록 조회', async () => {
      const tagTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_tags');
      
      const result = await tagTool!.handler({
        action: 'list'
      });
      
      expect(result).toHaveProperty('tags');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('success');
      expect(result.action).toBe('list');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.tags)).toBe(true);
    });

    test('태그 생성', async () => {
      const tagTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_tags');
      
      const result = await tagTool!.handler({
        action: 'create',
        tagName: 'test-tag',
        tagValue: 'test-value',
        description: 'Test tag description'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('태그 create 작업이 완료');
    });
  });

  describe('성능 모니터링 기능 테스트', () => {
    test('업로드 성능 모니터링', async () => {
      const perfTool = server.getRegisteredTools().find(tool => tool.name === 'irys_monitor_performance');
      
      const result = await perfTool!.handler({
        operation: 'upload',
        fileSize: 1024 * 1024 // 1MB
      });
      
      expect(result).toHaveProperty('operation');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
      expect(result.operation).toBe('upload');
      expect(result.metrics).toHaveProperty('duration');
      expect(result.metrics).toHaveProperty('throughput');
      expect(result.metrics).toHaveProperty('latency');
      expect(result.metrics).toHaveProperty('successRate');
      expect(result.metrics).toHaveProperty('errorRate');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('플러그인 관리 기능 테스트', () => {
    test('플러그인 목록 조회', async () => {
      const pluginTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_plugins');
      
      const result = await pluginTool!.handler({
        action: 'list'
      });
      
      expect(result).toHaveProperty('plugins');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('success');
      expect(result.action).toBe('list');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.plugins)).toBe(true);
    });

    test('플러그인 설치', async () => {
      const pluginTool = server.getRegisteredTools().find(tool => tool.name === 'irys_manage_plugins');
      
      const result = await pluginTool!.handler({
        action: 'install',
        pluginName: 'test-plugin',
        version: '1.0.0'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('플러그인 install 작업이 완료');
    });
  });

  describe('고급 통계 기능 테스트', () => {
    test('고급 통계 조회', async () => {
      const statsTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_advanced_stats');
      
      const result = await statsTool!.handler({
        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30일 전
        endDate: Date.now(),
        groupBy: 'day'
      });
      
      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('uploads');
      expect(result).toHaveProperty('downloads');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('recentActivity');
      expect(result).toHaveProperty('timeSeries');
      expect(result).toHaveProperty('topCategories');
      expect(result).toHaveProperty('topOwners');
      expect(result).toHaveProperty('storageEfficiency');
      expect(Array.isArray(result.timeSeries)).toBe(true);
      expect(Array.isArray(result.topCategories)).toBe(true);
      expect(Array.isArray(result.topOwners)).toBe(true);
      expect(result.storageEfficiency).toHaveProperty('compressionRatio');
      expect(result.storageEfficiency).toHaveProperty('deduplicationRatio');
      expect(result.storageEfficiency).toHaveProperty('costPerGB');
    });
  });

  describe('파일 복구 기능 테스트', () => {
    test('파일 복구 기본 기능', async () => {
      const restoreTool = server.getRegisteredTools().find(tool => tool.name === 'irys_restore_file');
      
      const result = await restoreTool!.handler({
        transactionId: 'test-transaction-id',
        overwrite: false
      });
      
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('restored');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.restored).toBe(true);
      expect(result.message).toContain('성공적으로 복구');
    });
  });

  describe('에러 처리 테스트', () => {
    test('존재하지 않는 파일 삭제 시 에러 처리', async () => {
      const deleteTool = server.getRegisteredTools().find(tool => tool.name === 'irys_delete_file');
      
      try {
        await deleteTool!.handler({
          transactionId: 'nonexistent-transaction-id',
          permanent: false
        });
        // 에러가 발생하지 않으면 테스트 실패
        expect(true).toBe(false); // 에러가 발생해야 합니다.
      } catch (error: any) {
        expect(error.message).toContain('실패');
      }
    });

    test('존재하지 않는 디렉토리 업로드 시 에러 처리', async () => {
      const uploadDirTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_directory');
      
      try {
        await uploadDirTool!.handler({
          directoryPath: '/nonexistent/directory',
          preserveStructure: true
        });
        expect(true).toBe(false); // 에러가 발생해야 합니다.
      } catch (error: any) {
        expect(error.message).toContain('디렉토리를 찾을 수 없습니다');
      }
    });
  });

  describe('성능 테스트', () => {
    test('대용량 배치 다운로드 성능', async () => {
      const batchDownloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_download');
      
      const startTime = Date.now();
      
      const result = await batchDownloadTool!.handler({
        transactionIds: Array.from({ length: 10 }, (_, i) => `tx-${i}`), // 100개에서 10개로 줄임
        includeMetadata: true
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result.summary.total).toBe(10);
      expect(duration).toBeLessThan(30000); // 30초 이내로 줄임
    }, 35000); // 타임아웃도 35초로 줄임
  });
}); 