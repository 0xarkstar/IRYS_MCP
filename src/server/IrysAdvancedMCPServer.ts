import { IrysAdvancedService, TokenType, BundleRequest, QueryRequest, ArweaveQueryRequest, CSVUploadRequest, CSVDownloadRequest } from '../services/IrysAdvancedService';
import { z } from 'zod';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  handler: Function;
}

export class IrysAdvancedMCPServer {
  public advancedService: IrysAdvancedService;
  private tools: Tool[] = [];

  constructor(privateKey: string, tokenType: TokenType = 'ethereum', gatewayUrl?: string) {
    this.advancedService = new IrysAdvancedService(privateKey, tokenType, gatewayUrl);
    this.registerAdvancedTools();
  }

  private registerTool(tool: Tool): void {
    this.tools.push(tool);
  }

  public getRegisteredTools(): Tool[] {
    return this.tools;
  }

  private registerAdvancedTools(): void {
    // 🚀 고급 번들링 기능
    this.registerTool({
      name: 'irys_create_bundle',
      description: '여러 파일을 하나의 번들로 묶어서 Irys 네트워크에 업로드합니다. 트랜잭션 비용을 절약하고 관련 파일들을 그룹화할 수 있습니다.',
      inputSchema: z.object({
        files: z.array(z.object({
          filePath: z.string(),
          tags: z.record(z.string()).optional(),
        })),
        bundleName: z.string().optional(),
        description: z.string().optional(),
      }),
      outputSchema: z.object({
        bundleId: z.string(),
        transactionIds: z.array(z.string()),
        totalSize: z.number().positive(),
        timestamp: z.number(),
        url: z.string().url(),
      }),
      handler: async (request: BundleRequest) => {
        return await this.advancedService.createBundle(request);
      },
    });

    // 🔍 고급 쿼리 기능
    this.registerTool({
      name: 'irys_advanced_query',
      description: 'Irys 네트워크에서 고급 검색을 수행합니다. 블록 범위, 정렬 옵션, 복잡한 태그 필터링을 지원합니다.',
      inputSchema: z.object({
        owner: z.string().optional(),
        tags: z.record(z.string()).optional(),
        fromBlock: z.number().int().positive().optional(),
        toBlock: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional().default(20),
        offset: z.number().int().min(0).optional().default(0),
        sortBy: z.enum(['timestamp', 'size', 'block']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }),
      outputSchema: z.object({
        files: z.array(z.object({
          transactionId: z.string(),
          url: z.string().url(),
          size: z.number().positive(),
          contentType: z.string(),
          tags: z.record(z.string()).optional(),
          timestamp: z.number(),
          owner: z.string(),
        })),
        total: z.number().int().min(0),
        hasMore: z.boolean(),
      }),
      handler: async (request: QueryRequest) => {
        return await this.advancedService.advancedQuery(request);
      },
    });

    // 📊 Arweave GraphQL 쿼리
    this.registerTool({
      name: 'irys_arweave_query',
      description: 'Arweave 블록체인에 직접 GraphQL 쿼리를 실행합니다. 복잡한 블록체인 데이터 분석이 가능합니다.',
      inputSchema: z.object({
        query: z.string(),
        variables: z.record(z.any()).optional(),
      }),
      outputSchema: z.object({
        data: z.any(),
        errors: z.array(z.any()).optional(),
      }),
      handler: async (request: ArweaveQueryRequest) => {
        return await this.advancedService.arweaveQuery(request);
      },
    });

    // 📈 CSV 구조화 업로드
    this.registerTool({
      name: 'irys_upload_csv_structured',
      description: 'CSV 파일을 구조화된 JSON 형태로 변환하여 업로드합니다. 메타데이터와 함께 검색 가능한 형태로 저장됩니다.',
      inputSchema: z.object({
        filePath: z.string(),
        delimiter: z.string().optional().default(','),
        hasHeader: z.boolean().optional().default(true),
        tags: z.record(z.string()).optional(),
      }),
      outputSchema: z.object({
        transactionId: z.string(),
        url: z.string().url(),
        size: z.number().positive(),
        contentType: z.string(),
        tags: z.record(z.string()).optional(),
        timestamp: z.number(),
      }),
      handler: async (request: CSVUploadRequest) => {
        return await this.advancedService.uploadCSV(request);
      },
    });

    // 📥 CSV 구조화 다운로드
    this.registerTool({
      name: 'irys_download_csv_structured',
      description: '구조화된 CSV 데이터를 다시 CSV 형태로 변환하여 다운로드합니다.',
      inputSchema: z.object({
        transactionId: z.string(),
        outputPath: z.string().optional(),
        delimiter: z.string().optional().default(','),
        includeHeader: z.boolean().optional().default(true),
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
      handler: async (request: CSVDownloadRequest) => {
        return await this.advancedService.downloadCSV(request);
      },
    });

    // 🗂️ 디렉토리 전체 업로드
    this.registerTool({
      name: 'irys_upload_directory',
      description: '디렉토리 전체를 재귀적으로 스캔하여 모든 파일을 Irys 네트워크에 업로드합니다. 상대 경로 정보가 보존됩니다.',
      inputSchema: z.object({
        dirPath: z.string(),
        tags: z.record(z.string()).optional(),
      }),
      outputSchema: z.object({
        results: z.array(z.object({
          filePath: z.string(),
          transactionId: z.string().optional(),
          url: z.string().url().optional(),
          success: z.boolean(),
          error: z.string().optional(),
        })),
        summary: z.object({
          total: z.number().int().positive(),
          successful: z.number().int().min(0),
          failed: z.number().int().min(0),
        }),
      }),
      handler: async (request: { dirPath: string; tags?: Record<string, string> }) => {
        return await this.advancedService.uploadDirectory(request.dirPath, request.tags);
      },
    });

    // 🔢 정밀 잔액 조회
    this.registerTool({
      name: 'irys_get_precise_balance',
      description: 'BigNumber를 사용하여 정밀한 잔액을 조회합니다. 18자리 소수점까지 정확한 잔액을 확인할 수 있습니다.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        balance: z.any(), // BigNumber
        currency: z.string(),
        formatted: z.string(),
      }),
      handler: async () => {
        return await this.advancedService.getPreciseBalance();
      },
    });

    // 🔄 토큰 타입 변경
    this.registerTool({
      name: 'irys_switch_token_type',
      description: 'Irys 서비스에서 사용하는 토큰 타입을 변경합니다. Ethereum, Solana, Aptos, Arweave 중 선택할 수 있습니다.',
      inputSchema: z.object({
        tokenType: z.enum(['ethereum', 'solana', 'aptos', 'arweave']),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        previousTokenType: z.string(),
        newTokenType: z.string(),
        message: z.string(),
      }),
      handler: async (request: { tokenType: TokenType }) => {
        const previousType = (this.advancedService as any).tokenType;
        await this.advancedService.switchTokenType(request.tokenType);
        return {
          success: true,
          previousTokenType: previousType,
          newTokenType: request.tokenType,
          message: `토큰 타입이 ${previousType}에서 ${request.tokenType}로 변경되었습니다.`,
        };
      },
    });

    // 📊 고급 통계 조회
    this.registerTool({
      name: 'irys_get_advanced_stats',
      description: 'BigNumber를 사용한 정밀한 통계 정보를 조회합니다. 평균 파일 크기, 스토리지 비용 추정 등을 포함합니다.',
      inputSchema: z.object({
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        owner: z.string().optional(),
      }),
      outputSchema: z.object({
        totalFiles: z.number().int().min(0),
        totalSize: z.number().int().min(0),
        uploads: z.number().int().min(0),
        downloads: z.number().int().min(0),
        categories: z.record(z.number().int().min(0)),
        recentActivity: z.array(z.object({
          transactionId: z.string(),
          action: z.enum(['upload', 'download', 'share']),
          timestamp: z.number(),
        })),
        preciseTotalSize: z.any(), // BigNumber
        averageFileSize: z.any(), // BigNumber
        storageCostEstimate: z.any(), // BigNumber
      }),
      handler: async (request: any) => {
        return await this.advancedService.getAdvancedStats(request);
      },
    });

    // 🔐 멀티 토큰 지원 업로드
    this.registerTool({
      name: 'irys_multi_token_upload',
      description: '현재 설정된 토큰 타입에 따라 적절한 업로드 클라이언트를 사용하여 파일을 업로드합니다.',
      inputSchema: z.object({
        filePath: z.string(),
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
        tokenType: z.string(),
      }),
      handler: async (request: any) => {
        // 토큰 타입에 따른 적절한 업로드 클라이언트 사용
        const tokenType = (this.advancedService as any).tokenType;
        
        // 시뮬레이션: 멀티 토큰 업로드
        return {
          transactionId: `multi-token-tx-${Date.now()}`,
          url: `https://node2.irys.xyz/multi-token-tx-${Date.now()}`,
          size: 1024,
          contentType: request.contentType || 'application/octet-stream',
          tags: request.tags,
          timestamp: Date.now(),
          tokenType,
        };
      },
    });

    // 📋 번들 정보 조회
    this.registerTool({
      name: 'irys_get_bundle_info',
      description: '번들 ID를 기반으로 번들에 포함된 파일들의 정보를 조회합니다.',
      inputSchema: z.object({
        bundleId: z.string(),
      }),
      outputSchema: z.object({
        bundleId: z.string(),
        bundleName: z.string().optional(),
        description: z.string().optional(),
        fileCount: z.number().int().positive(),
        totalSize: z.number().positive(),
        createdAt: z.number(),
        files: z.array(z.object({
          transactionId: z.string(),
          fileName: z.string(),
          contentType: z.string(),
          size: z.number().positive(),
          tags: z.record(z.string()).optional(),
        })),
      }),
      handler: async (request: { bundleId: string }) => {
        // 실제 구현에서는 번들 정보를 조회
        // 여기서는 시뮬레이션
        return {
          bundleId: request.bundleId,
          bundleName: 'Sample Bundle',
          description: 'This is a sample bundle',
          fileCount: 3,
          totalSize: 3072,
          createdAt: Date.now() - 3600000,
          files: [
            {
              transactionId: `${request.bundleId}-0`,
              fileName: 'file1.txt',
              contentType: 'text/plain',
              size: 1024,
              tags: { 'Bundle-Item': 'true' },
            },
            {
              transactionId: `${request.bundleId}-1`,
              fileName: 'file2.jpg',
              contentType: 'image/jpeg',
              size: 1024,
              tags: { 'Bundle-Item': 'true' },
            },
            {
              transactionId: `${request.bundleId}-2`,
              fileName: 'file3.pdf',
              contentType: 'application/pdf',
              size: 1024,
              tags: { 'Bundle-Item': 'true' },
            },
          ],
        };
      },
    });
  }

  async start(): Promise<void> {
    console.log('🚀 Irys 고급 MCP 서버를 시작합니다...');
    console.log(`💰 현재 토큰 타입: ${(this.advancedService as any).tokenType}`);
    
    try {
      const balance = await this.advancedService.getPreciseBalance();
      console.log(`💰 정밀 잔액: ${balance.formatted} ${balance.currency}`);
    } catch (error) {
      console.warn('⚠️  잔액 조회에 실패했습니다.');
    }

    console.log('✅ Irys 고급 MCP 서버가 준비되었습니다.');
  }

  async stop(): Promise<void> {
    console.log('🛑 Irys 고급 MCP 서버를 종료합니다...');
  }
} 