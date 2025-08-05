import { IrysAdvancedMCPServer } from '../src/server/IrysAdvancedMCPServer';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import crypto from 'crypto';

// 테스트용 개인키 생성 (32바이트)
const generateTestPrivateKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

config(); // Load environment variables

describe('Irys 고급 기능 테스트', () => {
  let advancedServer: IrysAdvancedMCPServer;
  const testDir = join(__dirname, 'test-directory');
  const testCSVPath = join(__dirname, 'test-data.csv');

  beforeAll(() => {
    const privateKey = process.env.IRYS_PRIVATE_KEY || generateTestPrivateKey();
    advancedServer = new IrysAdvancedMCPServer(privateKey, 'ethereum');
    
    // 테스트 디렉토리 생성
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    
    // 테스트 파일들 생성
    writeFileSync(join(testDir, 'file1.txt'), 'Test file 1 content');
    writeFileSync(join(testDir, 'file2.txt'), 'Test file 2 content');
    
    // 서브디렉토리 생성 후 파일 생성
    const subdir = join(testDir, 'subdir');
    if (!existsSync(subdir)) {
      mkdirSync(subdir, { recursive: true });
    }
    writeFileSync(join(subdir, 'file3.txt'), 'Test file 3 content');
    
    // 테스트 CSV 파일 생성
    const csvContent = `name,age,city
John,25,New York
Jane,30,Los Angeles
Bob,35,Chicago`;
    writeFileSync(testCSVPath, csvContent, 'utf8');
  });

  afterAll(() => {
    // 테스트 파일들 정리
    if (existsSync(testDir)) {
      rmdirSync(testDir, { recursive: true });
    }
    if (existsSync(testCSVPath)) {
      unlinkSync(testCSVPath);
    }
  });

  describe('고급 MCP 도구 등록 테스트', () => {
    test('고급 도구들이 올바르게 등록되었는지 확인', () => {
      const tools = advancedServer.getRegisteredTools();
      expect(tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('irys_create_bundle');
      expect(toolNames).toContain('irys_advanced_query');
      expect(toolNames).toContain('irys_arweave_query');
      expect(toolNames).toContain('irys_upload_csv_structured');
      expect(toolNames).toContain('irys_upload_directory');
      expect(toolNames).toContain('irys_get_precise_balance');
      expect(toolNames).toContain('irys_switch_token_type');
      expect(toolNames).toContain('irys_get_advanced_stats');
      expect(toolNames).toContain('irys_multi_token_upload');
      expect(toolNames).toContain('irys_get_bundle_info');
    });

    test('도구 스키마 검증', () => {
      const bundleTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_create_bundle');
      expect(() => bundleTool!.inputSchema.parse({
        files: [{ filePath: 'test.txt' }],
        bundleName: 'Test Bundle'
      })).not.toThrow();
    });
  });

  describe('번들링 기능 테스트', () => {
    test('번들 생성 기본 기능', async () => {
      const bundleTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_create_bundle');
      
      const result = await bundleTool!.handler({
        files: [
          { filePath: join(testDir, 'file1.txt'), tags: { 'Test-Type': 'bundle-test' } },
          { filePath: join(testDir, 'file2.txt'), tags: { 'Test-Type': 'bundle-test' } }
        ],
        bundleName: 'Test Bundle',
        description: 'This is a test bundle'
      });

      expect(result).toHaveProperty('bundleId');
      expect(result).toHaveProperty('transactionIds');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('url');
      expect(Array.isArray(result.transactionIds)).toBe(true);
      expect(result.transactionIds.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('고급 쿼리 기능 테스트', () => {
    test('고급 쿼리 기본 기능', async () => {
      const queryTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_advanced_query');
      
      const result = await queryTool!.handler({
        limit: 10,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });

      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.files)).toBe(true);
    }, 15000);
  });

  describe('Arweave GraphQL 쿼리 테스트', () => {
    test('Arweave GraphQL 쿼리 기본 기능', async () => {
      const arweaveTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_arweave_query');
      
      const result = await arweaveTool!.handler({
        query: `
          query {
            transactions(first: 5) {
              edges {
                node {
                  id
                  owner {
                    address
                  }
                }
              }
            }
          }
        `
      });

      expect(result).toHaveProperty('data');
    }, 15000);
  });

  describe('CSV 구조화 기능 테스트', () => {
    test('CSV 구조화 업로드', async () => {
      const csvUploadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_upload_csv_structured');
      
      const result = await csvUploadTool!.handler({
        filePath: testCSVPath,
        delimiter: ',',
        hasHeader: true,
        tags: { 'Test-Type': 'csv-structured-test' }
      });

      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('size');
      expect(result.contentType).toBe('application/json');
    }, 30000);

    test('CSV 구조화 다운로드', async () => {
      const csvDownloadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_download_csv_structured');
      
      // 먼저 업로드
      const uploadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_upload_csv_structured');
      const uploadResult = await uploadTool!.handler({
        filePath: testCSVPath,
        delimiter: ',',
        hasHeader: true,
        tags: { 'Test-Type': 'csv-download-test' }
      });

      // 다운로드
      const downloadResult = await csvDownloadTool!.handler({
        transactionId: uploadResult.transactionId,
        delimiter: ',',
        includeHeader: true
      });

      expect(downloadResult).toHaveProperty('content');
      expect(downloadResult.contentType).toBe('text/csv');
      expect(downloadResult.size).toBeGreaterThan(0);
    }, 30000);
  });

  describe('디렉토리 업로드 기능 테스트', () => {
    test('디렉토리 전체 업로드', async () => {
      const dirUploadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_upload_directory');
      
      const result = await dirUploadTool!.handler({
        dirPath: testDir,
        tags: { 'Test-Type': 'directory-upload-test' }
      });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('summary');
      expect(result.summary.total).toBeGreaterThan(0);
      expect(Array.isArray(result.results)).toBe(true);
    }, 60000);
  });

  describe('정밀 잔액 조회 테스트', () => {
    test('정밀 잔액 조회', async () => {
      const balanceTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_get_precise_balance');
      
      const result = await balanceTool!.handler({});

      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('formatted');
      expect(result.currency).toBe('AR');
      expect(typeof result.formatted).toBe('string');
    }, 15000);
  });

  describe('토큰 타입 변경 테스트', () => {
    test('토큰 타입 변경', async () => {
      const switchTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_switch_token_type');
      
      const result = await switchTool!.handler({
        tokenType: 'solana'
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('previousTokenType');
      expect(result).toHaveProperty('newTokenType');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(result.previousTokenType).toBe('ethereum');
      expect(result.newTokenType).toBe('solana');
    }, 15000);
  });

  describe('고급 통계 조회 테스트', () => {
    test('고급 통계 조회', async () => {
      const statsTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_get_advanced_stats');
      
      const result = await statsTool!.handler({});

      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('uploads');
      expect(result).toHaveProperty('downloads');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('recentActivity');
      expect(result).toHaveProperty('preciseTotalSize');
      expect(result).toHaveProperty('averageFileSize');
      expect(result).toHaveProperty('storageCostEstimate');
    }, 15000);
  });

  describe('멀티 토큰 업로드 테스트', () => {
    test('멀티 토큰 업로드', async () => {
      const multiTokenTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_multi_token_upload');
      
      const result = await multiTokenTool!.handler({
        filePath: join(testDir, 'file1.txt'),
        tags: { 'Test-Type': 'multi-token-test' },
        contentType: 'text/plain',
        isPublic: true
      });

      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('contentType');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('tokenType');
    }, 30000);
  });

  describe('번들 정보 조회 테스트', () => {
    test('번들 정보 조회', async () => {
      const bundleInfoTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_get_bundle_info');
      
      const result = await bundleInfoTool!.handler({
        bundleId: 'test-bundle-id'
      });

      expect(result).toHaveProperty('bundleId');
      expect(result).toHaveProperty('bundleName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('fileCount');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('files');
      expect(Array.isArray(result.files)).toBe(true);
    }, 15000);
  });

  describe('에러 처리 테스트', () => {
    test('존재하지 않는 파일로 번들 생성 시 에러 처리', async () => {
      const bundleTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_create_bundle');
      
      await expect(bundleTool!.handler({
        files: [{ filePath: '/nonexistent/file.txt' }]
      })).rejects.toThrow();
    }, 15000);

    test('존재하지 않는 디렉토리 업로드 시 에러 처리', async () => {
      const dirUploadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_upload_directory');
      
      await expect(dirUploadTool!.handler({
        dirPath: '/nonexistent/directory'
      })).rejects.toThrow();
    }, 15000);

    test('존재하지 않는 CSV 파일 업로드 시 에러 처리', async () => {
      const csvUploadTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_upload_csv_structured');
      
      await expect(csvUploadTool!.handler({
        filePath: '/nonexistent/data.csv'
      })).rejects.toThrow();
    }, 15000);
  });

  describe('성능 테스트', () => {
    test('대용량 번들 생성 성능', async () => {
      const bundleTool = advancedServer.getRegisteredTools().find(tool => tool.name === 'irys_create_bundle');
      
      // 성능 테스트용 파일들 생성
      const performanceFiles = [];
      for (let i = 0; i < 10; i++) {
        const filePath = join(testDir, `perf-file-${i}.txt`);
        writeFileSync(filePath, `Performance test file ${i} content`);
        performanceFiles.push(filePath);
      }
      
      const startTime = Date.now();
      
      const result = await bundleTool!.handler({
        files: performanceFiles.map(filePath => ({
          filePath,
          tags: { 'Performance-Test': 'true' }
        })),
        bundleName: 'Performance Test Bundle'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toHaveProperty('bundleId');
      expect(duration).toBeLessThan(60000); // 60초 이내
      
      // 성능 테스트 파일들 정리
      performanceFiles.forEach(filePath => {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    }, 60000);
  });
}); 