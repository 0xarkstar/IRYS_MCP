import { IrysService } from '../services/IrysService';
import {
  UploadRequest, UploadResponse, DownloadRequest, DownloadResponse,
  SearchRequest, SearchResponse, BatchUploadRequest, BatchUploadResponse,
  VersionRequest, VersionResponse, ShareRequest, ShareResponse,
  StatsRequest, StatsResponse, FileInfo,
  UploadRequestSchema, DownloadRequestSchema, SearchRequestSchema,
  BatchUploadRequestSchema, VersionRequestSchema, ShareRequestSchema, StatsRequestSchema,
  FileInfoSchema,
  IrysError, NetworkError, AuthenticationError, FileNotFoundError, ValidationError,
} from '../types';
import { z } from 'zod';

interface BalanceResponse {
  balance: string;
  currency: string;
}

interface ConnectionResponse {
  isConnected: boolean;
  message: string;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  handler: Function;
}

export class IrysMCPServer {
  public irysService: IrysService;
  private tools: Tool[] = [];

  constructor(privateKey: string, gatewayUrl?: string) {
    this.irysService = new IrysService(privateKey, gatewayUrl);
    this.registerTools();
  }

  private registerTools(): void {
    // 1. 파일 업로드
    this.registerTool({
      name: 'irys_upload_file',
      description: 'Irys 네트워크에 파일을 업로드합니다',
      inputSchema: UploadRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
          url: { type: 'string' },
          size: { type: 'number' },
          contentType: { type: 'string' },
          tags: { type: 'object' },
          timestamp: { type: 'number' },
        },
      },
      handler: async (request: UploadRequest): Promise<UploadResponse> => {
        return await this.irysService.uploadFile(request);
      },
    });

    // 2. 파일 다운로드
    this.registerTool({
      name: 'irys_download_file',
      description: 'Irys 네트워크에서 파일을 다운로드합니다',
      inputSchema: DownloadRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
          size: { type: 'number' },
          contentType: { type: 'string' },
          transactionId: { type: 'string' },
        },
      },
      handler: async (request: DownloadRequest): Promise<DownloadResponse> => {
        return await this.irysService.downloadFile(request);
      },
    });

    // 3. 파일 검색
    this.registerTool({
      name: 'irys_search_files',
      description: 'Irys 네트워크에서 파일을 검색합니다',
      inputSchema: SearchRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                url: { type: 'string' },
                size: { type: 'number' },
                contentType: { type: 'string' },
                tags: { type: 'object' },
                timestamp: { type: 'number' },
                owner: { type: 'string' },
              },
            },
          },
          total: { type: 'number' },
          hasMore: { type: 'boolean' },
        },
      },
      handler: async (request: SearchRequest): Promise<SearchResponse> => {
        return await this.irysService.searchFiles(request);
      },
    });

    // 4. 배치 업로드
    this.registerTool({
      name: 'irys_batch_upload',
      description: '여러 파일을 한 번에 Irys 네트워크에 업로드합니다',
      inputSchema: BatchUploadRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filePath: { type: 'string' },
                transactionId: { type: 'string' },
                url: { type: 'string' },
                success: { type: 'boolean' },
                error: { type: 'string' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              successful: { type: 'number' },
              failed: { type: 'number' },
            },
          },
        },
      },
      handler: async (request: BatchUploadRequest): Promise<BatchUploadResponse> => {
        return await this.irysService.batchUpload(request);
      },
    });

    // 5. 파일 버전 관리
    this.registerTool({
      name: 'irys_create_version',
      description: '기존 파일의 새 버전을 생성합니다',
      inputSchema: VersionRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          originalTransactionId: { type: 'string' },
          newTransactionId: { type: 'string' },
          version: { type: 'string' },
          url: { type: 'string' },
          timestamp: { type: 'number' },
        },
      },
      handler: async (request: VersionRequest): Promise<VersionResponse> => {
        return await this.irysService.createVersion(request);
      },
    });

    // 6. 파일 공유 설정
    this.registerTool({
      name: 'irys_update_share_settings',
      description: '파일의 공유 설정을 업데이트합니다',
      inputSchema: ShareRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
          isPublic: { type: 'boolean' },
          allowedUsers: {
            type: 'array',
            items: { type: 'string' },
          },
          expiresAt: { type: 'number' },
          shareUrl: { type: 'string' },
        },
      },
      handler: async (request: ShareRequest): Promise<ShareResponse> => {
        return await this.irysService.updateShareSettings(request);
      },
    });

    // 7. 통계 정보 조회
    this.registerTool({
      name: 'irys_get_stats',
      description: 'Irys 네트워크 사용 통계를 조회합니다',
      inputSchema: StatsRequestSchema,
      outputSchema: {
        type: 'object',
        properties: {
          totalFiles: { type: 'number' },
          totalSize: { type: 'number' },
          uploads: { type: 'number' },
          downloads: { type: 'number' },
          categories: { type: 'object' },
          recentActivity: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                action: { type: 'string' },
                timestamp: { type: 'number' },
              },
            },
          },
        },
      },
      handler: async (request: StatsRequest): Promise<StatsResponse> => {
        return await this.irysService.getStats(request);
      },
    });

    // 8. 파일 정보 조회
    this.registerTool({
      name: 'irys_get_file_info',
      description: '특정 파일의 상세 정보를 조회합니다',
      inputSchema: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
        },
        required: ['transactionId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
          url: { type: 'string' },
          size: { type: 'number' },
          contentType: { type: 'string' },
          tags: { type: 'object' },
          timestamp: { type: 'number' },
          owner: { type: 'string' },
        },
      },
      handler: async (request: { transactionId: string }): Promise<FileInfo> => {
        return await this.irysService.getFileInfo(request.transactionId);
      },
    });

    // 9. 연결 상태 확인
    this.registerTool({
      name: 'irys_check_connection',
      description: 'Irys 네트워크 연결 상태를 확인합니다',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      outputSchema: {
        type: 'object',
        properties: {
          connected: { type: 'boolean' },
          balance: { type: 'string' },
        },
      },
      handler: async (): Promise<{ connected: boolean; balance: string }> => {
        const connected = await this.irysService.checkConnection();
        const balance = connected ? await this.irysService.getBalance() : '0';
        return { connected, balance };
      },
    });

    // 10. 잔액 조회
    this.registerTool({
      name: 'irys_get_balance',
      description: 'Irys 계정의 현재 잔액을 조회합니다. 잔액과 통화 단위를 반환합니다.',
      inputSchema: z.object({}), // No input required
      outputSchema: z.object({
        balance: z.string(),
        currency: z.string(),
      }),
      handler: async (): Promise<BalanceResponse> => {
        const balance = await this.irysService.getBalance();
        return {
          balance,
          currency: 'AR', // Irys uses AR (Arweave) token
        };
      },
    });

    // 11. 파일 암호화
    this.registerTool({
      name: 'irys_encrypt_file',
      description: '로컬 파일을 AES-256-CBC로 암호화합니다. 암호화된 파일을 로컬에 저장합니다.',
      inputSchema: z.object({
        filePath: z.string(),
        password: z.string().min(1),
        outputPath: z.string().optional(),
      }),
      outputSchema: z.object({
        originalPath: z.string(),
        encryptedPath: z.string(),
        salt: z.string(),
        iv: z.string(),
        message: z.string(),
      }),
      handler: async (request: any): Promise<any> => {
        const { filePath, password, outputPath } = request;
        const fs = require('fs');
        const crypto = require('crypto');
        
        const fileBuffer = fs.readFileSync(filePath);
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(password, salt, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        const encryptedData = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
        const finalOutputPath = outputPath || `${filePath}.encrypted`;
        fs.writeFileSync(finalOutputPath, encryptedData);
        
        return {
          originalPath: filePath,
          encryptedPath: finalOutputPath,
          salt: salt.toString('hex'),
          iv: iv.toString('hex'),
          message: 'File encrypted successfully.',
        };
      },
    });

    // 12. 파일 복호화
    this.registerTool({
      name: 'irys_decrypt_file',
      description: 'AES-256-CBC로 암호화된 로컬 파일을 복호화합니다.',
      inputSchema: z.object({
        encryptedFilePath: z.string(),
        password: z.string().min(1),
        outputPath: z.string().optional(),
        salt: z.string(),
        iv: z.string(),
      }),
      outputSchema: z.object({
        encryptedPath: z.string(),
        decryptedPath: z.string(),
        message: z.string(),
      }),
      handler: async (request: any): Promise<any> => {
        const { encryptedFilePath, password, outputPath, salt, iv } = request;
        const fs = require('fs');
        const crypto = require('crypto');
        
        const encryptedData = fs.readFileSync(encryptedFilePath);
        const saltBuffer = Buffer.from(salt, 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');
        const key = crypto.scryptSync(password, saltBuffer, 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
        
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        const finalOutputPath = outputPath || encryptedFilePath.replace('.encrypted', '.decrypted');
        fs.writeFileSync(finalOutputPath, decryptedData);
        
        return {
          encryptedPath: encryptedFilePath,
          decryptedPath: finalOutputPath,
          message: 'File decrypted successfully.',
        };
      },
    });

    // 13. 암호화된 파일 업로드
    this.registerTool({
      name: 'irys_upload_encrypted_file',
      description: 'AES-256-CBC 암호화를 사용하여 파일을 안전하게 업로드합니다. 비밀번호로 파일을 암호화하여 프라이버시를 보장합니다.',
      inputSchema: z.object({
        filePath: z.string(),
        password: z.string().min(1),
        tags: z.record(z.string()).optional(),
        contentType: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        isPublic: z.boolean().default(true),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        url: z.string().url(),
        size: z.number().positive(),
        contentType: z.string(),
        tags: z.record(z.string()).optional(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<UploadResponse> => {
        return await this.irysService.uploadEncryptedFile(request);
      },
    });

    // 14. 암호화된 파일 다운로드
    this.registerTool({
      name: 'irys_download_encrypted_file',
      description: '암호화된 파일을 비밀번호로 복호화하여 다운로드합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        password: z.string().min(1),
        outputPath: z.string().optional(),
      }),
      outputSchema: z.object({
        filePath: z.string().optional(),
        content: z.instanceof(Buffer).optional(),
        size: z.number().positive(),
        contentType: z.string(),
        transactionId: z.string(),
      }).refine(data => data.filePath !== undefined || data.content !== undefined, {
        message: "Either filePath or content must be present",
      }),
      handler: async (request: any): Promise<DownloadResponse> => {
        return await this.irysService.downloadEncryptedFile(request);
      },
    });

    // 15. 데이터 계약 파일 업로드
    this.registerTool({
      name: 'irys_upload_with_data_contract',
      description: '조건부 접근 제어가 포함된 데이터 계약과 함께 파일을 업로드합니다. 시간, 잔액, 사용자 기반 접근 제어를 지원합니다.',
      inputSchema: z.object({
        filePath: z.string(),
        tags: z.record(z.string()).optional(),
        contentType: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        isPublic: z.boolean().default(true),
        dataContract: z.object({
          validFrom: z.number().optional(),
          validUntil: z.number().optional(),
          requiredBalance: z.string().optional(),
          allowedUsers: z.array(z.string()).optional(),
          maxDownloads: z.number().int().positive().optional(),
          accessControl: z.enum(['public', 'private', 'time-based', 'balance-based']).optional(),
        }),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        url: z.string().url(),
        size: z.number().positive(),
        contentType: z.string(),
        tags: z.record(z.string()).optional(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<UploadResponse> => {
        return await this.irysService.uploadWithDataContract(request);
      },
    });

    // 16. 데이터 계약 검증
    this.registerTool({
      name: 'irys_validate_data_contract',
      description: '파일의 데이터 계약 조건을 검증합니다. 접근 권한, 시간 제한, 잔액 요구사항 등을 확인합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        userAddress: z.string().optional(),
      }),
      outputSchema: z.object({
        isValid: z.boolean(),
        reason: z.string().optional(),
        contract: z.any().optional(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.validateDataContract(request.transactionId, request.userAddress);
      },
    });

    // 17. 조건부 접근 파일 다운로드
    this.registerTool({
      name: 'irys_download_with_data_contract',
      description: '데이터 계약 조건을 검증한 후 파일을 다운로드합니다. 접근 권한이 없으면 오류를 반환합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        outputPath: z.string().optional(),
        userAddress: z.string().optional(),
      }),
      outputSchema: z.object({
        filePath: z.string().optional(),
        content: z.instanceof(Buffer).optional(),
        size: z.number().positive(),
        contentType: z.string(),
        transactionId: z.string(),
      }).refine(data => data.filePath !== undefined || data.content !== undefined, {
        message: "Either filePath or content must be present",
      }),
      handler: async (request: any): Promise<DownloadResponse> => {
        return await this.irysService.downloadWithDataContract(request);
      },
    });

    // 🚀 공용 오픈소스 MCP 추가 도구들

    // 18. 파일 삭제
    this.registerTool({
      name: 'irys_delete_file',
      description: '파일을 삭제 표시합니다. 실제 삭제는 불가능하므로 삭제 태그를 추가합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        permanent: z.boolean().default(false),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        deleted: z.boolean(),
        permanent: z.boolean(),
        message: z.string(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.deleteFile(request);
      },
    });

    // 19. 배치 다운로드
    this.registerTool({
      name: 'irys_batch_download',
      description: '여러 파일을 한 번에 다운로드합니다. 메타데이터 포함 옵션을 지원합니다.',
      inputSchema: z.object({
        transactionIds: z.array(z.string()),
        outputDirectory: z.string().optional(),
        includeMetadata: z.boolean().default(true),
      }),
      outputSchema: z.object({
        results: z.array(z.object({
          transactionId: z.string(),
          filePath: z.string().optional(),
          content: z.instanceof(Buffer).optional(),
          success: z.boolean(),
          error: z.string().optional(),
          metadata: z.any().optional(),
        })),
        summary: z.object({
          total: z.number(),
          successful: z.number(),
          failed: z.number(),
          totalSize: z.number(),
        }),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.batchDownload(request);
      },
    });

    // 20. 버전 롤백
    this.registerTool({
      name: 'irys_rollback_version',
      description: '파일을 특정 버전으로 롤백합니다. 백업 생성 옵션을 지원합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        targetVersion: z.string(),
        createBackup: z.boolean().default(true),
      }),
      outputSchema: z.object({
        originalTransactionId: z.string(),
        newTransactionId: z.string(),
        targetVersion: z.string(),
        backupTransactionId: z.string().optional(),
        url: z.string(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.rollbackVersion(request);
      },
    });

    // 21. 공유 해제
    this.registerTool({
      name: 'irys_revoke_share',
      description: '파일의 공유를 해제합니다. 특정 사용자만 해제하거나 모든 공유를 해제할 수 있습니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        userAddress: z.string().optional(),
        revokeAll: z.boolean().default(false),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        revokedUsers: z.array(z.string()),
        revokedAll: z.boolean(),
        message: z.string(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.revokeShare(request);
      },
    });

    // 22. 토큰 타입 전환
    this.registerTool({
      name: 'irys_switch_token_type',
      description: 'Irys 서비스에서 사용하는 토큰 타입을 변경합니다. Ethereum, Solana, Aptos, Arweave 중 선택할 수 있습니다.',
      inputSchema: z.object({
        tokenType: z.enum(['ethereum', 'solana', 'aptos', 'arweave']),
        privateKey: z.string().optional(),
      }),
      outputSchema: z.object({
        previousTokenType: z.string(),
        newTokenType: z.string(),
        success: z.boolean(),
        balance: z.string(),
        currency: z.string(),
        message: z.string(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.switchTokenType(request);
      },
    });

    // 23. 디렉토리 업로드
    this.registerTool({
      name: 'irys_upload_directory',
      description: '디렉토리 전체를 재귀적으로 스캔하여 모든 파일을 Irys 네트워크에 업로드합니다. 상대 경로 정보가 보존됩니다.',
      inputSchema: z.object({
        directoryPath: z.string(),
        tags: z.record(z.string()).optional(),
        preserveStructure: z.boolean().default(true),
        excludePatterns: z.array(z.string()).optional(),
        includeHidden: z.boolean().default(false),
      }),
      outputSchema: z.object({
        directoryPath: z.string(),
        files: z.array(z.object({
          relativePath: z.string(),
          transactionId: z.string(),
          url: z.string(),
          size: z.number(),
          success: z.boolean(),
          error: z.string().optional(),
        })),
        summary: z.object({
          totalFiles: z.number(),
          totalSize: z.number(),
          successful: z.number(),
          failed: z.number(),
          preservedStructure: z.boolean(),
        }),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.uploadDirectory(request);
      },
    });

    // 24. 카테고리 관리
    this.registerTool({
      name: 'irys_manage_categories',
      description: '파일 카테고리를 생성, 수정, 삭제, 조회합니다. 계층적 카테고리 구조를 지원합니다.',
      inputSchema: z.object({
        action: z.enum(['create', 'update', 'delete', 'list', 'get']),
        categoryName: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        parentCategory: z.string().optional(),
      }),
      outputSchema: z.object({
        categories: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          color: z.string().optional(),
          parentCategory: z.string().optional(),
          fileCount: z.number(),
          totalSize: z.number(),
        })),
        action: z.string(),
        success: z.boolean(),
        message: z.string().optional(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.manageCategories(request);
      },
    });

    // 25. 태그 관리
    this.registerTool({
      name: 'irys_manage_tags',
      description: '파일 태그를 생성, 수정, 삭제, 조회합니다. 태그 사용 통계를 제공합니다.',
      inputSchema: z.object({
        action: z.enum(['create', 'update', 'delete', 'list', 'search']),
        tagName: z.string().optional(),
        tagValue: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }),
      outputSchema: z.object({
        tags: z.array(z.object({
          name: z.string(),
          value: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          usageCount: z.number(),
        })),
        action: z.string(),
        success: z.boolean(),
        message: z.string().optional(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.manageTags(request);
      },
    });

    // 26. 성능 모니터링
    this.registerTool({
      name: 'irys_monitor_performance',
      description: 'Irys 작업의 성능을 모니터링하고 최적화 권장사항을 제공합니다.',
      inputSchema: z.object({
        operation: z.enum(['upload', 'download', 'search', 'batch']),
        fileSize: z.number().optional(),
        concurrent: z.number().optional(),
        duration: z.number().optional(),
      }),
      outputSchema: z.object({
        operation: z.string(),
        metrics: z.object({
          duration: z.number(),
          throughput: z.number(),
          latency: z.number(),
          successRate: z.number(),
          errorRate: z.number(),
        }),
        recommendations: z.array(z.string()),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.monitorPerformance(request);
      },
    });

    // 27. 플러그인 관리
    this.registerTool({
      name: 'irys_manage_plugins',
      description: 'Irys MCP 플러그인을 설치, 제거, 활성화, 비활성화합니다. 확장 기능을 관리할 수 있습니다.',
      inputSchema: z.object({
        action: z.enum(['install', 'uninstall', 'enable', 'disable', 'list', 'info']),
        pluginName: z.string().optional(),
        pluginUrl: z.string().optional(),
        version: z.string().optional(),
      }),
      outputSchema: z.object({
        plugins: z.array(z.object({
          name: z.string(),
          version: z.string(),
          enabled: z.boolean(),
          description: z.string().optional(),
          author: z.string().optional(),
          dependencies: z.array(z.string()).optional(),
        })),
        action: z.string(),
        success: z.boolean(),
        message: z.string().optional(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.managePlugins(request);
      },
    });

    // 28. 고급 통계
    this.registerTool({
      name: 'irys_get_advanced_stats',
      description: '고급 통계 정보를 조회합니다. 시계열 데이터, 카테고리별 분석, 스토리지 효율성을 포함합니다.',
      inputSchema: z.object({
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        owner: z.string().optional(),
        category: z.string().optional(),
        includeDeleted: z.boolean().default(false),
        groupBy: z.enum(['day', 'week', 'month', 'category', 'owner']).optional(),
      }),
      outputSchema: z.object({
        totalFiles: z.number(),
        totalSize: z.number(),
        uploads: z.number(),
        downloads: z.number(),
        categories: z.record(z.number()),
        recentActivity: z.array(z.object({
          transactionId: z.string(),
          action: z.enum(['upload', 'download', 'share']),
          timestamp: z.number(),
        })),
        timeSeries: z.array(z.object({
          period: z.string(),
          uploads: z.number(),
          downloads: z.number(),
          totalSize: z.number(),
          uniqueUsers: z.number(),
        })),
        topCategories: z.array(z.object({
          name: z.string(),
          fileCount: z.number(),
          totalSize: z.number(),
          percentage: z.number(),
        })),
        topOwners: z.array(z.object({
          address: z.string(),
          fileCount: z.number(),
          totalSize: z.number(),
          percentage: z.number(),
        })),
        storageEfficiency: z.object({
          compressionRatio: z.number(),
          deduplicationRatio: z.number(),
          costPerGB: z.number(),
        }),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.getAdvancedStats(request);
      },
    });

    // 29. 파일 복구
    this.registerTool({
      name: 'irys_restore_file',
      description: '삭제 표시된 파일을 복구합니다. 복구 후 파일에 접근할 수 있게 됩니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        restoreToPath: z.string().optional(),
        overwrite: z.boolean().default(false),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        restored: z.boolean(),
        restoreToPath: z.string().optional(),
        message: z.string(),
        timestamp: z.number(),
      }),
      handler: async (request: any): Promise<any> => {
        return await this.irysService.restoreFile(request);
      },
    });
  }

  private registerTool(tool: Tool): void {
    this.tools.push(tool);
  }

  public getRegisteredTools(): Tool[] {
    return this.tools;
  }

  /**
   * 서버 시작
   */
  async start(): Promise<void> {
    console.log('🚀 Irys MCP 서버를 시작합니다...');
    
    // 연결 상태 확인
    const connected = await this.irysService.checkConnection();
    if (!connected) {
      console.warn('⚠️  Irys 네트워크에 연결할 수 없습니다. 설정을 확인해주세요.');
    } else {
      console.log('✅ Irys 네트워크에 연결되었습니다.');
      
      // 잔액 조회
      try {
        const balance = await this.irysService.getBalance();
        console.log(`💰 현재 잔액: ${balance} AR`);
      } catch (error) {
        console.warn('⚠️  잔액 조회에 실패했습니다.');
      }
    }

    console.log('✅ Irys MCP 서버가 준비되었습니다.');
  }

  /**
   * 서버 종료
   */
  async stop(): Promise<void> {
    console.log('🛑 Irys MCP 서버를 종료합니다...');
  }
} 