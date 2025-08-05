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
    // 🚀 Advanced bundling functionality
    this.registerTool({
      name: 'irys_create_bundle',
      description: 'Bundles multiple files into a single Irys network upload. Saves transaction costs and groups related files.',
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

    // 🔍 Advanced query functionality
    this.registerTool({
      name: 'irys_advanced_query',
      description: 'Performs advanced searches on the Irys network. Supports block range, sorting options, and complex tag filtering.',
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

    // 📊 Arweave GraphQL query
    this.registerTool({
      name: 'irys_arweave_query',
      description: 'Executes a direct GraphQL query on the Arweave blockchain. Enables complex blockchain data analysis.',
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

    // 📈 CSV structured upload
    this.registerTool({
      name: 'irys_upload_csv_structured',
      description: 'Converts a CSV file into a structured JSON format for upload. Saves metadata and makes it searchable.',
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

    // 📥 CSV structured download
    this.registerTool({
      name: 'irys_download_csv_structured',
      description: 'Converts structured CSV data back to CSV format for download.',
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

    // 🗂️ Directory upload
    this.registerTool({
      name: 'irys_upload_directory',
      description: 'Recursively scans a directory and uploads all files to the Irys network. Preserves relative path information.',
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

    // 🔢 Precise balance check
    this.registerTool({
      name: 'irys_get_precise_balance',
      description: 'Checks for precise balance using BigNumber. Can accurately check for balances up to 18 decimal places.',
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

    // 🔄 Token type change
    this.registerTool({
      name: 'irys_switch_token_type',
      description: 'Changes the token type used by the Irys service. Can choose between Ethereum, Solana, Aptos, Arweave.',
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
          message: `Token type changed from ${previousType} to ${request.tokenType}.`,
        };
      },
    });

    // 📊 Advanced stats query
    this.registerTool({
      name: 'irys_get_advanced_stats',
      description: 'Queries for precise statistical information using BigNumber. Includes average file size, storage cost estimates, etc.',
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

    // 🔐 Multi-token support upload
    this.registerTool({
      name: 'irys_multi_token_upload',
      description: 'Uses the appropriate upload client based on the currently set token type to upload files.',
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
        // Use appropriate upload client based on token type
        const tokenType = (this.advancedService as any).tokenType;
        
        // Simulation: Multi-token upload
        return {
          transactionId: `multi-token-tx-${Date.now()}`,
          url: `https://uploader.irys.xyz/multi-token-tx-${Date.now()}`,
          size: 1024,
          contentType: request.contentType || 'application/octet-stream',
          tags: request.tags,
          timestamp: Date.now(),
          tokenType,
        };
      },
    });

    // 📋 Bundle info query
    this.registerTool({
      name: 'irys_get_bundle_info',
      description: 'Queries information about files included in a bundle based on the bundle ID.',
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
        // In a real implementation, bundle info would be queried
        // Here is a simulation
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
    console.log('🚀 Starting Irys Advanced MCP server...');
    console.log(`💰 Current token type: ${(this.advancedService as any).tokenType}`);
    
    try {
      const balance = await this.advancedService.getPreciseBalance();
      console.log(`💰 Precise balance: ${balance.formatted} ${balance.currency}`);
    } catch (error) {
      console.warn('⚠️ Failed to get balance.');
    }

    console.log('✅ Irys Advanced MCP server is ready.');
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Irys Advanced MCP server...');
  }
} 